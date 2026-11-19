package com.studyos.app;

import android.os.Handler;
import android.os.Looper;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Bridge between the web app and the home-screen widgets. The web app reports real events
 * (data changed, task done, streak milestone, focus running); the widgets and the mood engine do the rest.
 */
@CapacitorPlugin(name = "StudyWidget")
public class StudyWidgetPlugin extends Plugin {
    private final Handler main = new Handler(Looper.getMainLooper());

    private void refreshNow() {
        WidgetUpdater.updateAll(getContext());
    }

    /** Re-draw once the temporary mood (3 s / 8 s) has run out, even if the alarm is delayed. */
    private void refreshLater(long ms) {
        main.postDelayed(this::refreshNow, ms);
    }

    @PluginMethod
    public void sync(PluginCall call) {
        try {
            WidgetStore.saveState(getContext(), call.getData().toString());
            refreshNow();
            call.resolve();
        } catch (Exception e) {
            call.reject("sync failed");
        }
    }

    @PluginMethod
    public void taskCompleted(PluginCall call) {
        WidgetStore.setLong(getContext(), "lastTaskAt", System.currentTimeMillis());
        refreshNow();
        refreshLater(MoodEngine.EXCITED_MS + 150);
        call.resolve();
    }

    @PluginMethod
    public void celebrate(PluginCall call) {
        Integer m = call.getInt("milestone", 0);
        WidgetStore.setLong(getContext(), "celebrationAt", System.currentTimeMillis());
        WidgetStore.setInt(getContext(), "celebrationStreak", m == null ? 0 : m);
        refreshNow();
        refreshLater(MoodEngine.CELEBRATE_MS + 150);
        call.resolve();
    }

    @PluginMethod
    public void setSession(PluginCall call) {
        Boolean on = call.getBoolean("active", false);
        WidgetStore.setBool(getContext(), "sessionActive", Boolean.TRUE.equals(on));
        refreshNow();
        call.resolve();
    }

    /** Which widget opened the app (cold start). Returned once, then cleared. */
    @PluginMethod
    public void getLaunchTarget(PluginCall call) {
        JSObject r = new JSObject();
        r.put("target", MainActivity.takePendingTarget());
        call.resolve(r);
    }
}
