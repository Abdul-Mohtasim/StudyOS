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

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Tells the web app the real notification state of this phone and opens the right
 * Android settings screen. Needed because after "Don't allow" Android no longer shows
 * the permission pop-up, so the only way forward is the system settings.
 */
@CapacitorPlugin(name = "StudyNotify")
public class StudyNotifyPlugin extends Plugin {

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        Context context = getContext();
        result.put("enabled", NotificationManagerCompat.from(context).areNotificationsEnabled());
        result.put("sdk", Build.VERSION.SDK_INT);
        try {
            PackageInfo info = context.getPackageManager()
                .getPackageInfo(context.getPackageName(), PackageManager.GET_PERMISSIONS);
            result.put("versionName", info.versionName);
            boolean post = false;
            boolean exact = false;
            if (info.requestedPermissions != null) {
                for (String permission : info.requestedPermissions) {
                    if ("android.permission.POST_NOTIFICATIONS".equals(permission)) post = true;
                    if ("android.permission.SCHEDULE_EXACT_ALARM".equals(permission)) exact = true;
                }
            }
            result.put("declaresPostNotifications", post);
            result.put("declaresExactAlarm", exact);
        } catch (Exception ignored) {
            // diagnostics only
        }

        String channelId = call.getString("channelId", "");
        result.put("channelExists", false);
        if (Build.VERSION.SDK_INT >= 26 && channelId != null && !channelId.isEmpty()) {
            NotificationManager manager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            NotificationChannel channel = manager == null ? null : manager.getNotificationChannel(channelId);
            if (channel != null) {
                result.put("channelExists", true);
                result.put("importance", channel.getImportance());
                result.put("hasSound", channel.getSound() != null);
            }
        }
        call.resolve(result);
    }

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
        String channelId = call.getString("channelId", "");
        try {
            if (Build.VERSION.SDK_INT >= 26 && channelId != null && !channelId.isEmpty()) {
                Intent intent = new Intent(Settings.ACTION_CHANNEL_NOTIFICATION_SETTINGS)
                    .putExtra(Settings.EXTRA_APP_PACKAGE, getContext().getPackageName())
                    .putExtra(Settings.EXTRA_CHANNEL_ID, channelId)
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
