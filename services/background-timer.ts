/**
 * Background Timer Service
 *
 * This service manages background timers that continue running even when
 * the app is backgrounded (user switches to Instagram).
 *
 * Uses expo-task-manager and expo-background-fetch for iOS background execution.
 * The timer tracks how long the user has been in Instagram and triggers
 * a notification storm when the allowed time expires.
 */

import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";

// Storage keys
const TIMER_START_KEY = "@ShortBreak:timerStart";
const TIMER_DURATION_KEY = "@ShortBreak:timerDuration";
const TIMER_ACTIVE_KEY = "@ShortBreak:timerActive";

// Background task name
const BACKGROUND_TIMER_TASK = "SHORTBREAK_BACKGROUND_TIMER";

// Callback for when timer expires
let onExpireCallback: (() => void) | null = null;

// Interval ID for foreground checking
let foregroundCheckInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Initialize the background timer service.
 * Should be called once when the app starts.
 */
export async function initBackgroundTimer(): Promise<void> {
  // Define the background task
  TaskManager.defineTask(BACKGROUND_TIMER_TASK, async () => {
    try {
      const isExpired = await checkTimerExpired();
      if (isExpired && onExpireCallback) {
        onExpireCallback();
      }
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error("[BackgroundTimer] Background task error:", error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });

  // Register the background fetch task
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TIMER_TASK, {
      minimumInterval: 15, // iOS minimum is 15 minutes, but we check more frequently when foregrounded
      stopOnTerminate: false,
      startOnBoot: false,
    });
    console.log("[BackgroundTimer] Background task registered");
  } catch (error) {
    console.error("[BackgroundTimer] Failed to register background task:", error);
  }

  // Listen for app state changes to check timer when app comes to foreground
  AppState.addEventListener("change", handleAppStateChange);
}

/**
 * Handle app state changes to check timer when app becomes active.
 */
function handleAppStateChange(nextAppState: AppStateStatus): void {
  if (nextAppState === "active") {
    // App came to foreground, check if timer expired
    checkAndTriggerIfExpired();
    startForegroundChecking();
  } else if (nextAppState === "background") {
    stopForegroundChecking();
  }
}

/**
 * Start checking the timer periodically when app is in foreground.
 */
function startForegroundChecking(): void {
  stopForegroundChecking(); // Clear any existing interval
  foregroundCheckInterval = setInterval(async () => {
    await checkAndTriggerIfExpired();
  }, 5000); // Check every 5 seconds when in foreground
}

/**
 * Stop foreground checking.
 */
function stopForegroundChecking(): void {
  if (foregroundCheckInterval) {
    clearInterval(foregroundCheckInterval);
    foregroundCheckInterval = null;
  }
}

/**
 * Check if timer expired and trigger callback if so.
 */
async function checkAndTriggerIfExpired(): Promise<void> {
  const isExpired = await checkTimerExpired();
  if (isExpired && onExpireCallback) {
    onExpireCallback();
    await stopTimer(); // Auto-stop after triggering
  }
}

/**
 * Start a new timer with the specified duration.
 * @param durationMinutes Duration in minutes
 * @param onExpire Callback to execute when timer expires
 */
export async function startTimer(
  durationMinutes: number,
  onExpire: () => void
): Promise<void> {
  const now = Date.now();
  const durationMs = durationMinutes * 60 * 1000;

  try {
    await AsyncStorage.multiSet([
      [TIMER_START_KEY, now.toString()],
      [TIMER_DURATION_KEY, durationMs.toString()],
      [TIMER_ACTIVE_KEY, "true"],
    ]);

    onExpireCallback = onExpire;

    console.log(`[BackgroundTimer] Timer started for ${durationMinutes} minutes`);
  } catch (error) {
    console.error("[BackgroundTimer] Failed to start timer:", error);
    throw error;
  }
}

/**
 * Stop the current timer.
 */
export async function stopTimer(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TIMER_START_KEY, TIMER_DURATION_KEY, TIMER_ACTIVE_KEY]);
    onExpireCallback = null;
    stopForegroundChecking();
    console.log("[BackgroundTimer] Timer stopped");
  } catch (error) {
    console.error("[BackgroundTimer] Failed to stop timer:", error);
  }
}

/**
 * Check if the timer has expired.
 * @returns true if timer has expired, false otherwise
 */
export async function checkTimerExpired(): Promise<boolean> {
  try {
    const [[, isActive], [, startTime], [, duration]] = await AsyncStorage.multiGet([
      TIMER_ACTIVE_KEY,
      TIMER_START_KEY,
      TIMER_DURATION_KEY,
    ]);

    if (isActive !== "true" || !startTime || !duration) {
      return false;
    }

    const start = parseInt(startTime, 10);
    const dur = parseInt(duration, 10);
    const now = Date.now();
    const elapsed = now - start;

    return elapsed >= dur;
  } catch (error) {
    console.error("[BackgroundTimer] Failed to check timer:", error);
    return false;
  }
}

/**
 * Get remaining time in milliseconds.
 * @returns Remaining time in ms, or 0 if timer is not active or expired
 */
export async function getRemainingTime(): Promise<number> {
  try {
    const [[, isActive], [, startTime], [, duration]] = await AsyncStorage.multiGet([
      TIMER_ACTIVE_KEY,
      TIMER_START_KEY,
      TIMER_DURATION_KEY,
    ]);

    if (isActive !== "true" || !startTime || !duration) {
      return 0;
    }

    const start = parseInt(startTime, 10);
    const dur = parseInt(duration, 10);
    const now = Date.now();
    const elapsed = now - start;
    const remaining = dur - elapsed;

    return Math.max(0, remaining);
  } catch (error) {
    console.error("[BackgroundTimer] Failed to get remaining time:", error);
    return 0;
  }
}

/**
 * Check if a timer is currently active.
 * @returns true if timer is active
 */
export async function isTimerActive(): Promise<boolean> {
  try {
    const isActive = await AsyncStorage.getItem(TIMER_ACTIVE_KEY);
    return isActive === "true";
  } catch (error) {
    console.error("[BackgroundTimer] Failed to check timer status:", error);
    return false;
  }
}

/**
 * Set the expire callback (useful for re-registering after app reload).
 */
export function setExpireCallback(callback: () => void): void {
  onExpireCallback = callback;
}
