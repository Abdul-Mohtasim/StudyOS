package com.studyos.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Fired by the background alarm (StudyWidgetUpdater) so the mascot's mood keeps advancing
 * on its own — day turning to night, Motivated drifting into Worried then Sad — even when
 * the StudyOS app itself is closed.
 */
public class StudyWidgetTickReceiver extends BroadcastReceiver {
    public static final String ACTION_TICK = "com.studyos.app.action.WIDGET_TICK";

    @Override
    public void onReceive(Context context, Intent intent) {
        StudyWidgetUpdater.refreshAll(context);
        // Stop ticking once the last widget from the pack is removed, to save battery.
        if (!StudyWidgetUpdater.anyWidgetsActive(context)) return;
        StudyWidgetUpdater.ensureTicking(context);
    }
}
