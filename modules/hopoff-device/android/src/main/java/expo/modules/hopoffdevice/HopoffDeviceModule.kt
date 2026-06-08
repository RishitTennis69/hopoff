package expo.modules.hopoffdevice

import android.accessibilityservice.AccessibilityServiceInfo
import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class HopoffDeviceModule : Module() {
  private var limitReceiver: BroadcastReceiver? = null

  override fun definition() = ModuleDefinition {
    Name("HopoffDevice")

    Events("onLimitExceeded")

    OnCreate {
      val ctx = appContext.reactContext ?: return@OnCreate Unit
      val receiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
          val appId = intent?.getStringExtra("appId") ?: return
          sendEvent("onLimitExceeded", mapOf("appId" to appId))
        }
      }
      limitReceiver = receiver
      val filter = IntentFilter(LIMIT_EXCEEDED_ACTION)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        ctx.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
      } else {
        @Suppress("UnspecifiedRegisterReceiverFlag")
        ctx.registerReceiver(receiver, filter)
      }
    }

    OnDestroy {
      val ctx = appContext.reactContext
      val receiver = limitReceiver
      if (ctx != null && receiver != null) {
        try {
          ctx.unregisterReceiver(receiver)
        } catch (_: IllegalArgumentException) {
          /* already unregistered */
        }
      }
      limitReceiver = null
    }

    AsyncFunction("getInstalledPackages") { packages: List<String> ->
      val pm = appContext.reactContext?.packageManager ?: return@AsyncFunction emptyList<String>()
      packages.filter { pkg ->
        try {
          pm.getPackageInfo(pkg, 0)
          true
        } catch (_: PackageManager.NameNotFoundException) {
          false
        }
      }
    }

    AsyncFunction("getInstalledSchemes") { _schemes: List<String> ->
      emptyList<String>()
    }

    AsyncFunction("hasUsageAccess") {
      val ctx = appContext.reactContext ?: return@AsyncFunction false
      val appOps = ctx.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
      val mode = appOps.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        ctx.packageName,
      )
      if (mode == AppOpsManager.MODE_ALLOWED) return@AsyncFunction true

      val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
        ?: return@AsyncFunction false
      val end = System.currentTimeMillis()
      val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, end - 86_400_000L, end)
      stats != null && stats.isNotEmpty()
    }

    AsyncFunction("isAccessibilityServiceEnabled") {
      val ctx = appContext.reactContext ?: return@AsyncFunction false
      val am = ctx.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager
      val enabled = am.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
      val serviceName = HopOffAccessibilityService::class.java.name
      enabled.any { it.resolveInfo.serviceInfo.name == serviceName }
    }

    AsyncFunction("setMonitoredApps") { apps: List<Map<String, Any>> ->
      val ctx = appContext.reactContext ?: return@AsyncFunction null
      val entries = apps.mapNotNull { map ->
        val appId = map["appId"] as? String ?: return@mapNotNull null
        val packageName = map["packageName"] as? String ?: return@mapNotNull null
        val limitMinutes = when (val raw = map["limitMinutes"]) {
          is Int -> raw
          is Double -> raw.toInt()
          is Number -> raw.toInt()
          else -> return@mapNotNull null
        }
        MonitoredAppEntry(appId, packageName, limitMinutes)
      }
      MonitoringStore.setMonitoredApps(ctx, entries)
    }

    AsyncFunction("clearMonitoredApps") {
      val ctx = appContext.reactContext ?: return@AsyncFunction null
      MonitoringStore.clear(ctx)
    }

    AsyncFunction("openUsageAccessSettings") {
      val ctx = appContext.reactContext ?: return@AsyncFunction null
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      ctx.startActivity(intent)
    }

    AsyncFunction("openAccessibilitySettings") {
      val ctx = appContext.reactContext ?: return@AsyncFunction null
      val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      ctx.startActivity(intent)
    }

    AsyncFunction("queryUsageByDay") { packages: List<String>, days: Int ->
      val ctx = appContext.reactContext ?: return@AsyncFunction emptyList<Map<String, Any>>()
      val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
        ?: return@AsyncFunction emptyList<Map<String, Any>>()

      val allowed = packages.toSet()
      val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
      val out = mutableListOf<Map<String, Any>>()
      val dayCount = days.coerceIn(1, 14)

      for (offset in (dayCount - 1) downTo 0) {
        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, -offset)
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        val start = cal.timeInMillis
        cal.add(Calendar.DAY_OF_YEAR, 1)
        val end = cal.timeInMillis - 1L
        val dateKey = sdf.format(Date(start))

        val stats: List<UsageStats> =
          usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end) ?: emptyList()

        for (stat in stats) {
          if (!allowed.contains(stat.packageName)) continue
          val minutes = (stat.totalTimeInForeground / 60_000L).toInt()
          if (minutes <= 0) continue
          out.add(
            mapOf(
              "packageName" to stat.packageName,
              "date" to dateKey,
              "minutes" to minutes,
            ),
          )
        }
      }

      out
    }
  }

  companion object {
    const val LIMIT_EXCEEDED_ACTION = "expo.modules.hopoffdevice.LIMIT_EXCEEDED"
  }
}
