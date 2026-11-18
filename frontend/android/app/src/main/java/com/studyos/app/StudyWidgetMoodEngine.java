package com.studyos.app;

import java.util.Calendar;
import java.util.TimeZone;

/**
 * Centralized, deterministic mood resolver for the Streak Widget mascot.
 *
 * This is the ONLY place that decides which mood is shown. It is pure and stateless:
 * given a StudyWidgetState snapshot and "now", it always returns the same mood. All the
 * state that makes a mood "temporary" (the 3-second Excited window, a milestone's
 * Celebrating window) is a timestamp stored on StudyWidgetState by the caller that
 * detected the event, not inside this engine, so animation/rendering code never needs to
 * know how a mood started.
 *
 * Priority order (highest wins), per spec:
 *   1. Celebrating  2. Excited  3. Sleeping  4. Sad  5. Worried  6. Motivated  7. Happy
 */
public final class StudyWidgetMoodEngine {

    /** How long the mascot stays Excited after a task completes, before recalculating. */
    public static final long EXCITED_WINDOW_MS = 3000L;

    private StudyWidgetMoodEngine() {}

    public static StudyWidgetMood resolve(StudyWidgetState state, long nowMillis) {
        // 1. Celebrating — a streak milestone was just unlocked. Nothing interrupts this.
        if (state.milestoneCelebrateUntil > nowMillis) {
            return StudyWidgetMood.CELEBRATING;
        }

        // 2. Excited — a study task was just completed. Short, always wins over routine moods.
        if (state.lastTaskCompletedAt > 0
            && nowMillis - state.lastTaskCompletedAt < EXCITED_WINDOW_MS) {
            return StudyWidgetMood.EXCITED;
        }

        int minuteOfDay = minuteOfDay(nowMillis);
        boolean goalDone = state.dailyGoalPercent >= 100 || state.studiedToday;

        // 3. Sleeping — configured nighttime hours, but only while nothing active is happening.
        if (!state.activeSessionRunning && isNight(state, minuteOfDay)) {
            return StudyWidgetMood.SLEEPING;
        }

        // Once today's goal is done, Sad/Worried can never show for today.
        if (goalDone) {
            return StudyWidgetMood.HAPPY;
        }

        // 4. Sad — the local day's study block ended with nothing done.
        boolean dayEnded = isPastDeadline(minuteOfDay, state.dayDeadlineMinute);
        if (dayEnded) {
            return StudyWidgetMood.SAD;
        }

        // 5. Worried — the deadline is approaching and there has been no meaningful progress.
        int minutesToDeadline = minutesUntil(minuteOfDay, state.dayDeadlineMinute);
        boolean noProgress = state.todayFocusMinutes <= 0 && state.tasksCompleted <= 0;
        if (minutesToDeadline <= Math.max(0, state.worriedWindowMinutes) && noProgress) {
            return StudyWidgetMood.WORRIED;
        }

        // 6. Motivated — goal incomplete, but there is still plenty of time today.
        return StudyWidgetMood.MOTIVATED;
    }

    private static int minuteOfDay(long nowMillis) {
        Calendar cal = Calendar.getInstance(TimeZone.getDefault());
        cal.setTimeInMillis(nowMillis);
        return cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE);
    }

    private static boolean isNight(StudyWidgetState state, int minuteOfDay) {
        int start = wrap(state.nightStartMinute);
        int end = wrap(state.nightEndMinute);
        if (start == end) return false;
        if (start < end) {
            return minuteOfDay >= start && minuteOfDay < end;
        }
        // Wraps past midnight, e.g. 23:00 -> 06:00.
        return minuteOfDay >= start || minuteOfDay < end;
    }

    private static boolean isPastDeadline(int minuteOfDay, int deadlineMinute) {
        return minuteOfDay >= wrap(deadlineMinute);
    }

    /** Minutes remaining until deadlineMinute, today, clamped to >= 0 (never negative/wrapped). */
    private static int minutesUntil(int minuteOfDay, int deadlineMinute) {
        int delta = wrap(deadlineMinute) - minuteOfDay;
        return Math.max(0, delta);
    }

    private static int wrap(int minute) {
        int m = minute % 1440;
        return m < 0 ? m + 1440 : m;
    }
}
