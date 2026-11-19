package com.studyos.app;

import java.util.Calendar;

/**
 * Mascot mood resolver. Pure logic, no Android classes, no drawing.
 * Port of frontend/src/widgets/moodEngine.js: keep the two in step
 * (tools/MoodEngineCheck.java compares them on the shared test vectors).
 *
 * Priority (highest first): celebrating > excited > sleeping > sad > worried > motivated > happy.
 * Day maths use the device's local time zone.
 */
public final class MoodEngine {
    public static final long EXCITED_MS = 3000;
    public static final long CELEBRATE_MS = 8000;
    public static final int[] MILESTONES = {3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365, 500, 730, 1000};
    private static final long HOUR = 3600000L;

    public static final class State {
        public long now;
        public boolean studiedToday, studiedYesterday, everStudied, sessionActive;
        public long lastTaskAt, celebrationAt;
        public int nightStart = 23, nightEnd = 6, worryHours = 3;
    }

    public static final class Result {
        public String mood;
        public int level;
        public long nextAt;
    }

    private static long startOfNextDay(long now) {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(now);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        c.add(Calendar.DAY_OF_MONTH, 1);
        return c.getTimeInMillis();
    }

    private static long atHour(long now, int hour, int dayOffset) {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(now);
        c.add(Calendar.DAY_OF_MONTH, dayOffset);
        c.set(Calendar.HOUR_OF_DAY, hour);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTimeInMillis();
    }

    private static boolean isNight(long now, int start, int end) {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(now);
        int h = c.get(Calendar.HOUR_OF_DAY);
        return start > end ? (h >= start || h < end) : (h >= start && h < end);
    }

    public static Result resolve(State s) {
        long now = s.now;
        double sinceTask = s.lastTaskAt > 0 ? (double) (now - s.lastTaskAt) : Double.POSITIVE_INFINITY;
        double sinceCeleb = s.celebrationAt > 0 ? (double) (now - s.celebrationAt) : Double.POSITIVE_INFINITY;
        long midnight = startOfNextDay(now);
        boolean night = isNight(now, s.nightStart, s.nightEnd);
        long nextAt = midnight;

        if (sinceCeleb >= 0 && sinceCeleb < CELEBRATE_MS) nextAt = Math.min(nextAt, s.celebrationAt + CELEBRATE_MS);
        if (sinceTask >= 0 && sinceTask < EXCITED_MS) nextAt = Math.min(nextAt, s.lastTaskAt + EXCITED_MS);
        for (int off = 0; off <= 1; off++) {
            for (int h : new int[]{s.nightStart, s.nightEnd}) {
                long t = atHour(now, h, off);
                if (t > now) nextAt = Math.min(nextAt, t);
            }
        }
        long left = midnight - now;
        long worryAt = midnight - s.worryHours * HOUR;
        long worry2At = midnight - HOUR;
        if (worryAt > now) nextAt = Math.min(nextAt, worryAt);
        if (worry2At > now) nextAt = Math.min(nextAt, worry2At);

        Result r = new Result();
        r.nextAt = nextAt;
        if (sinceCeleb >= 0 && sinceCeleb < CELEBRATE_MS) r.mood = "celebrating";
        else if (sinceTask >= 0 && sinceTask < EXCITED_MS) r.mood = "excited";
        else if (night && !s.sessionActive) r.mood = "sleeping";
        else if (s.studiedToday) r.mood = "happy";
        else if (s.everStudied && !s.studiedYesterday) r.mood = "sad";
        else if (left <= s.worryHours * HOUR) {
            r.mood = "worried";
            r.level = left <= HOUR ? 2 : 1;
        } else r.mood = "motivated";
        return r;
    }

    /** Highest streak milestone newly reached (above `celebrated`), or 0. */
    public static int newMilestone(int streak, int celebrated) {
        int hit = 0;
        for (int m : MILESTONES) if (streak >= m && m > celebrated) hit = m;
        return hit;
    }
}
