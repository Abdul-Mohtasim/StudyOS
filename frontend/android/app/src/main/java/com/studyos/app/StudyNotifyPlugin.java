package com.studyos.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * Study reminders for the web app: permission, scheduling (AlarmManager), an instant test
 * notification, a status report and shortcuts to the right Android settings screens.
 * Everything here is native, so nothing depends on a third-party notification plugin.
 */
@CapacitorPlugin(
    name = "StudyNotify",
    permissions = {
        @Permission(strings = {"android.permission.POST_NOTIFICATIONS"}, alias = "notifications")
    }
)
public class StudyNotifyPlugin extends Plugin {

    private boolean notificationsEnabled() {
        return NotificationManagerCompat.from(getContext()).areNotificationsEnabled();
    }

    // ---- status ---------------------------------------------------------------------------

    @PluginMethod
    public void getStatus(PluginCall call) {
        Context context = getContext();
        ReminderScheduler.ensureChannel(context);

        JSObject result = new JSObject();
        result.put("enabled", notificationsEnabled());
        result.put("sdk", Build.VERSION.SDK_INT);
        result.put("canExact", ReminderScheduler.canScheduleExact(context));
        result.put("scheduled", ReminderScheduler.scheduledCount(context));
        result.put("channelId", ReminderScheduler.CHANNEL_ID);
        try {
            PackageInfo info = context.getPackageManager()
                .getPackageInfo(context.getPackageName(), PackageManager.GET_PERMISSIONS);
            result.put("versionName", info.versionName);
            boolean post = false;
            if (info.requestedPermissions != null) {
                for (String permission : info.requestedPermissions) {
                    if ("android.permission.POST_NOTIFICATIONS".equals(permission)) post = true;
                }
            }
            result.put("declaresPostNotifications", post);
        } catch (Exception ignored) {
            // diagnostics only
        }

        result.put("channelExists", false);
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager manager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            NotificationChannel channel =
                manager == null ? null : manager.getNotificationChannel(ReminderScheduler.CHANNEL_ID);
            if (channel != null) {
                result.put("channelExists", true);
                result.put("importance", channel.getImportance());
                result.put("hasSound", channel.getSound() != null);
            }
        }
        call.resolve(result);
    }

    // ---- permission -----------------------------------------------------------------------

    @PluginMethod
    public void requestPermission(PluginCall call) {
        ReminderScheduler.ensureChannel(getContext());
        if (Build.VERSION.SDK_INT < 33 || getPermissionState("notifications") == PermissionState.GRANTED) {
            resolvePermission(call);
            return;
        }
        requestPermissionForAlias("notifications", call, "permissionResult");
    }

    @PermissionCallback
    private void permissionResult(PluginCall call) {
        resolvePermission(call);
    }

    private void resolvePermission(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", notificationsEnabled());
        result.put("sdk", Build.VERSION.SDK_INT);
        call.resolve(result);
    }

    // ---- scheduling -----------------------------------------------------------------------

    @PluginMethod
    public void scheduleReminders(PluginCall call) {
        JSArray items = call.getArray("items");
        int count = ReminderScheduler.scheduleAll(getContext(), items);
        JSObject result = new JSObject();
        result.put("count", count);
        call.resolve(result);
    }

    @PluginMethod
    public void cancelReminders(PluginCall call) {
        ReminderScheduler.cancelAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void showNow(PluginCall call) {
        ReminderScheduler.show(
            getContext(),
            2900,
            call.getString("title", "StudyOS"),
            call.getString("body", ""));
        call.resolve();
    }

    // ---- settings shortcuts ---------------------------------------------------------------

    @PluginMethod
    public void openNotificationSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                .putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName())
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        } catch (Exception e) {
            openAppDetails();
        }
        call.resolve();
    }

    @PluginMethod
    public void openChannelSettings(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= 26) {
                Intent intent = new Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS)
                    .putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName())
                    .putExtra(Settings.EXTRA_CHANNEL_ID, ReminderScheduler.CHANNEL_ID)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            } else {
                openNotificationSettings(call);
                return;
            }
        } catch (Exception e) {
            openAppDetails();
        }
        call.resolve();
    }

    @PluginMethod
    public void openExactAlarmSettings(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= 31) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                    .setData(Uri.parse("package:" + getContext().getPackageName()))
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            }
        } catch (Exception e) {
            openAppDetails();
        }
        call.resolve();
    }

    private void openAppDetails() {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                .setData(Uri.parse("package:" + getContext().getPackageName()))
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        } catch (Exception ignored) {
            // nothing else we can open
        }
    }
}
