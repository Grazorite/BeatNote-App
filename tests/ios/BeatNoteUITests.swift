import XCTest

final class BeatNoteUITests: XCTestCase {
  private var app: XCUIApplication!

  override func setUpWithError() throws {
    continueAfterFailure = false
    app = XCUIApplication()
    app.launchArguments += ["-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
    XCUIDevice.shared.orientation = .portrait
    app.launch()
    closeMobileSidebar()
  }

  func testStudioLaunchesAndDocumentPickerOpens() {
    XCTAssertTrue(element("load-song").waitForExistence(timeout: 20))
    XCTAssertFalse(app.staticTexts["Something went wrong"].exists)
    XCTAssertTrue(element("sidebar-open-toggle").isHittable)
    XCTAssertFalse(element("sidebar-toggle").exists, "Closed drawer must not overlap the project toolbar.")
    element("sidebar-open-toggle").tap()
    XCTAssertTrue(element("sidebar-toggle").waitForExistence(timeout: 5))
    XCTAssertFalse(app.staticTexts["Stem Separation"].exists)
    XCTAssertFalse(app.staticTexts["View Mode"].exists)
    element("sidebar-toggle").tap()
    XCTAssertTrue(element("project-actions-scroll-cue").waitForExistence(timeout: 5))
    element("project-actions-scroll-cue").tap()
    XCTAssertTrue(element("import-data").isHittable)
    element("project-actions-scroll-cue").tap()

    element("load-song").tap()
    XCTAssertTrue(waitForPicker(timeout: 15))

    let cancel = app.buttons["Cancel"].firstMatch
    if cancel.waitForExistence(timeout: 3) {
      cancel.tap()
    }
  }

  func testAudioAnnotationAndProjectRestore() {
    loadBundledSimulatorAudio()

    let playback = element("play-pause")
    XCTAssertTrue(playback.waitForExistence(timeout: 10))
    playback.tap()
    let pauseButton = app.descendants(matching: .any).matching(NSPredicate(format: "label == %@", "Pause playback")).firstMatch
    XCTAssertTrue(pauseButton.waitForExistence(timeout: 5))
    pauseButton.tap()

    element("add-marker").tap()
    let annotation = app.textFields["marker-annotation"]
    XCTAssertTrue(annotation.waitForExistence(timeout: 5))
    let workspaceScroll = app.scrollViews.firstMatch
    for _ in 0..<3 {
      if annotation.isHittable { break }
      workspaceScroll.swipeUp()
    }
    XCTAssertTrue(annotation.isHittable)
    annotation.tap()
    annotation.typeText("Dance note")
    let annotationSavedToField = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "value == %@", "Dance note"),
      object: annotation
    )
    XCTAssertEqual(XCTWaiter.wait(for: [annotationSavedToField], timeout: 5), .completed)

    let projectName = "UITest-\(UUID().uuidString.prefix(8))"
    let saveButton = element("save-project")
    makeProjectActionVisible("save-project")
    XCTAssertTrue(saveButton.waitForExistence(timeout: 5) && saveButton.isHittable)
    saveButton.tap()
    let nameField = app.textFields["save-project-name"]
    XCTAssertTrue(nameField.waitForExistence(timeout: 10))
    nameField.tap()
    nameField.typeText(projectName)
    element("confirm-save-project").tap()
    dismissAlertIfPresent()

    app.terminate()
    app.launch()
    closeMobileSidebar()
    XCTAssertTrue(element("load-project").waitForExistence(timeout: 15))
    makeProjectActionVisible("load-project")
    element("load-project").tap()
    let projectSuffix = String(projectName.suffix(8))
    let savedProject = projectControl(containing: "load-saved-project-", suffix: projectSuffix)
    XCTAssertTrue(savedProject.waitForExistence(timeout: 10))
    savedProject.tap()
    dismissAlertIfPresent()

    XCTAssertEqual(element("load-song").label, "Song Loaded")
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    element("navigate-right-marker").tap()
    XCTAssertEqual(app.textFields["marker-annotation"].value as? String, "Dance note")

