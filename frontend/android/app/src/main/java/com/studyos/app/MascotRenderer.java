package com.studyos.app;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Typeface;

import androidx.core.graphics.PathParser;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Draws the "Ember" mascot into Bitmaps from assets/mascot.json. No mood logic lives here:
 * it only turns (mood, level, animation frame) into pixels. Frame i of n is one step of a looping animation.
 */
final class MascotRenderer {
    private static final class Layer {
        Path path;
        Integer fill, stroke;
        float sw;
        String tag;
        int min;
    }

    private static final class Mood {
        final List<Layer> layers = new ArrayList<>();
        float bounce, hz, tilt, breathe, wave, squash;
        String fx = "none";
    }

    private static Map<String, Mood> MOODS;

    private static int parse(String hex) {
        if (hex == null || hex.length() == 0) return Color.TRANSPARENT;
        if (hex.length() == 9) { // #RRGGBBAA (CSS order) -> #AARRGGBB
            return Color.parseColor("#" + hex.substring(7, 9) + hex.substring(1, 7));
        }
        return Color.parseColor(hex);
    }

    private static synchronized Map<String, Mood> load(Context ctx) {
        if (MOODS != null) return MOODS;
        Map<String, Mood> out = new HashMap<>();
        try {
            InputStream in = ctx.getAssets().open("mascot.json");
            byte[] buf = new byte[in.available()];
            int off = 0;
            while (off < buf.length) {
                int r = in.read(buf, off, buf.length - off);
                if (r < 0) break;
                off += r;
            }
            in.close();
            JSONObject root = new JSONObject(new String(buf, 0, off, "UTF-8"));
            JSONObject colors = root.getJSONObject("colors");
            JSONObject moods = root.getJSONObject("moods");
            java.util.Iterator<String> it = moods.keys();
            while (it.hasNext()) {
                String name = it.next();
                JSONObject mo = moods.getJSONObject(name);
                Mood m = new Mood();
                JSONObject a = mo.getJSONObject("anim");
                m.bounce = (float) a.optDouble("bounce", 0);
                m.hz = (float) a.optDouble("hz", 1);
                m.tilt = (float) a.optDouble("tilt", 0);
                m.breathe = (float) a.optDouble("breathe", 0);
                m.wave = (float) a.optDouble("wave", 0);
                m.squash = (float) a.optDouble("squash", 0);
                m.fx = a.optString("fx", "none");
                JSONArray ls = mo.getJSONArray("layers");
                for (int i = 0; i < ls.length(); i++) {
                    JSONObject lo = ls.getJSONObject(i);
                    Layer l = new Layer();
                    l.path = PathParser.createPathFromPathData(lo.getString("d"));
                    if (lo.has("fill") && !lo.isNull("fill")) l.fill = parse(colors.getString(lo.getString("fill")));
                    if (lo.has("stroke") && !lo.isNull("stroke")) {
                        l.stroke = parse(colors.getString(lo.getString("stroke")));
                        l.sw = (float) lo.optDouble("sw", 3);
                    }
                    l.tag = lo.optString("tag", "");
                    l.min = lo.optInt("min", 0);
                    if (l.path != null) m.layers.add(l);
                }
                out.put(name, m);
            }
        } catch (Exception e) {
            // No mascot data: widgets still work, they just show no character.
        }
        MOODS = out;
        return out;
    }

    /** How many full animation cycles fit in one loop of `frames` frames played at `flipMs` per frame. */
    static int cycles(Context ctx, String mood, int frames, int flipMs) {
        Mood m = load(ctx).get(mood);
        float hz = m == null || m.hz <= 0 ? 1f : m.hz;
        return Math.max(1, Math.round(hz * frames * flipMs / 1000f));
    }

