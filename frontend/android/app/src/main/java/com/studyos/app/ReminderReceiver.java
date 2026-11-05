package com.studyos.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Fires when a scheduled study reminder is due. */
public class ReminderReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        ReminderScheduler.show(
            context,
            intent.getIntExtra("id", 1),
            intent.getStringExtra("title"),
            intent.getStringExtra("body"));
    }
}
