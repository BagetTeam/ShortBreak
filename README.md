# ShortBreak

A mindful social media app that reduces mindless scrolling on Instagram by introducing friction and "mindfulness checkpoints."

## Features

### The Interceptor (Instagram Gateway)
When you try to open Instagram, the app intercepts and asks you to declare your intent:
- **"Go to Messages"** - Opens Instagram DMs with a 2-minute timer
- **"I Want to Scroll"** - Shows an intervention screen with a "Second Chance" to choose mindfulness

If you stay on Instagram longer than your allowed time, a **Notification Storm** kicks in to nudge you back.

### The Learning Feed
A reimagined "Reels" experience where the algorithm is controlled by you:
- Enter a topic or upload a syllabus PDF
- AI (Gemini) generates a structured learning path
- Watch short educational videos (YouTube Shorts) in a TikTok-style feed
- Infinite scroll that keeps generating new related content

## Tech Stack

- **Framework**: React Native (Expo)
- **Navigation**: Expo Router
- **Backend**: Convex (Real-time database)
- **AI**: Google Gemini 1.5 Pro
- **Video**: YouTube Data API + react-native-youtube-iframe

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or physical device
- Convex account
- Google Cloud account (for APIs)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your values:
- `EXPO_PUBLIC_CONVEX_URL`: Your Convex deployment URL
- `GEMINI_API_KEY`: Google Gemini API key
- `YOUTUBE_API_KEY`: YouTube Data API key

### 3. Set Up Convex

```bash
# Login to Convex
npx convex login

# Initialize and deploy
npx convex dev
```

This will generate the type-safe API files and start syncing with your Convex backend.

### 4. Configure iOS Shortcut (Required!)

The app requires an iOS Shortcut to intercept Instagram opens:

1. Open **Shortcuts** app on your iPhone
2. Go to **Automation** tab
3. Tap **+** → **Create Personal Automation**
4. Select **App** → **Instagram** → **Is Opened**
5. Add the following actions:
   - **If** → Clipboard → equals → `PASS_OPEN`
     - **Set Clipboard** to empty text
     - **Stop and Output**
   - **Otherwise**
     - **Open App** → ShortBreak
6. Disable "Ask Before Running"

### 5. Run the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios
```

## Project Structure

```
ShortBreak/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigator screens
│   │   └── index.tsx      # Home screen (Gateway)
│   ├── intervention.tsx   # Second Chance screen
│   ├── time-selector.tsx  # Duration selection
│   ├── shortbreak.tsx     # Mindfulness screen
│   ├── course-create.tsx  # Learning feed creation
│   └── learning-feed.tsx  # Video feed screen
├── components/            # Reusable components
│   └── learning-feed.tsx  # Reels-style video component
├── services/              # Business logic services
│   ├── clipboard-handshake.ts
│   ├── background-timer.ts
│   ├── notification-storm.ts
│   ├── deep-linking.ts
│   ├── instagram-launcher.ts
│   ├── app-state.ts
│   └── error-handler.ts
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── mutations.ts       # Write operations
│   ├── queries.ts         # Read operations
│   └── actions/           # Server-side actions
│       ├── gemini.ts      # AI content generation
│       └── youtube.ts     # Video search
└── hooks/                 # React hooks
```

## How It Works

### Clipboard Handshake
To prevent an infinite loop when opening Instagram:
1. App writes `PASS_OPEN` to clipboard
2. iOS Shortcut checks clipboard
3. If token exists → Shortcut exits, user enters Instagram
4. If no token → Shortcut opens ShortBreak

### Background Timer
Uses `expo-task-manager` to track time even when the app is backgrounded:
1. Timer starts when user opens Instagram
2. Timer persists in AsyncStorage
3. When timer expires → Notification Storm begins

### Notification Storm
Sends persistent notifications every 5 seconds until the user returns:
- Uses critical alerts (iOS 15+) to break through DND
- Rotating mindfulness messages
- Stops when user taps "Stop Notifications" in the app

## API Keys

### Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to Convex environment variables

### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable YouTube Data API v3
4. Create credentials (API key)
5. Add to Convex environment variables

## License

MIT
