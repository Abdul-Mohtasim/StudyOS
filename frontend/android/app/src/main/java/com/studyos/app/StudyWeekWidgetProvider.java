package com.studyos.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

/** Study time this week: a tiny 7-bar bar chart of minutes studied per day. */
public class StudyWeekWidgetProvider extends AppWidgetProvider {

    private static final int[] BAR_IDS = {
        R.id.widget_week_bar_0, R.id.widget_week_bar_1, R.id.widget_week_bar_2,
        R.id.widget_week_bar_3, R.id.widget_week_bar_4, R.id.widget_week_bar_5, R.id.widget_week_bar_6
    };

    private static final int[] LEVEL_DRAWABLES = {
        R.drawable.bar_level_0, R.drawable.bar_level_1, R.drawable.bar_level_2,
        R.drawable.bar_level_3, R.drawable.bar_level_4, R.drawable.bar_level_5
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) updateAppWidget(context, manager, id);
    }

    static void updateAppWidget(Context context, AppWidgetManager manager, int appWidgetId) {
        StudyWidgetState state = StudyWidgetState.load(context);
        StudyWidgetTheme theme = StudyWidgetTheme.forKey(state.theme);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_week);
        views.setInt(R.id.widget_root, "setBackgroundResource", theme.backgroundRes);
        views.setTextColor(R.id.widget_week_title, theme.textColor);

        int[] minutes = state.weekMinutes == null || state.weekMinutes.length != 7
            ? new int[7] : state.weekMinutes;
        int max = 1;
        int total = 0;
        for (int m : minutes) { max = Math.max(max, m); total += m; }

        for (int i = 0; i < 7; i++) {
            int level = minutes[i] <= 0 ? 0 : Math.max(1, Math.round((minutes[i] / (float) max) * 5));
            views.setImageViewResource(BAR_IDS[i], LEVEL_DRAWABLES[Math.min(5, level)]);
            views.setInt(BAR_IDS[i], "setColorFilter", theme.accentColor);
        }
        views.setTextViewText(R.id.widget_week_total, total + " min this week");
        views.setTextColor(R.id.widget_week_total, theme.mutedTextColor);

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
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, StudyWeekWidgetProvider.class));
        for (int id : ids) updateAppWidget(context, manager, id);
    }

    static boolean hasWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        return manager.getAppWidgetIds(new ComponentName(context, StudyWeekWidgetProvider.class)).length > 0;
    }
}
