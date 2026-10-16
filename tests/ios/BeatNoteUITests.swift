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
    XCTAssertFalse(element("loop-overview").exists, "The loop overview should stay hidden until audio is loaded.")
    let lowestDockButton = element("playback-speed")
    XCTAssertTrue(lowestDockButton.exists)
    XCTAssertLessThanOrEqual(
      lowestDockButton.frame.maxY,
      app.frame.maxY - 30,
      "The bottom dock must remain above the iPhone curved-corner safe area."
    )
    XCTAssertFalse(app.staticTexts["Something went wrong"].exists)
    XCTAssertTrue(element("sidebar-open-toggle").isHittable)
    XCTAssertFalse(element("sidebar-toggle").exists, "Closed drawer must not overlap the project toolbar.")
    XCTAssertEqual(element("load-song").label, "Choose Audio File")
    XCTAssertEqual(element("load-project").label, "Open Projects")
    XCTAssertEqual(element("import-data").label, "Import CSV")
    XCTAssertEqual(element("export-data").label, "Export CSV")
    for disabledControl in [
      "navigate-left-marker", "add-marker", "navigate-right-marker", "play-pause",
      "repeat-toggle", "inner-loop-cycle", "shuffle-control", "first-track-control",
      "previous-track-control", "next-track-control", "playback-speed", "remove-last-marker",
      "annotation-control"
    ] {
      XCTAssertFalse(element(disabledControl).isEnabled, "\(disabledControl) should be disabled until a song is loaded.")
    }
    element("sidebar-open-toggle").tap()
    XCTAssertTrue(element("sidebar-toggle").waitForExistence(timeout: 5))
    XCTAssertTrue(element("settings-help").waitForExistence(timeout: 5))
    XCTAssertTrue(element("settings-bpm").waitForExistence(timeout: 5))
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
    for action in ["load-song", "save-project", "load-project", "export-data", "import-data"] {
      XCTAssertTrue(element(action).exists, "All project actions must fit without horizontal scrolling.")
    }

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
    element("annotation-control").tap()
    let annotation = element("annotation-editor-input")
    XCTAssertTrue(annotation.waitForExistence(timeout: 5))
    let workspaceScroll = app.scrollViews.firstMatch
    for _ in 0..<3 {
      if annotation.isHittable { break }
      workspaceScroll.swipeUp()
    }
    XCTAssertTrue(annotation.isHittable)
    annotation.tap()
    let keyboard = app.keyboards.firstMatch
    XCTAssertTrue(keyboard.waitForExistence(timeout: 5))
    XCTAssertLessThanOrEqual(
      annotation.frame.maxY,
      keyboard.frame.minY + 2,
      "The annotation field must remain visible above the software keyboard."
    )
    typeTextIntoControlledField("Dance note", field: annotation)
    XCTAssertEqual(annotation.value as? String, "Dance note")
    element("save-annotation").tap()

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
    XCTAssertTrue(app.staticTexts["Projects"].waitForExistence(timeout: 5))
    XCTAssertEqual(
      app.staticTexts.matching(NSPredicate(format: "label CONTAINS %@", "annotation layers")).count,
      0
    )
    let projectSuffix = String(projectName.suffix(8))
    let savedProject = projectControl(containing: "load-saved-project-", suffix: projectSuffix)
    XCTAssertTrue(savedProject.waitForExistence(timeout: 10))
    savedProject.tap()
    dismissAlertIfPresent()

    XCTAssertEqual(element("load-song").label, "Replace Audio File")
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    XCTAssertEqual(element("loop-overview-summary").label, savedLoopSummary)
    XCTAssertTrue(element("loop-overview-range").exists, "Saved loop range should restore after relaunch.")
    XCTAssertEqual(String(describing: element("inner-loop-cycle").value ?? ""), savedLoopToggleValue)
    element("navigate-right-marker").tap()
    element("annotation-control").tap()
    XCTAssertEqual(element("annotation-editor-input").value as? String, "Dance note")
    app.buttons["Cancel"].firstMatch.tap()

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
    let row = element("wrapped-row-gesture-area-0")
    let playbackTime = element("playback-current-time")
    XCTAssertTrue(row.waitForExistence(timeout: 5) && playbackTime.exists)
    row.coordinate(withNormalizedOffset: CGVector(dx: 0.65, dy: 0.7)).tap()
    XCTAssertTrue(pauseButton.exists, "A tap seek while playing must continue playback.")
    let timeAfterTap = playbackTime.label
    row.coordinate(withNormalizedOffset: CGVector(dx: 0.25, dy: 0.7))
      .press(forDuration: 0.1, thenDragTo: row.coordinate(withNormalizedOffset: CGVector(dx: 0.55, dy: 0.7)))
    XCTAssertTrue(pauseButton.waitForExistence(timeout: 5), "Playback must resume after a drag seek.")
    let clockAdvanced = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label != %@", timeAfterTap),
      object: playbackTime
    )
    XCTAssertEqual(XCTWaiter.wait(for: [clockAdvanced], timeout: 3), .completed)
    pauseButton.tap()
    element("add-marker").tap()

    let annotationControl = element("annotation-control")
    XCTAssertTrue(annotationControl.waitForExistence(timeout: 5))
    XCTAssertTrue(annotationControl.isHittable, "The annotation editor should stay enabled for the marker just added.")
    annotationControl.tap()
    let annotation = element("annotation-editor-input")
    typeTextIntoControlledField("Live marker note", field: annotation)
    XCTAssertEqual(annotation.value as? String, "Live marker note")
  }

  func testLongTrackOverviewTapDoesNotSeekAndDragCreatesLoop() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    let overview = element("loop-overview")
    scrollIntoView(overview)
    XCTAssertGreaterThan(overview.frame.width, app.frame.width * 0.8)
    XCTAssertGreaterThan(element("waveform-container").frame.width, app.frame.width * 0.8)

    let currentTime = element("playback-current-time")
    let initialTime = currentTime.label
    let initialMarkers = app.staticTexts["grand-total-markers"].label
    let initialFrame = overview.frame
    overview.coordinate(withNormalizedOffset: CGVector(dx: 0.7, dy: 0.5)).tap()
    XCTAssertEqual(currentTime.label, initialTime, "Overview taps must not seek playback.")

    overview.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.2))
      .press(forDuration: 0.1, thenDragTo: overview.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.8)))
    XCTAssertEqual(overview.frame.minY, initialFrame.minY, accuracy: 1, "Vertical overview motion must not scroll the page.")

    overview.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.5))
      .press(forDuration: 0.1, thenDragTo: overview.coordinate(withNormalizedOffset: CGVector(dx: 0.55, dy: 0.5)))
    XCTAssertTrue(element("loop-overview-range").waitForExistence(timeout: 5))
    XCTAssertTrue(element("loop-overview-handle-start").exists)
    XCTAssertTrue(element("loop-overview-handle-end").exists)
    XCTAssertEqual(currentTime.label, initialTime, "Creating a loop must not seek playback.")
    XCTAssertEqual(app.staticTexts["grand-total-markers"].label, initialMarkers)

    let startHandle = element("loop-overview-handle-start")
    let startBeforeMove = String(describing: startHandle.value ?? "")
    let range = element("loop-overview-range")
    range.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
      .press(forDuration: 0.1, thenDragTo: range.coordinate(withNormalizedOffset: CGVector(dx: 0.65, dy: 0.5)))
    XCTAssertNotEqual(String(describing: startHandle.value ?? ""), startBeforeMove, "Dragging the range should move both bounds.")

    let startBeforeResize = String(describing: startHandle.value ?? "")
    startHandle.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
      .press(forDuration: 0.1, thenDragTo: startHandle.coordinate(withNormalizedOffset: CGVector(dx: 0.1, dy: 0.5)))
    XCTAssertNotEqual(String(describing: startHandle.value ?? ""), startBeforeResize, "Dragging a handle should resize the range.")
    XCTAssertGreaterThanOrEqual(startHandle.frame.height, 44, "Native handle target should be at least 44 points tall.")

    XCTAssertTrue(startHandle.label.hasPrefix("Loop start "), "The start handle should expose its adjustable value label.")
    XCTAssertFalse(String(describing: startHandle.value ?? "").isEmpty, "The start handle should expose its current value.")
    XCTAssertEqual(currentTime.label, initialTime)
    XCTAssertEqual(app.staticTexts["grand-total-markers"].label, initialMarkers)
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

    XCTAssertFalse(element("remove-last-marker").isEnabled)
    XCTAssertFalse(element("annotation-control").isEnabled)

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
    let playbackTime = element("playback-current-time")
    XCTAssertGreaterThan(playbackSeconds(from: playbackTime.label), 0)
    element("play-pause").tap()
    Thread.sleep(forTimeInterval: 6.0)
    XCTAssertLessThanOrEqual(
      playbackSeconds(from: playbackTime.label),
      5,
      "A selected range ending at the song boundary must wrap instead of stopping."
    )
  }

  func testWrappedRowSeekMarkerAndDragGestures() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    let accessibleRow = element("wrapped-row-0")
    scrollIntoView(accessibleRow)
    XCTAssertTrue(accessibleRow.waitForExistence(timeout: 10))
    XCTAssertTrue(accessibleRow.label.hasPrefix("Row 1, 0:00 to "))
    XCTAssertFalse(accessibleRow.label.contains("phrase"))
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
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("0 markers"))
    element("add-marker").tap()
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    let markerIndicator = app.descendants(matching: .any).matching(
      NSPredicate(format: "identifier BEGINSWITH %@", "wrapped-row-marker-vocals-")
    ).firstMatch
    XCTAssertTrue(markerIndicator.waitForExistence(timeout: 5))
    XCTAssertTrue(markerIndicator.label.contains("Vocals marker"))
    XCTAssertTrue(markerIndicator.label.contains("not annotated"))
    let annotationControl = element("annotation-control")
    XCTAssertTrue(annotationControl.isEnabled)
    annotationControl.tap()
    let annotation = element("annotation-editor-input")
    typeTextIntoControlledField("Row note", field: annotation)
    element("save-annotation").tap()
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

  func testPortraitUsesFixedSingleLayerWorkspace() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    XCTAssertFalse(app.staticTexts["Annotation layers"].exists)
    XCTAssertFalse(element("row-density-preset-default").exists)
    XCTAssertFalse(element("wrapped-follow-toggle").exists)
    XCTAssertTrue(element("loop-overview").exists)
    XCTAssertGreaterThan(element("loop-overview").frame.width, app.frame.width * 0.8)
    XCTAssertTrue(element("play-pause").isHittable)
    XCTAssertTrue(element("add-marker").isHittable)
    XCTAssertTrue(element("annotation-control").exists)
    XCTAssertFalse(element("marker-annotation").exists)
    assertStaticCanvasCoversSongEnd()
    XCTAssertFalse(app.staticTexts["Phrase 1"].exists)
    XCTAssertFalse(app.staticTexts["Count 1"].exists)
    XCTAssertLessThanOrEqual(element("wrapped-row-0").frame.height, 56)
    XCTAssertLessThanOrEqual(element("wrapped-row-gutter-0").frame.width, 52)

    let gutter = element("wrapped-row-gutter-0")
    XCTAssertTrue(gutter.waitForExistence(timeout: 10) && gutter.isHittable)
    gutter.tap()
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("0 markers"))
    XCTAssertTrue(element("waveform-detail-close").waitForExistence(timeout: 5))
    element("waveform-detail-close").tap()

    let row = element("wrapped-row-gesture-area-0")
    scrollIntoView(row)
    XCTAssertTrue(row.waitForExistence(timeout: 10) && row.isHittable)
    row.coordinate(withNormalizedOffset: CGVector(dx: 0.25, dy: 0.1)).tap()
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("0 markers"))
    element("add-marker").tap()
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    assertNoGestureRuntimeError()
  }

  func testWrappedFollowPlayheadTracksDistantRow() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    XCTAssertFalse(element("wrapped-follow-toggle").exists)
    assertStaticCanvasCoversSongEnd()
    let firstRowFrame = element("wrapped-row-0").frame

    let distantRow = element("wrapped-row-gesture-area-4")
    scrollIntoView(distantRow)
    distantRow.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    let playbackTime = element("playback-current-time")
    let timeBeforePlayback = playbackTime.label
    element("play-pause").tap()
    let playbackStarted = XCTNSPredicateExpectation(
      predicate: NSPredicate(format: "label != %@", timeBeforePlayback),
      object: playbackTime
    )
    XCTAssertEqual(XCTWaiter.wait(for: [playbackStarted], timeout: 5), .completed)

    XCTAssertEqual(element("wrapped-row-0").frame.minY, firstRowFrame.minY, accuracy: 1)

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
    assertStaticCanvasCoversSongEnd()
    XCTAssertEqual(element("wrapped-row-0").frame.minY, firstRowFrame.minY, accuracy: 1)
    let pauseButton = app.descendants(matching: .any).matching(
      NSPredicate(format: "label == %@", "Pause playback")
    ).firstMatch
    XCTAssertTrue(pauseButton.exists, "Playback should remain active after returning from background.")

    assertNoGestureRuntimeError()
  }

  func testLandscapeReflowPreservesMarkersAndDocksDetailPanel() {
    loadBundledSimulatorAudio("long-test-track.m4a")

    assertStaticCanvasCoversSongEnd()

    let row = element("wrapped-row-gesture-area-0")
    scrollIntoView(row)
    XCTAssertTrue(row.waitForExistence(timeout: 10) && row.isHittable)
    row.coordinate(withNormalizedOffset: CGVector(dx: 0.4, dy: 0.1)).tap()
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("0 markers"))
    element("add-marker").tap()
    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("1 markers"))
    let marker = app.descendants(matching: .any).matching(
      NSPredicate(format: "identifier BEGINSWITH %@", "wrapped-row-marker-vocals-")
    ).firstMatch
    XCTAssertTrue(marker.waitForExistence(timeout: 5))
    let markerIdentifier = marker.identifier

    rotateAppToLandscape()
    assertStaticCanvasCoversSongEnd()
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
    XCTAssertTrue(app.staticTexts["2 markers ready to export"].waitForExistence(timeout: 5))
    XCTAssertTrue(app.staticTexts["Includes timestamps, BPM-derived bar:beat timing, and annotations"].exists)
    XCTAssertFalse(element("export-midi").exists)
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
    XCTAssertGreaterThanOrEqual(element("add-marker").frame.minX, rail.frame.minX)
    XCTAssertLessThanOrEqual(element("shuffle-control").frame.maxX, rail.frame.maxX)
    XCTAssertLessThanOrEqual(element("load-song").frame.height, 56)
    XCTAssertLessThanOrEqual(rail.frame.width, 110)
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
    XCTAssertTrue(element("load-song").waitForExistence(timeout: 20))
    element("load-song").tap()
    selectDocument(filename)
    dismissAlertIfPresent()
    XCTAssertEqual(element("load-song").label, "Replace Audio File")
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

  private func assertStaticCanvasCoversSongEnd() {
    let rows = app.descendants(matching: .any).matching(
      NSPredicate(format: "identifier MATCHES %@", "^wrapped-row-[0-9]+$")
    )
    XCTAssertGreaterThan(rows.count, 1, "The fitted canvas should contain multiple rows.")
    let lastRow = rows.element(boundBy: rows.count - 1)
    XCTAssertTrue(lastRow.exists)
    XCTAssertTrue(
      lastRow.label.contains("to 2:29") || lastRow.label.contains("to 3:00"),
      "The final fitted row must reach the end of the loaded song. Found: \(lastRow.label)"
    )
    XCTAssertFalse(
      app.scrollViews.matching(identifier: "wrapped-waveform").firstMatch.exists,
      "The phone waveform canvas must not expose a vertical scroll view."
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
