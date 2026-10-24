import XCTest

final class BeatNoteUITests: XCTestCase {
  private var app: XCUIApplication!

  override func setUpWithError() throws {
    continueAfterFailure = false
    app = XCUIApplication()
    app.launchArguments += ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
    XCUIDevice.shared.orientation = .portrait
    app.launch()
    openDevelopmentServerIfNeeded()
    closeMobileSidebar()
  }

  override func tearDownWithError() throws {
    app?.terminate()
    XCUIDevice.shared.orientation = .portrait
  }

  func testStudioLaunchesAndDocumentPickerOpens() {
    XCTAssertTrue(element("song-title-control").waitForExistence(timeout: 20))
    let restoredAudio = element("loop-overview").exists
    let lowestDockButton = element("playback-speed")
    XCTAssertTrue(lowestDockButton.exists)
    XCTAssertLessThanOrEqual(
      lowestDockButton.frame.maxY,
      app.frame.maxY - 30,
      "The bottom dock must remain above the iPhone curved-corner safe area."
    )
    XCTAssertFalse(app.staticTexts["Something went wrong"].exists)
    XCTAssertTrue(element("sidebar-open-toggle").isHittable)
    XCTAssertGreaterThan(
      element("sidebar-open-toggle").frame.minX,
      element("load-project").frame.minX,
      "Settings should be the trailing action in the mobile project toolbar."
    )
    XCTAssertFalse(element("sidebar-toggle").exists, "Closed drawer must not overlap the project toolbar.")
    if restoredAudio {
      XCTAssertTrue(element("song-title-control").label.contains("current song"))
    } else {
      XCTAssertEqual(element("song-title-control").label, "Music library, no song chosen")
    }
    XCTAssertEqual(element("load-project").label, "Open Projects")
    if !restoredAudio {
      for disabledControl in [
        "navigate-left-marker", "add-marker", "navigate-right-marker", "play-pause",
        "repeat-toggle", "inner-loop-cycle", "shuffle-control", "first-track-control",
        "previous-track-control", "next-track-control", "playback-speed", "remove-last-marker",
        "annotation-control"
      ] {
        XCTAssertFalse(element(disabledControl).isEnabled, "\(disabledControl) should be disabled until a song is loaded.")
      }
    }
    element("sidebar-open-toggle").tap()
    XCTAssertTrue(element("sidebar-toggle").waitForExistence(timeout: 5))
    XCTAssertTrue(element("settings-page").waitForExistence(timeout: 5))
    XCTAssertTrue(element("settings-help").waitForExistence(timeout: 5))
    XCTAssertFalse(element("settings-bpm").exists)
    XCTAssertFalse(app.staticTexts["Project BPM"].exists)
    XCTAssertFalse(app.staticTexts["Stem Separation"].exists)
    XCTAssertFalse(app.staticTexts["View Mode"].exists)
    for hiddenSetting in [
      "Canvas Options",
      "Ghost Playhead in Timeline",
      "Show Loop Overview",
      "Show Grid Lines",
      "Magnetic Snapping",
      "Marker Options",
      "Active Layer Only",
      "Show Annotations",
    ] {
      XCTAssertFalse(app.staticTexts[hiddenSetting].exists, "\(hiddenSetting) should stay hidden in V1 settings.")
    }
    element("sidebar-toggle").tap()
    XCTAssertFalse(element("project-actions-scroll-cue").exists)
    for action in ["song-title-control", "save-project", "load-project", "sidebar-open-toggle"] {
      XCTAssertTrue(element(action).exists, "All project actions must fit without horizontal scrolling.")
    }

    let songTitle = element("song-title-control")
    songTitle.tap()
    XCTAssertEqual(element("music-library-sheet-title").label, "Music")
    let importAudio = element("music-library-import")
    XCTAssertTrue(importAudio.waitForExistence(timeout: 5))
    importAudio.tap()
    if !waitForPicker(timeout: 15) {
      app.activate()
      XCTAssertTrue(importAudio.waitForExistence(timeout: 5) && importAudio.isHittable)
      importAudio.tap()
    }
    XCTAssertTrue(waitForPicker(timeout: 10))

    let cancel = app.buttons["Cancel"].firstMatch
    if cancel.waitForExistence(timeout: 3) {
      cancel.tap()
    }
  }

