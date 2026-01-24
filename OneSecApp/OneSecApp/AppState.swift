//
//  AppState.swift
//  OneSecApp
//
//  Manages app state and clipboard handshake logic
//

import SwiftUI
import UIKit

class AppState: ObservableObject {
    @Published var shouldShowMindfulness = false
    @Published var targetApp: String = ""
    
    private let passOpenKey = "PASS_OPEN"
    
    init() {
        checkClipboardOnLaunch()
    }
    
    func checkClipboardOnLaunch() {
        // Check if we should bypass the mindfulness screen
        if let clipboardContent = UIPasteboard.general.string,
           clipboardContent == passOpenKey {
            // Clear clipboard and allow direct access
            UIPasteboard.general.string = ""
            shouldShowMindfulness = false
        } else {
            // Show mindfulness check-in
            shouldShowMindfulness = true
        }
    }
    
    func handleURL(_ url: URL) {
        // Handle deep links from Shortcuts
        if url.scheme == "onesec" {
            if let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
               let target = components.queryItems?.first(where: { $0.name == "target" })?.value {
                targetApp = target
                shouldShowMindfulness = true
            }
        }
    }
    
    func allowAccess(to app: String) {
        // Write pass key to clipboard
        UIPasteboard.general.string = passOpenKey
        
        // Open the target app
        if let url = URL(string: app) {
            UIApplication.shared.open(url)
        }
    }
    
    func cancelAccess() {
        // User chose mindfulness - just exit or show a message
        shouldShowMindfulness = false
    }
}
