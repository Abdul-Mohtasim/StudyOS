package com.studyos.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Everything the widget pack needs to draw itself, mirrored from the web app into
 * SharedPreferences so the widgets (which run in a separate process from the app's
 * web view) can read it instantly, with no network call and no JS runtime.
 *
 * The web app is the single source of truth; it calls StudyWidgetPlugin.pushState()
 * whenever something relevant changes, and this class just stores/loads that snapshot.
 */
public final class StudyWidgetState {

    public static final String PREFS = "studyos_widget_state";
    private static final String KEY = "state_json";

    // Defaults used until the app has synced at least once.
    public int streak = 0;
    public int bestStreak = 0;
    public boolean studiedToday = false;
    public int dailyGoalMinutes = 30;
    public int todayFocusMinutes = 0;
    public int dailyGoalPercent = 0;
    public int tasksTotal = 0;
    public int tasksCompleted = 0;
    public String[] upcomingTasks = new String[0];
    public int[] weekMinutes = new int[7]; // oldest -> today
    public int gems = 0;
    public String theme = "light"; // light|dark|theme_ocean|theme_forest|theme_sunset|theme_mono
    public boolean activeSessionRunning = false;

    // Event-driven mood inputs (not recomputed here; the engine reads these).
    public long lastTaskCompletedAt = 0L;
    public long milestoneCelebrateUntil = 0L;
    public int lastCelebratedStreak = 0;

    // Configurable daily schedule, in minutes-of-day (0-1439), device-local.
    public int worriedWindowMinutes = 120; // start warning this many minutes before the deadline
    public int dayDeadlineMinute = 21 * 60; // 9:00 PM: the day's study block is considered over
    public int nightStartMinute = 23 * 60; // 11:00 PM
    public int nightEndMinute = 6 * 60; // 6:00 AM

    public long updatedAt = 0L;

    public static StudyWidgetState load(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String raw = prefs.getString(KEY, null);
        StudyWidgetState state = new StudyWidgetState();
        if (raw == null) return state;
        try {
            JSONObject o = new JSONObject(raw);
            state.streak = o.optInt("streak", state.streak);
            state.bestStreak = o.optInt("bestStreak", state.bestStreak);
            state.studiedToday = o.optBoolean("studiedToday", state.studiedToday);
            state.dailyGoalMinutes = o.optInt("dailyGoalMinutes", state.dailyGoalMinutes);
            state.todayFocusMinutes = o.optInt("todayFocusMinutes", state.todayFocusMinutes);
            state.dailyGoalPercent = o.optInt("dailyGoalPercent", state.dailyGoalPercent);
            state.tasksTotal = o.optInt("tasksTotal", state.tasksTotal);
            state.tasksCompleted = o.optInt("tasksCompleted", state.tasksCompleted);
            state.gems = o.optInt("gems", state.gems);
            state.theme = o.optString("theme", state.theme);
            state.activeSessionRunning = o.optBoolean("activeSessionRunning", state.activeSessionRunning);
            state.lastTaskCompletedAt = o.optLong("lastTaskCompletedAt", state.lastTaskCompletedAt);
            state.milestoneCelebrateUntil = o.optLong("milestoneCelebrateUntil", state.milestoneCelebrateUntil);
            state.lastCelebratedStreak = o.optInt("lastCelebratedStreak", state.lastCelebratedStreak);
            state.worriedWindowMinutes = o.optInt("worriedWindowMinutes", state.worriedWindowMinutes);
            state.dayDeadlineMinute = o.optInt("dayDeadlineMinute", state.dayDeadlineMinute);
            state.nightStartMinute = o.optInt("nightStartMinute", state.nightStartMinute);
            state.nightEndMinute = o.optInt("nightEndMinute", state.nightEndMinute);
            state.updatedAt = o.optLong("updatedAt", state.updatedAt);

            JSONArray tasks = o.optJSONArray("upcomingTasks");
            if (tasks != null) {
                String[] out = new String[tasks.length()];
                for (int i = 0; i < tasks.length(); i++) out[i] = tasks.optString(i, "");
                state.upcomingTasks = out;
            }
            JSONArray week = o.optJSONArray("weekMinutes");
            if (week != null) {
                int[] out = new int[7];
                for (int i = 0; i < 7 && i < week.length(); i++) out[i] = week.optInt(i, 0);
                state.weekMinutes = out;
            }
        } catch (JSONException ignored) {
            // Corrupt snapshot: fall back to defaults rather than crash the widget.
        }
        return state;
    }

    public static void save(Context context, JSONObject payload) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        // Merge onto whatever is already stored so a partial push (e.g. "just completed a
        // task") doesn't wipe fields the caller didn't include.
        StudyWidgetState current = load(context);
        JSONObject merged = current.toJson();
        java.util.Iterator<String> keys = payload.keys();
        while (keys.hasNext()) {
            String k = keys.next();
            try {
                merged.put(k, payload.get(k));
            } catch (JSONException ignored) {
                // skip malformed field
            }
        }
        try {
            merged.put("updatedAt", System.currentTimeMillis());
        } catch (JSONException ignored) {
            // ignore
        }
        prefs.edit().putString(KEY, merged.toString()).apply();
    }

    public JSONObject toJson() {
        JSONObject o = new JSONObject();
        try {
            o.put("streak", streak);
            o.put("bestStreak", bestStreak);
            o.put("studiedToday", studiedToday);
            o.put("dailyGoalMinutes", dailyGoalMinutes);
            o.put("todayFocusMinutes", todayFocusMinutes);
            o.put("dailyGoalPercent", dailyGoalPercent);
            o.put("tasksTotal", tasksTotal);
            o.put("tasksCompleted", tasksCompleted);
            o.put("gems", gems);
            o.put("theme", theme);
            o.put("activeSessionRunning", activeSessionRunning);
            o.put("lastTaskCompletedAt", lastTaskCompletedAt);
            o.put("milestoneCelebrateUntil", milestoneCelebrateUntil);
            o.put("lastCelebratedStreak", lastCelebratedStreak);
            o.put("worriedWindowMinutes", worriedWindowMinutes);
            o.put("dayDeadlineMinute", dayDeadlineMinute);
            o.put("nightStartMinute", nightStartMinute);
            o.put("nightEndMinute", nightEndMinute);
            o.put("updatedAt", updatedAt);
            o.put("upcomingTasks", new JSONArray(java.util.Arrays.asList(upcomingTasks)));
            JSONArray week = new JSONArray();
            for (int m : weekMinutes) week.put(m);
            o.put("weekMinutes", week);
        } catch (JSONException ignored) {
            // all keys are well-formed above; this cannot realistically happen
        }
        return o;
    }
}
