/**
 * Instagram Launcher Service
 *
 * This is the main orchestration service that combines:
 * - Clipboard handshake (to prevent infinite loop)
 * - Background timer (to track allowed time)
 * - Notification storm (when time expires)
 * - Deep linking (to open Instagram)
 *
 * This service provides the main entry points for launching Instagram
 * with different intents (messages vs scrolling).
 */

import { setPassOpen, clearPassOpen } from "./clipboard-handshake";
import { startTimer, stopTimer, isTimerActive, getRemainingTime } from "./background-timer";
import { startStorm, stopStorm, isStormActive } from "./notification-storm";
import { openInstagramMessages, openInstagramFeed, isInstagramInstalled } from "./deep-linking";

// Default timer duration for messages (2 minutes as per agents.md)
const MESSAGES_TIMER_DURATION_MINUTES = 2;

// Session state
interface SessionState {
  type: "messages" | "scroll" | null;
  startedAt: number | null;
  durationMinutes: number | null;
}

let currentSession: SessionState = {
  type: null,
  startedAt: null,
  durationMinutes: null,
};

/**
 * Launch Instagram Messages with a 2-minute timer.
 * Flow:
 * 1. Set PASS_OPEN in clipboard
 * 2. Start background timer for 2 minutes
 * 3. Deep link to Instagram DMs
 *
 * @returns true if successfully launched
 */
export async function launchMessages(): Promise<boolean> {
  console.log("[InstagramLauncher] Launching Messages");

  // Check if Instagram is installed first
  const installed = await isInstagramInstalled();
  if (!installed) {
    return false;
  }

  try {
    // Stop any existing storm
    if (await isStormActive()) {
      await stopStorm();
    }

    // Stop any existing timer
    if (await isTimerActive()) {
      await stopTimer();
    }

    // Set clipboard handshake
    await setPassOpen();

    // Start timer with notification storm callback
    await startTimer(MESSAGES_TIMER_DURATION_MINUTES, () => {
      console.log("[InstagramLauncher] Messages timer expired, starting storm");
      startStorm();
    });

    // Update session state
    currentSession = {
      type: "messages",
      startedAt: Date.now(),
      durationMinutes: MESSAGES_TIMER_DURATION_MINUTES,
    };

    // Open Instagram Messages
    const opened = await openInstagramMessages();
    if (!opened) {
      // If open failed, clean up
      await stopTimer();
      await clearPassOpen();
      currentSession = { type: null, startedAt: null, durationMinutes: null };
      return false;
    }

    return true;
  } catch (error) {
    console.error("[InstagramLauncher] Failed to launch messages:", error);
    // Clean up on error
    await stopTimer();
    await clearPassOpen();
    currentSession = { type: null, startedAt: null, durationMinutes: null };
    return false;
  }
}

/**
 * Launch Instagram Feed with a user-selected timer duration.
 * Flow:
 * 1. Set PASS_OPEN in clipboard
 * 2. Start background timer for the specified duration
 * 3. Deep link to Instagram main feed
 *
 * @param durationMinutes The allowed scroll time in minutes
 * @returns true if successfully launched
 */
export async function launchFeed(durationMinutes: number): Promise<boolean> {
  console.log(`[InstagramLauncher] Launching Feed for ${durationMinutes} minutes`);

  // Validate duration
  if (durationMinutes <= 0 || durationMinutes > 60) {
    console.error("[InstagramLauncher] Invalid duration:", durationMinutes);
    return false;
  }

  // Check if Instagram is installed first
  const installed = await isInstagramInstalled();
  if (!installed) {
    return false;
  }

  try {
    // Stop any existing storm
    if (await isStormActive()) {
      await stopStorm();
    }

    // Stop any existing timer
    if (await isTimerActive()) {
      await stopTimer();
    }

    // Set clipboard handshake
    await setPassOpen();

    // Start timer with notification storm callback
    await startTimer(durationMinutes, () => {
      console.log("[InstagramLauncher] Feed timer expired, starting storm");
      startStorm();
    });

    // Update session state
    currentSession = {
      type: "scroll",
      startedAt: Date.now(),
      durationMinutes: durationMinutes,
    };

    // Open Instagram Feed
    const opened = await openInstagramFeed();
    if (!opened) {
      // If open failed, clean up
      await stopTimer();
      await clearPassOpen();
      currentSession = { type: null, startedAt: null, durationMinutes: null };
      return false;
    }

    return true;
  } catch (error) {
    console.error("[InstagramLauncher] Failed to launch feed:", error);
    // Clean up on error
    await stopTimer();
    await clearPassOpen();
    currentSession = { type: null, startedAt: null, durationMinutes: null };
    return false;
  }
}

/**
 * Stop the current session.
 * Clears the timer, stops any notification storm, and resets state.
 * Should be called when user returns to ShortBreak.
 */
export async function stopSession(): Promise<void> {
  console.log("[InstagramLauncher] Stopping session");

  // Stop notification storm if active
  if (await isStormActive()) {
    await stopStorm();
  }

  // Stop timer
  await stopTimer();

  // Clear clipboard
  await clearPassOpen();

  // Reset session state
  currentSession = {
    type: null,
    startedAt: null,
    durationMinutes: null,
  };
}

/**
 * Get information about the current session.
 * @returns Current session state
 */
export function getSessionInfo(): SessionState {
  return { ...currentSession };
}

/**
 * Get remaining time in the current session.
 * @returns Remaining time in milliseconds, or 0 if no active session
 */
export async function getSessionRemainingTime(): Promise<number> {
  return getRemainingTime();
}

/**
 * Check if there's an active session.
 * @returns true if a session is active
 */
export async function hasActiveSession(): Promise<boolean> {
  return isTimerActive();
}

/**
 * Check if a notification storm is currently active.
 * @returns true if storm is active
 */
export async function isNudgeActive(): Promise<boolean> {
  return isStormActive();
}

/**
 * Re-export useful functions from child services
 */
export { isInstagramInstalled } from "./deep-linking";
export { isTimerActive, getRemainingTime } from "./background-timer";
export { isStormActive } from "./notification-storm";
