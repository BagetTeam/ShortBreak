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
    @EnvironmentObject var appState: AppState
    @State private var showSetupGuide = false
    @AppStorage("hasCompletedSetup") private var hasCompletedSetup = false
    
    // TODO: Replace with your actual iCloud shortcut link after creating it
    let shortcutInstallURL = "https://www.icloud.com/shortcuts/YOUR_SHORTCUT_ID_HERE"
    
    var body: some View {
        VStack(spacing: 24) {
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
                Text("Setup in 2 steps")
                    .font(.headline)
                
                // Step 1: Install Shortcut
                Button(action: {
                    if let url = URL(string: shortcutInstallURL) {
                        UIApplication.shared.open(url)
                    }
                }) {
                    HStack {
                        Text("1")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                            .frame(width: 24, height: 24)
                            .background(Color.green.opacity(0.2))
                            .clipShape(Circle())
                        Text("Install 'OneSec Gate' Shortcut")
                        Spacer()
                        Image(systemName: "arrow.up.right.square")
                    }
                    .foregroundColor(.primary)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(12)
                }
                
                // Step 2: Create Automation
                Button(action: {
                    showSetupGuide = true
                }) {
                    HStack {
                        Text("2")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                            .frame(width: 24, height: 24)
                            .background(Color.green.opacity(0.2))
                            .clipShape(Circle())
                        Text("Create Instagram Automation")
                        Spacer()
                        Image(systemName: "chevron.right")
                    }
                    .foregroundColor(.primary)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(12)
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
        .padding()
        .sheet(isPresented: $showSetupGuide) {
            AutomationGuideView()
        }
    }
}

// Simple guide just for creating the automation (shortcut is already installed)
struct AutomationGuideView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    Image(systemName: "gearshape.2.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.green)
                        .padding(.top, 40)
                    
                    Text("Create Automation")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    VStack(alignment: .leading, spacing: 20) {
                        StepRow(number: "1", text: "Open the Shortcuts app")
                        StepRow(number: "2", text: "Go to the Automation tab")
                        StepRow(number: "3", text: "Tap + → Create Personal Automation")
                        StepRow(number: "4", text: "Select App → Instagram → Is Opened")
                        StepRow(number: "5", text: "Tap Next")
                        StepRow(number: "6", text: "Add action: Run Shortcut")
                        StepRow(number: "7", text: "Select 'OneSec Gate'")
                        StepRow(number: "8", text: "Tap Next → Turn OFF 'Ask Before Running'")
                        StepRow(number: "9", text: "Tap Done!")
                    }
                    .padding(.horizontal, 24)
                    
                    Button(action: {
                        if let url = URL(string: "shortcuts://") {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack {
                            Image(systemName: "arrow.up.right.square")
                            Text("Open Shortcuts App")
                        }
                        .foregroundColor(.white)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(12)
                    }
                    .padding(.top, 20)
                    
                    Spacer(minLength: 40)
                }
            }
            .navigationTitle("Setup")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

struct StepRow: View {
    let number: String
    let text: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text(number)
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .frame(width: 24, height: 24)
                .background(Color.green)
                .clipShape(Circle())
            
            Text(text)
                .font(.body)
            
            Spacer()
        }
    }
}
