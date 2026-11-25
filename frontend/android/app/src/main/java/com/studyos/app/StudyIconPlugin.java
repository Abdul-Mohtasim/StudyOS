package com.studyos.app;

import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Dynamic launcher icon. Every icon is an <activity-alias> that targets MainActivity.
 * MainActivity itself has no LAUNCHER filter and is never disabled, so the app always stays launchable.
 * Switching enables the new alias FIRST, then disables the others, with DONT_KILL_APP.
 *
 * IMPORTANT: Android closes the app if the alias it was opened from is disabled while it is on screen
 * (DONT_KILL_APP does not prevent this). So a change requested while StudyOS is visible is only SAVED,
 * and applied in onStop, when the user has left the app. If the app is already in the background it is applied at once.
 */
@CapacitorPlugin(name = "StudyIcon")
public class StudyIconPlugin extends Plugin {
    private static final String TAG = "StudyIcon";
    static final String[] ICONS = {
        "flame_default",
        "flame_focused",
        "flame_celebrating",
        "flame_sleepy",
        "flame_away",
        "flame_welcome",
        "flame_streak",
        "flame_goal_complete",
        "flame_resting",
        "flame_motivated"
    };
    static final String DEFAULT = "flame_default";
    private static final String PREFS = "studyos_icon", PENDING = "pending";
    private static volatile boolean visible = false;

    private static SharedPreferences prefs(Context c) { return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE); }
    static String pending(Context c) { return prefs(c).getString(PENDING, ""); }

    /** Applies a saved icon change. Only call when StudyOS is not on screen. */
    static void applyPending(Context c) {
        String icon = pending(c);
        if (icon.isEmpty()) return;
        try {
            if (!icon.equals(current(c))) apply(c, icon);
            prefs(c).edit().remove(PENDING).apply();
        } catch (Exception e) {
            Log.e(TAG, "applying saved icon " + icon + " failed; keeping it for the next try", e);
        }
    }

    @Override
    protected void handleOnStart() { super.handleOnStart(); visible = true; }

    @Override
    protected void handleOnResume() { super.handleOnResume(); visible = true; }

    @Override
    protected void handleOnStop() {
        super.handleOnStop();
        visible = false;
        applyPending(getContext());
    }

    @Override
    protected void handleOnDestroy() {
        visible = false;
        applyPending(getContext());
        super.handleOnDestroy();
    }

    private static ComponentName alias(Context c, String icon) {
        return new ComponentName(c.getPackageName(), "com.studyos.app.Icon_" + icon);
    }

    private static boolean known(String icon) {
        for (String k : ICONS) if (k.equals(icon)) return true;
        return false;
    }

    /** The alias that is enabled now. A never-touched default alias counts as enabled (manifest default). */
    static String current(Context c) {
        PackageManager pm = c.getPackageManager();
        String fallback = null;
        for (String k : ICONS) {
            int st = pm.getComponentEnabledSetting(alias(c, k));
            if (st == PackageManager.COMPONENT_ENABLED_STATE_ENABLED) return k;
            if (st == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT && DEFAULT.equals(k)) fallback = k;
        }
        return fallback == null ? DEFAULT : fallback;
    }

    static void apply(Context c, String icon) {
        PackageManager pm = c.getPackageManager();
        // 1. turn the new one on (so there is never a moment with no launcher entry)
        pm.setComponentEnabledSetting(alias(c, icon), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP);
        // 2. turn every other one off
        for (String k : ICONS) {
            if (k.equals(icon)) continue;
            int want = PackageManager.COMPONENT_ENABLED_STATE_DISABLED;
            if (pm.getComponentEnabledSetting(alias(c, k)) != want || DEFAULT.equals(k))
                pm.setComponentEnabledSetting(alias(c, k), want, PackageManager.DONT_KILL_APP);
        }
    }

    @PluginMethod
    public void isSupported(PluginCall call) {
        JSObject r = new JSObject();
        r.put("supported", true);
        call.resolve(r);
    }

    @PluginMethod
    public void getCurrentIcon(PluginCall call) {
        try {
            JSObject r = new JSObject();
            String p = pending(getContext());
            r.put("icon", p.isEmpty() ? current(getContext()) : p);
            r.put("showing", current(getContext()));
            r.put("pending", !p.isEmpty());
            call.resolve(r);
        } catch (Exception e) {
            Log.e(TAG, "getCurrentIcon failed", e);
            call.reject("getCurrentIcon failed: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void setIcon(PluginCall call) {
        String icon = call.getString("icon", "");
        if (!known(icon)) { call.reject("Unknown icon: " + icon); return; }
        Context c = getContext();
        try {
            String showing = current(c);
            JSObject r = new JSObject();
            r.put("icon", icon);
            if (icon.equals(showing)) {
                prefs(c).edit().remove(PENDING).apply();   // cancels an older saved change
                r.put("changed", false);
                r.put("pending", false);
                call.resolve(r);
                return;
            }
            // Save it; never disable the alias the user is looking at.
            prefs(c).edit().putString(PENDING, icon).commit();
            if (!visible) applyPending(c);
            r.put("changed", !visible);
            r.put("pending", visible);
            call.resolve(r);
        } catch (Exception e) {
            Log.e(TAG, "setIcon(" + icon + ") failed", e);
            call.reject("setIcon failed: " + e.getMessage(), e);
        }
    }

    /** App theme -> start screen style (flame face + matching background). */
    private static int splashStyle(String key) {
        switch (key) {
            case "midnight": return R.style.Splash_Midnight;
            case "ocean": return R.style.Splash_Ocean;
            case "forest": return R.style.Splash_Forest;
            case "sunset": return R.style.Splash_Sunset;
            case "mono": return R.style.Splash_Mono;
            default: return R.style.Splash_Ember;
        }
    }

    /**
     * Remembers the app theme for the start screen. Android 13+ keeps it for the next launches
     * (SplashScreen.setSplashScreenTheme). Older versions show the default start screen.
     */
    @PluginMethod
    public void setSplashTheme(PluginCall call) {
        String key = call.getString("key", "ember");
        Context c = getContext();
        try {
            String was = prefs(c).getString("splash", "");
            JSObject r = new JSObject();
            r.put("key", key);
            r.put("supported", Build.VERSION.SDK_INT >= 33);
            if (key.equals(was)) { call.resolve(r); return; }
            prefs(c).edit().putString("splash", key).apply();
            if (Build.VERSION.SDK_INT >= 33 && getActivity() != null) {
                final int style = splashStyle(key);
                getActivity().runOnUiThread(() -> {
                    try { getActivity().getSplashScreen().setSplashScreenTheme(style); }
                    catch (Exception e) { Log.e(TAG, "setSplashScreenTheme failed", e); }
                });
            }
            call.resolve(r);
        } catch (Exception e) {
            Log.e(TAG, "setSplashTheme(" + key + ") failed", e);
            call.reject("setSplashTheme failed: " + e.getMessage(), e);
        }
    }
}