  func testAudioAnnotationAndProjectRestore() {
    loadBundledSimulatorAudio()
    XCTAssertTrue(
      element("wrapped-row-peaks-0").waitForExistence(timeout: 10),
      "Native audio loading should decode real waveform peaks for wrapped rows."
    )
    XCTAssertTrue(
      element("loop-overview-peaks").waitForExistence(timeout: 5),
      "Native audio loading should decode real waveform peaks for the overview strip."
    )

    let playback = element("play-pause")
    XCTAssertTrue(playback.waitForExistence(timeout: 10))
    playback.tap()
    let pauseButton = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Pause playback")).firstMatch
    XCTAssertTrue(pauseButton.waitForExistence(timeout: 5))
    pauseButton.tap()
    waitForWrappedCanvasEnd("to 0:05")

    let overview = element("loop-overview")
    overview.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.5))
      .press(forDuration: 0.1, thenDragTo: overview.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)))
    XCTAssertTrue(element("loop-overview-range").waitForExistence(timeout: 5))
    element("inner-loop-cycle").tap()
    element("inner-loop-cycle").tap()
    let savedLoopSummary = element("loop-overview-summary").label
    let savedLoopToggleValue = String(describing: element("inner-loop-cycle").value ?? "")

    element("add-marker").tap()
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))

    Thread.sleep(forTimeInterval: 1.0)
    app.terminate()
    app.launchEnvironment["BEATNOTE_TEST_PURGE_CACHES"] = "1"
    app.launch()
    openDevelopmentServerIfNeeded()
    closeMobileSidebar()
    let restoredTitle = element("song-title-control")
    let durableCopyLoaded = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label CONTAINS %@", "current song test-audio"),
      object: restoredTitle
    )
    XCTAssertEqual(XCTWaiter.wait(for: [durableCopyLoaded], timeout: 20), .completed)
    XCTAssertEqual(element("playback-current-time").label, "Current: 0:00")
    XCTAssertTrue(element("play-pause").label.contains("Play playback"))
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    XCTAssertEqual(element("loop-overview-summary").label, savedLoopSummary)
    XCTAssertTrue(element("loop-overview-range").exists, "Draft loop range should restore after relaunch.")
    XCTAssertEqual(String(describing: element("inner-loop-cycle").value ?? ""), savedLoopToggleValue)
  }

  func testLoopRangeToggleAndTransportFits() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    let dockIDs = [
      "navigate-left-marker", "add-marker", "navigate-right-marker", "play-pause",
      "repeat-toggle", "inner-loop-cycle", "shuffle-control", "first-track-control",
      "previous-track-control", "next-track-control", "playback-speed", "remove-last-marker",
      "annotation-control"
    ]
    for control in dockIDs.map({ element($0) }) {
      XCTAssertTrue(control.exists)
      XCTAssertGreaterThanOrEqual(control.frame.height, 44)
    }
    XCTAssertTrue(element("control-dock").exists)
    XCTAssertFalse(element("loop-region-toggle").exists)
    XCTAssertFalse(element("loop-marker-toggle").exists)
    XCTAssertGreaterThanOrEqual(element("play-pause").frame.width, element("add-marker").frame.width * 1.9)
    XCTAssertGreaterThanOrEqual(element("play-pause").frame.height, element("add-marker").frame.height * 1.9)

    let speed = element("playback-speed")
    XCTAssertTrue(speed.label.contains("1×"))
    speed.tap()
    let doubleSpeed = app.descendants(matching: .any).matching(
      NSPredicate(format: "label == %@", "Select 2× playback speed")
    ).firstMatch
    XCTAssertTrue(doubleSpeed.waitForExistence(timeout: 5))
    doubleSpeed.tap()
    XCTAssertTrue(speed.label.contains("2×"))
    Thread.sleep(forTimeInterval: 0.38)
    speed.tap()
    let reopenedResetSpeed = app.descendants(matching: .any).matching(
      NSPredicate(format: "label == %@", "Reset playback speed to 1×")
    ).firstMatch
    XCTAssertTrue(reopenedResetSpeed.waitForExistence(timeout: 1))
    XCTAssertTrue(reopenedResetSpeed.isHittable, "The speed popup must stay above the Play control.")
    speed.tap()
    Thread.sleep(forTimeInterval: 0.5)
    let playbackTime = element("playback-current-time")
    element("play-pause").tap()
    Thread.sleep(forTimeInterval: 2.0)
    element("play-pause").tap()
    XCTAssertGreaterThanOrEqual(
      playbackSeconds(from: playbackTime.label),
      3,
      "Two-times playback should advance the media clock faster than wall time."
    )
    speed.tap()
    let resetSpeed = app.descendants(matching: .any).matching(
      NSPredicate(format: "label == %@", "Reset playback speed to 1×")
    ).firstMatch
    XCTAssertTrue(resetSpeed.waitForExistence(timeout: 5))
    resetSpeed.tap()
    XCTAssertTrue(speed.label.contains("1×"))

    XCTAssertFalse(element("remove-last-marker").isEnabled)
    XCTAssertTrue(element("annotation-control").isEnabled)
    element("annotation-control").tap()
    let markerRequiredToast = app.staticTexts["Add a marker first"]
    XCTAssertTrue(markerRequiredToast.waitForExistence(timeout: 2))

    let clearControl = element("loop-overview-clear")
    XCTAssertTrue(clearControl.exists)
    XCTAssertFalse(clearControl.isEnabled)
    XCTAssertFalse(element("loop-overview-outside-start").exists)
    XCTAssertFalse(element("loop-overview-outside-end").exists)
    let toggle = element("inner-loop-cycle")
    let toggleBefore = String(describing: toggle.value ?? "")
    toggle.tap()
    toggle.tap()
    XCTAssertTrue(element("loop-overview-range").waitForExistence(timeout: 5))
    XCTAssertTrue(clearControl.isEnabled)
    let toggleAfter = String(describing: toggle.value ?? "")
    XCTAssertNotEqual(toggleAfter, toggleBefore, "Inner-loop control should expose its range state (before: \(toggleBefore), after: \(toggleAfter)).")

    let rows = app.descendants(matching: .any).matching(
      NSPredicate(format: "identifier BEGINSWITH %@", "wrapped-row-gesture-area-")
    )
    XCTAssertGreaterThan(rows.count, 1)
    let lastRow = rows.element(boundBy: rows.count - 1)
    XCTAssertTrue(lastRow.exists && lastRow.isHittable)
    lastRow.coordinate(withNormalizedOffset: CGVector(dx: 0.8, dy: 0.5)).tap()
    XCTAssertGreaterThan(playbackSeconds(from: playbackTime.label), 0)
    element("play-pause").tap()
    Thread.sleep(forTimeInterval: 6.0)
    XCTAssertLessThanOrEqual(
      playbackSeconds(from: playbackTime.label),
      5,
      "A selected range ending at the song boundary must wrap instead of stopping."
    )
  }

  func testCsvImportAndShareSheetExport() {
    loadBundledSimulatorAudio()
    element("add-marker").tap()
    makeProjectActionVisible("load-project")
    element("load-project").tap()
    XCTAssertTrue(element("current-project-import-csv").waitForExistence(timeout: 5))
    element("current-project-import-csv").tap()
    selectDocument("valid-import.csv")
    XCTAssertTrue(element("csv-replace-confirm").waitForExistence(timeout: 5))
    XCTAssertEqual(element("csv-existing-counts").label, "Existing: 1 marker, 0 annotations")
    XCTAssertEqual(element("csv-imported-counts").label, "Imported: 1 marker, 1 annotation")
    XCTAssertEqual(element("csv-skipped-count").label, "Skipped: 0 rows")
    element("csv-replace-apply").tap()

    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    makeProjectActionVisible("load-project")
    element("load-project").tap()
    XCTAssertTrue(element("current-project-export-csv").waitForExistence(timeout: 5))
    element("current-project-export-csv").tap()
    XCTAssertTrue(app.staticTexts["1 marker ready to export"].waitForExistence(timeout: 5))
    XCTAssertTrue(
      element("export-csv").label.contains("Includes timestamps, BPM-derived bar:beat timing, and annotations")
    )
    XCTAssertFalse(element("export-midi").exists)
    element("export-csv").tap()

    let shareSheet = app.otherElements["ActivityListView"]
    let copyAction = app.buttons["Copy"]
    XCTAssertTrue(
      shareSheet.waitForExistence(timeout: 10) || copyAction.waitForExistence(timeout: 2),
      "CSV export should present the iOS share sheet.\n\(app.debugDescription)"
    )
  }

  func testOpenInAudioImportsIntoLibrary() {
    let title = element("song-title-control")
    XCTAssertTrue(title.waitForExistence(timeout: 20))
    let loadedTitle = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label CONTAINS %@", "current song open-in-audio"),
      object: title
    )
    XCTAssertEqual(
      XCTWaiter.wait(for: [loadedTitle], timeout: 30),
      .completed,
      "Open In should import and load the delivered audio file.\n\(app.debugDescription)"
    )
    XCTAssertTrue(
      app.staticTexts["Imported “open-in-audio”"].waitForExistence(timeout: 5),
      "Open In should confirm the import in the dock toast."
    )

    title.tap()
    XCTAssertTrue(element("music-library-sheet").waitForExistence(timeout: 5))
    XCTAssertTrue(
      app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "open-in-audio, ")).firstMatch
        .waitForExistence(timeout: 5),
      "The Open In item should remain in the local music library."
    )
  }

  func testAudioContinuesWhileAppIsInBackground() {
    loadBundledSimulatorAudio("background-audio.m4a")

    let playbackTime = element("playback-current-time")
    XCTAssertTrue(playbackTime.waitForExistence(timeout: 5))
    element("play-pause").tap()
    let pauseButton = app.descendants(matching: .any).matching(
      NSPredicate(format: "label == %@", "Pause playback")
    ).firstMatch
    XCTAssertTrue(pauseButton.waitForExistence(timeout: 5))
    let timeBeforeBackground = playbackTime.label

    XCUIDevice.shared.press(.home)
    Thread.sleep(forTimeInterval: 1.5)
    app.activate()

    XCTAssertTrue(playbackTime.waitForExistence(timeout: 10))
    let timeAdvanced = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label != %@", timeBeforeBackground),
      object: playbackTime
    )
    XCTAssertEqual(XCTWaiter.wait(for: [timeAdvanced], timeout: 5), .completed)
    XCTAssertTrue(pauseButton.exists, "Playback should remain active after returning from background.")

    let secondsBefore = playbackSeconds(from: timeBeforeBackground)
    let secondsAfter = playbackSeconds(from: playbackTime.label)
    XCTAssertGreaterThan(secondsAfter, secondsBefore, "The playback clock should advance while the app is backgrounded.")
  }

  func testLandscapeGesturesAndCompactControls() {
    loadBundledSimulatorAudio()
    rotateAppToLandscape()

    let rail = element("landscape-control-rail")
    XCTAssertTrue(rail.waitForExistence(timeout: 10))
    XCTAssertGreaterThanOrEqual(element("add-marker").frame.minX, rail.frame.minX)
    XCTAssertLessThanOrEqual(element("shuffle-control").frame.maxX, rail.frame.maxX)
    XCTAssertLessThanOrEqual(element("song-title-control").frame.height, 56)
    XCTAssertLessThanOrEqual(rail.frame.width, 110)

    let songTitle = element("song-title-control")
    XCTAssertTrue(songTitle.isHittable, "The song title should remain tappable in landscape.")
    songTitle.tap()
    XCTAssertTrue(
      element("music-library-sheet").waitForExistence(timeout: 5),
      "The Music Library sheet should support landscape presentation."
    )
    XCTAssertTrue(element("music-library-import").isHittable)
    element("music-library-sheet-close").tap()
    XCTAssertTrue(rail.waitForExistence(timeout: 5))

    let landscapeButton = element("add-marker").frame
    XCTAssertGreaterThanOrEqual(landscapeButton.height, 38)
    XCTAssertLessThanOrEqual(landscapeButton.width / landscapeButton.height, 1.25)

    let leftColumn = ["navigate-left-marker", "add-marker", "inner-loop-cycle", "repeat-toggle", "first-track-control", "previous-track-control"]
    let rightColumn = ["navigate-right-marker", "remove-last-marker", "annotation-control", "playback-speed", "shuffle-control", "next-track-control"]
    let leftX = element(leftColumn[0]).frame.minX
    let rightX = element(rightColumn[0]).frame.minX
    for identifier in leftColumn { XCTAssertEqual(element(identifier).frame.minX, leftX, accuracy: 2) }
    for identifier in rightColumn { XCTAssertEqual(element(identifier).frame.minX, rightX, accuracy: 2) }
    let orderedControls = ["navigate-left-marker", "add-marker", "inner-loop-cycle", "play-pause", "repeat-toggle", "first-track-control", "previous-track-control"]
    for index in 1..<orderedControls.count {
      XCTAssertLessThan(element(orderedControls[index - 1]).frame.minY, element(orderedControls[index]).frame.minY)
    }
    XCTAssertGreaterThanOrEqual(element("play-pause").frame.width, element("navigate-left-marker").frame.width * 1.9)
    XCTAssertGreaterThanOrEqual(element("play-pause").frame.height, element("navigate-left-marker").frame.height * 1.9)
    XCTAssertGreaterThanOrEqual(element("play-pause").frame.minX, rail.frame.minX - 2)
    XCTAssertLessThanOrEqual(element("play-pause").frame.maxX, rail.frame.maxX + 2)
    XCTAssertLessThanOrEqual(rail.frame.maxY - element("previous-track-control").frame.maxY, 2)

    let waveform = element("wrapped-row-gesture-area-0")
    scrollIntoView(waveform)
    XCTAssertTrue(waveform.isHittable, "Waveform gesture area should be visible.")
    XCTAssertGreaterThan(element("waveform-container").frame.width, app.frame.width * 0.45)
    XCTAssertLessThanOrEqual(element("waveform-container").frame.maxX, rail.frame.minX + 5)
    waveform.coordinate(withNormalizedOffset: CGVector(dx: 0.65, dy: 0.5)).tap()
    waveform.coordinate(withNormalizedOffset: CGVector(dx: 0.75, dy: 0.5))
      .press(forDuration: 0.1, thenDragTo: waveform.coordinate(withNormalizedOffset: CGVector(dx: 0.35, dy: 0.5)))
    assertNoGestureRuntimeError()

    let overview = element("loop-overview")
    scrollIntoView(overview)
    XCTAssertTrue(overview.exists, "Loop overview should exist in landscape.")
    XCTAssertGreaterThan(overview.frame.width, app.frame.width * 0.45, "Loop overview should span the landscape canvas.")
    overview.coordinate(withNormalizedOffset: CGVector(dx: 0.25, dy: 0.5))
      .press(forDuration: 0.1, thenDragTo: overview.coordinate(withNormalizedOffset: CGVector(dx: 0.55, dy: 0.5)))
    XCTAssertTrue(element("loop-overview-range").waitForExistence(timeout: 5))
    XCTAssertFalse(element("marker-annotation").exists)
    XCTAssertGreaterThan(element("waveform-container").frame.width, app.frame.width * 0.55)
    XCUIDevice.shared.orientation = .portrait
    XCTAssertTrue(element("portrait-control-dock").waitForExistence(timeout: 10))
    XCTAssertEqual(
      element("control-dock-glass").frame.width,
      element("portrait-control-dock").frame.width,
      accuracy: 2,
      "The dock glass should remeasure after returning to portrait."
    )
    assertNoGestureRuntimeError()
  }

  private func loadBundledSimulatorAudio(_ filename: String = "test-audio.wav") {
    XCTAssertTrue(element("song-title-control").waitForExistence(timeout: 20))
    element("song-title-control").tap()
    XCTAssertTrue(element("music-library-import").waitForExistence(timeout: 5))
    element("music-library-import").tap()
    selectDocument(filename)
    dismissAlertIfPresent()
    let title = element("song-title-control")
    let expectedTitle = URL(fileURLWithPath: filename).deletingPathExtension().lastPathComponent
    let loadedTitle = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label CONTAINS %@", "current song \(expectedTitle)"),
      object: title
    )
    XCTAssertEqual(XCTWaiter.wait(for: [loadedTitle], timeout: 20), .completed)
    let sheetClosed = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "exists == false"),
      object: element("music-library-sheet")
    )
    XCTAssertEqual(XCTWaiter.wait(for: [sheetClosed], timeout: 10), .completed)
  }

  private func element(_ identifier: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: identifier).firstMatch
  }

  private func typeTextIntoControlledField(_ text: String, field: XCUIElement) {
    // React Native commits controlled TextInput state asynchronously. Sending the entire string in
    // one XCTest event can race those commits and drop or reorder characters on a busy simulator.
    for character in text {
      field.typeText(String(character))
      Thread.sleep(forTimeInterval: 0.08)
    }
  }

  private func waitForWrappedCanvasEnd(_ expectedSuffix: String) {
    let rows = app.descendants(matching: .any).matching(
      NSPredicate(format: "identifier MATCHES %@", "^wrapped-row-[0-9]+$")
    )
    for _ in 0..<60 {
      if rows.count > 0, rows.element(boundBy: rows.count - 1).label.contains(expectedSuffix) {
        return
      }
      Thread.sleep(forTimeInterval: 0.25)
    }
    let lastLabel = rows.count > 0 ? rows.element(boundBy: rows.count - 1).label : "no rows"
    XCTFail("The wrapped canvas did not settle on the loaded audio duration ending \(expectedSuffix). Found: \(lastLabel)")
  }

  private func rotateAppToLandscape() {
    for orientation in [UIDeviceOrientation.landscapeLeft, .landscapeRight] {
      XCUIDevice.shared.orientation = orientation
      app.activate()
      for _ in 0..<20 {
        if app.frame.width > app.frame.height { return }
        Thread.sleep(forTimeInterval: 0.25)
      }
    }
    XCTFail("The iOS simulator did not rotate the app into landscape.")
  }

  private func closeMobileSidebar() {
    let toggle = element("sidebar-toggle")
    if toggle.waitForExistence(timeout: 3) {
      toggle.tap()
      return
    }
    XCTAssertTrue(
      element("sidebar-open-toggle").waitForExistence(timeout: 10),
      "The mobile sidebar should be either open and closable or already closed."
    )
  }

  private func openDevelopmentServerIfNeeded() {
    let studio = element("song-title-control")
    if !studio.waitForExistence(timeout: 3) {
      let localServer = app.buttons["http://localhost:8081"].firstMatch
      XCTAssertTrue(
        localServer.waitForExistence(timeout: 15),
        "The development build should open the studio or offer the local Metro server."
      )
      localServer.tap()
    }
    XCTAssertTrue(studio.waitForExistence(timeout: 30), "The studio did not load from the local Metro server.")

    let onboardingContinue = app.buttons["Continue"].firstMatch
    if onboardingContinue.waitForExistence(timeout: 3) {
      onboardingContinue.tap()
      XCTAssertTrue(studio.waitForExistence(timeout: 5))
    }

    let devMenuClose = app.buttons["Close"].firstMatch
    if devMenuClose.waitForExistence(timeout: 2) {
      devMenuClose.tap()
      XCTAssertFalse(devMenuClose.waitForExistence(timeout: 3))
    }
  }

  private func makeProjectActionVisible(_ identifier: String) {
    let action = element(identifier)
    XCTAssertTrue(action.waitForExistence(timeout: 5), "Project action \(identifier) should exist in the fixed toolbar.")
  }

  private func scrollIntoView(_ element: XCUIElement) {
    let workspaceScroll = self.element("wrapped-waveform")
    for _ in 0..<12 {
      if element.isHittable { return }
      let start = workspaceScroll.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.8))
      let end = workspaceScroll.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.65))
      start.press(forDuration: 0.1, thenDragTo: end)
    }
  }

  private func assertNoGestureRuntimeError() {
    XCTAssertFalse(app.staticTexts["Something went wrong"].exists)
    XCTAssertFalse(
      app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "View config getter callback")).firstMatch.exists
    )
  }

  private func playbackSeconds(from label: String) -> Int {
    let clock = label.components(separatedBy: "Current: ").last ?? ""
    let parts = clock.split(separator: ":").compactMap { Int($0) }
    guard parts.count == 2 else {
      XCTFail("Unexpected playback clock label: \(label)")
      return 0
    }
    return parts[0] * 60 + parts[1]
  }

  private func selectDocument(_ filename: String) {
    XCTAssertTrue(waitForPicker(timeout: 15), "Document picker did not appear.\n\(app.debugDescription)")

    let fileLabel = (filename as NSString).deletingPathExtension
    let file = app.descendants(matching: .any).matching(
      NSPredicate(format: "label BEGINSWITH %@", fileLabel)
    ).firstMatch

    if !file.waitForExistence(timeout: 2) || !file.isHittable {
      let browse = app.buttons["Browse"].firstMatch
      if browse.exists && !browse.isSelected {
        browse.tap()
      }
      tapPickerLocation("On My iPhone")
    }

    tapPickerItem(fileLabel, timeout: 10)
  }

  private func tapPickerLocation(_ label: String) {
    let location = app.descendants(matching: .any).matching(
      NSPredicate(format: "label == %@", label)
    ).firstMatch
    XCTAssertTrue(location.waitForExistence(timeout: 10), "Could not find Files location '\(label)'.\n\(app.debugDescription)")
    XCTAssertTrue(location.isHittable, "Files location '\(label)' is not hittable.")
    location.tap()
  }

  private func waitForPicker(timeout: TimeInterval) -> Bool {
    let picker = app.descendants(matching: .any).matching(
      NSPredicate(format: "label == %@", "Browse")
    ).firstMatch
    let recents = app.descendants(matching: .any).matching(
      NSPredicate(format: "label == %@", "Recents")
    ).firstMatch
    return picker.waitForExistence(timeout: timeout) || recents.waitForExistence(timeout: 1)
  }

  private func tapPickerItem(_ label: String, timeout: TimeInterval) {
    let predicate = NSPredicate(format: "label BEGINSWITH %@", label)
    let matches = app.descendants(matching: .any).matching(predicate)
    XCTAssertTrue(matches.firstMatch.waitForExistence(timeout: timeout), "Could not find '\(label)' in Files picker.\n\(app.debugDescription)")
    for attempt in 0..<5 {
      for index in 0..<matches.count {
        let item = matches.element(boundBy: index)
        if item.isHittable {
          item.tap()
          return
        }
      }
      if attempt < 4 {
        app.swipeUp()
      }
    }
    XCTFail("'\(label)' has no hittable match in Files picker.\n\(app.debugDescription)")
  }

  private func dismissAlertIfPresent() {
    let ok = app.alerts.buttons["OK"].firstMatch
    if ok.waitForExistence(timeout: 2) {
      ok.tap()
    }
  }
}
