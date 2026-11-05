import AVFoundation
import MediaPlayer
import ExpoModulesCore

public final class BeatNoteAudioSessionModule: Module {
  private var routeObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("BeatNoteAudioSession")
    Events("onOutputRouteUnavailable")

    AsyncFunction("setRemoteSeekSeconds") { (seconds: Int) in
      let intervals = [NSNumber(value: seconds)]
      let center = MPRemoteCommandCenter.shared()
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
  }

  private func stopObservingRouteChanges() {
    guard let routeObserver else { return }
    NotificationCenter.default.removeObserver(routeObserver)
    self.routeObserver = nil
  }
}
