/**
 * Error Handler Service
 *
 * Centralized error handling for the app.
 * Provides consistent error messaging and logging.
 */

import { Alert } from "react-native";

// Error types
export enum ErrorType {
  NETWORK = "NETWORK",
  API = "API",
  INSTAGRAM_NOT_INSTALLED = "INSTAGRAM_NOT_INSTALLED",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  TIMER_ERROR = "TIMER_ERROR",
  CONVEX_ERROR = "CONVEX_ERROR",
  GEMINI_ERROR = "GEMINI_ERROR",
  YOUTUBE_ERROR = "YOUTUBE_ERROR",
  UNKNOWN = "UNKNOWN",
}

// Error info interface
interface ErrorInfo {
  type: ErrorType;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
}

// User-friendly error messages
const ERROR_MESSAGES: Record<ErrorType, { title: string; message: string }> = {
  [ErrorType.NETWORK]: {
    title: "No Connection",
    message: "Please check your internet connection and try again.",
  },
  [ErrorType.API]: {
    title: "Service Error",
    message: "Something went wrong with our servers. Please try again later.",
  },
  [ErrorType.INSTAGRAM_NOT_INSTALLED]: {
    title: "Instagram Not Found",
    message: "Instagram doesn't seem to be installed on your device.",
  },
  [ErrorType.PERMISSION_DENIED]: {
    title: "Permission Required",
    message: "Please grant the required permissions to use this feature.",
  },
  [ErrorType.TIMER_ERROR]: {
    title: "Timer Error",
    message: "There was an issue with the timer. Please try again.",
  },
  [ErrorType.CONVEX_ERROR]: {
    title: "Database Error",
    message: "Unable to save or retrieve your data. Please try again.",
  },
  [ErrorType.GEMINI_ERROR]: {
    title: "AI Error",
    message: "Unable to generate content. Please try a different prompt.",
  },
  [ErrorType.YOUTUBE_ERROR]: {
    title: "Video Search Error",
    message: "Unable to find videos. Please try a different topic.",
  },
  [ErrorType.UNKNOWN]: {
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again.",
  },
};

/**
 * Log an error to the console (and potentially to a logging service).
 */
export function logError(error: ErrorInfo): void {
  console.error(`[${error.type}] ${error.message}`, {
    originalError: error.originalError,
    context: error.context,
  });

  // TODO: Send to error logging service (e.g., Sentry, LogRocket)
}

/**
 * Show an alert to the user for an error.
 */
export function showErrorAlert(
  type: ErrorType,
  options?: {
    onRetry?: () => void;
    onDismiss?: () => void;
    customMessage?: string;
  }
): void {
  const errorInfo = ERROR_MESSAGES[type];

  const buttons: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }> = [];

  if (options?.onDismiss) {
    buttons.push({
      text: "Dismiss",
      style: "cancel",
      onPress: options.onDismiss,
    });
  }

  if (options?.onRetry) {
    buttons.push({
      text: "Try Again",
      onPress: options.onRetry,
    });
  }

  if (buttons.length === 0) {
    buttons.push({ text: "OK" });
  }

  Alert.alert(
    errorInfo.title,
    options?.customMessage || errorInfo.message,
    buttons
  );
}

/**
 * Handle an error with logging and optional alert.
 */
export function handleError(
  error: Error | unknown,
  type: ErrorType = ErrorType.UNKNOWN,
  options?: {
    showAlert?: boolean;
    context?: Record<string, any>;
    onRetry?: () => void;
  }
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  const errorInfo: ErrorInfo = {
    type,
    message: errorObj.message,
    originalError: errorObj,
    context: options?.context,
  };

  logError(errorInfo);

  if (options?.showAlert !== false) {
    showErrorAlert(type, {
      onRetry: options?.onRetry,
    });
  }
}

/**
 * Classify an error based on its properties.
 */
export function classifyError(error: Error | unknown): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  // Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout")
  ) {
    return ErrorType.NETWORK;
  }

  // API errors
  if (
    errorMessage.includes("api") ||
    errorMessage.includes("status") ||
    errorMessage.includes("response")
  ) {
    return ErrorType.API;
  }

  // Gemini errors
  if (
    errorMessage.includes("gemini") ||
    errorMessage.includes("generate") ||
    errorMessage.includes("outline")
  ) {
    return ErrorType.GEMINI_ERROR;
  }

  // YouTube errors
  if (
    errorMessage.includes("youtube") ||
    errorMessage.includes("video")
  ) {
    return ErrorType.YOUTUBE_ERROR;
  }

  // Convex errors
  if (
    errorMessage.includes("convex") ||
    errorMessage.includes("database") ||
    errorMessage.includes("mutation") ||
    errorMessage.includes("query")
  ) {
    return ErrorType.CONVEX_ERROR;
  }

  // Permission errors
  if (
    errorMessage.includes("permission") ||
    errorMessage.includes("denied") ||
    errorMessage.includes("access")
  ) {
    return ErrorType.PERMISSION_DENIED;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Wrap an async function with error handling.
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    type?: ErrorType;
    showAlert?: boolean;
    context?: Record<string, any>;
  }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const type = options?.type || classifyError(error);
      handleError(error, type, {
        showAlert: options?.showAlert,
        context: options?.context,
      });
      throw error;
    }
  }) as T;
}

/**
 * Create a retry wrapper for a function.
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  maxRetries: number = 3,
  delayMs: number = 1000
): T {
  return (async (...args: Parameters<T>) => {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message);

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }) as T;
}
