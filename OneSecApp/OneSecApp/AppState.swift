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

import SwiftUI
import UIKit

// MARK: - App State
class AppState: ObservableObject {
    @Published var shouldShowMindfulness = false
    @Published var targetApp: String = "instagram://"
    
    private let bypassKey = "BYPASS_CONFIRM"
    
    init() {
        shouldShowMindfulness = false
    }
    
    /// Called when app is opened via URL scheme (onesec://?target=instagram://)
    func handleURL(_ url: URL) {
        guard url.scheme == "onesec" else { return }
        
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        let queryItems = components?.queryItems ?? []
        
        // Get target app from URL (default to Instagram)
        if let target = queryItems.first(where: { $0.name == "target" })?.value {
            targetApp = target
        } else {
            targetApp = "instagram://"
        }
        
        print("🧘 Showing mindfulness screen for: \(targetApp)")
        shouldShowMindfulness = true
    }
    
    /// Called when user taps "Continue to Instagram"
    func allowAccess(to app: String) {
        // Write bypass key to clipboard
        UIPasteboard.general.string = bypassKey
        print("📋 Wrote '\(bypassKey)' to clipboard")
        
        targetApp = app
        
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
    
    func cancelAccess() {
        shouldShowMindfulness = false
    }
}
