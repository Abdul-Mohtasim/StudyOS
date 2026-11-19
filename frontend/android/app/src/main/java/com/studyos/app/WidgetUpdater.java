package com.studyos.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.net.Uri;
import android.widget.RemoteViews;

import java.util.Locale;

/**
 * Builds every home-screen widget from the stored snapshot + the mood engine and keeps one alarm
 * set for the next moment the mascot's mood can change by itself. Drawing the mascot is MascotRenderer's job;
 * deciding its mood is MoodEngine's job; this class only wires them to RemoteViews.
 */
final class WidgetUpdater {
    static final String ACTION_REFRESH = "com.studyos.app.WIDGET_REFRESH";
    static final String ACTION_TIP = "com.studyos.app.WIDGET_TIP";
    static final String EXTRA_OPEN = "studyos_open";

    private static final int FRAMES = 12, FLIP_MS = 180, FRAME_PX = 160;
    private static final int[] FRAME_IDS = {R.id.f0, R.id.f1, R.id.f2, R.id.f3, R.id.f4, R.id.f5, R.id.f6, R.id.f7, R.id.f8, R.id.f9, R.id.f10, R.id.f11};
    private static final int[] ROW_IDS = {R.id.r0, R.id.r1, R.id.r2, R.id.r3};
    private static final int[] ROW_BG = {R.id.rb0, R.id.rb1, R.id.rb2, R.id.rb3};
    private static final int[] ROW_BOX = {R.id.row0, R.id.row1, R.id.row2, R.id.row3};

    private WidgetUpdater() { }

    // ---- messages: always kind, never shaming ----------------------------------------------

    private static final String[] M_HAPPY = {"Nice rhythm, %n!", "You showed up today. Proud of you!", "Streak safe. Rest well."};
    private static final String[] M_MOTIVATED = {"Ready when you are, %n!", "A short session keeps your streak going.", "Even 10 minutes counts today."};
    private static final String[] M_WORRIED = {"%n, a quick session saves your streak!", "Still time. 10 minutes is enough!", "Let's squeeze one in before midnight."};
    private static final String[] M_SAD = {"New day, fresh start, %n.", "No worries. One session brings the smile back.", "Missing a day is okay. Come back today!"};
    private static final String[] M_SLEEP = {"Can't sleep, %n?", "Shhh... resting. See you tomorrow.", "Sweet dreams, %n!"};
    private static final String[] M_EXCITED = {"You did it, %n!", "Yes! Great work!", "Task done. Amazing!"};

    private static String message(String mood, WidgetStore.Snap s, long now) {
        String[] pool;
        switch (mood) {
            case "celebrating":
                return s.celebrationStreak > 0 ? s.celebrationStreak + " day streak! Incredible!" : "Milestone reached! Incredible!";
            case "excited": pool = M_EXCITED; break;
            case "sleeping": pool = M_SLEEP; break;
            case "sad": pool = M_SAD; break;
            case "worried": pool = M_WORRIED; break;
            case "motivated": pool = M_MOTIVATED; break;
            default: pool = M_HAPPY;
        }
        int day = WidgetStore.dayKey(now, 0).hashCode();
        String m = pool[Math.floorMod(day + s.tip, pool.length)];
        String first = s.name == null ? "" : s.name.trim();
        if (first.contains(" ")) first = first.substring(0, first.indexOf(' '));
        if (first.isEmpty()) return m.replace(", %n", "").replace("%n, ", "").replace(" %n", "").replace("%n", "").replace("  ", " ").trim();
        return m.replace("%n", first);
    }

    // ---- entry points ----------------------------------------------------------------------

    static void updateAll(Context ctx) {
        Context app = ctx.getApplicationContext();
        long now = System.currentTimeMillis();
        WidgetStore.Snap s = WidgetStore.read(app, now);
        AppWidgetManager mgr = AppWidgetManager.getInstance(app);
        boolean any = false;

        MoodEngine.Result mood = resolve(s, now);

        int[] ids = mgr.getAppWidgetIds(new ComponentName(app, StreakWidgetProvider.class));
        for (int id : ids) { mgr.updateAppWidget(id, buildStreak(app, s, mood, now)); any = true; }
        ids = mgr.getAppWidgetIds(new ComponentName(app, TasksWidgetProvider.class));
        for (int id : ids) { mgr.updateAppWidget(id, buildTasks(app, s)); any = true; }
        ids = mgr.getAppWidgetIds(new ComponentName(app, FocusWidgetProvider.class));
        for (int id : ids) { mgr.updateAppWidget(id, buildFocus(app, s)); any = true; }
        ids = mgr.getAppWidgetIds(new ComponentName(app, WeekWidgetProvider.class));
        for (int id : ids) { mgr.updateAppWidget(id, buildWeek(app, s)); any = true; }

        schedule(app, any ? mood.nextAt : 0);
    }

