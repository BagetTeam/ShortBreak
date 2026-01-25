//
//  AppState.swift
//  OneSecApp
//
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

import SwiftUI
import UIKit

// MARK: - App State
class AppState: ObservableObject {
    @Published var shouldShowMindfulness = false
    @Published var shouldShowSessionSummary = false
    @Published var targetApp: String = "instagram://"
    @Published var screenTimeData: ScreenTimeData?
    @Published var lastSessionDuration: Double = 0  // Duration of the last Instagram session in seconds
    
    private let bypassKey = "BYPASS_CONFIRM"
    private let dbManager = DatabaseManager.shared
    
    init() {
        shouldShowMindfulness = false
        shouldShowSessionSummary = false
        refreshScreenTimeData()
    }
    
    /// Refresh the screen time data from database
    func refreshScreenTimeData() {
        screenTimeData = dbManager.getCurrentData()
    }
    
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
        
        // Get target app from URL (default to Instagram)
        if let target = queryItems.first(where: { $0.name == "target" })?.value {
            targetApp = target
        } else {
            targetApp = "instagram://"
        }
        
        print("🧘 Showing mindfulness screen for: \(targetApp)")
        shouldShowSessionSummary = false  // Reset session summary when opening for entry
        shouldShowMindfulness = true
        refreshScreenTimeData()
    }
    
    /// Called when user taps "Continue to Instagram"
    func allowAccess(to app: String) {
        // Write bypass key to clipboard
        UIPasteboard.general.string = bypassKey
        print("📋 Wrote '\(bypassKey)' to clipboard")
        
        targetApp = app
        
        // Record Instagram entry time in database
        dbManager.recordInstagramEntry()
        print("⏱️ Recorded Instagram entry time")
        
        // Small delay to ensure clipboard is set, then open Instagram
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            self.openTargetApp()
        }
    }
    
    private func openTargetApp() {
        if let url = URL(string: targetApp) {
            print("🚀 Opening: \(targetApp)")
            UIApplication.shared.open(url)
        }
    }
    
    /// Called when user exits Instagram (via separate automation)
    func handleInstagramExit() {
        if let duration = dbManager.recordInstagramExit() {
            print("⏱️ Instagram session ended. Duration: \(Int(duration)) seconds")
            lastSessionDuration = duration
            refreshScreenTimeData()
            
            // Show session summary screen
            shouldShowMindfulness = false
            shouldShowSessionSummary = true
            
            // Check if user has exceeded their allocated time
            if dbManager.hasExceededScreenTime() {
                print("⚠️ User has exceeded allocated screen time!")
            }
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
}
