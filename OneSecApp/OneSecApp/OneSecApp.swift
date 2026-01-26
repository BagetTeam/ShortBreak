//
//  OneSecApp.swift
//  OneSecApp
//
//  Created for ShortBreak Project
//

import SwiftUI
import UserNotifications

@main
struct OneSecApp: App {
    @StateObject private var appState = AppState()

     private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                print("Notification permission granted")
            } else if let error = error {
                print("Notification permission error: \(error)")
            } else {
                print("Notification permission denied")
            }
        }
    }

    private func checkNotificationStatus() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            switch settings.authorizationStatus {
            case .notDetermined:
                requestNotificationPermission()
            case .denied:
                print("User denied notifications - maybe show an alert asking them to go to Settings?")
            case .authorized:
                print("Already authorized")
            default:
                break
            }
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .onAppear {
                    checkNotificationStatus()
                }
                .onOpenURL { url in
                    print("Opened with URL: \(url)")
                    appState.handleURL(url)
                }
        }
    }
}
