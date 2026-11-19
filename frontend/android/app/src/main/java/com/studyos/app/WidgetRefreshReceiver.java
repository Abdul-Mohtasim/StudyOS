package com.studyos.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Refreshes the widgets: mood alarm, clock/timezone/date change, reboot, app update, mascot tap. */
public class WidgetRefreshReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String a = intent == null ? null : intent.getAction();
        if (WidgetUpdater.ACTION_TIP.equals(a)) {
            // Tapping the mascot shows the next message. It never changes the mood.
            WidgetStore.setInt(context, "tip", WidgetStore.sp(context).getInt("tip", 0) + 1);
        }
        WidgetUpdater.updateAll(context);
    }
}
