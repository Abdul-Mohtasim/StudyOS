package com.studyos.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.SystemClock;

/**
 * One place that refreshes every widget in the pack and keeps the mood engine ticking even
 * when the app is closed:
 *  - an immediate refresh whenever the web app pushes new state (task done, streak changed...)
 *  - a short one-shot alarm so a 3-second "Excited" celebration actually expires on screen
 *  - a repeating background tick so time-only transitions (Motivated -> Worried -> Sad,
 *    day/night) still happen while nobody is using the app
 */
public final class StudyWidgetUpdater {

    private static final int REQUEST_EXCITED_EXPIRY = 9001;
    private static final int REQUEST_TICK = 9002;
    private static final long TICK_INTERVAL_MS = 15 * 60 * 1000L; // 15 minutes: cosmetic only

    private StudyWidgetUpdater() {}

    /** Re-renders every StudyOS widget on the home screen from the latest saved state. */
    public static void refreshAll(Context context) {
        StudyStreakWidgetProvider.updateAllWidgets(context);
        StudyTasksWidgetProvider.updateAllWidgets(context);
        StudyWeekWidgetProvider.updateAllWidgets(context);
        StudyTimerWidgetProvider.updateAllWidgets(context);
    }

    /** Call this after StudyWidgetState changes that could flip the mascot's mood. */
    public static void onStateChanged(Context context) {
        refreshAll(context);
        scheduleExcitedExpiry(context);
        ensureTicking(context);
    }

    // ---- the brief Excited window ----------------------------------------------------

    private static void scheduleExcitedExpiry(Context context) {
        StudyWidgetState state = StudyWidgetState.load(context);
        if (state.lastTaskCompletedAt <= 0) return;
        long fireAt = state.lastTaskCompletedAt + StudyWidgetMoodEngine.EXCITED_WINDOW_MS;
        if (fireAt <= System.currentTimeMillis()) return;

        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        PendingIntent pi = PendingIntent.getBroadcast(
            context, REQUEST_EXCITED_EXPIRY,
            new Intent(context, StudyWidgetTickReceiver.class).setAction(StudyWidgetTickReceiver.ACTION_TICK),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        try {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireAt, pi);
        } catch (SecurityException ignored) {
            // No exact-alarm permission: the next 15-minute tick will still catch it.
        }
    }

    // ---- the slow background tick ------------------------------------------------------

    public static void ensureTicking(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        PendingIntent pi = PendingIntent.getBroadcast(
            context, REQUEST_TICK,
            new Intent(context, StudyWidgetTickReceiver.class).setAction(StudyWidgetTickReceiver.ACTION_TICK),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        long first = SystemClock.elapsedRealtime() + TICK_INTERVAL_MS;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            am.setInexactRepeating(AlarmManager.ELAPSED_REALTIME, first, TICK_INTERVAL_MS, pi);
        } else {
            am.setRepeating(AlarmManager.ELAPSED_REALTIME, first, TICK_INTERVAL_MS, pi);
        }
    }

    public static boolean anyWidgetsActive(Context context) {
        return StudyStreakWidgetProvider.hasWidgets(context)
            || StudyTasksWidgetProvider.hasWidgets(context)
            || StudyWeekWidgetProvider.hasWidgets(context)
            || StudyTimerWidgetProvider.hasWidgets(context);
    }
}
