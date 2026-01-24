/**
 * Notification Storm Service
 *
 * This service implements the "Notification Storm" feature - a series of
 * repeated notifications that fire every 5 seconds to nudge the user
 * to stop scrolling and return to the ShortBreak app.
 *
 * The storm continues until the user returns to the app and explicitly stops it.
 */

import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Storage key for storm state
const STORM_ACTIVE_KEY = "@ShortBreak:stormActive";
const STORM_COUNT_KEY = "@ShortBreak:stormCount";

// Storm interval (5 seconds)
const STORM_INTERVAL_MS = 5000;

// Interval ID for the storm
let stormInterval: ReturnType<typeof setInterval> | null = null;

// Notification counter for varied messages
let notificationCount = 0;

// Nudge messages to rotate through
const NUDGE_MESSAGES = [
  { title: "Time's Up!", body: "Your scroll time has ended. Time for a break!" },
  { title: "Hey, You Still There?", body: "You've been scrolling longer than planned." },
  { title: "Mindfulness Check", body: "Is this scroll bringing you joy?" },
  { title: "Break Time", body: "Come back to ShortBreak for a moment." },
  { title: "Gentle Reminder", body: "Your planned time is over." },
  { title: "Scroll Alert", body: "Time to close Instagram and take a breather." },
  { title: "You Can Do It!", body: "Close Instagram and feel good about it." },
  { title: "Pause & Reflect", body: "Is there something better you could be doing?" },
];

/**
 * Configure notification handler settings.
 * Call this once when the app initializes.
 */
export function configureNotifications(): void {
  // Configure how notifications are handled when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });
}

/**
 * Request notification permissions.
 * @returns true if permissions were granted
 */
export async function requestPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowCriticalAlerts: true, // Request critical alerts for breaking through DND
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[NotificationStorm] Permission not granted");
      return false;
    }

    console.log("[NotificationStorm] Permissions granted");
    return true;
  } catch (error) {
    console.error("[NotificationStorm] Failed to request permissions:", error);
    return false;
  }
}

/**
 * Send a single notification.
 */
async function sendNotification(): Promise<void> {
  const message = NUDGE_MESSAGES[notificationCount % NUDGE_MESSAGES.length];
  notificationCount++;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        sound: "default",
        badge: notificationCount,
        priority: Notifications.AndroidNotificationPriority.MAX,
        ...(Platform.OS === "ios" && {
          interruptionLevel: "critical", // iOS 15+ critical alerts
        }),
      },
      trigger: null, // Immediate delivery
    });

    console.log(`[NotificationStorm] Sent notification #${notificationCount}`);
  } catch (error) {
    console.error("[NotificationStorm] Failed to send notification:", error);
  }
}

/**
 * Start the notification storm.
 * Sends a notification immediately and then every 5 seconds until stopped.
 */
export async function startStorm(): Promise<void> {
  // Check if storm is already active
  if (stormInterval) {
    console.log("[NotificationStorm] Storm already active");
    return;
  }

  // Reset counter
  notificationCount = 0;

  // Mark storm as active
  await AsyncStorage.setItem(STORM_ACTIVE_KEY, "true");

  console.log("[NotificationStorm] Starting notification storm");

  // Send first notification immediately
  await sendNotification();

  // Start interval for subsequent notifications
  stormInterval = setInterval(async () => {
    await sendNotification();

    // Update count in storage
    await AsyncStorage.setItem(STORM_COUNT_KEY, notificationCount.toString());
  }, STORM_INTERVAL_MS);
}

/**
 * Stop the notification storm.
 */
export async function stopStorm(): Promise<void> {
  if (stormInterval) {
    clearInterval(stormInterval);
    stormInterval = null;
  }

  // Clear storm state
  await AsyncStorage.multiRemove([STORM_ACTIVE_KEY, STORM_COUNT_KEY]);

  // Clear badge
  await Notifications.setBadgeCountAsync(0);

  // Dismiss all delivered notifications
  await Notifications.dismissAllNotificationsAsync();

  console.log("[NotificationStorm] Storm stopped");
}

/**
 * Check if a storm is currently active.
 * @returns true if storm is active
 */
export async function isStormActive(): Promise<boolean> {
  try {
    const isActive = await AsyncStorage.getItem(STORM_ACTIVE_KEY);
    return isActive === "true";
  } catch (error) {
    console.error("[NotificationStorm] Failed to check storm status:", error);
    return false;
  }
}

/**
 * Resume storm if it was active before app was killed.
 * Call this when app starts to continue any interrupted storm.
 */
export async function resumeStormIfActive(): Promise<void> {
  const wasActive = await isStormActive();
  if (wasActive && !stormInterval) {
    console.log("[NotificationStorm] Resuming interrupted storm");
    await startStorm();
  }
}

/**
 * Get the current notification count.
 * @returns Number of notifications sent in the current storm
 */
export function getNotificationCount(): number {
  return notificationCount;
}
