package com.studyos.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * The bridge between the web app's React state and the StudyOS home-screen widget pack.
 *
 * The web app calls pushState() (see frontend/src/widgets.js) whenever something that could
 * change what a widget shows happens: a task completes, the streak changes, the daily goal
 * progress moves, the theme changes, a streak milestone is hit, or the focus timer starts or
 * stops. This plugin just mirrors that into SharedPreferences (StudyWidgetState) and asks
 * every widget to redraw — all the actual mood/graphics logic lives in native widget code so
 * it keeps working even while the app (and its JS) isn't running.
 */
@CapacitorPlugin(name = "StudyWidget")
public class StudyWidgetPlugin extends Plugin {

    @PluginMethod
    public void pushState(PluginCall call) {
        JSObject data = call.getData();
        JSONObject payload = new JSONObject();
        try {
            copyIfPresent(data, payload, "streak");
            copyIfPresent(data, payload, "bestStreak");
            copyIfPresent(data, payload, "studiedToday");
            copyIfPresent(data, payload, "dailyGoalMinutes");
            copyIfPresent(data, payload, "todayFocusMinutes");
            copyIfPresent(data, payload, "dailyGoalPercent");
            copyIfPresent(data, payload, "tasksTotal");
            copyIfPresent(data, payload, "tasksCompleted");
            copyIfPresent(data, payload, "gems");
            copyIfPresent(data, payload, "theme");
            copyIfPresent(data, payload, "activeSessionRunning");
            copyIfPresent(data, payload, "lastTaskCompletedAt");
            copyIfPresent(data, payload, "milestoneCelebrateUntil");
            copyIfPresent(data, payload, "lastCelebratedStreak");
            copyIfPresent(data, payload, "worriedWindowMinutes");
            copyIfPresent(data, payload, "dayDeadlineMinute");
            copyIfPresent(data, payload, "nightStartMinute");
            copyIfPresent(data, payload, "nightEndMinute");

            JSONArray upcomingTasks = data.optJSONArray("upcomingTasks");
            if (upcomingTasks != null) {
                payload.put("upcomingTasks", upcomingTasks);
            }
            JSONArray weekMinutes = data.optJSONArray("weekMinutes");
            if (weekMinutes != null) {
                payload.put("weekMinutes", weekMinutes);
            }
        } catch (JSONException e) {
            call.reject("Malformed widget state payload", e);
            return;
        }

        StudyWidgetState.save(getContext(), payload);
        StudyWidgetUpdater.onStateChanged(getContext());
        call.resolve();
    }

    @PluginMethod
    public void hasWidgets(PluginCall call) {
        JSObject result = new JSObject();
        result.put("active", StudyWidgetUpdater.anyWidgetsActive(getContext()));
        call.resolve(result);
    }

    private void copyIfPresent(JSObject source, JSONObject target, String key) throws JSONException {
        if (!source.has(key)) return;
        Object value = source.opt(key);
        if (value == null) return;
        target.put(key, value);
    }
}
