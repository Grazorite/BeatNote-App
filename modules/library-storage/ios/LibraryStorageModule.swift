import CryptoKit
import ExpoModulesCore
import Foundation
import os
import UIKit

private enum LibraryStorageOpenURLBus {
  static var pendingURLs: [String] = []
  static var listenerOwner: UUID?
  static var listener: ((String) -> Void)?

  static func receive(_ url: URL) {
    guard url.isFileURL else { return }
    if let listener {
      listener(url.absoluteString)
    } else {
      pendingURLs.append(url.absoluteString)
    }
  }

  static func consumePendingURLs() -> [String] {
    let urls = pendingURLs
    pendingURLs.removeAll()
    return urls
  }

  static func startObserving(owner: UUID, _ nextListener: @escaping (String) -> Void) {
    listenerOwner = owner
    listener = nextListener
    consumePendingURLs().forEach(nextListener)
  }

  static func stopObserving(owner: UUID) {
    guard listenerOwner == owner else { return }
    listenerOwner = nil
    listener = nil
  }
}

public final class LibraryStorageAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    guard url.isFileURL else { return false }
    LibraryStorageOpenURLBus.receive(url)
    return true
  }
}

private enum LibraryStorageError: Error {
  case applicationSupportUnavailable
  case musicDirectoryCreationFailed
}

/// Opt-in os_signpost intervals for Instruments. Disabled by default so release behaviour and
/// overhead are unchanged unless profiling explicitly turns it on.
private final class SignpostGate: @unchecked Sendable {
  static let shared = SignpostGate()
  // Points of Interest shows these intervals in Instruments' default timeline.
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

  /// Begin an interval keyed by `intervalID`. A duplicate begin for a live id is ignored.
  func begin(_ intervalID: String, _ name: String) {
    lock.lock()
    guard enabled, intervals[intervalID] == nil else {
      lock.unlock()
      return
    }
    let id = OSSignpostID(log: log)
    intervals[intervalID] = id
    lock.unlock()
    // The signpost name must be a static string and identical for begin and end, so the dynamic
    // interval name travels in the message instead.
    os_signpost(.begin, log: log, name: "BeatNote", signpostID: id, "%{public}s", name)
  }

  /// End the interval keyed by `intervalID`, if one is live.
  func end(_ intervalID: String) {
    lock.lock()
    let id = intervals.removeValue(forKey: intervalID)
    lock.unlock()
    guard let id else { return }
    os_signpost(.end, log: log, name: "BeatNote", signpostID: id)
  }
}

public final class LibraryStorageModule: Module {
  private static let hashChunkSize = 1_048_576
  private let openURLObserverID = UUID()

  public func definition() -> ModuleDefinition {
    Name("LibraryStorage")
    Events("onOpenURL")

    OnStartObserving("onOpenURL") { [weak self] in
      guard let self else { return }
      LibraryStorageOpenURLBus.startObserving(owner: self.openURLObserverID) { [weak self] url in
        self?.sendEvent("onOpenURL", ["url": url])
      }
    }

    OnStopObserving("onOpenURL") { [weak self] in
      guard let self else { return }
      LibraryStorageOpenURLBus.stopObserving(owner: self.openURLObserverID)
    }

    Function("consumePendingOpenURLs") {
      LibraryStorageOpenURLBus.consumePendingURLs()
    }

    Function("shouldPurgeTestCaches") {
#if DEBUG
      ProcessInfo.processInfo.environment["BEATNOTE_TEST_PURGE_CACHES"] == "1"
#else
      false
#endif
    }

    Function("getMusicDirectoryUri") {
      try Self.musicDirectory().absoluteString
    }

    AsyncFunction("setExcludedFromBackup") { (url: URL, excluded: Bool) in
      var mutableURL = url
      var values = URLResourceValues()
      values.isExcludedFromBackup = excluded
      try mutableURL.setResourceValues(values)
    }

    AsyncFunction("isExcludedFromBackup") { (url: URL) in
      try url.resourceValues(forKeys: [.isExcludedFromBackupKey]).isExcludedFromBackup ?? false
    }

    AsyncFunction("md5File") { (url: URL) in
      try Self.md5File(url)
    }

    Function("randomUUID") {
      UUID().uuidString.lowercased()
    }

    Function("enableSignposts") { (enabled: Bool) in
      SignpostGate.shared.setEnabled(enabled)
    }

    Function("beginSignpost") { (intervalID: String, name: String) in
      SignpostGate.shared.begin(intervalID, name)
    }

    Function("endSignpost") { (intervalID: String) in
      SignpostGate.shared.end(intervalID)
    }
  }

  /// Native entry point for sibling modules (waveform, tempo). No-op unless signposts are enabled.
  public static func beginSignpost(_ intervalID: String, name: String) {
    SignpostGate.shared.begin(intervalID, name)
  }

  /// Native entry point for sibling modules. No-op when the interval is not live.
  public static func endSignpost(_ intervalID: String) {
    SignpostGate.shared.end(intervalID)
  }

  private static func musicDirectory() throws -> URL {
    guard let applicationSupport = FileManager.default.urls(
      for: .applicationSupportDirectory,
      in: .userDomainMask
    ).first else {
      throw LibraryStorageError.applicationSupportUnavailable
    }
    let directory = applicationSupport
      .appendingPathComponent("BeatNote", isDirectory: true)
      .appendingPathComponent("Music", isDirectory: true)
    do {
      try FileManager.default.createDirectory(
        at: directory,
        withIntermediateDirectories: true
      )
      return directory
    } catch {
      throw LibraryStorageError.musicDirectoryCreationFailed
    }
  }

  private static func md5File(_ url: URL) throws -> String {
    let handle = try FileHandle(forReadingFrom: url)
    defer { try? handle.close() }
    var digest = Insecure.MD5()
    while let chunk = try handle.read(upToCount: hashChunkSize), !chunk.isEmpty {
      digest.update(data: chunk)
    }
    return digest.finalize().map { String(format: "%02x", $0) }.joined()
  }

}
