import AVFoundation
import CoreMedia
import ExpoModulesCore
import os

private final class WaveformSignpostGate: @unchecked Sendable {
  static let shared = WaveformSignpostGate()
  private let log = OSLog(subsystem: "com.beatnote.app", category: .pointsOfInterest)
  private let lock = NSLock()
  private var enabled = false
  private var intervals: [String: OSSignpostID] = [:]

  func setEnabled(_ value: Bool) {
    lock.lock()
    enabled = value
    if !value { intervals.removeAll() }
    lock.unlock()
  }

  func begin(_ id: String, name: String) {
    lock.lock()
    guard enabled, intervals[id] == nil else {
      lock.unlock()
      return
    }
    let signpostID = OSSignpostID(log: log)
    intervals[id] = signpostID
    lock.unlock()
    os_signpost(.begin, log: log, name: "BeatNote", signpostID: signpostID, "%{public}s", name)
  }

  func end(_ id: String) {
    lock.lock()
    let signpostID = intervals.removeValue(forKey: id)
    lock.unlock()
    guard let signpostID else { return }
    os_signpost(.end, log: log, name: "BeatNote", signpostID: signpostID)
  }
}

private enum WaveformExtractionError: Error {
  case audioTrackMissing
  case cannotCreateReader
  case cannotAddOutput
  case cannotStartReader
  case cannotReadBuffer
  case decodingFailed(String)
}

private struct PeakAccumulator {
  var maximum: Float = 0
  var squaredTotal: Double = 0
  var sampleCount = 0

  mutating func append(_ value: Float) {
    let magnitude = min(abs(value), 1)
    maximum = max(maximum, magnitude)
    squaredTotal += Double(magnitude * magnitude)
    sampleCount += 1
  }

  func value() -> Double {
    guard sampleCount > 0 else { return 0 }
    let rms = sqrt(squaredTotal / Double(sampleCount))
    return min(Double(maximum) * 0.7 + rms * 0.3, 1)
  }
}

public final class BeatNoteWaveformModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BeatNoteWaveform")

    Function("enableSignposts") { (enabled: Bool) in
      WaveformSignpostGate.shared.setEnabled(enabled)
    }

    AsyncFunction("extractPeaksAsync") {
      (audioURL: URL, requestedSamplesPerSecond: Int) async throws -> [String: Any] in
      let samplesPerSecond = min(max(requestedSamplesPerSecond, 25), 200)
      let signpostID = String(UUID().uuidString.prefix(8))
      Self.signpostBegin(signpostID, name: "waveform.decode")
      defer { Self.signpostEnd(signpostID) }
      return try await Self.extractPeaks(from: audioURL, samplesPerSecond: samplesPerSecond)
    }
  }

  private static func signpostBegin(_ intervalID: String, name: String) {
    WaveformSignpostGate.shared.begin(intervalID, name: name)
  }

  private static func signpostEnd(_ intervalID: String) {
    WaveformSignpostGate.shared.end(intervalID)
  }

  private static func extractPeaks(
    from audioURL: URL,
    samplesPerSecond: Int
  ) async throws -> [String: Any] {
    let asset = AVURLAsset(url: audioURL)
    let duration = try await asset.load(.duration)
    let durationSeconds = CMTimeGetSeconds(duration)
    guard durationSeconds.isFinite, durationSeconds > 0 else {
      throw WaveformExtractionError.cannotCreateReader
    }

    let tracks = try await asset.loadTracks(withMediaType: .audio)
    guard let track = tracks.first else {
      throw WaveformExtractionError.audioTrackMissing
    }

    let targetPeakCount = max(1, Int(ceil(durationSeconds * Double(samplesPerSecond))))
    let formatDescriptions = try await track.load(.formatDescriptions)
    let audioDescription = formatDescriptions.first
      .flatMap { CMAudioFormatDescriptionGetStreamBasicDescription($0) }
    let sampleRate = audioDescription?.pointee.mSampleRate ?? 44_100
    let channelCount = max(1, Int(audioDescription?.pointee.mChannelsPerFrame ?? 1))
    let estimatedFrameCount = max(1, Int(ceil(durationSeconds * sampleRate)))
    let framesPerPeak = max(1, Int(ceil(Double(estimatedFrameCount) / Double(targetPeakCount))))

    guard let reader = try? AVAssetReader(asset: asset) else {
      throw WaveformExtractionError.cannotCreateReader
    }
    let settings: [String: Any] = [
      AVFormatIDKey: kAudioFormatLinearPCM,
      AVLinearPCMBitDepthKey: 32,
      AVLinearPCMIsFloatKey: true,
      AVLinearPCMIsBigEndianKey: false,
      AVLinearPCMIsNonInterleaved: false
    ]
    let output = AVAssetReaderTrackOutput(track: track, outputSettings: settings)
    output.alwaysCopiesSampleData = false
    guard reader.canAdd(output) else {
      throw WaveformExtractionError.cannotAddOutput
    }
    reader.add(output)
    guard reader.startReading() else {
      throw WaveformExtractionError.cannotStartReader
    }

    var accumulators = Array(repeating: PeakAccumulator(), count: targetPeakCount)
    var processedFrames = 0

    while let sampleBuffer = output.copyNextSampleBuffer() {
      guard let blockBuffer = CMSampleBufferGetDataBuffer(sampleBuffer) else { continue }
      let byteLength = CMBlockBufferGetDataLength(blockBuffer)
      guard byteLength > 0 else { continue }

      var contiguousLength = 0
      var totalLength = 0
      var rawPointer: UnsafeMutablePointer<Int8>?
      let status = CMBlockBufferGetDataPointer(
        blockBuffer,
        atOffset: 0,
        lengthAtOffsetOut: &contiguousLength,
        totalLengthOut: &totalLength,
        dataPointerOut: &rawPointer
      )
      guard status == kCMBlockBufferNoErr,
            contiguousLength == totalLength,
            let rawPointer else {
        throw WaveformExtractionError.cannotReadBuffer
      }

      let floatCount = totalLength / MemoryLayout<Float>.size
      let frameCount = floatCount / channelCount
      let samples = UnsafeRawPointer(rawPointer).assumingMemoryBound(to: Float.self)

      for localFrame in 0..<frameCount {
        let peakIndex = min((processedFrames + localFrame) / framesPerPeak, targetPeakCount - 1)
        let sampleOffset = localFrame * channelCount
        for channel in 0..<channelCount {
          accumulators[peakIndex].append(samples[sampleOffset + channel])
        }
      }
      processedFrames += frameCount
    }

    if reader.status == .failed {
      throw WaveformExtractionError.decodingFailed(
        reader.error?.localizedDescription ?? "Unknown AVAssetReader error"
      )
    }

    var peaks = accumulators.map { $0.value() }
    if let maximum = peaks.max(), maximum > 0 {
      let normalizer = 0.95 / maximum
      peaks = peaks.map { min($0 * normalizer, 1) }
    }

    return [
      "peaks": peaks,
      "durationMs": durationSeconds * 1_000
    ]
  }
}
