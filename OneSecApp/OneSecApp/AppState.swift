//
//  AppState.swift
//  OneSecApp
//
//  Manages app state using clipboard-based bypass
//  Manages app state using clipboard-based bypass
//
//  ARCHITECTURE:
//  1. User opens Instagram → Automation triggers → Shortcut runs
//  2. Shortcut checks clipboard for "BYPASS_CONFIRM"
//  3. If "BYPASS_CONFIRM" found → Clear clipboard → Stop Shortcut → Instagram opens
//  4. If not found → Open OneSecApp
//  5. User sees choice: "Continue on Insta" or "Bring me to ShortBreak"
//  6. If Continue → App writes "BYPASS_CONFIRM" to clipboard → Opens Instagram
//  7. If ShortBreak → Opens web app instead
//
//  SCREEN TIME TRACKING:
//  - When user enters Instagram, we record the entry time (Unix timestamp)
//  - When user exits (detected via separate automation), we calculate duration
//  - Duration is subtracted from allocated daily screen time
//
//  SCREEN TIME TRACKING:
//  - When user enters Instagram, we record the entry time (Unix timestamp)
//  - When user exits (detected via separate automation), we calculate duration
//  - Duration is subtracted from allocated daily screen time
//

import SwiftUI
import UIKit
import UserNotifications

// MARK: - App State
class AppState: ObservableObject {
    @Published var shouldShowMindfulness = false
    @Published var shouldShowSessionSummary = false
    @Published var shouldShowSpinner = false
    @Published var targetApp: String = "instagram://"
    @Published var screenTimeData: ScreenTimeData?
    @Published var lastSessionDuration: Double = 0  // Duration of the last Instagram session in seconds
    @Published var wonScreenTime: Int = 0  // The amount won from the spinner (in minutes)
    
    private let bypassKey = "BYPASS_CONFIRM"
    private let dbManager = DatabaseManager.shared
    
    // Time required between claims (180 seconds = 3 min for testing, use 3600 for 1 hour)
    let claimCooldown: Double = 15
    
    init() {
        shouldShowMindfulness = false
        shouldShowSessionSummary = false
        shouldShowSpinner = false
        refreshScreenTimeData()
    }
    
    /// Refresh the screen time data from database
    func refreshScreenTimeData() {
        screenTimeData = dbManager.getCurrentData()
    }
    
    /// Called when app is opened via URL scheme (onesec://?target=instagram://)
    /// Called when app is opened via URL scheme (onesec://?target=instagram://)
    func handleURL(_ url: URL) {
        guard url.scheme == "onesec" else { return }
        
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        let queryItems = components?.queryItems ?? []
        
        // Check if this is an exit notification (from the "Is Closed" automation)
        if let action = queryItems.first(where: { $0.name == "action" })?.value, action == "exit" {
            handleInstagramExit()
            return
        }
        
        // Check if this is an exit notification (from the "Is Closed" automation)
        if let action = queryItems.first(where: { $0.name == "action" })?.value, action == "exit" {
            handleInstagramExit()
            return
        }
        
        // Get target app from URL (default to Instagram)
        if let target = queryItems.first(where: { $0.name == "target" })?.value {
            targetApp = target
        } else {
            targetApp = "instagram://"
        } else {
            targetApp = "instagram://"
        }
        
        shouldShowSessionSummary = false  // Reset session summary when opening for entry
        shouldShowMindfulness = true
        refreshScreenTimeData()
    }

