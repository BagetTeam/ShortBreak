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
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .onOpenURL { url in
                    appState.handleURL(url)
                }
        }
    }
}
