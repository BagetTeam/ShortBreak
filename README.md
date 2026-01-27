# ShortBreak

A duel-platform to solve the *reel* cause of your scrolling addiction. It is both an iOS mobile app that allocates screen time for you, giving you a sense of responsibility over your time spent scrolling, and a web application for micro learning through scrolling. 

## Project Structure

### `/web` - Web Application

Next.js app that generates personalized learning experiences from YouTube Shorts using AI-generated outlines.

**Stack:** Next.js, TypeScript, Tailwind CSS, Convex, Gemini API, YouTube API

**Key Components:**
- `shorts-feed.tsx` - Vertical scrolling video feed
- `learning-workspace.tsx` - Main workspace for prompts and videos
- `history-sidebar.tsx` - Prompt history sidebar
- `mobile-navbar.tsx` - Mobile bottom navigation

**Setup:**
1. `cd web && npm install`
2. Create `.env.local` with `NEXT_PUBLIC_CONVEX_URL`
3. Configure Convex environment variables (`GEMINI_API_KEY`, `YOUTUBE_API_KEY`)
4. `npm run dev`

See `web/README.md` for details.

### `/OneSecApp` - iOS Application

Native SwiftUI iOS app for mindfulness check-ins and Instagram session tracking.

**Stack:** SwiftUI, Swift 5.0, iOS 17.0+, Core Data

**Key Views:**
- `ContentView.swift` - Root view controller
- `MindfulnessCheckInView.swift` - Breathing exercise UI
- `SessionSummaryView.swift` - Session statistics
- `AppState.swift` - Global state management

**Setup:**
1. Open `OneSecApp.xcodeproj` in Xcode
2. Configure signing with your development team
3. Install iOS Shortcuts (Entry and Exit) from the app
4. Create iOS Automations in Shortcuts app

See `OneSecApp/README.md` for details.

## Quick Start

**Web:** `cd web && npm install && npm run dev`

**iOS:** Open `OneSecApp/OneSecApp.xcodeproj` in Xcode and build
