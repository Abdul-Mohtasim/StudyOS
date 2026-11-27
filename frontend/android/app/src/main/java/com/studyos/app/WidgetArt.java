package com.studyos.app;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.DashPathEffect;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;

import androidx.core.graphics.PathParser;

import java.util.Calendar;
import java.util.Locale;

/**
 * Draws every home-screen widget as ONE bitmap in a fixed design size (2x2 = 160 x 160, wide = 340 x 160 design units).
 * The launcher scales that bitmap to whatever size the widget has (ImageView fitCenter), so proportions never break.
 * Only three widgets show the flame character (Streak, Big streak, Reading); they are animated by drawing a few frames.
 * Every widget shows the streak flame icon: red when today is done, grey while it waits.
 * No mood logic lives here (MoodEngine decides) and no I/O (WidgetStore reads).
 */
final class WidgetArt {
    static final int K_STREAK = 0, K_BIG = 1, K_READ = 2, K_RING = 3, K_WEEK7 = 4, K_FOCUS = 5, K_TASKS = 6, K_BARS = 7;
    static final int FRAMES = 6;

    /** pixels per design unit: a 2x2 widget is 360 px, a wide one 765 px */
    private static final float S = 2.25f;

    private static final int CARD1 = 0xFF0A1A73, CARD2 = 0xFF1F4FE0;
    private static final int WHITE = 0xFFFFFFFF, SUB = 0xFFC9D3FF, GREY = 0x99FFFFFF;
    private static final int TILE = 0x24FFFFFF, TILE_ON = 0x40FFB347, TRACK = 0x33FFFFFF;
    private static final int OK = 0xFF2ECC71, ACC = 0xFFFF9F1C, WARN = 0xFFFF5A2A;
    private static final int ORANGE_TOP = 0xFFFFD27A, ORANGE_BOT = 0xFFFF7A1A;

    // The StudyOS streak flame (same drawing as the icon in the app), in a 48 x 48 box
    private static final Path FLAME = PathParser.createPathFromPathData(
            "M24,3C25.4,9.6 31.6,13 35.2,19.4C37.6,23.6 38.4,28.6 36.4,33.2C34,38.8 29,43 24,43C16,43 9.6,36.6 9.6,28.6C9.6,24.4 11.4,21 14,18.2C14.6,21 16.2,22.8 18.4,23.6C17.4,15.4 19.6,8.6 24,3Z");
    private static final Path INNER = PathParser.createPathFromPathData(
            "M24,21C20,25 18,28 18,31.4C18,35.2 20.6,37.8 24,37.8C27.4,37.8 30,35.2 30,31.4C30,28 28,25 24,21Z");
    private static final Path CORE = PathParser.createPathFromPathData(
            "M24,23.4C20.6,26.8 18.8,29.4 18.8,32C18.8,35.2 21,37.4 24,37.4C27,37.4 29.2,35.2 29.2,32C29.2,29.4 27.4,26.8 24,23.4Z");

