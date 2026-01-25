//
//  ContentView.swift
//  OneSecApp
//
//  Main content view that shows mindfulness screen or home
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        ZStack {
            if appState.shouldShowMindfulness {
                MindfulnessCheckInView()
            } else {
                HomeView()
            }
        }
    }
}

struct HomeView: View {
    @State private var showSetupGuide = false
    @AppStorage("hasCompletedSetup") private var hasCompletedSetup = false
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            Image(systemName: "leaf.fill")
                .font(.system(size: 60))
                .foregroundColor(.green)
            
            Text("One Sec")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("Take a moment before you scroll")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Spacer()
            
            // Setup section
            VStack(spacing: 16) {
                if !hasCompletedSetup {
                    Text("Complete setup to intercept Instagram")
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Button(action: {
                        showSetupGuide = true
                    }) {
                        HStack {
                            Image(systemName: "gear")
                            Text("Setup Shortcut Automation")
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .cornerRadius(12)
                    }
                    .padding(.horizontal, 40)
                } else {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Setup complete!")
                            .foregroundColor(.secondary)
                    }
                    
                    Button(action: {
                        showSetupGuide = true
                    }) {
                        Text("View Setup Guide Again")
                            .font(.subheadline)
                            .foregroundColor(.blue)
                    }
                }
            }
            .padding(.bottom, 40)
        }
        .padding()
        .sheet(isPresented: $showSetupGuide, onDismiss: {
            hasCompletedSetup = true
        }) {
            SetupGuideView()
        }
    }
}
