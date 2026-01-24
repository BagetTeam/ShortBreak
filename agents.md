# AGENTS.md - Project Context & Directives

## 1. Project Mission
**Name:** ShortBreak (Personal Project)
**Goal:** Reduce mindless scrolling on Instagram by introducing friction, "mindfulness checkpoints," and a "double-confirmation" mechanism via an iOS Shortcut interception method.
**Dual Functionality:**
1.  **The Interceptor:** The app acts as a "Gateway." When the user opens Instagram, an iOS Shortcut redirects them to this app. The app forces the user to declare their intent. If they choose to scroll, they face a "Second Chance" intervention screen to reconsider, effectively adding friction to the dopamine loop.
2.  **The Learning Feed:** A reimagined "Reels" experience where the "algorithm" is explicitly controlled by the user via Natural Language Prompts or PDF Class Outlines. The feed presents short-form educational content (YouTube Shorts) structured like a curriculum, powered by Gemini and Convex DB.
   
## 2. Tech Stack (Strict)
*   **Framework:** React Native CLI (iOS only).
*   **Navigation:** `@react-navigation/native`, `@react-navigation/stack`.
*   **Notifications:** `@notifee/react-native` (Used for "Notification Storms").
*   **Background Tasks:** `react-native-background-timer` (Critical for keeping the "Nudge" alive after app switch).
*   **Clipboard:** `@react-native-clipboard/clipboard` (Used for the "Handshake" logic).
*   **Storage:** `@react-native-async-storage/async-storage`.
*   **Linking:** Standard React Native `Linking` API.
*   **Video:** `react-native-youtube-iframe` (For rendering the "Reels-style" feed).
*   **Files:** `react-native-document-picker` (For PDF uploads).
  
### Backend & AI (Convex Ecosystem)
*   **Database & Sync:** `convex` (React Native SDK).
*   **AI Logic:** Google Gemini 3.0 Flash (called via **Convex Actions**).
*   **Video Source:** YouTube Data API (called via **Convex Actions**).

## 3. Architecture & Logic Flow

### The "Clipboard Handshake" (System Requirement)
To prevent the "Infinite Loop" (Instagram -> Shortcut -> App -> Instagram...):
1.  **User opens Instagram:** iOS Shortcut triggers.
2.  **Shortcut Check:** Checks Clipboard for string `PASS_OPEN`.
3.  **If `PASS_OPEN` exists:** Shortcut clears clipboard and exits (User enters Insta).
4.  **If `PASS_OPEN` is missing:** Shortcut redirects to **ShortBreak Scroll App**.

### The User Flow (App Logic)

#### Path A: "Go to Messages"
1.  **User Input:** Clicks "Go to Messages" on the home screen.
2.  **Action:**
    *   App writes `PASS_OPEN` to Clipboard.
    *   App starts `BackgroundTimer` for **2 Minutes** (Hardcoded).
    *   App Deep Links to `instagram://direct_v2/inbox/`.
3.  **Outcome:** If user is still in app after 2 mins -> **Notification Storm** starts.

#### Path B: "I Want to Scroll" (The Intervention)
1.  **User Input:** Clicks "I Want to Scroll".
2.  **Action:** Navigate to a **"Second Chance" Screen** (Do NOT open Insta yet).
3.  **The Second Chance UI:**
    *   **Option 1: "Go on ShortBreak"**: Redirects user to a local mindfulness view or exits the app (Crisis averted).
    *   **Option 2: "Continue to Reels"**: Opens a **Time Selector Modal**.
4.  **Time Selector:**
    *   User inputs/selects duration (e.g., 5 min, 10 min, 15 min).
    *   **Confirm Action:**
        *   App writes `PASS_OPEN` to Clipboard.
        *   App starts `BackgroundTimer` for **[User Selected Duration]**.
        *   App Deep Links to `instagram://` (Main Feed).
5.  **Outcome:** If user is still in app after [Selected Duration] -> **Notification Storm** starts.

## 4. Implementation Directives for Agents

### A. Navigation & State
*   Use a Stack Navigator.
*   **Home Screen:** "Messages" vs "Scroll" buttons.
*   **Intervention Screen:** "ShortBreak" vs "Continue" buttons.
*   **Time Selector:** Can be a Modal or a clean UI on the Intervention Screen.
*   **ShortBreak:** Simple view with a "Good job choosing mindfulness" message.

