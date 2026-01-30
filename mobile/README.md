# One Sec - Swift iOS App

A native Swift iOS app that replicates the "One Sec" mindfulness experience. This app intercepts social media app launches and provides a brief breathing exercise and reflection before allowing access.

## Features

- **Mindfulness Check-In**: Animated breathing exercise (3 breaths) before accessing apps
- **Reflection Prompt**: Asks "Why do you want to open this app?" to encourage intentional usage
- **Clipboard Handshake**: Uses clipboard mechanism to prevent infinite redirect loops
- **Deep Linking Support**: Can be triggered via iOS Shortcuts automation
- **Clean UI**: Minimal, calming interface with gradient backgrounds

## How It Works

1. **iOS Shortcut Setup**: Configure a Shortcut automation that triggers when Instagram (or other app) is opened
2. **Clipboard Check**: The shortcut checks if `PASS_OPEN` exists in clipboard
   - If yes: Clears clipboard and allows direct access
   - If no: Redirects to One Sec app
3. **Mindfulness Screen**: User sees animated breathing exercise (3 breaths)
4. **Reflection**: After breathing, user is asked why they want to open the app
5. **Decision**: User can either continue to the app or take a break instead

## Setup Instructions

### 1. Build the App

1. Open `OneSecApp.xcodeproj` in Xcode
2. Select your development team in Signing & Capabilities
3. Build and run on your device or simulator

### 2. Configure iOS Shortcut

**IMPORTANT:** You must configure the iOS Shortcut manually:

1. Open **Shortcuts** app on your iPhone
2. Go to **Automation** tab
3. Tap **+** to create new automation
4. Select **App** → Choose **Instagram** (or your target app)
5. Select **Is Opened**
6. Add the following logic:
   - **Get Clipboard**
   - **If** clipboard text **equals** `PASS_OPEN`:
     - **Set Clipboard** to empty string
     - **Stop This Shortcut**
   - **Otherwise**:
     - **Open App** → Select **One Sec**

### 3. Deep Linking (Optional)

The app supports deep linking via `onesec://` URL scheme. You can trigger it with:
```
onesec://?target=instagram://
```

## App Structure

- `OneSecApp.swift`: Main app entry point
- `ContentView.swift`: Root view that switches between home and mindfulness screen
- `AppState.swift`: Manages app state and clipboard handshake logic
- `MindfulnessCheckInView.swift`: The core breathing exercise and reflection UI

## Customization

### Change Breathing Duration

Edit `MindfulnessCheckInView.swift`:
- Modify `timeRemaining` initial value (default: 3 breaths)
- Adjust timing in `breathingCycle()` method

### Change Target App

Edit `AppState.swift`:
- Modify the default in `handleContinue()` method
- Or pass target via deep link: `onesec://?target=YOUR_APP_URL`

### Customize UI Colors

Edit `MindfulnessCheckInView.swift`:
- Modify gradient colors in the `LinearGradient`
- Change button colors and styles

## Technical Details

- **Framework**: SwiftUI
- **Minimum iOS**: 17.0
- **Language**: Swift 5.0
- **Architecture**: MVVM pattern with ObservableObject state management

## Notes

- The app uses the clipboard as a handshake mechanism to prevent infinite loops
- Background execution is limited on iOS, so the app relies on Shortcuts automation
- The breathing animation uses SwiftUI animations with easing functions
