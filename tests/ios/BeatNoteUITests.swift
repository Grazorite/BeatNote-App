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

  override func tearDownWithError() throws {
    app?.terminate()
    XCUIDevice.shared.orientation = .portrait
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

    let loadSong = element("load-song")
    loadSong.tap()
    if !waitForPicker(timeout: 15) {
      app.activate()
      XCTAssertTrue(loadSong.waitForExistence(timeout: 5) && loadSong.isHittable)
      loadSong.tap()
    }
    XCTAssertTrue(waitForPicker(timeout: 10))

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

    let beforeDrag = currentTime.label
    timeline.coordinate(withNormalizedOffset: CGVector(dx: 0.8, dy: 0.5))
      .press(forDuration: 0.1, thenDragTo: timeline.coordinate(withNormalizedOffset: CGVector(dx: 0.25, dy: 0.5)))
    let draggedSeek = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label != %@", beforeDrag),
      object: currentTime
    )
    XCTAssertEqual(XCTWaiter.wait(for: [draggedSeek], timeout: 5), .completed)
    XCTAssertTrue((30...45).contains(playbackSeconds(from: currentTime.label)), "Overview drag should seek to about 25% of the track.")
  }

  func testWrappedRowSeekMarkerAndDragGestures() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    let accessibleRow = element("wrapped-row-0")
    scrollIntoView(accessibleRow)
    XCTAssertTrue(accessibleRow.waitForExistence(timeout: 10))
    XCTAssertEqual(accessibleRow.label, "Row 1, 0:00 to 0:04, phrase 1")
    XCTAssertTrue(String(describing: accessibleRow.value ?? "").contains("Playback at 0:00"))

    let row = element("wrapped-row-gesture-area-0")
    scrollIntoView(row)
    XCTAssertTrue(row.waitForExistence(timeout: 10) && row.isHittable)

    let currentTime = element("playback-current-time")
    let initialTime = currentTime.label
    row.coordinate(withNormalizedOffset: CGVector(dx: 0.7, dy: 0.8)).tap()
    let tappedSeek = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label != %@", initialTime),
      object: currentTime
    )
    XCTAssertEqual(XCTWaiter.wait(for: [tappedSeek], timeout: 5), .completed)
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("0 markers"))

    let markerPosition = row.coordinate(withNormalizedOffset: CGVector(dx: 0.55, dy: 0.1))
    markerPosition.tap()
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    let markerIndicator = app.descendants(matching: .any).matching(
      NSPredicate(format: "identifier BEGINSWITH %@", "wrapped-row-marker-vocals-")
    ).firstMatch
    XCTAssertTrue(markerIndicator.waitForExistence(timeout: 5))
    XCTAssertTrue(markerIndicator.label.contains("Vocals marker"))
    XCTAssertTrue(markerIndicator.label.contains("not annotated"))
    let annotation = app.textFields["marker-annotation"]
    XCTAssertTrue(annotation.isEnabled)
    annotation.tap()
    annotation.typeText("Row note")
    let annotatedMarker = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label CONTAINS %@", ", annotated"),
      object: markerIndicator
    )
    XCTAssertEqual(XCTWaiter.wait(for: [annotatedMarker], timeout: 5), .completed)
    let annotationIndicator = app.descendants(matching: .any).matching(
      NSPredicate(format: "identifier BEGINSWITH %@", "wrapped-row-annotation-vocals-")
    ).firstMatch
    XCTAssertTrue(annotationIndicator.waitForExistence(timeout: 5))

    markerPosition.tap()
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"), "Selecting a marker must not duplicate it.")

    let rowYBeforeDrag = row.frame.minY
    let beforeDrag = currentTime.label
    row.coordinate(withNormalizedOffset: CGVector(dx: 0.8, dy: 0.8))
      .press(forDuration: 0.1, thenDragTo: row.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.8)))
    let draggedSeek = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label != %@", beforeDrag),
      object: currentTime
    )
    XCTAssertEqual(XCTWaiter.wait(for: [draggedSeek], timeout: 5), .completed)
    XCTAssertEqual(
      row.frame.minY,
      rowYBeforeDrag,
      accuracy: 3,
      "Horizontal row seeking must not move the surrounding page vertically."
    )
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    assertNoGestureRuntimeError()
  }

  func testWrappedRowDensityPresetsReflowWithoutChangingMarkers() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    let defaultDensity = element("row-density-preset-default")
    scrollIntoView(defaultDensity)
    XCTAssertTrue(defaultDensity.waitForExistence(timeout: 5) && defaultDensity.isHittable)
    defaultDensity.tap()
    assertSecondRowStarts(at: "0:08")

    let row = element("wrapped-row-gesture-area-0")
    scrollIntoView(row)
    XCTAssertTrue(row.waitForExistence(timeout: 10) && row.isHittable)
    row.coordinate(withNormalizedOffset: CGVector(dx: 0.25, dy: 0.1)).tap()
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))

    let spacious = element("row-density-preset-spacious")
    scrollIntoView(spacious)
    XCTAssertTrue(spacious.waitForExistence(timeout: 5) && spacious.isHittable)
    spacious.tap()
    assertSecondRowStarts(at: "0:04")
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))

    let compact = element("row-density-preset-compact")
    XCTAssertTrue(compact.waitForExistence(timeout: 5) && compact.isHittable)
    compact.tap()
    assertSecondRowStarts(at: "0:12")
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    assertNoGestureRuntimeError()
  }

  func testWrappedFollowPlayheadTracksDistantRow() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    let followToggle = element("wrapped-follow-toggle")
    scrollIntoView(followToggle)
    XCTAssertTrue(followToggle.waitForExistence(timeout: 10))
    if (followToggle.value as? String) != "1" {
      followToggle.tap()
    }
    XCTAssertEqual(followToggle.value as? String, "1")

    element("play-pause").tap()
    let timeline = element("timeline-gesture-area")
    scrollIntoView(timeline)
    timeline.coordinate(withNormalizedOffset: CGVector(dx: 0.7, dy: 0.5)).tap()

    let distantRow = element("wrapped-row-26")
    XCTAssertTrue(
      distantRow.waitForExistence(timeout: 5),
      "Follow-playhead should virtualize the row containing the new playback position."
    )

    let playbackTime = element("playback-current-time")
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
    XCTAssertTrue(
      element("wrapped-row-26").waitForExistence(timeout: 5) || element("wrapped-row-27").waitForExistence(timeout: 1),
      "Follow-playhead should restore the distant playback row after returning from background."
    )
    let pauseButton = app.descendants(matching: .any).matching(
      NSPredicate(format: "label == %@", "Pause playback")
    ).firstMatch
    XCTAssertTrue(pauseButton.exists, "Playback should remain active after returning from background.")

    scrollIntoView(followToggle)
    followToggle.tap()
    XCTAssertEqual(followToggle.value as? String, "0")
    followToggle.tap()
    XCTAssertEqual(followToggle.value as? String, "1")
    assertNoGestureRuntimeError()
  }

  func testLandscapeReflowPreservesMarkersAndDocksDetailPanel() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    let portraitSecondGutter = element("wrapped-row-gutter-1")
    scrollIntoView(portraitSecondGutter)
    XCTAssertTrue(portraitSecondGutter.waitForExistence(timeout: 5))
    XCTAssertEqual(portraitSecondGutter.label, "Row starts at 0:04")

    let row = element("wrapped-row-gesture-area-0")
    scrollIntoView(row)
    XCTAssertTrue(row.waitForExistence(timeout: 10) && row.isHittable)
    row.coordinate(withNormalizedOffset: CGVector(dx: 0.4, dy: 0.1)).tap()
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    let marker = app.descendants(matching: .any).matching(
      NSPredicate(format: "identifier BEGINSWITH %@", "wrapped-row-marker-vocals-")
    ).firstMatch
    XCTAssertTrue(marker.waitForExistence(timeout: 5))
    let markerIdentifier = marker.identifier

    rotateAppToLandscape()
    assertSecondRowStarts(at: "0:08")
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    XCTAssertTrue(element(markerIdentifier).waitForExistence(timeout: 5))

    let detailAction = element("wrapped-row-detail-0")
    scrollIntoView(detailAction)
    XCTAssertTrue(detailAction.waitForExistence(timeout: 10) && detailAction.isHittable)
    detailAction.tap()

    let wrapped = element("wrapped-waveform")
    let detail = element("waveform-detail-panel")
    XCTAssertTrue(wrapped.waitForExistence(timeout: 10), "Landscape detail must retain wrapped context.")
    XCTAssertTrue(detail.waitForExistence(timeout: 10))
    XCTAssertLessThanOrEqual(
      wrapped.frame.maxX,
      detail.frame.minX + 5,
      "Landscape detail should dock beside the wrapped rows without overlap."
    )
    XCTAssertTrue(element(markerIdentifier).exists, "Opening detail must not remove the existing marker.")
    assertNoGestureRuntimeError()
  }

  func testPrecisionDetailModeOpensAndRestoresWrappedRow() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    let detailAction = element("wrapped-row-detail-0")
    scrollIntoView(detailAction)
    XCTAssertTrue(detailAction.waitForExistence(timeout: 10) && detailAction.isHittable)
    let timeBeforeSwitch = element("playback-current-time").label
    detailAction.tap()

    XCTAssertTrue(element("waveform-detail-panel").waitForExistence(timeout: 10))
    XCTAssertFalse(element("wrapped-waveform").exists)
    XCTAssertEqual(element("playback-current-time").label, timeBeforeSwitch)

    element("waveform-detail-close").tap()
    XCTAssertTrue(element("wrapped-waveform").waitForExistence(timeout: 10))
    XCTAssertTrue(element("wrapped-row-detail-0").waitForExistence(timeout: 5))
    XCTAssertEqual(element("playback-current-time").label, timeBeforeSwitch)
    assertNoGestureRuntimeError()
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
    loadBundledSimulatorAudio()
    rotateAppToLandscape()

    let rail = element("landscape-control-rail")
    XCTAssertTrue(rail.waitForExistence(timeout: 10))
    XCTAssertLessThanOrEqual(element("play-pause").frame.width, 44)
    XCTAssertLessThanOrEqual(element("add-marker").frame.width, 44)
    XCTAssertLessThanOrEqual(element("load-song").frame.height, 56)
    XCTAssertLessThanOrEqual(rail.frame.width, 280)

    let waveform = element("wrapped-row-gesture-area-0")
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
    rotateAppToLandscape()
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

  private func assertSecondRowStarts(at timestamp: String) {
    let gutter = element("wrapped-row-gutter-1")
    XCTAssertTrue(gutter.waitForExistence(timeout: 5))
    XCTAssertEqual(gutter.label, "Row starts at \(timestamp)")
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