    static MoodEngine.Result resolve(WidgetStore.Snap s, long now) {
        MoodEngine.State st = new MoodEngine.State();
        st.now = now;
        st.studiedToday = s.studiedToday;
        st.studiedYesterday = s.studiedYesterday;
        st.everStudied = s.everStudied || s.streak > 0;
        st.sessionActive = s.sessionActive;
        st.lastTaskAt = s.lastTaskAt;
        st.celebrationAt = s.celebrationAt;
        st.nightStart = s.nightStart;
        st.nightEnd = s.nightEnd;
        return MoodEngine.resolve(st);
    }

    /** One alarm, for the next time the mood can change on its own (night, deadline, midnight, 3s/8s timers). */
    private static void schedule(Context app, long nextAt) {
        AlarmManager am = (AlarmManager) app.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Intent i = new Intent(app, WidgetRefreshReceiver.class).setAction(ACTION_REFRESH);
        PendingIntent pi = PendingIntent.getBroadcast(app, 7101, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        am.cancel(pi);
        if (nextAt <= 0) return;
        long at = Math.max(nextAt + 400, System.currentTimeMillis() + 1200);
        try {
            am.setAndAllowWhileIdle(AlarmManager.RTC, at, pi);
        } catch (SecurityException ignored) { }
    }

    // ---- pending intents -------------------------------------------------------------------

    private static PendingIntent open(Context c, String target) {
        Intent i = new Intent(c, MainActivity.class);
        i.setAction(Intent.ACTION_MAIN);
        i.addCategory(Intent.CATEGORY_LAUNCHER);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        i.setData(Uri.parse("studyos://widget/" + target));
        i.putExtra(EXTRA_OPEN, target);
        return PendingIntent.getActivity(c, Math.abs(target.hashCode()), i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static PendingIntent tip(Context c) {
        Intent i = new Intent(c, WidgetRefreshReceiver.class).setAction(ACTION_TIP);
        return PendingIntent.getBroadcast(c, 7102, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    // ---- shared look: a bold solid card in the theme colour (mv), dark text on it, soft tinted pills ----

    private static int soft(WidgetStore.Snap s) { return blend(s.mv, 0xFFFFFFFF, 0.42f); }
    private static int faint(int c, int a) { return (c & 0x00FFFFFF) | (a << 24); }

    private static void paintBg(RemoteViews rv, WidgetStore.Snap s) {
        rv.setInt(R.id.bg, "setColorFilter", s.mv);
    }

    // ---- streak + mascot -------------------------------------------------------------------

    private static RemoteViews buildStreak(Context c, WidgetStore.Snap s, MoodEngine.Result mood, long now) {
        RemoteViews rv = new RemoteViews(c.getPackageName(), R.layout.widget_streak);
        paintBg(rv, s);
        int cyc = MascotRenderer.cycles(c, mood.mood, FRAMES, FLIP_MS);
        for (int i = 0; i < FRAMES; i++) {
            rv.setImageViewBitmap(FRAME_IDS[i], MascotRenderer.frame(c, mood.mood, mood.level, i, FRAMES, FRAME_PX, cyc));
        }
        rv.setInt(R.id.flame, "setColorFilter", s.onMv);
        rv.setTextViewText(R.id.num, s.streak + (s.streak == 1 ? " day" : " days"));
        rv.setTextColor(R.id.num, s.onMv);
        rv.setTextViewText(R.id.msg, message(mood.mood, s, now));
        rv.setTextColor(R.id.msg, s.onMv);
        rv.setTextViewText(R.id.prog, s.signedIn
                ? Math.min(s.todayMin, 9999) + " / " + s.goalMin + " min today  \u00B7  \uD83D\uDC8E " + String.format(Locale.US, "%,d", s.gems)
                : "Open StudyOS to sign in");
        rv.setTextColor(R.id.prog, faint(s.onMv, 200));
        rv.setImageViewBitmap(R.id.days, dayRow(s));
        boolean locked = s.signedIn && !s.unlocked;
        if (locked) {
            rv.setTextViewText(R.id.msg, "Unlock the Widget Pack in the Gem Shop");
            rv.setTextViewText(R.id.prog, "Tap to open the shop");
        }
        rv.setOnClickPendingIntent(R.id.root, open(c, locked ? "shop" : "home"));
        rv.setOnClickPendingIntent(R.id.mascot, locked ? open(c, "shop") : tip(c));
        return rv;
    }

    /** Seven day circles with letters; studied days become joined check pills, like a streak calendar. */
    private static Bitmap dayRow(WidgetStore.Snap s) {
        int w = 560, h = 124, n = 7;
        Bitmap b = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        Canvas cv = new Canvas(b);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        float slot = (float) w / n, r = 32, cy = 86;
        int m = s.weekMinutes.length;
        int soft = soft(s);
        p.setTextAlign(Paint.Align.CENTER);
        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
        p.setTextSize(30);
        for (int i = 0; i < n; i++) {
            int k = m - n + i; // the last 7 entries end with today
            boolean has = k >= 0 && k < m;
            boolean today = has && k == s.todayIndex;
            boolean done = has && s.weekMinutes[k] > 0;
            float cx = slot * i + slot / 2;
            p.setColor(today ? s.onMv : faint(s.onMv, 190));
            String lt = has && s.weekLabels[k].length() > 0 ? s.weekLabels[k].substring(0, 1) : "";
            cv.drawText(lt, cx, 30, p);
            p.setStyle(Paint.Style.FILL);
            if (!done) {
                p.setColor(today ? soft : faint(soft, 120));
                cv.drawCircle(cx, cy, r, p);
            }
        }
        // joined pills for runs of studied days
        int i = 0;
        while (i < n) {
            int k = m - n + i;
            if (k >= 0 && k < m && s.weekMinutes[k] > 0) {
                int j = i;
                while (j + 1 < n && m - n + j + 1 < m && s.weekMinutes[m - n + j + 1] > 0) j++;
                p.setStyle(Paint.Style.FILL);
                p.setColor(soft);
                cv.drawRoundRect(new RectF(slot * i + slot / 2 - r, cy - r, slot * j + slot / 2 + r, cy + r), r, r, p);
                p.setStyle(Paint.Style.STROKE);
                p.setStrokeWidth(7);
                p.setStrokeCap(Paint.Cap.ROUND);
                p.setStrokeJoin(Paint.Join.ROUND);
                p.setColor(s.mv);
                for (int q = i; q <= j; q++) {
                    float cx = slot * q + slot / 2;
                    cv.drawLine(cx - 12, cy + 1, cx - 3, cy + 10, p);
                    cv.drawLine(cx - 3, cy + 10, cx + 13, cy - 8, p);
                }
                i = j + 1;
            } else {
                i++;
            }
        }
        return b;
    }

    // ---- tasks -----------------------------------------------------------------------------

    private static RemoteViews buildTasks(Context c, WidgetStore.Snap s) {
        RemoteViews rv = new RemoteViews(c.getPackageName(), R.layout.widget_tasks);
        paintBg(rv, s);
        rv.setTextColor(R.id.title, s.onMv);
        rv.setTextViewText(R.id.count, s.signedIn ? s.doneToday + "/" + s.totalToday + " done" : "");
        rv.setTextColor(R.id.count, faint(s.onMv, 200));
        int n = Math.min(4, s.tasks.length);
        for (int i = 0; i < 4; i++) {
            if (i < n) {
                rv.setViewVisibility(ROW_BOX[i], android.view.View.VISIBLE);
                rv.setInt(ROW_BG[i], "setColorFilter", soft(s));
                rv.setTextViewText(ROW_IDS[i], "\u25CB   " + s.tasks[i]);
                rv.setTextColor(ROW_IDS[i], s.onMv);
            } else {
                rv.setViewVisibility(ROW_BOX[i], android.view.View.GONE);
            }
        }
        boolean empty = n == 0;
        rv.setViewVisibility(R.id.empty, empty ? android.view.View.VISIBLE : android.view.View.GONE);
        rv.setTextViewText(R.id.empty, !s.signedIn ? "Open StudyOS to sign in"
                : s.totalToday > 0 ? "All done for today. Well played!" : "Nothing planned yet. Add a task!");
        rv.setTextColor(R.id.empty, s.onMv);
        if (s.signedIn && !s.unlocked) {
            for (int i = 0; i < 4; i++) rv.setViewVisibility(ROW_BOX[i], android.view.View.GONE);
            rv.setViewVisibility(R.id.empty, android.view.View.VISIBLE);
            rv.setTextViewText(R.id.empty, "Unlock the Widget Pack in the Gem Shop");
            rv.setOnClickPendingIntent(R.id.root, open(c, "shop"));
            return rv;
        }
        rv.setOnClickPendingIntent(R.id.root, open(c, "tasks"));
        return rv;
    }

    // ---- focus shortcut --------------------------------------------------------------------

    private static RemoteViews buildFocus(Context c, WidgetStore.Snap s) {
        RemoteViews rv = new RemoteViews(c.getPackageName(), R.layout.widget_focus);
        paintBg(rv, s);
        rv.setInt(R.id.btnbg, "setColorFilter", s.onMv);
        rv.setTextColor(R.id.ttl, s.onMv);
        rv.setTextColor(R.id.sub, faint(s.onMv, 210));
        rv.setTextColor(R.id.btn, soft(s));
        rv.setTextViewText(R.id.sub, s.todayMin + " / " + s.goalMin + " min today");
        rv.setTextViewText(R.id.btn, s.sessionActive ? "OPEN TIMER" : "START FOCUS");
        int pct = Math.min(100, Math.round(100f * s.todayMin / Math.max(1, s.goalMin)));
        rv.setImageViewBitmap(R.id.ring, ring(pct, s.todayMin, s));
        if (s.signedIn && !s.unlocked) {
            rv.setTextViewText(R.id.sub, "Widget Pack is locked");
            rv.setTextViewText(R.id.btn, "OPEN SHOP");
            rv.setOnClickPendingIntent(R.id.root, open(c, "shop"));
            return rv;
        }
        rv.setOnClickPendingIntent(R.id.root, open(c, s.sessionActive ? "focus" : "focus_start"));
        return rv;
    }

    private static Bitmap ring(int pct, int minutes, WidgetStore.Snap s) {
        int sz = 200;
        float sw = 24;
        Bitmap b = Bitmap.createBitmap(sz, sz, Bitmap.Config.ARGB_8888);
        Canvas cv = new Canvas(b);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(sw);
        p.setStrokeCap(Paint.Cap.ROUND);
        RectF r = new RectF(sw / 2, sw / 2, sz - sw / 2, sz - sw / 2);
        p.setColor(soft(s));
        cv.drawOval(r, p);
        if (pct > 0) {
            p.setColor(s.onMv);
            cv.drawArc(r, -90, 360f * pct / 100f, false, p);
        }
        p.setStyle(Paint.Style.FILL);
        p.setTextAlign(Paint.Align.CENTER);
        p.setColor(s.onMv);
        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
        p.setTextSize(64);
        cv.drawText(String.valueOf(Math.min(minutes, 999)), sz / 2f, sz / 2f + 14, p);
        p.setTextSize(26);
        p.setColor(faint(s.onMv, 200));
        cv.drawText("min", sz / 2f, sz / 2f + 48, p);
        return b;
    }

    // ---- week chart ------------------------------------------------------------------------

    private static RemoteViews buildWeek(Context c, WidgetStore.Snap s) {
        RemoteViews rv = new RemoteViews(c.getPackageName(), R.layout.widget_week);
        paintBg(rv, s);
        int total = 0;
        for (int m : s.weekMinutes) total += m;
        rv.setTextColor(R.id.title, s.onMv);
        rv.setTextViewText(R.id.total, total >= 60 ? (total / 60) + "h " + (total % 60) + "m" : total + " min");
        rv.setTextColor(R.id.total, s.onMv);
        rv.setImageViewBitmap(R.id.chart, weekChart(s));
        if (s.signedIn && !s.unlocked) {
            rv.setTextViewText(R.id.total, "Locked");
            rv.setOnClickPendingIntent(R.id.root, open(c, "shop"));
            return rv;
        }
        rv.setOnClickPendingIntent(R.id.root, open(c, "study"));
        return rv;
    }

    private static Bitmap weekChart(WidgetStore.Snap s) {
        int w = 560, h = 220;
        Bitmap b = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        Canvas cv = new Canvas(b);
        int n = s.weekMinutes.length;
        if (n == 0) return b;
        int max = Math.max(s.goalMin, 1);
        for (int m : s.weekMinutes) max = Math.max(max, m);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        float labelH = 40, top = 8, chartH = h - labelH - top;
        float slot = (float) w / n, bw = slot * 0.6f;
        p.setTextAlign(Paint.Align.CENTER);
        p.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
        p.setTextSize(27);
        for (int i = 0; i < n; i++) {
            float cx = slot * i + slot / 2;
            float bh = Math.max(14, chartH * s.weekMinutes[i] / max);
            boolean today = i == s.todayIndex;
            p.setStyle(Paint.Style.FILL);
            p.setColor(s.weekMinutes[i] > 0 ? (today ? s.onMv : soft(s)) : faint(soft(s), 110));
            cv.drawRoundRect(new RectF(cx - bw / 2, top + chartH - bh, cx + bw / 2, top + chartH), bw / 2, bw / 2, p);
            p.setColor(today ? s.onMv : faint(s.onMv, 200));
            cv.drawText(s.weekLabels[i].length() > 1 ? s.weekLabels[i].substring(0, 1) : s.weekLabels[i], cx, h - 8, p);
        }
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(3);
        p.setColor(faint(s.onMv, 150));
        p.setPathEffect(new android.graphics.DashPathEffect(new float[]{10, 8}, 0));
        float gy = top + chartH - chartH * s.goalMin / max;
        cv.drawLine(0, gy, w, gy, p);
        return b;
    }

    private static int blend(int a, int b, float t) {
        int ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
        int br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
        return 0xFF000000 | ((int) (ar + (br - ar) * t) << 16) | ((int) (ag + (bg - ag) * t) << 8) | (int) (ab + (bb - ab) * t);
    }
}
