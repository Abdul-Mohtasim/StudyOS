package com.studyos.app;

/**
 * Maps the app's theme/palette key (same keys used by the web app and the Shop: "light",
 * "dark", "theme_ocean", "theme_forest", "theme_sunset", "theme_mono") onto the widget
 * resources that draw that look, so a widget on the home screen always matches whatever
 * theme the person picked in StudyOS.
 */
public final class StudyWidgetTheme {

    public final int backgroundRes;
    public final int accentColor;
    public final int textColor;
    public final int mutedTextColor;

    private StudyWidgetTheme(int backgroundRes, int accentColor, int textColor, int mutedTextColor) {
        this.backgroundRes = backgroundRes;
        this.accentColor = accentColor;
        this.textColor = textColor;
        this.mutedTextColor = mutedTextColor;
    }

    public static StudyWidgetTheme forKey(String key) {
        String k = key == null ? "light" : key;
        switch (k) {
            case "dark":
                return new StudyWidgetTheme(
                    R.drawable.widget_bg_midnight, 0xFFC9B8C3, 0xFFEDEBEC, 0xFFB7B2B6);
            case "theme_ocean":
                return new StudyWidgetTheme(
                    R.drawable.widget_bg_ocean, 0xFF2B6082, 0xFF1C2B33, 0xFF5B7483);
            case "theme_forest":
                return new StudyWidgetTheme(
                    R.drawable.widget_bg_forest, 0xFF2F6B4A, 0xFF1D2E24, 0xFF577C64);
            case "theme_sunset":
                return new StudyWidgetTheme(
                    R.drawable.widget_bg_sunset, 0xFFB4532F, 0xFF34201A, 0xFF8A6456);
            case "theme_mono":
                return new StudyWidgetTheme(
                    R.drawable.widget_bg_mono, 0xFF1E1E1E, 0xFF1A1A1A, 0xFF6E6E6E);
            case "light":
            default:
                return new StudyWidgetTheme(
                    R.drawable.widget_bg_mauve, 0xFFE4585F, 0xFF1B1E25, 0xFF6B6E76);
        }
    }

    /** Mascot drawable for a given mood, tinted consistently with the rest of the app. */
    public static int mascotDrawable(StudyWidgetMood mood) {
        switch (mood) {
            case CELEBRATING: return R.drawable.mascot_celebrating;
            case EXCITED: return R.drawable.mascot_excited;
            case SLEEPING: return R.drawable.mascot_sleeping;
            case SAD: return R.drawable.mascot_sad;
            case WORRIED: return R.drawable.mascot_worried;
            case MOTIVATED: return R.drawable.mascot_motivated;
            case HAPPY:
            default: return R.drawable.mascot_happy;
        }
    }

    public static String moodMessage(StudyWidgetMood mood, StudyWidgetState state) {
        switch (mood) {
            case CELEBRATING: return state.streak + "-day streak! Amazing.";
            case EXCITED: return "Nice work! Keep it up.";
            case SLEEPING: return "Resting up for tomorrow.";
            case SAD: return "Today slipped by. Fresh start tomorrow.";
            case WORRIED: return "Time's running out today!";
            case MOTIVATED: return "Let's get some studying in.";
            case HAPPY:
            default: return "Today's goal is done!";
        }
    }
}
