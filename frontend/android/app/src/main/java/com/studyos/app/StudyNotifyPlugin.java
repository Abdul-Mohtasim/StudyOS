package com.studyos.app;

import android.content.Context;
import android.content.Intent;
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
 * Small helper for notification permission problems.
 *
 * Android only shows the "Allow / Don't allow" dialog while the permission is still undecided.
 * After the user has denied it (twice on Android 13+) the system never shows the dialog again,
 * so the only way forward is the app's notification settings screen. This plugin opens it
 * and can report whether notifications are currently enabled for the app.
 */
@CapacitorPlugin(name = "StudyNotify")
public class StudyNotifyPlugin extends Plugin {

    @PluginMethod
    public void isEnabled(PluginCall call) {
        JSObject result = new JSObject();
        try {
            result.put("enabled", NotificationManagerCompat.from(getContext()).areNotificationsEnabled());
        } catch (Exception e) {
            result.put("enabled", true);
        }
        call.resolve(result);
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        Context context = getContext();
        String pkg = context.getPackageName();
        try {
            Intent intent;
            if (Build.VERSION.SDK_INT >= 26) {
                intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                intent.putExtra(Settings.EXTRA_APP_PACKAGE, pkg);
            } else {
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.fromParts("package", pkg, null));
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            call.resolve();
        } catch (Exception first) {
            try {
                Intent fallback = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                fallback.setData(Uri.fromParts("package", pkg, null));
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(fallback);
                call.resolve();
            } catch (Exception second) {
                call.reject("Could not open notification settings");
            }
        }
    }
}
