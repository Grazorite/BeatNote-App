import CryptoKit
import ExpoModulesCore
import Foundation

private enum LibraryStorageError: Error {
  case applicationSupportUnavailable
  case musicDirectoryCreationFailed
}

public final class LibraryStorageModule: Module {
  private static let hashChunkSize = 1_048_576

  public func definition() -> ModuleDefinition {
    Name("LibraryStorage")

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