    static Bitmap frame(Context ctx, String mood, int level, int i, int n, int px, int cycles) {
        Bitmap bmp = Bitmap.createBitmap(px, px, Bitmap.Config.ARGB_8888);
        Mood m = load(ctx).get(mood);
        if (m == null) return bmp;
        Canvas cv = new Canvas(bmp);
        float s = px / 100f;
        cv.scale(s, s);
        double ph = 2 * Math.PI * cycles * i / n;
        float lift = m.bounce * (float) ((1 - Math.cos(ph)) / 2); // 0 on the ground, `bounce` at the top
        float tilt = m.tilt * (float) Math.sin(ph);
        float breathe = 1f + m.breathe * (float) Math.sin(ph) - m.squash;
        float armSwing = m.wave * (0.5f + 0.5f * (float) Math.sin(2 * ph));

        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        for (Layer l : m.layers) {
            if (l.min > level) continue;
            cv.save();
            if ("shadow".equals(l.tag)) {
                float k = 1f - 0.18f * (lift / Math.max(1f, m.bounce));
                cv.scale(k, k, 50, 94);
            } else if ("foot".equals(l.tag)) {
                cv.translate(0, -lift * 0.25f);
            } else {
                cv.translate(0, -lift);
                cv.rotate(tilt, 50, 92);
                cv.scale(2f - breathe, breathe, 50, 91);
                if ("armR".equals(l.tag)) cv.rotate(-armSwing * 38f, 79, 56);
                if ("armL".equals(l.tag)) cv.rotate(armSwing * 14f, 21, 56);
            }
            if (l.fill != null) {
                p.setStyle(Paint.Style.FILL);
                p.setColor(l.fill);
                cv.drawPath(l.path, p);
            }
            if (l.stroke != null) {
                p.setStyle(Paint.Style.STROKE);
                p.setStrokeWidth(l.sw);
                p.setStrokeCap(Paint.Cap.ROUND);
                p.setStrokeJoin(Paint.Join.ROUND);
                p.setColor(l.stroke);
                cv.drawPath(l.path, p);
            }
            cv.restore();
        }
        drawFx(cv, p, m.fx, i, n);
        return bmp;
    }

    // ---- particles (deterministic: same frame -> same picture) ----------------------------

    private static void star(Canvas cv, Paint p, float cx, float cy, float r) {
        Path st = new Path();
        st.moveTo(cx, cy - r);
        st.quadTo(cx, cy, cx + r, cy);
        st.quadTo(cx, cy, cx, cy + r);
        st.quadTo(cx, cy, cx - r, cy);
        st.quadTo(cx, cy, cx, cy - r);
        cv.drawPath(st, p);
    }

    private static void drawFx(Canvas cv, Paint p, String fx, int i, int n) {
        float t = (float) i / n;
        p.setStyle(Paint.Style.FILL);
        if ("sparkle".equals(fx)) {
            p.setColor(0xFFFFE27A);
            float[][] pts = {{14, 24, 0f}, {86, 20, 0.33f}, {10, 52, 0.66f}, {90, 48, 0.5f}};
            for (float[] q : pts) {
                float k = 0.55f + 0.45f * (float) Math.sin(2 * Math.PI * (t + q[2]));
                star(cv, p, q[0], q[1], 3.5f + 4.5f * Math.abs(k));
            }
        } else if ("zzz".equals(fx)) {
            p.setColor(0xFF8E9AAF);
            p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
            for (int z = 0; z < 3; z++) {
                float u = (t + z / 3f) % 1f;
                p.setAlpha((int) (255 * Math.sin(Math.PI * u)));
                p.setTextSize(9 + 5 * u);
                cv.drawText("z", 70 + 14 * u + z * 3, 30 - 24 * u, p);
            }
            p.setAlpha(255);
        } else if ("confetti".equals(fx)) {
            int[] cols = {0xFFFF6F7D, 0xFF7C5CFF, 0xFFFFE27A, 0xFF6EC6FF, 0xFF7BE0A0};
            for (int c = 0; c < 18; c++) {
                float x0 = (c * 37) % 100;
                float u = (t + (c * 0.173f)) % 1f;
                float y = -6 + 112 * u;
                float x = x0 + 5 * (float) Math.sin(2 * Math.PI * (u * 2 + c));
                p.setColor(cols[c % cols.length]);
                cv.save();
                cv.rotate(360 * u * (c % 2 == 0 ? 1 : -1), x, y);
                cv.drawRect(x - 2f, y - 1.2f, x + 2f, y + 1.2f, p);
                cv.restore();
            }
        }
    }
}
