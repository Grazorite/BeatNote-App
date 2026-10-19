package com.beatnote.librarystorage

import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileInputStream
import java.io.IOException
import java.net.URI
import java.security.DigestInputStream
import java.security.MessageDigest
import java.util.UUID

class LibraryStorageModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LibraryStorage")

    Function("getMusicDirectoryUri") {
      musicDirectory().toURI().toString()
    }

    AsyncFunction("setExcludedFromBackup") { _: String, _: Boolean ->
      // noBackupFilesDir is excluded from Android Auto Backup by definition.
    }

    AsyncFunction("isExcludedFromBackup") { _: String ->
      true
    }

    AsyncFunction("md5File") Coroutine { uri: String ->
      md5File(File(URI(uri)))
    }

    Function("randomUUID") {
      UUID.randomUUID().toString().lowercase()
    }
  }

  private fun musicDirectory(): File {
    val context = appContext.reactContext ?: throw Exceptions.AppContextLost()
    val directory = File(context.noBackupFilesDir, "BeatNote/Music")
    if (!directory.exists() && !directory.mkdirs()) {
      throw IOException("Unable to create BeatNote music directory")
    }
    if (!directory.isDirectory) {
      throw IOException("BeatNote music path is not a directory")
    }
    return directory
  }

  private fun md5File(file: File): String {
    val messageDigest = MessageDigest.getInstance("MD5")
    FileInputStream(file).use { input ->
      DigestInputStream(input, messageDigest).use { digestInput ->
        val buffer = ByteArray(HASH_CHUNK_SIZE)
        while (digestInput.read(buffer) != -1) {
          // Reading through DigestInputStream updates the digest.
        }
      }
    }
    return messageDigest.digest().joinToString(separator = "") {
      "%02x".format(it.toInt() and 0xff)
    }
  }

  private companion object {
    const val HASH_CHUNK_SIZE = 1_048_576
  }
}
