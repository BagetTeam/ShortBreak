/**
 * Services Index
 *
 * Central export point for all services.
 */

// Clipboard handshake
export {
  setPassOpen,
  checkPassOpen,
  clearPassOpen,
  getClipboardContent,
} from "./clipboard-handshake";

// Background timer
export {
  initBackgroundTimer,
  startTimer,
  stopTimer,
  checkTimerExpired,
  getRemainingTime,
  isTimerActive,
  setExpireCallback,
} from "./background-timer";

// Notification storm
export {
  configureNotifications,
  requestPermissions,
  startStorm,
  stopStorm,
  isStormActive,
  resumeStormIfActive,
  getNotificationCount,
} from "./notification-storm";

// Deep linking
export {
  isInstagramInstalled,
  openInstagramMessages,
  openInstagramFeed,
  openInstagramURL,
  openURL,
  openInstagramAppStore,
  getInitialURL,
  addDeepLinkListener,
} from "./deep-linking";

// Instagram launcher (main orchestration)
export {
  launchMessages,
  launchFeed,
  stopSession,
  getSessionInfo,
  getSessionRemainingTime,
  hasActiveSession,
  isNudgeActive,
} from "./instagram-launcher";

// App state management
export {
  initAppStateManagement,
  setOnAppForeground,
  setOnAppBackground,
  getCurrentAppState,
  isAppInForeground,
  setSessionType,
  getSessionType,
  getLastActiveTime,
  clearSessionState,
  cleanupAppStateManagement,
} from "./app-state";

// Error handling
export {
  ErrorType,
  logError,
  showErrorAlert,
  handleError,
  classifyError,
  withErrorHandling,
  withRetry,
} from "./error-handler";
