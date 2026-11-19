package com.studyos.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;

/**
 * Everything the home-screen widgets know, kept in SharedPreferences so it survives app restarts
 * and works while the app is closed. The web app pushes a fresh snapshot (StudyWidgetPlugin.sync)
 * whenever its real data changes; the native side only adds the clock (day roll-over, night, deadline).
 */
final class WidgetStore {
    private static final String PREF = "studyos_widget";

    /** What the widgets draw, already corrected for the local clock. */
    static final class Snap {
        boolean signedIn;
        int streak, gems, goalMin, todayMin, doneToday, totalToday;
        boolean studiedToday, studiedYesterday, everStudied;
        String[] tasks = new String[0];
        String[] weekLabels = new String[0];
        int[] weekMinutes = new int[0];
        int todayIndex = -1;
        int nightStart = 23, nightEnd = 6;
        long lastTaskAt, celebrationAt;
        int celebrationStreak;
        boolean sessionActive;
        int tip;
        // theme colours (ARGB ints)
        int pg, card, chip, ink, mut, mv, track, onMv;
        boolean dark;
        String name = "";
        boolean unlocked;
    }

    static SharedPreferences sp(Context c) {
        return c.getApplicationContext().getSharedPreferences(PREF, Context.MODE_PRIVATE);
    }

    static String dayKey(long t, int dayOffset) {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(t);
        c.add(Calendar.DAY_OF_MONTH, dayOffset);
        return c.get(Calendar.YEAR) + "-" + String.format(java.util.Locale.US, "%02d", c.get(Calendar.MONTH) + 1)
                + "-" + String.format(java.util.Locale.US, "%02d", c.get(Calendar.DAY_OF_MONTH));
    }

    static void saveState(Context c, String json) {
        sp(c).edit().putString("state", json).apply();
    }

    static void setLong(Context c, String k, long v) { sp(c).edit().putLong(k, v).apply(); }
    static long getLong(Context c, String k) { return sp(c).getLong(k, 0L); }
    static void setBool(Context c, String k, boolean v) { sp(c).edit().putBoolean(k, v).apply(); }
    static void setInt(Context c, String k, int v) { sp(c).edit().putInt(k, v).apply(); }

    private static int color(JSONObject o, String k, int fallback) {
        try {
            String s = o.optString(k, "");
            if (s.length() == 7 && s.charAt(0) == '#') return 0xFF000000 | (int) Long.parseLong(s.substring(1), 16);
        } catch (Exception ignored) { }
        return fallback;
    }

    /** Reads the stored snapshot and corrects it for the current local day. Never throws. */
    static Snap read(Context c, long now) {
        Snap s = new Snap();
        SharedPreferences p = sp(c);
        s.lastTaskAt = p.getLong("lastTaskAt", 0L);
        s.celebrationAt = p.getLong("celebrationAt", 0L);
        s.celebrationStreak = p.getInt("celebrationStreak", 0);
        s.sessionActive = p.getBoolean("sessionActive", false);
        s.tip = p.getInt("tip", 0);
        // defaults = Calm Mauve
        s.pg = 0xFFDFE0E3; s.card = 0xFFEDEBEC; s.chip = 0xFFE1E0E2; s.ink = 0xFF1B1E25;
        s.mut = 0xFF4B5D6D; s.mv = 0xFFC9B8C3; s.track = 0xFFC8C6C8; s.onMv = 0xFF1B1E25;
        try {
            JSONObject o = new JSONObject(p.getString("state", "{}"));
            s.signedIn = o.optBoolean("signedIn", false);
            s.name = o.optString("name", "");
            s.unlocked = o.optBoolean("unlocked", false);
            s.gems = o.optInt("gems", 0);
            s.goalMin = Math.max(1, o.optInt("goalMin", 25));
            s.everStudied = o.optBoolean("everStudied", false);
            s.nightStart = o.optInt("nightStart", 23);
            s.nightEnd = o.optInt("nightEnd", 6);
            s.doneToday = o.optInt("doneToday", 0);
            s.totalToday = o.optInt("totalToday", 0);
            JSONArray t = o.optJSONArray("tasks");
            if (t != null) {
                s.tasks = new String[t.length()];
                for (int i = 0; i < t.length(); i++) s.tasks[i] = t.optString(i, "");
            }
            JSONArray wl = o.optJSONArray("weekLabels"), wm = o.optJSONArray("weekMinutes");
            if (wl != null && wm != null) {
                int n = Math.min(wl.length(), wm.length());
                s.weekLabels = new String[n];
                s.weekMinutes = new int[n];
                for (int i = 0; i < n; i++) { s.weekLabels[i] = wl.optString(i, ""); s.weekMinutes[i] = wm.optInt(i, 0); }
                s.todayIndex = o.optInt("todayIndex", n - 1);
            }
            JSONObject th = o.optJSONObject("theme");
            if (th != null) {
                s.dark = th.optBoolean("dark", false);
                s.pg = color(th, "pg", s.pg); s.card = color(th, "card", s.card); s.chip = color(th, "chip", s.chip);
                s.ink = color(th, "ink", s.ink); s.mut = color(th, "mut", s.mut); s.mv = color(th, "mv", s.mv);
                s.track = color(th, "track", s.track); s.onMv = color(th, "onMv", s.onMv);
            }

            // Local-day correction: the snapshot was taken on `dayKey`.
            String today = dayKey(now, 0), saved = o.optString("dayKey", today);
            boolean savedStudied = o.optBoolean("studiedToday", false);
            int streak = o.optInt("streak", 0);
            s.todayMin = o.optInt("todayMin", 0);
            if (saved.equals(today)) {
                s.studiedToday = savedStudied;
                s.studiedYesterday = o.optBoolean("studiedYesterday", false);
                s.streak = streak;
            } else if (saved.equals(dayKey(now, -1))) {
                // A new local day started while the app was closed: today has no progress yet,
                // yesterday counts only if it was studied. A missed day breaks the streak now, not earlier.
                s.studiedToday = false;
                s.studiedYesterday = savedStudied;
                s.todayMin = 0;
                s.doneToday = 0;
                s.streak = savedStudied ? streak : 0;
            } else {
                s.studiedToday = false;
                s.studiedYesterday = false;
                s.todayMin = 0;
                s.doneToday = 0;
                s.streak = 0;
            }
        } catch (Exception ignored) { }
        return s;
    }
}