    makeProjectActionVisible("load-project")
    element("load-project").tap()
    projectControl(containing: "delete-saved-project-", suffix: projectSuffix).tap()
    let deleteConfirmation = app.alerts["Delete Project"]
    XCTAssertTrue(deleteConfirmation.waitForExistence(timeout: 5))
    deleteConfirmation.buttons["Delete"].tap()
  }

  func testAnnotationRemainsEditableWhilePlaybackContinues() {
    loadBundledSimulatorAudio("background-audio.m4a")
    element("play-pause").tap()

    let pauseButton = app.descendants(matching: .any).matching(
      NSPredicate(format: "label == %@", "Pause playback")
    ).firstMatch
    XCTAssertTrue(pauseButton.waitForExistence(timeout: 5))
    element("add-marker").tap()
    Thread.sleep(forTimeInterval: 0.4)

    let annotation = app.textFields["marker-annotation"]
    XCTAssertTrue(annotation.waitForExistence(timeout: 5))
    XCTAssertTrue(annotation.isHittable, "The annotation editor should stay enabled for the marker just added.")
    annotation.tap()
    annotation.typeText("Live marker note")
    XCTAssertEqual(annotation.value as? String, "Live marker note")
  }

  func testLongTrackOverviewTapAndDragSeek() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    let timeline = element("timeline-gesture-area")
    scrollIntoView(timeline)
    XCTAssertGreaterThan(timeline.frame.width, app.frame.width * 0.8)
    XCTAssertGreaterThan(element("waveform-container").frame.width, app.frame.width * 0.8)

    let currentTime = element("playback-current-time")
    let initialTime = currentTime.label
    timeline.coordinate(withNormalizedOffset: CGVector(dx: 0.7, dy: 0.5)).tap()
    let tappedSeek = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label != %@", initialTime),
      object: currentTime
    )
    XCTAssertEqual(XCTWaiter.wait(for: [tappedSeek], timeout: 5), .completed)
    let tappedSeconds = playbackSeconds(from: currentTime.label)
    XCTAssertTrue((100...110).contains(tappedSeconds), "Overview tap should seek to about 70% of the 150-second track.")

    timeline.coordinate(withNormalizedOffset: CGVector(dx: 0.8, dy: 0.5))
      .press(forDuration: 0.1, thenDragTo: timeline.coordinate(withNormalizedOffset: CGVector(dx: 0.25, dy: 0.5)))
    let draggedSeek = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label != %@", currentTime.label),
      object: currentTime
    )
    XCTAssertEqual(XCTWaiter.wait(for: [draggedSeek], timeout: 5), .completed)
    XCTAssertTrue((30...45).contains(playbackSeconds(from: currentTime.label)), "Overview drag should seek to about 25% of the track.")
  }

  func testCsvImportAndShareSheetExport() {
    loadBundledSimulatorAudio()
    element("add-marker").tap()
    makeProjectActionVisible("import-data")
    element("import-data").tap()
    element("select-csv-file").tap()
    selectDocument("valid-import.csv")
    dismissAlertIfPresent()

    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("2 markers"))
    makeProjectActionVisible("export-data")
    element("export-data").tap()
    element("export-csv").tap()

    let shareSheet = app.otherElements["ActivityListView"]
    let copyAction = app.buttons["Copy"]
    XCTAssertTrue(
      shareSheet.waitForExistence(timeout: 10) || copyAction.waitForExistence(timeout: 2),
      "CSV export should present the iOS share sheet.\n\(app.debugDescription)"
    )
  }

  func testInvalidCsvImportShowsError() {
    loadBundledSimulatorAudio()
    makeProjectActionVisible("import-data")
    element("import-data").tap()
    element("select-csv-file").tap()
    selectDocument("invalid-import.csv")

    XCTAssertTrue(app.alerts["Import Failed"].waitForExistence(timeout: 10))
    app.alerts.buttons["OK"].tap()
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
    XCUIDevice.shared.orientation = .landscapeLeft
    loadBundledSimulatorAudio()

    XCTAssertLessThanOrEqual(element("play-pause").frame.width, 44)
    XCTAssertLessThanOrEqual(element("add-marker").frame.width, 44)
    XCTAssertLessThanOrEqual(element("load-song").frame.height, 56)
    let rail = element("landscape-control-rail")
    XCTAssertTrue(rail.waitForExistence(timeout: 5))
    XCTAssertLessThanOrEqual(rail.frame.width, 280)

    let waveform = element("waveform-gesture-area")
    scrollIntoView(waveform)
    XCTAssertTrue(waveform.isHittable, "Waveform gesture area should be visible.")
    XCTAssertGreaterThan(element("waveform-container").frame.width, app.frame.width * 0.45)
    XCTAssertLessThanOrEqual(element("waveform-container").frame.maxX, rail.frame.minX + 5)
    waveform.coordinate(withNormalizedOffset: CGVector(dx: 0.65, dy: 0.5)).tap()
    waveform.coordinate(withNormalizedOffset: CGVector(dx: 0.75, dy: 0.5))
      .press(forDuration: 0.1, thenDragTo: waveform.coordinate(withNormalizedOffset: CGVector(dx: 0.35, dy: 0.5)))
    assertNoGestureRuntimeError()

    let timeline = element("timeline-gesture-area")
    scrollIntoView(timeline)
    XCTAssertTrue(timeline.isHittable, "Timeline scrollbar gesture area should be visible.")
    timeline.coordinate(withNormalizedOffset: CGVector(dx: 0.7, dy: 0.5)).tap()
    timeline.coordinate(withNormalizedOffset: CGVector(dx: 0.45, dy: 0.5))
      .press(forDuration: 0.1, thenDragTo: timeline.coordinate(withNormalizedOffset: CGVector(dx: 0.55, dy: 0.5)))
    assertNoGestureRuntimeError()
  }

  func testLandscapeCsvImportAndExport() {
    XCUIDevice.shared.orientation = .landscapeLeft
    loadBundledSimulatorAudio("background-audio.m4a")
    element("add-marker").tap()

    let importButton = element("import-data")
    makeProjectActionVisible("import-data")
    XCTAssertTrue(importButton.isHittable, "Import should remain reachable from the landscape project toolbar.")
    importButton.tap()
    let selectCsv = element("select-csv-file")
    XCTAssertTrue(selectCsv.waitForExistence(timeout: 5) && selectCsv.isHittable)
    selectCsv.tap()
    selectDocument("valid-import.csv")
    dismissAlertIfPresent()

    let exportButton = element("export-data")
    makeProjectActionVisible("export-data")
    XCTAssertTrue(exportButton.isHittable)
    exportButton.tap()
    let exportCsv = element("export-csv")
    XCTAssertTrue(exportCsv.waitForExistence(timeout: 5) && exportCsv.isHittable)
    exportCsv.tap()

    let shareSheet = app.otherElements["ActivityListView"]
    let copyAction = app.buttons["Copy"]
    XCTAssertTrue(
      shareSheet.waitForExistence(timeout: 10) || copyAction.waitForExistence(timeout: 2),
      "CSV export should present the iOS share sheet in landscape.\n\(app.debugDescription)"
    )
  }

  private func loadBundledSimulatorAudio(_ filename: String = "test-audio.wav") {
    XCTAssertTrue(element("load-song").waitForExistence(timeout: 20))
    element("load-song").tap()
    selectDocument(filename)
    dismissAlertIfPresent()
    XCTAssertEqual(element("load-song").label, "Song Loaded")
  }

  private func element(_ identifier: String) -> XCUIElement {
    app.descendants(matching: .any).matching(identifier: identifier).firstMatch
  }

  private func closeMobileSidebar() {
    let toggle = element("sidebar-toggle")
    XCTAssertTrue(toggle.waitForExistence(timeout: 10))
    toggle.tap()
  }

  private func makeProjectActionVisible(_ identifier: String) {
    let action = element(identifier)
    let toolbar = element("project-actions-scroll")
    for _ in 0..<5 {
      if action.isHittable { return }
      toolbar.swipeLeft()
    }
  }

  private func scrollIntoView(_ element: XCUIElement) {
    let workspaceScroll = self.element("mobile-workspace-scroll")
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

  private func projectControl(containing prefix: String, suffix: String) -> XCUIElement {
    app.descendants(matching: .any).matching(
      NSPredicate(format: "identifier BEGINSWITH %@ AND identifier CONTAINS %@", prefix, suffix)
    ).firstMatch
  }

  private func selectDocument(_ filename: String) {
    XCTAssertTrue(waitForPicker(timeout: 15), "Document picker did not appear.\n\(app.debugDescription)")

    let fileLabel = (filename as NSString).deletingPathExtension
    let file = app.descendants(matching: .any).matching(
      NSPredicate(format: "label BEGINSWITH %@", fileLabel)
    ).firstMatch

    if !file.waitForExistence(timeout: 2) {
      let browse = app.buttons["Browse"].firstMatch
      if browse.exists && !browse.isSelected {
        browse.tap()
      }
      tapPickerLocation("On My iPhone")
      tapPickerLocation("BeatNote")
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
    let item = app.descendants(matching: .any).matching(predicate).firstMatch
    XCTAssertTrue(item.waitForExistence(timeout: timeout), "Could not find '\(label)' in Files picker.\n\(app.debugDescription)")
    XCTAssertTrue(item.isHittable, "'\(label)' is not hittable in Files picker.")
    item.tap()
  }

  private func dismissAlertIfPresent() {
    let ok = app.alerts.buttons["OK"].firstMatch
    if ok.waitForExistence(timeout: 2) {
      ok.tap()
    }
  }
}
