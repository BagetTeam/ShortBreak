/**
 * Deep Linking Service
 *
 * This service handles deep linking to Instagram and other apps.
 * It provides safe methods that check if the target app is installed
 * before attempting to open it.
 */

import { Linking, Alert, Platform } from "react-native";

// Instagram URL schemes
const INSTAGRAM_SCHEME = "instagram://";
const INSTAGRAM_MESSAGES_URL = "instagram://direct_v2/inbox/";
const INSTAGRAM_FEED_URL = "instagram://";
const INSTAGRAM_APP_STORE_URL = "https://apps.apple.com/app/instagram/id389801252";

/**
 * Check if Instagram is installed on the device.
 * @returns true if Instagram is installed
 */
export async function isInstagramInstalled(): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(INSTAGRAM_SCHEME);
    console.log("[DeepLinking] Instagram installed:", canOpen);
    return canOpen;
  } catch (error) {
    console.error("[DeepLinking] Error checking Instagram:", error);
    return false;
  }
}

/**
 * Open Instagram's Direct Messages inbox.
 * @returns true if successfully opened, false otherwise
 */
export async function openInstagramMessages(): Promise<boolean> {
  try {
    const isInstalled = await isInstagramInstalled();

    if (!isInstalled) {
      showInstagramNotInstalledAlert();
      return false;
    }

    console.log("[DeepLinking] Opening Instagram Messages");
    await Linking.openURL(INSTAGRAM_MESSAGES_URL);
    return true;
  } catch (error) {
    console.error("[DeepLinking] Failed to open Instagram Messages:", error);
    handleOpenError(error);
    return false;
  }
}

/**
 * Open Instagram's main feed.
 * @returns true if successfully opened, false otherwise
 */
export async function openInstagramFeed(): Promise<boolean> {
  try {
    const isInstalled = await isInstagramInstalled();

    if (!isInstalled) {
      showInstagramNotInstalledAlert();
      return false;
    }

    console.log("[DeepLinking] Opening Instagram Feed");
    await Linking.openURL(INSTAGRAM_FEED_URL);
    return true;
  } catch (error) {
    console.error("[DeepLinking] Failed to open Instagram Feed:", error);
    handleOpenError(error);
    return false;
  }
}

/**
 * Open a custom Instagram URL.
 * @param url The Instagram URL to open
 * @returns true if successfully opened, false otherwise
 */
export async function openInstagramURL(url: string): Promise<boolean> {
  try {
    const isInstalled = await isInstagramInstalled();

    if (!isInstalled) {
      showInstagramNotInstalledAlert();
      return false;
    }

    console.log("[DeepLinking] Opening Instagram URL:", url);
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error("[DeepLinking] Failed to open Instagram URL:", error);
    handleOpenError(error);
    return false;
  }
}

/**
 * Open a generic URL, with safety checks.
 * @param url The URL to open
 * @returns true if successfully opened, false otherwise
 */
export async function openURL(url: string): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      console.log("[DeepLinking] Cannot open URL:", url);
      Alert.alert("Cannot Open", "Unable to open this link on your device.");
      return false;
    }

    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error("[DeepLinking] Failed to open URL:", error);
    handleOpenError(error);
    return false;
  }
}

/**
 * Open the App Store page for Instagram.
 */
export async function openInstagramAppStore(): Promise<void> {
  try {
    if (Platform.OS === "ios") {
      await Linking.openURL(INSTAGRAM_APP_STORE_URL);
    }
  } catch (error) {
    console.error("[DeepLinking] Failed to open App Store:", error);
  }
}

/**
 * Show an alert when Instagram is not installed.
 */
function showInstagramNotInstalledAlert(): void {
  Alert.alert(
    "Instagram Not Found",
    "Instagram doesn't seem to be installed on your device. Would you like to install it?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Install",
        onPress: () => openInstagramAppStore(),
      },
    ]
  );
}

/**
 * Handle errors when opening URLs.
 */
function handleOpenError(error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  Alert.alert("Error", `Failed to open the app: ${errorMessage}`);
}

/**
 * Get the initial URL that opened the app (if any).
 * Useful for handling deep links into ShortBreak.
 * @returns The initial URL or null
 */
export async function getInitialURL(): Promise<string | null> {
  try {
    const url = await Linking.getInitialURL();
    console.log("[DeepLinking] Initial URL:", url);
    return url;
  } catch (error) {
    console.error("[DeepLinking] Failed to get initial URL:", error);
    return null;
  }
}

/**
 * Add a listener for incoming deep links.
 * @param callback Function to call when a deep link is received
 * @returns Cleanup function to remove the listener
 */
export function addDeepLinkListener(
  callback: (url: string) => void
): () => void {
  const subscription = Linking.addEventListener("url", (event) => {
    console.log("[DeepLinking] Received deep link:", event.url);
    callback(event.url);
  });

  return () => subscription.remove();
}
