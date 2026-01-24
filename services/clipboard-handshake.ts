/**
 * Clipboard Handshake Service
 *
 * This service manages the clipboard-based handshake mechanism that prevents
 * the "Infinite Loop" problem when redirecting between this app and Instagram.
 *
 * Flow:
 * 1. User opens Instagram → iOS Shortcut triggers
 * 2. Shortcut checks clipboard for "PASS_OPEN"
 * 3. If PASS_OPEN exists → Shortcut clears clipboard and exits (User enters Instagram)
 * 4. If PASS_OPEN is missing → Shortcut redirects to ShortBreak app
 */

import * as Clipboard from "expo-clipboard";

const PASS_TOKEN = "PASS_OPEN";

/**
 * Sets the PASS_OPEN token in the clipboard to authorize Instagram access.
 * This token is read by the iOS Shortcut to determine if the user
 * has been "cleared" to enter Instagram.
 */
export async function setPassOpen(): Promise<void> {
  try {
    await Clipboard.setStringAsync(PASS_TOKEN);
    console.log("[ClipboardHandshake] PASS_OPEN token set");
  } catch (error) {
    console.error("[ClipboardHandshake] Failed to set PASS_OPEN:", error);
    throw error;
  }
}

/**
 * Checks if the PASS_OPEN token exists in the clipboard.
 * @returns true if PASS_OPEN token is present
 */
export async function checkPassOpen(): Promise<boolean> {
  try {
    const content = await Clipboard.getStringAsync();
    const hasToken = content === PASS_TOKEN;
    console.log("[ClipboardHandshake] Check PASS_OPEN:", hasToken);
    return hasToken;
  } catch (error) {
    console.error("[ClipboardHandshake] Failed to check clipboard:", error);
    return false;
  }
}

/**
 * Clears the PASS_OPEN token from the clipboard.
 * Should be called when the user returns to the app to reset the state.
 */
export async function clearPassOpen(): Promise<void> {
  try {
    const content = await Clipboard.getStringAsync();
    if (content === PASS_TOKEN) {
      await Clipboard.setStringAsync("");
      console.log("[ClipboardHandshake] PASS_OPEN token cleared");
    }
  } catch (error) {
    console.error("[ClipboardHandshake] Failed to clear clipboard:", error);
  }
}

/**
 * Gets the current clipboard content (for debugging purposes).
 * @returns Current clipboard content
 */
export async function getClipboardContent(): Promise<string> {
  try {
    return await Clipboard.getStringAsync();
  } catch (error) {
    console.error("[ClipboardHandshake] Failed to get clipboard:", error);
    return "";
  }
}
