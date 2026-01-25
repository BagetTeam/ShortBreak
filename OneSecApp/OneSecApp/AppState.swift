//
//  AppState.swift
//  OneSecApp
//
//  Manages app state using file-based timestamp bypass
//
//  ARCHITECTURE:
//  1. Automation triggers when Instagram opens -> runs Shortcut "OneSec Gate"
//  2. Shortcut reads onesec_timestamp.txt file
//  3. If (current_time - file_timestamp) < 60 sec -> Shortcut stops (Instagram opens)
//  4. If older or missing -> Shortcut opens onesec://?target=instagram://
//  5. User does breathing, taps Continue
//  6. App writes NEW timestamp to file and opens Instagram
//  7. Automation triggers again, Shortcut reads fresh timestamp -> Stops
//  8. User stays in Instagram! ✓
//

import SwiftUI
import UIKit

// MARK: - Shared Storage
/// Writes timestamp to a file that Shortcuts can read
class SharedStorage {
    // File in Documents folder (visible in Files app under "On My iPhone > One Sec")
    static var timestampFileURL: URL? {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?
            .appendingPathComponent("onesec_timestamp.txt")
    }
    
    /// Create initial timestamp file (so users can select it in Shortcuts)
    static func ensureFileExists() {
        guard let fileURL = timestampFileURL else { return }
        
        if !FileManager.default.fileExists(atPath: fileURL.path) {
            // Write 0 so first check will fail (no bypass)
            try? "0".write(to: fileURL, atomically: true, encoding: .utf8)
            print("📄 Created initial timestamp file at: \(fileURL.path)")
        }
    }
    
    /// Write current timestamp to file (Shortcuts will read this)
    static func writeTimestamp() {
        guard let fileURL = timestampFileURL else {
            print("❌ Could not get Documents directory")
            return
        }
        
        let now = Int(Date().timeIntervalSince1970)
        let content = String(now)
        
        do {
            try content.write(to: fileURL, atomically: true, encoding: .utf8)
            print("📝 Wrote timestamp \(now) to: \(fileURL.lastPathComponent)")
        } catch {
            print("❌ Failed to write timestamp: \(error)")
        }
    }
    
    /// Check if bypass is valid (used within the app)
    static let bypassWindowSeconds: TimeInterval = 60.0
    
    static func shouldBypass() -> Bool {
        guard let fileURL = timestampFileURL,
              let content = try? String(contentsOf: fileURL, encoding: .utf8),
              let timestamp = Double(content.trimmingCharacters(in: .whitespacesAndNewlines)),
              timestamp > 0 else {
            return false
        }
        
        let elapsed = Date().timeIntervalSince1970 - timestamp
        let bypass = elapsed < bypassWindowSeconds
        
        print("⏰ Bypass check: \(Int(elapsed))s elapsed (window: \(Int(bypassWindowSeconds))s) → \(bypass ? "BYPASS" : "SHOW")")
        return bypass
    }
}

// MARK: - App State
class AppState: ObservableObject {
    @Published var shouldShowMindfulness = false
    @Published var targetApp: String = "instagram://"
    
    private var lastActiveTime: Date?
    private var urlHandled = false
    
    init() {
        shouldShowMindfulness = false
        // Ensure timestamp file exists
        SharedStorage.ensureFileExists()
    }
    
    /// Called when app receives a URL (onesec://...)
    func handleURL(_ url: URL) {
        urlHandled = true
        
        guard url.scheme == "onesec" else { return }
        
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        let queryItems = components?.queryItems ?? []
        
        // Get target app from URL (default to Instagram)
        if let target = queryItems.first(where: { $0.name == "target" })?.value {
            targetApp = target
        }
        
        // Check bypass
        if SharedStorage.shouldBypass() {
            print("🔓 Bypass valid - redirecting to \(targetApp)")
            openTargetApp()
            return
        }
        
        print("🧘 Showing mindfulness screen for: \(targetApp)")
        shouldShowMindfulness = true
    }
    
    /// Called when app becomes active (from automation or user)
    func handleAppBecameActive() {
        // If URL was already handled, don't do anything
        if urlHandled {
            urlHandled = false // Reset for next time
            return
        }
        
        // App opened without URL - likely from automation "Open App" action
        // Check if we should bypass or show mindfulness
        
        // Check bypass first
        if SharedStorage.shouldBypass() {
            print("🔓 Bypass valid (no URL) - staying in app or redirecting")
            // Don't show mindfulness, user was recently authorized
            // Optionally redirect to Instagram:
            // openTargetApp()
            return
        }
        
        // No URL and no bypass - show mindfulness
        // (This handles the simple "Open One Sec" automation)
        print("🧘 App opened without URL, no bypass - showing mindfulness")
        targetApp = "instagram://" // Default target
        shouldShowMindfulness = true
    }
    
    func allowAccess(to app: String) {
        // Write timestamp
        SharedStorage.writeTimestamp()
        
        // Open target app
        targetApp = app
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
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
