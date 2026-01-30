//
//  AppIntents.swift
//  OneSecApp
//
//  NOTE: App Intents cannot open URLs from background (iOS security restriction).
//  The bypass logic must be done in the Shortcut itself using file-based timestamp.
//
//  SCREEN TIME INTENTS:
//  - RecordAppExitIntent: Called when user exits app (via "Is Closed" automation)
//  - AddHourlyScreenTimeIntent: Called hourly to add random screen time allocation
//  - GetRemainingScreenTimeIntent: Returns the remaining screen time in seconds
//

import AppIntents

// MARK: - Open App Intent

/// Minimal App Intent - just for Siri integration, not for the automation
struct OpenOneSecIntent: AppIntent {
    static var title: LocalizedStringResource = "Open One Sec"
    static var description = IntentDescription("Opens the One Sec mindfulness app")
    static var openAppWhenRun: Bool = true
    
    func perform() async throws -> some IntentResult {
        return .result()
    }
}

// MARK: - Screen Time Intents

/// Records when user exits app and calculates session duration
/// Call this from an "App Is Closed" automation
struct RecordAppExitIntent: AppIntent {
    static var title: LocalizedStringResource = "Record App Exit"
    static var description = IntentDescription("Records when you leave app and calculates time spent")
    static var openAppWhenRun: Bool = false
    
    func perform() async throws -> some IntentResult & ReturnsValue<Double> {
        let dbManager = DatabaseManager.shared
        
        if let duration = dbManager.recordAppExit() {
            return .result(value: duration)
        }
        
        // Return 0 if no entry was recorded
        return .result(value: 0)
    }
}

/// Adds random screen time allocation (1-10 minutes)
/// Call this from an hourly automation
struct AddHourlyScreenTimeIntent: AppIntent {
    static var title: LocalizedStringResource = "Add Hourly Screen Time"
    static var description = IntentDescription("Adds a random amount of app screen time (1-10 minutes)")
    static var openAppWhenRun: Bool = false
    
    func perform() async throws -> some IntentResult & ReturnsValue<Double> {
        let dbManager = DatabaseManager.shared
        let addedSeconds = dbManager.addRandomScreenTime()
        
        print("🎲 Added \(Int(addedSeconds)) seconds via Intent")
        return .result(value: addedSeconds)
    }
}

/// Returns the remaining screen time in seconds (can be negative if exceeded)
struct GetRemainingScreenTimeIntent: AppIntent {
    static var title: LocalizedStringResource = "Get Remaining Screen Time"
    static var description = IntentDescription("Gets how much app screen time is left for today")
    static var openAppWhenRun: Bool = false
    
    func perform() async throws -> some IntentResult & ReturnsValue<Double> {
        let dbManager = DatabaseManager.shared
        let remaining = dbManager.getRemainingScreenTime()
        
        print("⏱️ Remaining screen time: \(Int(remaining)) seconds")
        return .result(value: remaining)
    }
}

/// Checks if user has exceeded their allocated screen time
struct HasExceededScreenTimeIntent: AppIntent {
    static var title: LocalizedStringResource = "Has Exceeded Screen Time"
    static var description = IntentDescription("Checks if you've exceeded your app time limit")
    static var openAppWhenRun: Bool = false
    
    func perform() async throws -> some IntentResult & ReturnsValue<Bool> {
        let dbManager = DatabaseManager.shared
        let exceeded = dbManager.hasExceededScreenTime()
        
        print("⚠️ Exceeded screen time: \(exceeded)")
        return .result(value: exceeded)
    }
}

/// Records when user enters app (for manual triggering if needed)
struct RecordAppEntryIntent: AppIntent {
    static var title: LocalizedStringResource = "Record App Entry"
    static var description = IntentDescription("Records when you open app")
    static var openAppWhenRun: Bool = false
    
    func perform() async throws -> some IntentResult {
        let dbManager = DatabaseManager.shared
        dbManager.recordAppEntry()
        
        return .result()
    }
}

// MARK: - App Shortcuts Provider

struct OneSecShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OpenOneSecIntent(),
            phrases: [
                "Open \(.applicationName)",
                "\(.applicationName) breathing"
            ],
            shortTitle: "Open One Sec",
            systemImageName: "leaf.fill"
        )
        
        AppShortcut(
            intent: RecordAppExitIntent(),
            phrases: [
                "Record exit with \(.applicationName)",
                "\(.applicationName) I left app"
            ],
            shortTitle: "Record Exit",
            systemImageName: "rectangle.portrait.and.arrow.right"
        )
        
        AppShortcut(
            intent: AddHourlyScreenTimeIntent(),
            phrases: [
                "Add screen time with \(.applicationName)",
                "\(.applicationName) give me more time"
            ],
            shortTitle: "Add Time",
            systemImageName: "clock.badge.plus"
        )
        
        AppShortcut(
            intent: GetRemainingScreenTimeIntent(),
            phrases: [
                "Check time with \(.applicationName)",
                "\(.applicationName) how much time do I have"
            ],
            shortTitle: "Check Time",
            systemImageName: "clock"
        )
    }
}
