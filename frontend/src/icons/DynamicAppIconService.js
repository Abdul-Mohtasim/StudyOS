// DynamicAppIconService: the only code that talks to the native launcher icon.
// Android: StudyIcon plugin (activity aliases). Web and other platforms: a safe no-op that reports unsupported.
import { Capacitor, registerPlugin } from "@capacitor/core";
import { ICONS } from "./iconController.js";

const NATIVE = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
const P = NATIVE ? registerPlugin("StudyIcon") : null;

export const DynamicAppIconService = {
  async isSupported() {
    if (!P) return false;
    try { return !!(await P.isSupported()).supported; } catch (e) { console.warn("[StudyIcon] isSupported failed:", (e && e.message) || String(e)); return false; }
  },
  getAvailableIcons() { return ICONS.slice(); },
  async getCurrentIcon() {
    if (!P) return "flame_default";
    try { return (await P.getCurrentIcon()).icon || "flame_default"; }
    catch (e) { console.warn("[StudyIcon] getCurrentIcon failed:", (e && e.message) || String(e)); return ""; }
  },
  async setIcon(iconName) {
    if (!ICONS.includes(iconName)) throw new Error("Unknown icon: " + iconName);
    if (!P) return { ok: false, reason: "unsupported" };
    try { const r = await P.setIcon({ icon: iconName }); return { ok: true, icon: r.icon || iconName, pending: !!r.pending }; }
    catch (e) { console.error("[StudyIcon] setIcon(" + iconName + ") failed:", (e && e.message) || String(e)); return { ok: false, reason: String(e && e.message || e) }; }
  },
  async setSplashTheme(key) {
    if (!P) return { ok: false, reason: "unsupported" };
    try { const r = await P.setSplashTheme({ key }); return { ok: true, supported: !!r.supported }; }
    catch (e) { console.error("[StudyIcon] setSplashTheme(" + key + ") failed:", (e && e.message) || String(e)); return { ok: false }; }
  },
  async resetIcon() { return this.setIcon("flame_default"); },
};
