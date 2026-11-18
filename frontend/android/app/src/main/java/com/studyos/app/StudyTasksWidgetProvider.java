package com.studyos.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;

/** Today's tasks: a quick glance at what's left, up to three titles plus a "+N more". */
public class StudyTasksWidgetProvider extends AppWidgetProvider {

    private static final int[] TASK_ROW_IDS = {
        R.id.widget_task_1, R.id.widget_task_2, R.id.widget_task_3
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) updateAppWidget(context, manager, id);
    }

    static void updateAppWidget(Context context, AppWidgetManager manager, int appWidgetId) {
        StudyWidgetState state = StudyWidgetState.load(context);
        StudyWidgetTheme theme = StudyWidgetTheme.forKey(state.theme);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_tasks);
        views.setInt(R.id.widget_root, "setBackgroundResource", theme.backgroundRes);

        int remaining = Math.max(0, state.tasksTotal - state.tasksCompleted);
        views.setTextViewText(R.id.widget_tasks_title,
            "Today's tasks  " + state.tasksCompleted + "/" + state.tasksTotal);
        views.setTextColor(R.id.widget_tasks_title, theme.textColor);

        String[] titles = state.upcomingTasks == null ? new String[0] : state.upcomingTasks;
        for (int i = 0; i < TASK_ROW_IDS.length; i++) {
            if (i < titles.length && titles[i] != null && !titles[i].isEmpty()) {
                views.setViewVisibility(TASK_ROW_IDS[i], View.VISIBLE);
                views.setTextViewText(TASK_ROW_IDS[i], "• " + titles[i]);
                views.setTextColor(TASK_ROW_IDS[i], theme.mutedTextColor);
            } else if (i == 0 && remaining > titles.length) {
                views.setViewVisibility(TASK_ROW_IDS[i], View.VISIBLE);
                views.setTextViewText(TASK_ROW_IDS[i], "+" + (remaining - titles.length) + " more");
                views.setTextColor(TASK_ROW_IDS[i], theme.mutedTextColor);
            } else {
                views.setViewVisibility(TASK_ROW_IDS[i], View.GONE);
            }
        }
        boolean nothingShown = titles.length == 0 && remaining == 0;
        views.setViewVisibility(R.id.widget_tasks_empty, nothingShown ? View.VISIBLE : View.GONE);
        views.setTextColor(R.id.widget_tasks_empty, theme.mutedTextColor);

        Intent launch = new Intent(context, MainActivity.class);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        launch.putExtra("studyos_widget_action", "open_tasks");
        PendingIntent pending = PendingIntent.getActivity(
            context, appWidgetId, launch,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pending);

        manager.updateAppWidget(appWidgetId, views);
    }

    static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, StudyTasksWidgetProvider.class));
        for (int id : ids) updateAppWidget(context, manager, id);
    }

    static boolean hasWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        return manager.getAppWidgetIds(new ComponentName(context, StudyTasksWidgetProvider.class)).length > 0;
    }
}
