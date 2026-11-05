package com.studyos.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * StudyOS reminders, done natively with Android's AlarmManager (no third-party plugin).
 * The web app sends a list of {id, at(ms), title, body}; this class sets one alarm per item,
 * remembers them so they survive a phone restart, and shows the notification with the
 * StudyOS chime (res/raw/studyos_notify.mp3) when an alarm fires.
 */
public final class ReminderScheduler {

    // Android 8+ takes the sound from the channel and can't change it afterwards, so the id is versioned.
    public static final String CHANNEL_ID = "studyos-reminders-v5";
    private static final String[] OLD_CHANNELS = {"studyos-reminders-v2", "studyos-reminders-v3", "studyos-reminders-v4"};
    private static final String PREFS = "studyos_reminders";
    private static final String KEY_ITEMS = "items";

    private ReminderScheduler() {}

    private static Uri soundUri(Context context) {
        return Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.studyos_notify);
    }

    public static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager manager =
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;

        for (String old : OLD_CHANNELS) {
            try {
                manager.deleteNotificationChannel(old);
            } catch (Exception ignored) {
                // not there
            }
        }
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return;

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID, "Study reminders", NotificationManager.IMPORTANCE_HIGH);
        channel.setDescription("Daily study reminders and streak warnings");
        AudioAttributes attributes = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();
        channel.setSound(soundUri(context), attributes);
        channel.enableVibration(true);
        channel.enableLights(true);
        manager.createNotificationChannel(channel);
    }

    public static void show(Context context, int id, String title, String body) {
        ensureChannel(context);
        Intent open = new Intent(context, MainActivity.class)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String safeTitle = title == null || title.isEmpty() ? "StudyOS" : title;
        String safeBody = body == null ? "" : body;

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_studyos)
            .setColor(0xFFE5484D)
            .setContentTitle(safeTitle)
            .setContentText(safeBody)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(safeBody))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setAutoCancel(true)
            .setContentIntent(contentIntent)
            .setSound(soundUri(context))      // Android 7 and older; newer versions use the channel
            .setVibrate(new long[] {0, 250, 150, 250});

        try {
            NotificationManagerCompat.from(context).notify(id, builder.build());
        } catch (SecurityException ignored) {
            // notification permission not granted
        }
    }

    // ---- alarms -------------------------------------------------------------------------

    private static PendingIntent pending(Context context, int id, String title, String body, int flags) {
        Intent intent = new Intent(context, ReminderReceiver.class)
            .putExtra("id", id)
            .putExtra("title", title)
            .putExtra("body", body);
        return PendingIntent.getBroadcast(context, id, intent, flags | PendingIntent.FLAG_IMMUTABLE);
    }

    /**
     * Reminders use plain exact alarms (setExactAndAllowWhileIdle), NOT setAlarmClock(): setAlarmClock
     * makes Android show an alarm-clock icon in the status bar for as long as a reminder is pending.
     * Android 12+ lets the user switch exact alarms off ("Alarms & reminders"); in that case we fall
     * back to setAndAllowWhileIdle, which can arrive a few minutes late but still fires.
     */
    public static boolean canScheduleExact(Context context) {
        if (Build.VERSION.SDK_INT < 31) return true;
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        return manager != null && manager.canScheduleExactAlarms();
    }

    private static void setAlarm(Context context, AlarmManager manager, JSONObject item) {
        int id = item.optInt("id");
        long at = item.optLong("at");
        PendingIntent pi = pending(context, id, item.optString("title"), item.optString("body"),
            PendingIntent.FLAG_UPDATE_CURRENT);
        try {
            if (canScheduleExact(context)) {
                manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            } else {
                manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            }
        } catch (SecurityException e) {
            manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        }
    }

    private static JSONArray load(Context context) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            return new JSONArray(prefs.getString(KEY_ITEMS, "[]"));
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    private static void save(Context context, JSONArray items) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putString(KEY_ITEMS, items.toString()).apply();
    }

    public static int scheduledCount(Context context) {
        long now = System.currentTimeMillis();
        JSONArray items = load(context);
        int count = 0;
        for (int i = 0; i < items.length(); i++) {
            if (items.optJSONObject(i) != null && items.optJSONObject(i).optLong("at") > now) count++;
        }
        return count;
    }

    public static void cancelAll(Context context) {
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        JSONArray items = load(context);
        if (manager != null) {
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.optJSONObject(i);
                if (item == null) continue;
                PendingIntent pi = pending(context, item.optInt("id"), "", "", PendingIntent.FLAG_NO_CREATE);
                if (pi != null) {
                    manager.cancel(pi);
                    pi.cancel();
                }
            }
        }
        save(context, new JSONArray());
    }

    /** Replace every scheduled reminder with this list. */
    public static int scheduleAll(Context context, JSONArray items) {
        cancelAll(context);
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (manager == null || items == null) return 0;

        long now = System.currentTimeMillis();
        JSONArray kept = new JSONArray();
        for (int i = 0; i < items.length(); i++) {
            JSONObject item = items.optJSONObject(i);
            if (item == null || item.optLong("at") <= now) continue;
            setAlarm(context, manager, item);
            kept.put(item);
        }
        save(context, kept);
        return kept.length();
    }

    /** After a phone restart or app update Android forgets alarms; set them again. */
    public static void restore(Context context) {
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (manager == null) return;
        long now = System.currentTimeMillis();
        JSONArray items = load(context);
        JSONArray kept = new JSONArray();
        for (int i = 0; i < items.length(); i++) {
            JSONObject item = items.optJSONObject(i);
            if (item == null || item.optLong("at") <= now) continue;
            setAlarm(context, manager, item);
            kept.put(item);
        }
        save(context, kept);
    }
}
