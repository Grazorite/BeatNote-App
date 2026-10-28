import Accelerate
import AVFoundation
import CoreMedia
import ExpoModulesCore

private enum TempoAnalysisError: Error {
  case audioTrackMissing
  case cancelled
  case cannotAddOutput
  case cannotCreateReader
  case cannotReadBuffer
  case cannotStartReader
  case decodingFailed(String)
  case insufficientAudio
}

private final class CancellationRegistry: @unchecked Sendable {
  static let shared = CancellationRegistry()
  private let lock = NSLock()
  private var cancelled = Set<String>()

  func begin(_ requestId: String) {
    lock.lock()
    cancelled.remove(requestId)
    lock.unlock()
  }

  func cancel(_ requestId: String) {
    lock.lock()
    cancelled.insert(requestId)
    lock.unlock()
  }

  func end(_ requestId: String) {
    lock.lock()
    cancelled.remove(requestId)
    lock.unlock()
  }

  func isCancelled(_ requestId: String) -> Bool {
    lock.lock()
    defer { lock.unlock() }
    return cancelled.contains(requestId)
  }
}

private struct AnalysisWindow {
  let startSeconds: Double
  let durationSeconds: Double
  let includesAnchor: Bool
}

private struct WindowEstimate {
  let bpm: Double
  let correlation: Double
  let anchorMs: Double?
}

