import CryptoKit
import ExpoModulesCore
import Foundation
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
