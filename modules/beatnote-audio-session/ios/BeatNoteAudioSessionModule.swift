import AVFoundation
import MediaPlayer
import ExpoModulesCore

public final class BeatNoteAudioSessionModule: Module {
  private var trackTargets: [(MPRemoteCommand, Any)] = []
  private var routeObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("BeatNoteAudioSession")
    Events("onOutputRouteUnavailable", "onRemoteTrack")

    AsyncFunction("configureRemoteButtons") { (mode: String, seconds: Int, previous: Bool, next: Bool) in
      let intervals = [NSNumber(value: seconds)]
      let center = MPRemoteCommandCenter.shared()
      center.skipForwardCommand.isEnabled = mode == "seek"
      center.skipBackwardCommand.isEnabled = mode == "seek"
      center.nextTrackCommand.isEnabled = mode == "tracks" && next
      center.previousTrackCommand.isEnabled = mode == "tracks" && previous
      if mode == "tracks" && self.trackTargets.isEmpty {
        for (command, direction) in [(center.previousTrackCommand, "previous"), (center.nextTrackCommand, "next")] {
          let token = command.addTarget { [weak self] _ in
            guard let self else { return .commandFailed }
            self.sendEvent("onRemoteTrack", ["direction": direction])
            return .success
          }
          self.trackTargets.append((command, token))
        }
      } else if mode != "tracks" {
        self.removeTrackTargets()
      }
      center.skipForwardCommand.preferredIntervals = intervals
      center.skipBackwardCommand.preferredIntervals = intervals
    }.runOnQueue(.main)

    OnStartObserving {
      guard self.routeObserver == nil else { return }
      self.routeObserver = NotificationCenter.default.addObserver(
        forName: AVAudioSession.routeChangeNotification,
        object: AVAudioSession.sharedInstance(),
        queue: .main
      ) { [weak self] notification in
        guard let reasonValue = notification.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt,
              let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue),
              reason == .oldDeviceUnavailable else {
          return
        }
        self?.sendEvent("onOutputRouteUnavailable", [
          "reason": "oldDeviceUnavailable"
        ])
      }
    }

    OnStopObserving {
      self.stopObservingRouteChanges()
    }
  }

  deinit {
    stopObservingRouteChanges()
    removeTrackTargets()
  }

  private func removeTrackTargets() {
    for (command, token) in trackTargets { command.removeTarget(token) }
    trackTargets.removeAll()
  }

  private func stopObservingRouteChanges() {
    guard let routeObserver else { return }
    NotificationCenter.default.removeObserver(routeObserver)
    self.routeObserver = nil
  }
}
