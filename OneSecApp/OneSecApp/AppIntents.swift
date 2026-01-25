//
//  AppIntents.swift
//  OneSecApp
//
//  Exposes app actions to iOS Shortcuts via App Intents
//

import AppIntents
import SwiftUI

// MARK: - Check and Redirect Intent
/// This intent is what the Shortcut automation will call
struct CheckAndRedirectIntent: AppIntent {
    static var title: LocalizedStringResource = "Mindful Check-In"
    static var description = IntentDescription("Pauses before opening an app to encourage mindful usage")
    
    static var openAppWhenRun: Bool = true
    
    @Parameter(title: "Target App URL", default: "instagram://")
    var targetAppURL: String
    
    func perform() async throws -> some IntentResult {
        // Check clipboard for pass key
        let clipboard = UIPasteboard.general.string ?? ""
        
        if clipboard == "PASS_OPEN" {
            // Clear clipboard and open target app directly
            await MainActor.run {
                UIPasteboard.general.string = ""
                if let url = URL(string: targetAppURL) {
                    UIApplication.shared.open(url)
                }
            }
            return .result()
        } else {
            // Open our app with the target parameter - the app will show mindfulness screen
            await MainActor.run {
                if let url = URL(string: "onesec://?target=\(targetAppURL)") {
                    UIApplication.shared.open(url)
                }
            }
            return .result()
        }
    }
}

// MARK: - App Shortcuts Provider
/// Makes shortcuts automatically available in the Shortcuts app
struct OneSecShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: CheckAndRedirectIntent(),
            phrases: [
                "Check in with \(.applicationName)",
                "Mindful check-in with \(.applicationName)",
                "Open \(.applicationName) check-in"
            ],
            shortTitle: "Mindful Check-In",
            systemImageName: "leaf.fill"
        )
    }
}

// MARK: - Simple Intent for manual trigger
struct OpenMindfulCheckInIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Mindful Check-In"
    static var description = IntentDescription("Opens the One Sec app to do a mindful breathing exercise")
    
    static var openAppWhenRun: Bool = true
    
    func perform() async throws -> some IntentResult {
        return .result()
    }
}
