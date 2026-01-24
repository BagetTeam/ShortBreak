# AGENTS.md - Project Context & Directives

## 1. Project Mission
**Name:** Mindful Scroll (Personal Project)
**Goal:** Reduce mindless scrolling on Instagram by introducing friction and "mindfulness checkpoints" via an iOS Shortcut interception method.
**Core Mechanism:** The app does not "block" Instagram via MDM. Instead, it acts as a "Gateway." When the user opens Instagram, an iOS Shortcut redirects them to this app. The user chooses their intent ("Messages" or "Scroll"). The app then "authorizes" the specific session via a Clipboard handshake and creates a background "Nudge" timer to ensure they don't stay too long.

## 2. Tech Stack (Strict)
*   **Framework:** React Native CLI (iOS only).
*   **Navigation:** `@react-navigation/native`, `@react-navigation/stack`.
*   **Notifications:** `@notifee/react-native` (Used for "Notification Storms").
*   **Background Tasks:** `react-native-background-timer` (Critical for keeping the "Nudge" alive after app switch).
*   **Clipboard:** `@react-native-clipboard/clipboard` (Used for the "Handshake" logic).
*   **Storage:** `@react-native-async-storage/async-storage`.
*   **Linking:** Standard React Native `Linking` API.

## 3. Architecture & Logic Flow

### The "Clipboard Handshake" (Crucial)
To prevent the "Infinite Loop" where opening Instagram triggers the Shortcut which opens the App which opens Instagram...
1.  **User opens Instagram:** iOS Shortcut triggers.
2.  **Shortcut Check:** Checks Clipboard for string `PASS_OPEN`.
3.  **If `PASS_OPEN` exists:** Shortcut clears clipboard and exits (User enters Insta).
4.  **If `PASS_OPEN` is missing:** Shortcut redirects to **Mindful Scroll App**.

### The App Logic
1.  **User Interface:** Displays two buttons: "Messages Only" and "I Want to Scroll".
2.  **Action:** When a button is pressed:
    *   Write `PASS_OPEN` to Clipboard.
    *   Start `BackgroundTimer` (e.g., 90 seconds).
    *   Deep Link to Instagram (`instagram://` or `instagram://direct_v2/inbox/`).
3.  **The Nudge (Background):**
    *   When `BackgroundTimer` expires, trigger `notifee` local notification.
    *   Loop notifications every 5 seconds until user returns to App to stop them.

## 4. Implementation Directives for Agents

### A. Navigation & Deep Linking
*   Do not use complex router setups. Keep it simple.
*   Always handle `Linking.canOpenURL` checks to prevent crashes if Insta isn't installed.
*   **Messages Deep Link:** Use `instagram://direct_v2/inbox/`
*   **Feed Deep Link:** Use `instagram://`

### B. Background Timer & Notifee
*   **Constraint:** iOS suspends apps quickly. You MUST use `react-native-background-timer` for the countdown, or the timer will pause when the user switches to Instagram.
*   **Notifee Setup:** ensure `ios.critical: true` and `ios.sound: 'default'` are set to break through user focus.
*   **Pattern:**
    ```javascript
    import BackgroundTimer from 'react-native-background-timer';
    
    // Start
    const startNudge = () => {
       BackgroundTimer.stopBackgroundTimer(); // Clear existing
       BackgroundTimer.startBackgroundTimer(); 
       
       // Set timeout logic...
    }
    
    // Stop (Must be called when user returns to app)
    const stopNudge = () => {
       BackgroundTimer.stopBackgroundTimer();
    }
    ```

### C. Permissions
*   Agent must generate code that requests **Notification Permissions** on app mount (`notifee.requestPermission()`).
*   No other special permissions (like Screen Time/Family Controls) are required for this MVP.

## 5. "Do Not Do" (Constraints)
1.  **NO Screen Time API:** Do not suggest `FamilyControls` or `ManagedSettings` unless explicitly asked. We are bypassing the Apple Entitlement wait time.
2.  **NO Screen Recording:** Do not attempt to use `ReplayKit` to detect the "Reels" tab. It is technically impossible to detect UI elements inside another app on iOS.
3.  **NO Android Code:** This is an iOS-exclusive logic flow.

## 6. Required "Manual Instruction" Output
Since the AI cannot program the iOS Shortcut app, **ANY** code generation response must include a comment or footer reminding the user to set up the iOS Shortcut:

> **REMINDER:** You must configure the iOS Shortcut manually:
> 1. Open Shortcuts > Automation > App (Instagram) > Is Opened.
> 2. Logic: If Clipboard == "PASS_OPEN" → Clear Clipboard & Stop. Else → Open [This App].