    func handleTimedNotification() {
        let content = UNMutableNotificationContent()
        content.title = "Screen Time Alert"
        content.body = "You have surpassed your screen time limit"
        content.sound = .default
    
        let timeLimit = dbManager.getRemainingScreenTime()
        if timeLimit < 1 {
            return
        }
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeLimit, repeats: false)
        let request = UNNotificationRequest(
            identifier: "ShortBreak",
            content: content,
            trigger: trigger
        )

        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Error scheduling notification: \(error)")
            }
        }
    }

    func handleCancelTimedNotification() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["ShortBreak"])
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: ["ShortBreak"])
    }
    
    /// Called when user taps "Continue to Instagram"
    func allowAccess(to app: String) {
        // Write bypass key to clipboard
        UIPasteboard.general.string = bypassKey
        
        targetApp = app
        
        // Record Instagram entry time in database
        dbManager.recordInstagramEntry()
        
        self.handleTimedNotification()
        // Small delay to ensure clipboard is set, then open Instagram
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            self.openTargetApp()
        }
    }
    
    private func openTargetApp() {
        if let url = URL(string: targetApp) {
            print("Opening: \(targetApp)")
            UIApplication.shared.open(url)
        }
    }
    
    /// Called when user exits Instagram (via separate automation)
    func handleInstagramExit() {
        handleCancelTimedNotification()
        if let duration = dbManager.recordInstagramExit() {
            print("Instagram session ended. Duration: \(Int(duration)) seconds")
            lastSessionDuration = duration
            refreshScreenTimeData()
            
            // Show session summary screen
            shouldShowMindfulness = false
            shouldShowSessionSummary = true
            
            if dbManager.hasExceededScreenTime() {
                print("User has exceeded allocated screen time!")
            }
        } else {
            // No entry time was recorded, just refresh data
            refreshScreenTimeData()
        } else {
            // No entry time was recorded, just refresh data
            refreshScreenTimeData()
        }
    }
    
    /// Add random screen time allocation (for hourly trigger)
    func addHourlyScreenTime() {
        let added = dbManager.addRandomScreenTime()
        print("🎲 Added \(Int(added)) seconds of screen time")
        refreshScreenTimeData()
    }
    
    /// Get remaining screen time
    var remainingScreenTime: Double {
        return dbManager.getRemainingScreenTime()
    }
    
    /// Check if user has exceeded their time
    var hasExceededTime: Bool {
        return dbManager.hasExceededScreenTime()
    }
    
    func cancelAccess() {
        shouldShowMindfulness = false
    }
    
    func dismissSessionSummary() {
        shouldShowSessionSummary = false
    }
    
    /// Format duration in seconds to a readable string
    func formatDuration(_ seconds: Double) -> String {
        let absSeconds = abs(seconds)
        let mins = Int(absSeconds) / 60
        let secs = Int(absSeconds) % 60
        
        if mins > 0 {
            return "\(mins)m \(secs)s"
        } else {
            return "\(secs)s"
        }
    }
    
    // MARK: - Spinner / Lottery Methods
    
    /// Check if claim is available
    func isClaimAvailable() -> Bool {
        return dbManager.isClaimAvailable(requiredSeconds: claimCooldown)
    }
    
    /// Get time remaining until next claim (in seconds)
    func timeUntilNextClaim() -> Double {
        return dbManager.timeUntilNextClaim(requiredSeconds: claimCooldown)
    }
    
    /// Start the spinner - called when user taps claim button
    func startSpinner() {
        // Mark the claim time immediately
        dbManager.updateLastGiveAway()
        
        // Roll the weighted random result
        wonScreenTime = rollWeightedScreenTime()
        
        // Show spinner
        shouldShowSpinner = true
        
        print("🎰 Starting spinner, will win: \(wonScreenTime) minutes")
    }
    
    /// Called when spinner animation completes - adds the won time
    func finishSpinner() {
        // Add the won time to allocated screen time
        let seconds = Double(wonScreenTime * 60)
        dbManager.addScreenTime(seconds: seconds)
        
        // Refresh data and hide spinner
        refreshScreenTimeData()
        shouldShowSpinner = false
        
        print("✅ Spinner complete, added \(wonScreenTime) minutes")
    }
    
    /// Roll weighted random screen time
    /// Returns minutes: 1, 2, 3, 5, 8, 10, 15, 20, or 30
    /// Higher values are rarer (30min ≈ 1%)
    private func rollWeightedScreenTime() -> Int {
        // Weights for each time option (higher = more common)
        // Total weight = 100
        let options: [(minutes: Int, weight: Int)] = [
            (1, 20),   // 25% chance
            (2, 18),   // 22% chance
            (3, 15),   // 18% chance
            (5, 10),   // 14% chance
            (-1, 12),   // 12% chance
            (8, 8),   // 10% chance
            (10, 5),   // 6% chance
            (15, 3),   // 3% chance
            (20, 2),   // 1% chance
            (30, 1),   // 1% chance
            (-5, 6),   // 6% chance
        ]
        
        let totalWeight = options.reduce(0) { $0 + $1.weight }
        let roll = Int.random(in: 1...totalWeight)
        
        var cumulative = 0
        for option in options {
            cumulative += option.weight
            if roll <= cumulative {
                return option.minutes
            }
        }
        
        return 1  // Fallback
    }
    
    /// Get all possible time options for the spinner display
    static let spinnerOptions: [Int] = [1, 2, 3, 5, -1, 8, 10, 15, 20, 30, -5]
}
