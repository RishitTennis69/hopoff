import ExpoModulesCore
import UIKit

public class HopoffDeviceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("HopoffDevice")

    AsyncFunction("getInstalledPackages") { (_ packages: [String]) -> [String] in
      []
    }

    AsyncFunction("getInstalledSchemes") { (schemes: [String]) -> [String] in
      schemes.filter { scheme in
        guard let url = URL(string: "\(scheme)://") else { return false }
        return UIApplication.shared.canOpenURL(url)
      }
    }

    AsyncFunction("hasUsageAccess") {
      false
    }

    AsyncFunction("isAccessibilityServiceEnabled") {
      false
    }

    AsyncFunction("setMonitoredApps") { (_ apps: [[String: Any]]) in
      // Requires Family Controls entitlement from Apple.
    }

    AsyncFunction("clearMonitoredApps") {}

    AsyncFunction("openUsageAccessSettings") {
      DispatchQueue.main.async {
        if let url = URL(string: UIApplication.openSettingsURLString) {
          UIApplication.shared.open(url)
        }
      }
    }

    AsyncFunction("openAccessibilitySettings") {
      DispatchQueue.main.async {
        if let url = URL(string: UIApplication.openSettingsURLString) {
          UIApplication.shared.open(url)
        }
      }
    }

    AsyncFunction("queryUsageByDay") { (_ packages: [String], _ days: Int) -> [[String: Any]] in
      []
    }
  }
}