    private static final String[] DAYN = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};

    private WidgetArt() { }

    static boolean animated(int kind) { return kind <= K_READ; }
    static boolean wide(int kind) { return kind == K_WEEK7 || kind == K_BARS; }

    // ---- entry point ------------------------------------------------------------------------

    /**
     * @param frame  animation frame 0..frames-1 (ignored by the widgets without a character)
     * @param locked the Widget Pack is not unlocked (or nobody is signed in): a dimmed card with a hint on top
     */
    static Bitmap draw(Context c, int kind, WidgetStore.Snap s, MoodEngine.Result mood, int frame, int frames, int cycles, boolean locked) {
        float w = wide(kind) ? 340f : 160f, h = 160f;
        Bitmap b = Bitmap.createBitmap(Math.round(w * S), Math.round(h * S), Bitmap.Config.ARGB_8888);
        Canvas cv = new Canvas(b);
        cv.scale(S, S);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setShader(new LinearGradient(0, 0, w * 0.35f, h, CARD1, CARD2, Shader.TileMode.CLAMP));
        cv.drawRect(0, 0, w, h, p);
        boolean lit = s.signedIn && s.studiedToday && s.streak > 0;
        switch (kind) {
            case K_STREAK: streak(c, cv, s, mood, lit, frame, frames, cycles); break;
            case K_BIG: big(c, cv, s, mood, lit, frame, frames, cycles); break;
            case K_READ: read(c, cv, s, mood, lit, frame, frames, cycles); break;
            case K_RING: ring(cv, s, lit); break;
            case K_WEEK7: week7(cv, s, lit); break;
            case K_FOCUS: focus(cv, s, lit); break;
            case K_TASKS: tasks(cv, s, lit); break;
            default: bars(cv, s, lit); break;
        }
        if (locked || !s.signedIn) overlay(cv, w, h, !s.signedIn ? "Open StudyOS" : "Unlock the Widget Pack", !s.signedIn ? "to sign in" : "in the Gem Shop");
        // round the corners with anti-aliased edges: clear everything outside the rounded card
        Path outside = new Path();
        outside.addRoundRect(new RectF(0, 0, w, h), 30f, 30f, Path.Direction.CW);
        outside.setFillType(Path.FillType.INVERSE_WINDING);
        Paint clear = new Paint(Paint.ANTI_ALIAS_FLAG);
        clear.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.CLEAR));
        cv.drawPath(outside, clear);
        return b;
    }

    // ---- the widgets with the flame character ---------------------------------------------------

    private static void streak(Context c, Canvas cv, WidgetStore.Snap s, MoodEngine.Result mood, boolean lit, int f, int n, int cyc) {
        icon(cv, 12, 10, 52, lit);
        number(cv, s.streak, 70, 50, 38, Paint.Align.LEFT);
        gradText(cv, label(s.streak), 70, 68, 12.5f, Paint.Align.LEFT);
        character(c, cv, mood, f, n, cyc, 66, 70, 92);
    }

    private static void big(Context c, Canvas cv, WidgetStore.Snap s, MoodEngine.Result mood, boolean lit, int f, int n, int cyc) {
        number(cv, s.streak, 14, 50, 44, Paint.Align.LEFT);
        gradText(cv, label(s.streak), 14, 68, 12f, Paint.Align.LEFT);
        // one huge flame with a white edge that runs off the corner
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        cv.save();
        cv.translate(58, 44);
        float k = 120f / 48f;
        cv.scale(k, k);
        p.setColor(WHITE);
        p.setStyle(Paint.Style.FILL_AND_STROKE);
        p.setStrokeWidth(5f);
        p.setStrokeJoin(Paint.Join.ROUND);
        cv.drawPath(FLAME, p);
        cv.restore();
        icon(cv, 58, 44, 120, lit);
        character(c, cv, mood, f, n, cyc, 2, 98, 62);
    }

    private static void read(Context c, Canvas cv, WidgetStore.Snap s, MoodEngine.Result mood, boolean lit, int f, int n, int cyc) {
        icon(cv, 10, 10, 34, lit);
        number(cv, s.streak, 48, 34, 24, Paint.Align.LEFT);
        gradText(cv, label(s.streak), 48, 47, 9.5f, Paint.Align.LEFT);
        character(c, cv, mood, f, n, cyc, 28, 8, 106);
        // the book in front of him
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        Path book = new Path();
        book.moveTo(8, 120);
        book.quadTo(44, 106, 80, 122);
        book.quadTo(116, 106, 152, 120);
        book.lineTo(152, 172);
        book.lineTo(8, 172);
        book.close();
        p.setStyle(Paint.Style.FILL);
        p.setColor(0xFFFFC83A);
        cv.drawPath(book, p);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeCap(Paint.Cap.ROUND);
        p.setStrokeWidth(3f);
        p.setColor(0xFFE2A41A);
        cv.drawLine(80, 122, 80, 172, p);
        Path edge = new Path();
        edge.moveTo(8, 120);
        edge.quadTo(44, 106, 80, 122);
        edge.quadTo(116, 106, 152, 120);
        cv.drawPath(edge, p);
        p.setStrokeWidth(2.2f);
        p.setAlpha(150);
        cv.drawLine(22, 136, 70, 140, p);
        cv.drawLine(22, 148, 70, 152, p);
        cv.drawLine(90, 140, 138, 136, p);
        cv.drawLine(90, 152, 138, 148, p);
        // his hands on the edges of the book
        p.setAlpha(255);
        p.setStyle(Paint.Style.FILL);
        p.setColor(0xFFFF9F43);
        cv.drawOval(new RectF(0, 124, 26, 152), p);
        cv.drawOval(new RectF(134, 124, 160, 152), p);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(2.4f);
        p.setColor(0xFFE8801F);
        cv.drawOval(new RectF(0, 124, 26, 152), p);
        cv.drawOval(new RectF(134, 124, 160, 152), p);
    }

    // ---- the widgets without a character (just the streak flame icon) -----------------------------

    private static void ring(Canvas cv, WidgetStore.Snap s, boolean lit) {
        text(cv, "Daily Goal", 14, 28, 14f, WHITE, Paint.Align.LEFT);
        float pct = Math.min(1f, (float) s.todayMin / Math.max(1, s.goalMin));
        progressRing(cv, 80, 88, 33, 13, pct);
        icon(cv, 60, 66, 40, lit);
        text(cv, Math.min(s.todayMin, 9999) + " / " + s.goalMin + " min", 80, 146, 12.5f, SUB, Paint.Align.CENTER);
    }

    private static void week7(Canvas cv, WidgetStore.Snap s, boolean lit) {
        text(cv, "Daily Goal", 16, 34, 18f, WHITE, Paint.Align.LEFT);
        icon(cv, 250, 6, 42, lit);
        number(cv, s.streak, 294, 37, 22, Paint.Align.LEFT);
        int m = s.weekMinutes.length;
        int dow = Calendar.getInstance().get(Calendar.DAY_OF_WEEK) - 1; // 0 = Sunday
        int todayK = s.todayIndex >= 0 && s.todayIndex < m ? s.todayIndex : m - 1;
        float pct = Math.min(1f, (float) s.todayMin / Math.max(1, s.goalMin));
        float tw = 39f, gap = 5.5f, x0 = (340f - (7 * tw + 6 * gap)) / 2f;
        for (int i = 0; i < 7; i++) {
            int off = i - dow;
            int k = todayK + off;
            boolean future = off > 0, today = off == 0;
            boolean valid = k >= 0 && k < m;
            int kind;
            if (today) kind = s.studiedToday ? 0 : 2;
            else if (future || !valid) kind = 3;
            else kind = s.weekMinutes[k] > 0 ? 0 : 1;
            tile(cv, x0 + i * (tw + gap), 62, tw, 80, DAYN[i], kind, pct);
        }
    }

    private static void focus(Canvas cv, WidgetStore.Snap s, boolean lit) {
        float pct = Math.min(1f, (float) s.todayMin / Math.max(1, s.goalMin));
        progressRing(cv, 50, 54, 32, 13, pct);
        text(cv, String.valueOf(Math.min(s.todayMin, 999)), 50, 61, 21f, WHITE, Paint.Align.CENTER);
        text(cv, "min", 50, 73, 9.5f, SUB, Paint.Align.CENTER);
        icon(cv, 108, 10, 42, lit);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setColor(0xFFC97100);
        cv.drawRoundRect(new RectF(12, 110, 148, 146), 14, 14, p);
        p.setColor(ACC);
        cv.drawRoundRect(new RectF(12, 106, 148, 142), 14, 14, p);
        text(cv, s.sessionActive ? "OPEN TIMER" : "START FOCUS", 80, 129, 14f, 0xFF201300, Paint.Align.CENTER);
    }

    private static void tasks(Canvas cv, WidgetStore.Snap s, boolean lit) {
        text(cv, "Today", 14, 31, 17f, WHITE, Paint.Align.LEFT);
        text(cv, s.doneToday + "/" + s.totalToday + " done", 14, 46, 11.5f, SUB, Paint.Align.LEFT);
        icon(cv, 108, 8, 42, lit);
        int n = Math.min(3, s.tasks.length);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        for (int i = 0; i < n; i++) {
            float y = 58 + i * 31;
            p.setStyle(Paint.Style.FILL);
            p.setColor(TILE);
            cv.drawRoundRect(new RectF(10, y, 150, y + 26), 10, 10, p);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(2.4f);
            p.setColor(GREY);
            cv.drawCircle(25, y + 13, 7.5f, p);
            Paint tp = textPaint(11f, WHITE, Paint.Align.LEFT);
            cv.drawText(fit(tp, s.tasks[i], 100f), 39, y + 17, tp);
        }
        if (n == 0) {
            text(cv, s.totalToday > 0 ? "All done for today!" : "Nothing planned yet", 80, 104, 13f, SUB, Paint.Align.CENTER);
        }
    }

    private static void bars(Canvas cv, WidgetStore.Snap s, boolean lit) {
        int n = s.weekMinutes.length;
        int total = 0;
        for (int mm : s.weekMinutes) total += mm;
        text(cv, "This week", 16, 33, 18f, WHITE, Paint.Align.LEFT);
        text(cv, total >= 60 ? (total / 60) + "h " + (total % 60) + "m" : total + " min", 16, 49, 11.5f, SUB, Paint.Align.LEFT);
        icon(cv, 250, 6, 42, lit);
        number(cv, s.streak, 294, 37, 22, Paint.Align.LEFT);
        if (n == 0) return;
        int max = Math.max(s.goalMin, 1);
        for (int mm : s.weekMinutes) max = Math.max(max, mm);
        float base = 130f, chartH = 56f, x0 = 18f, slot = (340f - 36f) / n;
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(1.6f);
        p.setColor(GREY);
        p.setPathEffect(new DashPathEffect(new float[]{5f, 5f}, 0));
        float gy = base - chartH * Math.min(1f, (float) s.goalMin / max);
        cv.drawLine(14, gy, 326, gy, p);
        p.setPathEffect(null);
        p.setStyle(Paint.Style.FILL);
        for (int i = 0; i < n; i++) {
            float cx = x0 + slot * i + slot / 2f;
            float bh = s.weekMinutes[i] > 0 ? Math.max(8f, chartH * s.weekMinutes[i] / max) : 8f;
            boolean td = i == s.todayIndex;
            p.setColor(s.weekMinutes[i] > 0 ? (td ? ACC : 0x99FFFFFF) : TILE);
            cv.drawRoundRect(new RectF(cx - 11, base - bh, cx + 11, base), 9, 9, p);
            String lab = s.weekLabels.length > i && s.weekLabels[i].length() > 0 ? s.weekLabels[i].substring(0, 1) : "";
            text(cv, lab, cx, 151, 12f, td ? WHITE : GREY, Paint.Align.CENTER);
        }
    }

    // ---- parts ------------------------------------------------------------------------------------

    /** The streak flame icon: red with an orange inside while today is done, grey while it waits. box = height of its 48 unit square. */
    private static void icon(Canvas cv, float x, float y, float box, boolean lit) {
        cv.save();
        cv.translate(x, y);
        float k = box / 48f;
        cv.scale(k, k);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setStyle(Paint.Style.FILL);
        if (lit) {
            p.setShader(new LinearGradient(0, 3, 0, 43, 0xFFFF5A3C, 0xFFFF2A4A, Shader.TileMode.CLAMP));
            cv.drawPath(FLAME, p);
            p.setShader(null);
            p.setColor(0xFFFF9600);
            cv.drawPath(INNER, p);
            p.setColor(0xFFFFF1B0);
            cv.save();
            cv.translate(0, 1.6f);
            cv.drawPath(CORE, p);
            cv.restore();
        } else {
            p.setColor(0xFF8B9CE6);
            cv.drawPath(FLAME, p);
            p.setColor(0xFFC3CDFA);
            cv.drawPath(CORE, p);
        }
        cv.restore();
    }

    /** Ember (the flame character) from assets/mascot.json, drawn square into (x, y, size). */
    private static void character(Context c, Canvas cv, MoodEngine.Result mood, int frame, int frames, int cycles, float x, float y, float size) {
        Bitmap em = MascotRenderer.frame(c, mood.mood, mood.level, frame, Math.max(1, frames), 256, Math.max(1, cycles));
        Paint bp = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
        cv.drawBitmap(em, null, new RectF(x, y, x + size, y + size), bp);
    }

    private static void progressRing(Canvas cv, float cx, float cy, float r, float sw, float pct) {
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(sw);
        p.setStrokeCap(Paint.Cap.ROUND);
        p.setColor(TRACK);
        cv.drawCircle(cx, cy, r, p);
        if (pct > 0f) {
            p.setColor(ACC);
            cv.drawArc(new RectF(cx - r, cy - r, cx + r, cy + r), -90f, 360f * pct, false, p);
        }
    }

    private static void tile(Canvas cv, float x, float y, float w, float h, String label, int kind, float pct) {
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        float cx = x + w / 2f, cy = y + 27f;
        p.setStyle(Paint.Style.FILL);
        p.setColor(kind == 2 ? TILE_ON : TILE);
        cv.drawRoundRect(new RectF(x, y, x + w, y + h), 12, 12, p);
        if (kind == 2) {
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(1.6f);
            p.setColor(0xB3FF9F1C);
            cv.drawRoundRect(new RectF(x, y, x + w, y + h), 12, 12, p);
        }
        if (kind == 0) {
            p.setStyle(Paint.Style.FILL);
            p.setColor(OK);
            cv.drawCircle(cx, cy, 13f, p);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(2.9f);
            p.setStrokeCap(Paint.Cap.ROUND);
            p.setStrokeJoin(Paint.Join.ROUND);
            p.setColor(WHITE);
            cv.drawLine(cx - 5.4f, cy + 0.5f, cx - 1.5f, cy + 4.6f, p);
            cv.drawLine(cx - 1.5f, cy + 4.6f, cx + 5.7f, cy - 3.8f, p);
        } else if (kind == 1) {
            text(cv, "!", cx, cy + 8f, 24f, WARN, Paint.Align.CENTER);
        } else if (kind == 2) {
            progressRing(cv, cx, cy, 11.5f, 4.4f, pct);
            p.setStyle(Paint.Style.FILL);
            p.setColor(WHITE);
            p.setAlpha(220);
            cv.drawCircle(cx, cy, 4.6f, p);
        } else {
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(3.2f);
            p.setColor(GREY);
            cv.drawCircle(cx, cy, 11.5f, p);
        }
        text(cv, label, cx, y + h - 11f, 12.5f, kind == 3 ? GREY : WHITE, Paint.Align.CENTER);
    }

    private static void overlay(Canvas cv, float w, float h, String l1, String l2) {
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setColor(0xB3000820);
        cv.drawRect(0, 0, w, h, p);
        text(cv, l1, w / 2f, h / 2f - 2f, 14f, WHITE, Paint.Align.CENTER);
        text(cv, l2, w / 2f, h / 2f + 16f, 12f, SUB, Paint.Align.CENTER);
    }

    // ---- text -------------------------------------------------------------------------------------

    private static String label(int streak) { return streak == 1 ? "Streak Day" : "Streak Days"; }

    private static Paint textPaint(float size, int color, Paint.Align a) {
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
        p.setTextSize(size);
        p.setColor(color);
        p.setTextAlign(a);
        return p;
    }

    private static void text(Canvas cv, String t, float x, float y, float size, int color, Paint.Align a) {
        cv.drawText(t, x, y, textPaint(size, color, a));
    }

    /** Orange gradient text (light orange on top, deep orange at the bottom). */
    private static void gradText(Canvas cv, String t, float x, float y, float size, Paint.Align a) {
        Paint p = textPaint(size, WHITE, a);
        p.setShader(new LinearGradient(0, y - size, 0, y, ORANGE_TOP, ORANGE_BOT, Shader.TileMode.CLAMP));
        cv.drawText(t, x, y, p);
    }

    /** The streak number in the orange gradient; 3 and 4 digit streaks shrink so they always fit. */
    private static void number(Canvas cv, int n, float x, float y, float size, Paint.Align a) {
        String t = String.format(Locale.US, "%d", Math.max(0, n));
        float k = t.length() >= 4 ? 0.66f : t.length() == 3 ? 0.82f : 1f;
        gradText(cv, t, x, y, size * k, a);
    }

    private static String fit(Paint p, String t, float maxW) {
        if (t == null) return "";
        if (p.measureText(t) <= maxW) return t;
        while (t.length() > 1 && p.measureText(t + "\u2026") > maxW) t = t.substring(0, t.length() - 1);
        return t + "\u2026";
    }
}
