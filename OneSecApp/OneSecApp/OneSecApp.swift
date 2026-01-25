//
//  OneSecApp.swift
//  OneSecApp
//
//  Created for ShortBreak Project
//

import SwiftUI

@main
struct OneSecApp: App {
    @StateObject private var appState = AppState()
    @Environment(\.scenePhase) private var scenePhase
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .onOpenURL { url in
                    print("📲 App opened with URL: \(url)")
                    appState.handleURL(url)
                }
                .onChange(of: scenePhase) { oldPhase, newPhase in
                    print("🔄 Scene phase: \(oldPhase) → \(newPhase)")
                    if newPhase == .active && oldPhase != .active {
                        // App just became active - check if we should show mindfulness
                        // Small delay to allow URL handling to happen first
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                            appState.handleAppBecameActive()
                        }
                    }
                }
        }
    }
}
