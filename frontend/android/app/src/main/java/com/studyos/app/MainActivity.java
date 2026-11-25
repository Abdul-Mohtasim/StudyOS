package com.studyos.app;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static String pendingTarget;

    static synchronized String takePendingTarget() {
        String t = pendingTarget;
        pendingTarget = null;
        return t == null ? "" : t;
    }

    private static synchronized void remember(Intent i) {
        if (i == null) return;
        String t = i.getStringExtra(WidgetUpdater.EXTRA_OPEN);
        if (t != null && !t.isEmpty()) {
            pendingTarget = t;
            i.removeExtra(WidgetUpdater.EXTRA_OPEN);
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StudyHapticsPlugin.class);
        registerPlugin(StudyNotifyPlugin.class);
        registerPlugin(StudyWidgetPlugin.class);
        registerPlugin(StudyIconPlugin.class);
        super.onCreate(savedInstanceState);
        remember(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        remember(intent);
        // App already running: tell the page straight away.
        String t = pendingTarget;
        if (t != null && getBridge() != null) {
            pendingTarget = null;
            getBridge().triggerWindowJSEvent("studyos-widget-open", "{\"target\":\"" + t.replaceAll("[^a-z_]", "") + "\"}");
        }
    }
}
