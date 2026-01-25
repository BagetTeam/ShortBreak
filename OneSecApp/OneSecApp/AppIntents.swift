//
//  AppIntents.swift
//  OneSecApp
//
//  NOTE: App Intents cannot open URLs from background (iOS security restriction).
//  The bypass logic must be done in the Shortcut itself using file-based timestamp.
//
//  SCREEN TIME INTENTS:
//  - RecordInstagramExitIntent: Called when user exits Instagram (via "Is Closed" automation)
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

/// Records when user exits Instagram and calculates session duration
/// Call this from an "Instagram Is Closed" automation
struct RecordInstagramExitIntent: AppIntent {
    static var title: LocalizedStringResource = "Record Instagram Exit"
    static var description = IntentDescription("Records when you leave Instagram and calculates time spent")
    static var openAppWhenRun: Bool = false
    
    func perform() async throws -> some IntentResult & ReturnsValue<Double> {
        let dbManager = DatabaseManager.shared
        
        if let duration = dbManager.recordInstagramExit() {
            print("⏱️ Instagram session ended via Intent. Duration: \(Int(duration)) seconds")
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
    static var description = IntentDescription("Adds a random amount of Instagram screen time (1-10 minutes)")
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
    static var description = IntentDescription("Gets how much Instagram screen time is left for today")
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
    static var description = IntentDescription("Checks if you've exceeded your Instagram time limit")
    static var openAppWhenRun: Bool = false
    
    func perform() async throws -> some IntentResult & ReturnsValue<Bool> {
        let dbManager = DatabaseManager.shared
        let exceeded = dbManager.hasExceededScreenTime()
        
        print("⚠️ Exceeded screen time: \(exceeded)")
        return .result(value: exceeded)
    }
}

/// Records when user enters Instagram (for manual triggering if needed)
struct RecordInstagramEntryIntent: AppIntent {
    static var title: LocalizedStringResource = "Record Instagram Entry"
    static var description = IntentDescription("Records when you open Instagram")
    static var openAppWhenRun: Bool = false
    
    func perform() async throws -> some IntentResult {
        let dbManager = DatabaseManager.shared
        dbManager.recordInstagramEntry()
        
        print("📱 Instagram entry recorded via Intent")
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
            intent: RecordInstagramExitIntent(),
            phrases: [
                "Record exit with \(.applicationName)",
                "\(.applicationName) I left Instagram"
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
