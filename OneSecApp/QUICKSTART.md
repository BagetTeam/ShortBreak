# Quick Start Guide - Running One Sec in Xcode

## Step-by-Step Instructions

### 1. Open the Project
1. **Open Xcode** (make sure you have Xcode installed from the App Store)
2. **File** → **Open** (or press `Cmd + O`)
3. Navigate to: `/Users/bryanlin/ShortBreak/OneSecApp/`
4. Select **OneSecApp.xcodeproj** and click **Open**

### 2. Configure Signing & Capabilities
1. In the **Project Navigator** (left sidebar), click on **OneSecApp** (the blue project icon at the top)
2. Select the **OneSecApp** target (under "TARGETS")
3. Click on the **Signing & Capabilities** tab
4. Check **"Automatically manage signing"**
5. Select your **Team** from the dropdown (you need an Apple Developer account, even a free one)
   - If you don't have one: Click "Add Account..." and sign in with your Apple ID

### 3. Choose a Simulator or Device
1. At the top of Xcode, next to the play/stop buttons, you'll see a device selector
2. **For Simulator**: 
   - Click the device selector
   - Choose any iPhone simulator (e.g., "iPhone 15 Pro" or "iPhone 15")
   - Make sure it's running iOS 17.0 or later
3. **For Physical Device**:
   - Connect your iPhone via USB
   - Trust the computer on your iPhone if prompted
   - Select your device from the device selector
   - You may need to enable Developer Mode on your iPhone (Settings → Privacy & Security → Developer Mode)

### 4. Build and Run
1. Click the **Play button** (▶️) in the top-left, or press `Cmd + R`
2. Xcode will:
   - Build the project (compile all Swift files)
   - Install the app on your simulator/device
   - Launch the app automatically

### 5. What You Should See
- The app will open showing the **mindfulness check-in screen**
- You'll see an animated breathing circle
- After 3 breaths, you'll see the reflection question: "Why do you want to open this app?"
- You can tap "Continue" or "Take a Break Instead"

## Troubleshooting

### "No signing certificate found"
- Make sure you've selected a Team in Signing & Capabilities
- You may need to create a free Apple Developer account

### "Could not launch app"
- Make sure your simulator/device is running iOS 17.0 or later
- Try cleaning the build: **Product** → **Clean Build Folder** (`Cmd + Shift + K`), then rebuild

### "Build failed" errors
- Check that all Swift files are present in the project
- Try: **Product** → **Clean Build Folder**, then rebuild

### App doesn't appear on device
- Make sure your device is unlocked
- Check that Developer Mode is enabled (for physical devices)
- Trust the developer certificate on your device (Settings → General → VPN & Device Management)

## Testing the App

### Test the Mindfulness Screen
- When you run the app, it should automatically show the breathing exercise
- Watch the circle animate through 3 breathing cycles
- After the breathing, you'll see the reflection question

### Test Deep Linking (Optional)
1. In Xcode, go to **Product** → **Scheme** → **Edit Scheme**
2. Select **Run** → **Arguments**
3. Under "Arguments Passed On Launch", add:
   ```
   -UIApplicationOpenURLOptionsSourceApplicationKey onesec://?target=instagram://
   ```
4. Or test via Terminal:
   ```bash
   xcrun simctl openurl booted "onesec://?target=instagram://"
   ```

## Next Steps

After the app runs successfully:
1. Set up the iOS Shortcut automation (see README.md)
2. Customize the breathing duration or UI colors if desired
3. Test the full flow with Instagram or another target app
