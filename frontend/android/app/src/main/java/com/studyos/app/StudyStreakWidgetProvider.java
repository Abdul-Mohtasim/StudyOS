package com.studyos.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

/**
 * The flagship widget: the animated-mood mascot, the current streak and today's progress.
 * Rendering is intentionally dumb — all the mood decisions happen in StudyWidgetMoodEngine,
 * this class just paints whatever that engine returns.
 */
public class StudyStreakWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) updateAppWidget(context, manager, id);
        StudyWidgetUpdater.ensureTicking(context);
    }

    @Override
    public void onEnabled(Context context) {
        StudyWidgetUpdater.ensureTicking(context);
    }

    static void updateAppWidget(Context context, AppWidgetManager manager, int appWidgetId) {
        StudyWidgetState state = StudyWidgetState.load(context);
        long now = System.currentTimeMillis();
        StudyWidgetMood mood = StudyWidgetMoodEngine.resolve(state, now);
        StudyWidgetTheme theme = StudyWidgetTheme.forKey(state.theme);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_streak);
        views.setInt(R.id.widget_root, "setBackgroundResource", theme.backgroundRes);
        views.setImageViewResource(R.id.widget_mascot, StudyWidgetTheme.mascotDrawable(mood));

        String streakLabel = state.streak + (state.streak == 1 ? " day streak" : " days streak");
        views.setTextViewText(R.id.widget_streak_text, streakLabel);
        views.setTextColor(R.id.widget_streak_text, theme.textColor);

        views.setTextViewText(R.id.widget_mood_text, StudyWidgetTheme.moodMessage(mood, state));
        views.setTextColor(R.id.widget_mood_text, theme.mutedTextColor);

        int percent = Math.max(0, Math.min(100, state.dailyGoalPercent));
        views.setProgressBar(R.id.widget_goal_progress, 100, percent, false);
        if (android.os.Build.VERSION.SDK_INT >= 31) {
            views.setColorStateList(R.id.widget_goal_progress, "setProgressTintList",
                android.content.res.ColorStateList.valueOf(theme.accentColor));
        }
        views.setTextViewText(R.id.widget_goal_text,
            state.todayFocusMinutes + " / " + state.dailyGoalMinutes + " min today");
        views.setTextColor(R.id.widget_goal_text, theme.mutedTextColor);

        Intent launch = new Intent(context, MainActivity.class);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        launch.putExtra("studyos_widget_action", "open_dashboard");
        PendingIntent pending = PendingIntent.getActivity(
            context, appWidgetId, launch,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pending);

        manager.updateAppWidget(appWidgetId, views);
    }

    static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, StudyStreakWidgetProvider.class));
        for (int id : ids) updateAppWidget(context, manager, id);
    }

    static boolean hasWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        return manager.getAppWidgetIds(new ComponentName(context, StudyStreakWidgetProvider.class)).length > 0;
    }
}