public final class BeatNoteTempoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BeatNoteTempo")
    Events("onAnalysisProgress")

    Function("cancelAnalysis") { (requestId: String) in
      CancellationRegistry.shared.cancel(requestId)
    }

    AsyncFunction("analyzeTempoAsync") {
      (audioURL: URL, requestId: String, minBpm: Double, maxBpm: Double) async throws -> [String: Any] in
      CancellationRegistry.shared.begin(requestId)
      defer { CancellationRegistry.shared.end(requestId) }

      let asset = AVURLAsset(url: audioURL)
      let duration = try await asset.load(.duration)
      let durationSeconds = CMTimeGetSeconds(duration)
      guard durationSeconds.isFinite, durationSeconds > 1 else {
        throw TempoAnalysisError.insufficientAudio
      }
      let tracks = try await asset.loadTracks(withMediaType: .audio)
      guard let track = tracks.first else { throw TempoAnalysisError.audioTrackMissing }

      let windows = Self.defaultWindows(durationSeconds: durationSeconds)
      var estimates: [WindowEstimate] = []
      for (index, window) in windows.enumerated() {
        try Self.checkCancellation(requestId)
        let estimate = try await Task.detached(priority: .utility) {
          let samples = try await Self.decode(
            asset: asset,
            track: track,
            window: window,
            requestId: requestId
          )
          return try Self.estimate(
            samples: samples,
            sampleRate: 11_025,
            window: window,
            minBpm: minBpm,
            maxBpm: maxBpm,
            requestId: requestId
          )
        }.value
        estimates.append(estimate)
        sendEvent("onAnalysisProgress", [
          "requestId": requestId,
          "fraction": Double(index + 1) / Double(windows.count)
        ])
      }

      return try Self.combine(estimates: estimates, minBpm: minBpm, maxBpm: maxBpm)
    }
  }

  private static func defaultWindows(durationSeconds: Double) -> [AnalysisWindow] {
    if durationSeconds < 90 {
      return [AnalysisWindow(startSeconds: 0, durationSeconds: durationSeconds, includesAnchor: true)]
    }
    let tempoWindows = [0.25, 0.5, 0.75].map { fraction in
      AnalysisWindow(
        startSeconds: min(max(0, durationSeconds * fraction - 10), durationSeconds - 20),
        durationSeconds: min(20, durationSeconds),
        includesAnchor: false
      )
    }
    return [AnalysisWindow(
      startSeconds: 0,
      durationSeconds: min(30, durationSeconds),
      includesAnchor: true
    )] + tempoWindows
  }

  private static func checkCancellation(_ requestId: String) throws {
    if Task.isCancelled || CancellationRegistry.shared.isCancelled(requestId) {
      throw TempoAnalysisError.cancelled
    }
  }

  private static func decode(
    asset: AVURLAsset,
    track: AVAssetTrack,
    window: AnalysisWindow,
    requestId: String
  ) async throws -> [Float] {
    let formatDescriptions = try await track.load(.formatDescriptions)
    let audioDescription = formatDescriptions.first
      .flatMap { CMAudioFormatDescriptionGetStreamBasicDescription($0) }
    let sourceSampleRate = audioDescription?.pointee.mSampleRate ?? 44_100
    let channelCount = max(1, Int(audioDescription?.pointee.mChannelsPerFrame ?? 1))

    guard let reader = try? AVAssetReader(asset: asset) else {
      throw TempoAnalysisError.cannotCreateReader
    }
    reader.timeRange = CMTimeRange(
      start: CMTime(seconds: window.startSeconds, preferredTimescale: 600),
      duration: CMTime(seconds: window.durationSeconds, preferredTimescale: 600)
    )
    let settings: [String: Any] = [
      AVFormatIDKey: kAudioFormatLinearPCM,
      AVLinearPCMBitDepthKey: 32,
      AVLinearPCMIsFloatKey: true,
      AVLinearPCMIsBigEndianKey: false,
      AVLinearPCMIsNonInterleaved: false
    ]
    let output = AVAssetReaderTrackOutput(track: track, outputSettings: settings)
    output.alwaysCopiesSampleData = false
    guard reader.canAdd(output) else { throw TempoAnalysisError.cannotAddOutput }
    reader.add(output)
    guard reader.startReading() else { throw TempoAnalysisError.cannotStartReader }

    let targetRate = 11_025.0
    let sourceFramesPerTarget = max(1, sourceSampleRate / targetRate)
    var samples: [Float] = []
    samples.reserveCapacity(Int(window.durationSeconds * targetRate))
    var sourceFramePosition = 0.0
    var nextTargetFrame = 0.0

    while let sampleBuffer = output.copyNextSampleBuffer() {
      try checkCancellation(requestId)
      guard let blockBuffer = CMSampleBufferGetDataBuffer(sampleBuffer) else { continue }
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
        throw TempoAnalysisError.cannotReadBuffer
      }
      let values = UnsafeRawPointer(rawPointer).assumingMemoryBound(to: Float.self)
      let frameCount = totalLength / MemoryLayout<Float>.size / channelCount
      for localFrame in 0..<frameCount {
        let absoluteFrame = sourceFramePosition + Double(localFrame)
        if absoluteFrame + 0.5 >= nextTargetFrame {
          var mono: Float = 0
          let offset = localFrame * channelCount
          for channel in 0..<channelCount { mono += values[offset + channel] }
          samples.append(mono / Float(channelCount))
          nextTargetFrame += sourceFramesPerTarget
        }
      }
      sourceFramePosition += Double(frameCount)
    }
    if reader.status == .failed {
      throw TempoAnalysisError.decodingFailed(
        reader.error?.localizedDescription ?? "Unknown AVAssetReader error"
      )
    }
    guard samples.count >= Int(targetRate) else { throw TempoAnalysisError.insufficientAudio }
    return samples
  }

  private static func estimate(
    samples: [Float],
    sampleRate: Double,
    window: AnalysisWindow,
    minBpm: Double,
    maxBpm: Double,
    requestId: String
  ) throws -> WindowEstimate {
    let frameSize = 512
    let hopSize = 256
    guard samples.count > frameSize else { throw TempoAnalysisError.insufficientAudio }
    var envelope: [Float] = []
    envelope.reserveCapacity(samples.count / hopSize)
    var priorEnergy: Float = 0
    var offset = 0
    while offset + frameSize <= samples.count {
      if envelope.count.isMultiple(of: 128) { try checkCancellation(requestId) }
      var energy: Float = 0
      samples.withUnsafeBufferPointer { buffer in
        vDSP_svesq(buffer.baseAddress! + offset, 1, &energy, vDSP_Length(frameSize))
      }
      energy = sqrt(energy / Float(frameSize))
      envelope.append(max(0, energy - priorEnergy))
      priorEnergy = energy
      offset += hopSize
    }

    var mean: Float = 0
    vDSP_meanv(envelope, 1, &mean, vDSP_Length(envelope.count))
    let centered = envelope.map { $0 - mean }
    let envelopeRate = sampleRate / Double(hopSize)
    let minimumLag = max(1, Int(floor(envelopeRate * 60 / maxBpm)))
    let maximumLag = min(centered.count - 2, Int(ceil(envelopeRate * 60 / minBpm)))
    guard minimumLag <= maximumLag else { throw TempoAnalysisError.insufficientAudio }

    var bestLag = minimumLag
    var bestCorrelation: Float = -1
    for lag in minimumLag...maximumLag {
      if lag.isMultiple(of: 16) { try checkCancellation(requestId) }
      let count = centered.count - lag
      var dot: Float = 0
      var leftEnergy: Float = 0
      var rightEnergy: Float = 0
      centered.withUnsafeBufferPointer { buffer in
        vDSP_dotpr(buffer.baseAddress!, 1, buffer.baseAddress! + lag, 1, &dot, vDSP_Length(count))
        vDSP_svesq(buffer.baseAddress!, 1, &leftEnergy, vDSP_Length(count))
        vDSP_svesq(buffer.baseAddress! + lag, 1, &rightEnergy, vDSP_Length(count))
      }
      let correlation = dot / max(0.000_001, sqrt(leftEnergy * rightEnergy))
      if correlation > bestCorrelation {
        bestCorrelation = correlation
        bestLag = lag
      }
    }

    let bpm = 60 * envelopeRate / Double(bestLag)
    var anchorMs: Double?
    if window.includesAnchor {
      var deviation: Float = 0
      vDSP_measqv(centered, 1, &deviation, vDSP_Length(centered.count))
      let threshold = max(mean * 1.5, sqrt(deviation) * 2)
      if let onsetIndex = envelope.firstIndex(where: { $0 >= threshold }) {
        anchorMs = (window.startSeconds + Double(onsetIndex) / envelopeRate) * 1_000
      }
    }
    return WindowEstimate(
      bpm: bpm,
      correlation: Double(max(0, min(bestCorrelation, 1))),
      anchorMs: anchorMs
    )
  }

  private static func combine(
    estimates: [WindowEstimate],
    minBpm: Double,
    maxBpm: Double
  ) throws -> [String: Any] {
    guard !estimates.isEmpty else { throw TempoAnalysisError.insufficientAudio }
    let tempoEstimates = estimates.filter { $0.anchorMs == nil }
    let tempoSource = tempoEstimates.isEmpty ? estimates : tempoEstimates
    let sortedBpms = tempoSource.map(\.bpm).sorted()
    let bpm = sortedBpms[sortedBpms.count / 2]
    let spread = sortedBpms.map { abs($0 - bpm) / max(bpm, 1) }.max() ?? 0
    let agreement = max(0, 1 - spread * 5)
    let averageCorrelation = tempoSource.map(\.correlation).reduce(0, +) / Double(tempoSource.count)
    let confidence = min(1, max(0, averageCorrelation * 0.75 + agreement * 0.25))
    let confidenceBand = confidence >= 0.72 ? "high" : confidence >= 0.45 ? "medium" : "low"
    let tempoModel = spread <= 0.04 ? "constant" : "variable"

    var alternatives: [[String: Any]] = [[
      "bpm": bpm, "likelihood": confidence, "relation": "primary"
    ]]
    if bpm / 2 >= minBpm {
      alternatives.append([
        "bpm": bpm / 2, "likelihood": confidence * 0.62, "relation": "half"
      ])
    }
    if bpm * 2 <= maxBpm {
      alternatives.append([
        "bpm": bpm * 2, "likelihood": confidence * 0.62, "relation": "double"
      ])
    }

    return [
      "detectedBpm": bpm,
      "confidence": confidence,
      "confidenceBand": confidenceBand,
      "tempoModel": tempoModel,
      "bpmAlternatives": alternatives,
      "suggestedAnchorMs": estimates.compactMap(\.anchorMs).first ?? 0
    ]
  }
}
