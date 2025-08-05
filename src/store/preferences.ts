import { useLocalStorage } from "@vueuse/core";
import { watchEffect } from "vue";

export const colorModePreference = useLocalStorage<
  "light" | "dark" | "light dark"
>("shodoku.app.preferences.appearance.color-mode", "light dark");

export function setupGlobalPreferences() {
  watchEffect(() => {
    const colorScheme = colorModePreference.value;
    if (colorScheme === "light" || colorScheme === "dark") {
      document.documentElement.style.setProperty("color-scheme", colorScheme);
    } else {
      document.documentElement.style.removeProperty("color-scheme");
    }
  });
}
