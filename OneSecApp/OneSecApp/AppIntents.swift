//
//  AppIntents.swift
//  OneSecApp
//
//  NOTE: App Intents cannot open URLs from background (iOS security restriction).
//  The bypass logic must be done in the Shortcut itself using file-based timestamp.
//

import AppIntents

// Minimal App Intent - just for Siri integration, not for the automation
struct OpenOneSecIntent: AppIntent {
    static var title: LocalizedStringResource = "Open One Sec"
    static var description = IntentDescription("Opens the One Sec mindfulness app")
    static var openAppWhenRun: Bool = true
    
    func perform() async throws -> some IntentResult {
        return .result()
    }
}

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
    }
}
