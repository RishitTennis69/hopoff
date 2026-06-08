package expo.modules.hopoffdevice

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class MonitoredAppEntry(
  val appId: String,
  val packageName: String,
  val limitMinutes: Int,
)

object MonitoringStore {
  private const val PREFS = "hopoff_monitoring"
  private const val KEY_APPS = "monitored_apps"

  fun setMonitoredApps(context: Context, apps: List<MonitoredAppEntry>) {
    val arr = JSONArray()
    for (app in apps) {
      arr.put(
        JSONObject()
          .put("appId", app.appId)
          .put("packageName", app.packageName)
          .put("limitMinutes", app.limitMinutes),
      )
    }
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      .edit()
      .putString(KEY_APPS, arr.toString())
      .apply()
  }

  fun getMonitoredApps(context: Context): List<MonitoredAppEntry> {
    val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_APPS, null)
      ?: return emptyList()
    return try {
      val arr = JSONArray(raw)
      buildList {
        for (i in 0 until arr.length()) {
          val obj = arr.getJSONObject(i)
          add(
            MonitoredAppEntry(
              appId = obj.getString("appId"),
              packageName = obj.getString("packageName"),
              limitMinutes = obj.getInt("limitMinutes"),
            ),
          )
        }
      }
    } catch (_: Exception) {
      emptyList()
    }
  }

  fun clear(context: Context) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(KEY_APPS).apply()
  }
}
