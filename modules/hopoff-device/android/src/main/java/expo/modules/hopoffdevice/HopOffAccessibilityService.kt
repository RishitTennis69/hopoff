package expo.modules.hopoffdevice

import android.accessibilityservice.AccessibilityService
import android.app.usage.UsageStatsManager
import android.content.Intent
import android.net.Uri
import android.view.accessibility.AccessibilityEvent
import java.util.Calendar

class HopOffAccessibilityService : AccessibilityService() {
  private var lastTriggerAt = 0L
  private var lastPackage: String? = null

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val pkg = event.packageName?.toString() ?: return
    if (pkg == packageName) return

    val monitored = MonitoringStore.getMonitoredApps(this)
    val entry = monitored.firstOrNull { it.packageName == pkg } ?: return

    if (pkg == lastPackage && System.currentTimeMillis() - lastTriggerAt < 60_000L) return

    val usedMinutes = todayUsageMinutes(pkg)
    if (usedMinutes < entry.limitMinutes) return

    lastPackage = pkg
    lastTriggerAt = System.currentTimeMillis()

    val broadcast = Intent(HopoffDeviceModule.LIMIT_EXCEEDED_ACTION).apply {
      setPackage(packageName)
      putExtra("appId", entry.appId)
    }
    sendBroadcast(broadcast)

    val launch = packageManager.getLaunchIntentForPackage(packageName)?.apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      data = Uri.parse("hoptfoff://block?appId=${entry.appId}")
    }
    launch?.let { startActivity(it) }
  }

  override fun onInterrupt() {}

  private fun todayUsageMinutes(packageName: String): Int {
    val usm = getSystemService(USAGE_STATS_SERVICE) as? UsageStatsManager ?: return 0
    val cal = Calendar.getInstance()
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)
    val start = cal.timeInMillis
    val end = System.currentTimeMillis()
    val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end) ?: return 0
    var totalMs = 0L
    for (stat in stats) {
      if (stat.packageName == packageName) totalMs += stat.totalTimeInForeground
    }
    return (totalMs / 60_000L).toInt()
  }
}
