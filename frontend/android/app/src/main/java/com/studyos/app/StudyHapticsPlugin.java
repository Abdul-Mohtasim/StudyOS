package com.studyos.app;

import android.content.Context;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;

/**
 * One native call plays a whole vibration pattern, so there is no chatter over the
 * JS bridge (which used to cause lag). Uses crisp hardware "primitives" (Android 11+)
 * when the phone supports them, otherwise an amplitude waveform, otherwise a plain pattern.
 *
 * JS payload:
 *   prims:      [[primitiveId, scale(0..1), delayMs], ...]   (optional)
 *   timings:    [ms, ms, ...]   waveform segment lengths      (optional)
 *   amplitudes: [0..255, ...]   same length as timings        (optional)
 * Primitive ids: 1 click, 2 thud, 3 spin, 4 quick rise, 5 slow rise, 6 quick fall, 7 tick, 8 low tick
 */
@CapacitorPlugin(name = "StudyHaptics")
public class StudyHapticsPlugin extends Plugin {

    private Vibrator vibrator;

    private Vibrator getVibrator() {
        if (vibrator != null) return vibrator;
        Context context = getContext();
        if (Build.VERSION.SDK_INT >= 31) {
            VibratorManager manager =
                (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            if (manager != null) vibrator = manager.getDefaultVibrator();
        } else {
            vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        }
        return vibrator;
    }

    @PluginMethod
    public void play(PluginCall call) {
        try {
            Vibrator v = getVibrator();
            if (v == null || !v.hasVibrator()) {
                call.resolve();
                return;
            }

            JSArray prims = call.getArray("prims");
            JSArray timingsArr = call.getArray("timings");
            JSArray ampsArr = call.getArray("amplitudes");

            if (Build.VERSION.SDK_INT >= 30 && prims != null && prims.length() > 0) {
                VibrationEffect composed = buildComposition(v, prims);
                if (composed != null) {
                    v.vibrate(composed);
                    call.resolve();
                    return;
                }
            }

            if (timingsArr != null && timingsArr.length() > 0) {
                int n = timingsArr.length();
                long[] timings = new long[n];
                for (int i = 0; i < n; i++) {
                    timings[i] = timingsArr.getLong(i);
                }

                if (Build.VERSION.SDK_INT >= 26) {
                    VibrationEffect effect;
                    if (ampsArr != null && ampsArr.length() == n && v.hasAmplitudeControl()) {
                        int[] amps = new int[n];
                        for (int i = 0; i < n; i++) {
                            amps[i] = Math.max(0, Math.min(255, ampsArr.getInt(i)));
                        }
                        effect = VibrationEffect.createWaveform(timings, amps, -1);
                    } else {
                        effect = VibrationEffect.createWaveform(timings, -1);
                    }
                    v.vibrate(effect);
                } else {
                    v.vibrate(timings, -1);
                }
            }
            call.resolve();
        } catch (Exception e) {
            call.resolve();
        }
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        try {
            Vibrator v = getVibrator();
            if (v != null) v.cancel();
        } catch (Exception ignored) {
            // nothing to cancel
        }
        call.resolve();
    }

    private VibrationEffect buildComposition(Vibrator v, JSONArray prims) throws Exception {
        int n = prims.length();
        int[] ids = new int[n];
        for (int i = 0; i < n; i++) {
            ids[i] = mapPrimitive(prims.getJSONArray(i).getInt(0));
        }
        if (!v.areAllPrimitivesSupported(ids)) {
            return null;
        }
        VibrationEffect.Composition composition = VibrationEffect.startComposition();
        for (int i = 0; i < n; i++) {
            JSONArray p = prims.getJSONArray(i);
            float scale = (float) p.getDouble(1);
            int delay = p.length() > 2 ? p.getInt(2) : 0;
            composition.addPrimitive(ids[i], scale, delay);
        }
        return composition.compose();
    }

    private int mapPrimitive(int id) {
        switch (id) {
            case 2:
                return Build.VERSION.SDK_INT >= 31
                    ? VibrationEffect.Composition.PRIMITIVE_THUD
                    : VibrationEffect.Composition.PRIMITIVE_CLICK;
            case 3:
                return Build.VERSION.SDK_INT >= 31
                    ? VibrationEffect.Composition.PRIMITIVE_SPIN
                    : VibrationEffect.Composition.PRIMITIVE_QUICK_RISE;
            case 4:
                return VibrationEffect.Composition.PRIMITIVE_QUICK_RISE;
            case 5:
                return VibrationEffect.Composition.PRIMITIVE_SLOW_RISE;
            case 6:
                return VibrationEffect.Composition.PRIMITIVE_QUICK_FALL;
            case 7:
                return VibrationEffect.Composition.PRIMITIVE_TICK;
            case 8:
                return Build.VERSION.SDK_INT >= 31
                    ? VibrationEffect.Composition.PRIMITIVE_LOW_TICK
                    : VibrationEffect.Composition.PRIMITIVE_TICK;
            default:
                return VibrationEffect.Composition.PRIMITIVE_CLICK;
        }
    }
}
