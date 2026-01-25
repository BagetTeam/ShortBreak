//
//  MindfulnessCheckInView.swift
//  OneSecApp
//
//  The choice screen - continue to Instagram or go to ShortBreak
//

import SwiftUI

struct MindfulnessCheckInView: View {
    @EnvironmentObject var appState: AppState
    
    // Placeholder URL for ShortBreak web app
    private let shortBreakURL = "https://github.com/BagetTeam"
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.1, green: 0.2, blue: 0.3),
                    Color(red: 0.2, green: 0.3, blue: 0.4)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 40) {
                Spacer()
                
                // Header
                VStack(spacing: 16) {
                    Image(systemName: "pause.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.white.opacity(0.9))
                    
                    Text("Take a moment")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text("What would you like to do?")
                        .font(.title3)
                        .foregroundColor(.white.opacity(0.8))
                }
                
                Spacer()
                
                // Action buttons
                VStack(spacing: 16) {
                    // Continue to Instagram button
                    Button(action: {
                        handleContinueToInsta()
                    }) {
                        HStack {
                            Image(systemName: "arrow.right.circle.fill")
                                .font(.title2)
                            Text("Continue on Insta")
                                .font(.headline)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(Color.white.opacity(0.2))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color.white.opacity(0.3), lineWidth: 1)
                        )
                        .cornerRadius(14)
                    }
                    
                    // ShortBreak button
                    Button(action: {
                        handleGoToShortBreak()
                    }) {
                        HStack {
                            Image(systemName: "sparkles")
                                .font(.title2)
                            Text("Bring me to ShortBreak")
                                .font(.headline)
                        }
                        .foregroundColor(Color(red: 0.1, green: 0.2, blue: 0.3))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(Color.white)
                        .cornerRadius(14)
                    }
                }
                .padding(.horizontal, 32)
                
                Spacer()
                    .frame(height: 60)
            }
        }
    }
    
    private func handleContinueToInsta() {
        // Same logic as before - set bypass and open Instagram
        let targetApp = appState.targetApp.isEmpty ? "instagram://" : appState.targetApp
        appState.allowAccess(to: targetApp)
    }
    
    private func handleGoToShortBreak() {
        // Open ShortBreak web app
        if let url = URL(string: shortBreakURL) {
            UIApplication.shared.open(url)
        }
        // Dismiss the mindfulness screen
        appState.cancelAccess()
    }
}
