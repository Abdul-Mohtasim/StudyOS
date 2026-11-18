package com.studyos.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

/** A one-tap shortcut widget that opens StudyOS straight into the focus timer. */
public class StudyTimerWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int id : appWidgetIds) updateAppWidget(context, manager, id);
    }

    static void updateAppWidget(Context context, AppWidgetManager manager, int appWidgetId) {
        StudyWidgetState state = StudyWidgetState.load(context);
        StudyWidgetTheme theme = StudyWidgetTheme.forKey(state.theme);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_timer);
        views.setInt(R.id.widget_root, "setBackgroundResource", theme.backgroundRes);
        views.setTextColor(R.id.widget_timer_label, theme.textColor);
        views.setInt(R.id.widget_timer_icon, "setColorFilter", theme.accentColor);

        Intent launch = new Intent(context, MainActivity.class);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        launch.putExtra("studyos_widget_action", "start_focus_timer");
        PendingIntent pending = PendingIntent.getActivity(
            context, appWidgetId, launch,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pending);

        manager.updateAppWidget(appWidgetId, views);
    }

    static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, StudyTimerWidgetProvider.class));
        for (int id : ids) updateAppWidget(context, manager, id);
    }

    static boolean hasWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        return manager.getAppWidgetIds(new ComponentName(context, StudyTimerWidgetProvider.class)).length > 0;
    }
}