### B. Background Timer & Notifee
*   **Constraint:** iOS suspends apps quickly. You MUST use `react-native-background-timer`.
*   **Logic:**
    ```javascript
    // Pseudocode for starting the timer
    const handleLaunchInstagram = (minutesAllowed) => {
       BackgroundTimer.stopBackgroundTimer(); // Reset any existing
       Clipboard.setString('PASS_OPEN');
       
       const millis = minutesAllowed * 60 * 1000;
       
       BackgroundTimer.setTimeout(() => {
          startNotificationStorm();
       }, millis);
       
       Linking.openURL(targetUrl);
    }
    ```
*   **Notification Storm:** Use `notifee` with `ios.critical: true`. Loop a local notification every 5 seconds until the user re-opens the Mindful App to click a "Stop" button.

### C. Permissions
*   Agent must generate code that requests **Notification Permissions** immediately on app mount.


## 5. Architecture: The Learning Feed (The "Algorithm")

### Core Concept
Instead of a black-box recommendation system, the feed is generated effectively JIT (Just-In-Time) based on a **Learning Goal**.

### Data Flow (The "Gemini Loop")
1.  **Input:** User provides text prompt (e.g., "History of Rome") OR uploads a PDF (Syllabus).
2.  **Processing (Convex Action):**
    *   Input sent to Gemini 3.0 Flash.
    *   **Gemini Task:** Generate a hierarchical "Course Outline" of search terms + specific sub-topics based on the input.
3.  **Content Fetch (Convex Action):**
    *   System takes Gemini's sub-topics and queries **YouTube Data API** (filtering for `videoDuration: 'short'`).
    *   Results are mapped to the Outline.
4.  **Display (React Native):**
    *   UI renders a full-screen vertical swipe list (FlatList with paging).
    *   Videos are played sequentially.
5.  **Infinite Context (Pagination):**
    *   **Trigger:** When user swipes to the 3rd-to-last video.
    *   **Action:** Call Gemini again with the *previous* context and ask for "The next logical module in this course."
    *   Append new videos to the feed.

## 6. Data Schema (Convex)

### `users`
*   `_id`: String
*   `name`: String

### `courses` (The History)
*   `userId`: Id("users")
*   `title`: String (e.g., "Intro to Physics")
*   `originalPrompt`: String (or file reference)
*   `lastPosition`: Number (Index of last watched video)
*   `createdAt`: Int64

### `feedItems` (The Content)
*   `courseId`: Id("courses")
*   `videoId`: String (YouTube ID)
*   `topicTitle`: String (Generated by Gemini, e.g., "Newton's First Law")
*   `order`: Number
*   `metaData`: Object (Channel name, duration, etc.)

## 7. Implementation Directives for Agents

### A. The "Reels" UI Component
*   Use `react-native-youtube-iframe`.
*   **Performance:** Implement a custom `FlatList`. Only the **currently visible** video should have `play={true}`. The previous and next videos should be pre-loaded but paused (`play={false}`).
*   **Overlay:** Overlay the "Topic Title" and "Course Progress" on top of the video (Gradient bottom) to mimic the TikTok UI but for learning.

### B. Gemini Prompt Engineering (Convex)
*   When generating the outline, instruct Gemini to be **granular**.
*   *Prompt Strategy:* "You are a curriculum designer. Break this topic into 5 engaging short-form video concepts. For each concept, provide a specific YouTube search query."
*   **PDF Handling:** If PDF is provided, pass the file token to Gemini 3.0 Flash (it handles documents natively) to extract key themes.

### C. Permissions & Files
*   Handle `react-native-document-picker` results carefully.
*   Upload the file to `Convex Storage` first, then pass the storage ID to the Action.

## 8. "Do Not Do" (Constraints)
1.  **NO Screen Time API:** Do not suggest `FamilyControls`.
2.  **NO Screen Recording:** Do not attempt to detect specific tabs (Reels vs Home) once inside Instagram. The "Reels" intent is assumed based on the user's initial choice in the app.
3.  **NO Android Code:** iOS only.

## 9. Required "Manual Instruction" Output
Any code generation must include this footer:

> **REMINDER:** You must configure the iOS Shortcut manually:
> 1. Open Shortcuts > Automation > App (Instagram) > Is Opened.
> 2. Logic: If Clipboard == "PASS_OPEN" → Clear Clipboard & Stop. Else → Open [This App].
