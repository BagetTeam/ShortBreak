/**
 * App State Management Service
 *
 * This service manages the overall app state, handling:
 * - App foreground/background transitions
 * - Session recovery
 * - State persistence
 * - Timer and notification coordination
 */

import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isTimerActive, checkTimerExpired, setExpireCallback } from "./background-timer";
import { startStorm, stopStorm, isStormActive, resumeStormIfActive } from "./notification-storm";
import { clearPassOpen } from "./clipboard-handshake";

// Storage keys
const LAST_ACTIVE_KEY = "@ShortBreak:lastActive";
const SESSION_TYPE_KEY = "@ShortBreak:sessionType";

// App state tracking
let currentAppState: AppStateStatus = AppState.currentState;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

// Callbacks
let onAppForegroundCallback: (() => void) | null = null;
let onAppBackgroundCallback: (() => void) | null = null;

/**
 * Initialize app state management.
 * Should be called once when the app starts.
 */
export function initAppStateManagement(): void {
  // Remove any existing subscription
  if (appStateSubscription) {
    appStateSubscription.remove();
  }

  // Subscribe to app state changes
  appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

  // Set up timer expiration callback
  setExpireCallback(async () => {
    console.log("[AppState] Timer expired, starting notification storm");
    await startStorm();
  });

  // Check initial state
  checkAndRecoverState();
}

/**
 * Handle app state changes (foreground/background transitions).
 */
async function handleAppStateChange(nextAppState: AppStateStatus): Promise<void> {
  const previousState = currentAppState;
  currentAppState = nextAppState;

  console.log(`[AppState] State changed: ${previousState} -> ${nextAppState}`);

  if (nextAppState === "active") {
    // App came to foreground
    await handleAppForeground();
    onAppForegroundCallback?.();
  } else if (nextAppState === "background") {
    // App went to background
    await handleAppBackground();
    onAppBackgroundCallback?.();
  }
}

/**
 * Handle app coming to foreground.
 */
async function handleAppForeground(): Promise<void> {
  console.log("[AppState] App came to foreground");

  // Record the time
  await AsyncStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());

  // Check if timer expired while app was in background
  const timerActive = await isTimerActive();
  if (timerActive) {
    const isExpired = await checkTimerExpired();
    if (isExpired) {
      console.log("[AppState] Timer expired while in background");
      // Start storm if not already active
      const stormActive = await isStormActive();
      if (!stormActive) {
        await startStorm();
      }
    }
  }

  // Resume storm if it was interrupted
  await resumeStormIfActive();
}

/**
 * Handle app going to background.
 */
async function handleAppBackground(): Promise<void> {
  console.log("[AppState] App went to background");

  // Record the time
  await AsyncStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

/**
 * Check and recover state after app restart.
 */
async function checkAndRecoverState(): Promise<void> {
  try {
    // Check if there's an active timer
    const timerActive = await isTimerActive();

    if (timerActive) {
      const isExpired = await checkTimerExpired();
      if (isExpired) {
        console.log("[AppState] Timer expired - starting storm");
        await startStorm();
      }
    } else {
      // No active timer - clear any stale state
      await clearPassOpen();
    }

    // Resume storm if needed
    await resumeStormIfActive();
  } catch (error) {
    console.error("[AppState] Error recovering state:", error);
  }
}

/**
 * Set callback for when app comes to foreground.
 */
export function setOnAppForeground(callback: () => void): void {
  onAppForegroundCallback = callback;
}

/**
 * Set callback for when app goes to background.
 */
export function setOnAppBackground(callback: () => void): void {
  onAppBackgroundCallback = callback;
}

/**
 * Get the current app state.
 */
export function getCurrentAppState(): AppStateStatus {
  return currentAppState;
}

/**
 * Check if the app is currently in foreground.
 */
export function isAppInForeground(): boolean {
  return currentAppState === "active";
}

/**
 * Store the current session type.
 */
export async function setSessionType(type: "messages" | "scroll" | null): Promise<void> {
  if (type) {
    await AsyncStorage.setItem(SESSION_TYPE_KEY, type);
  } else {
    await AsyncStorage.removeItem(SESSION_TYPE_KEY);
  }
}

/**
 * Get the current session type.
 */
export async function getSessionType(): Promise<"messages" | "scroll" | null> {
  const type = await AsyncStorage.getItem(SESSION_TYPE_KEY);
  return type as "messages" | "scroll" | null;
}

/**
 * Get the last time the app was active.
 */
export async function getLastActiveTime(): Promise<number | null> {
  const time = await AsyncStorage.getItem(LAST_ACTIVE_KEY);
  return time ? parseInt(time, 10) : null;
}

/**
 * Clear all session state.
 */
export async function clearSessionState(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(LAST_ACTIVE_KEY),
    AsyncStorage.removeItem(SESSION_TYPE_KEY),
    clearPassOpen(),
    stopStorm(),
  ]);
}

/**
 * Cleanup app state management.
 * Call when the app is being unmounted.
 */
export function cleanupAppStateManagement(): void {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  onAppForegroundCallback = null;
  onAppBackgroundCallback = null;
}
