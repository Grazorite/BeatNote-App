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
    element("sidebar-open-toggle").tap()
    XCTAssertTrue(element("sidebar-toggle").waitForExistence(timeout: 5))
    element("sidebar-toggle").tap()

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
    XCTAssertEqual(app.textFields["marker-annotation"].value as? String, "Dance note")

    let projectName = "UITest-\(UUID().uuidString.prefix(8))"
    let saveButton = element("save-project")
    XCTAssertTrue(saveButton.waitForExistence(timeout: 5) && saveButton.isHittable)
    saveButton.tap()
    let nameField = app.textFields["save-project-name"]
    XCTAssertTrue(nameField.waitForExistence(timeout: 5))
    nameField.tap()
    nameField.typeText(projectName)
    element("confirm-save-project").tap()
    dismissAlertIfPresent()

    app.terminate()
    app.launch()
    closeMobileSidebar()
    XCTAssertTrue(element("load-project").waitForExistence(timeout: 15))
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

    element("load-project").tap()
    projectControl(containing: "delete-saved-project-", suffix: projectSuffix).tap()
    let deleteConfirmation = app.alerts["Delete Project"]
    XCTAssertTrue(deleteConfirmation.waitForExistence(timeout: 5))
    deleteConfirmation.buttons["Delete"].tap()
  }

  func testCsvImportAndShareSheetExport() {
    loadBundledSimulatorAudio()
    element("add-marker").tap()
    element("import-data").tap()
    element("select-csv-file").tap()
    selectDocument("valid-import.csv")
    dismissAlertIfPresent()

    XCTAssertTrue(app.staticTexts["grand-total-markers"].label.contains("2 markers"))
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
    element("import-data").tap()
    element("select-csv-file").tap()
    selectDocument("invalid-import.csv")

    XCTAssertTrue(app.alerts["Import Failed"].waitForExistence(timeout: 10))
    app.alerts.buttons["OK"].tap()
  }

  func testLandscapeGesturesAndCompactControls() {
    XCUIDevice.shared.orientation = .landscapeLeft
    loadBundledSimulatorAudio()

    XCTAssertLessThanOrEqual(element("play-pause").frame.width, 56)
    XCTAssertLessThanOrEqual(element("add-marker").frame.width, 56)
    XCTAssertLessThanOrEqual(element("load-song").frame.height, 56)

    let waveform = element("waveform-gesture-area")
    scrollIntoView(waveform)
    XCTAssertTrue(waveform.isHittable, "Waveform gesture area should be visible.")
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

  private func loadBundledSimulatorAudio() {
    XCTAssertTrue(element("load-song").waitForExistence(timeout: 20))
    element("load-song").tap()
    selectDocument("test-audio.wav")
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

  private func scrollIntoView(_ element: XCUIElement) {
    let workspaceScroll = app.scrollViews.firstMatch
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
