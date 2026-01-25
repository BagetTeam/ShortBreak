//
//  SetupGuideView.swift
//  OneSecApp
//
//  Setup guide for file-based Shortcut automation
//

import SwiftUI

struct SetupGuideView: View {
    @Environment(\.dismiss) var dismiss
    @State private var currentStep = 0
    
    let steps = [
        SetupStep(
            title: "How It Works",
            description: "The Shortcut reads a timestamp file. If you were recently authorized (< 60 sec), Instagram opens. Otherwise, One Sec opens first.",
            systemImage: "clock.fill",
            action: nil,
            actionURL: nil,
            copyText: nil
        ),
        SetupStep(
            title: "Step 1: Open Shortcuts",
            description: "First, create a new Shortcut (not automation yet)",
            systemImage: "plus.circle.fill",
            action: "Open Shortcuts",
            actionURL: "shortcuts://",
            copyText: nil
        ),
        SetupStep(
            title: "Step 2: Get Timestamp File",
            description: "Add action: 'Get File'\n\nTap 'Files' and browse to:\nOn My iPhone → One Sec → onesec_timestamp.txt",
            systemImage: "doc.fill",
            action: nil,
            actionURL: nil,
            copyText: nil
        ),
        SetupStep(
            title: "Step 3: Get Current Time",
            description: "Add action: 'Date'\n\nThen add: 'Format Date'\nFormat: Custom\nFormat String: X",
            systemImage: "calendar",
            action: nil,
            actionURL: nil,
            copyText: "X"
        ),
        SetupStep(
            title: "Step 4: Calculate Difference",
            description: "Add action: 'Calculate'\n\n[Formatted Date] − [File]\n\nThis gives seconds since authorization.",
            systemImage: "minus.circle.fill",
            action: nil,
            actionURL: nil,
            copyText: nil
        ),
        SetupStep(
            title: "Step 5: Add IF Logic",
            description: "Add 'If' action:\nIf [Result] < 60\n\n• IF block: 'Stop This Shortcut'\n• Otherwise: 'Open URLs' with:",
            systemImage: "arrow.triangle.branch",
            action: nil,
            actionURL: nil,
            copyText: "onesec://?target=instagram://"
        ),
        SetupStep(
            title: "Step 6: Save Shortcut",
            description: "Name it 'OneSec Gate' and tap Done",
            systemImage: "square.and.arrow.down.fill",
            action: nil,
            actionURL: nil,
            copyText: nil
        ),
        SetupStep(
            title: "Step 7: Create Automation",
            description: "Go to Automation tab → + → Create Personal Automation → App → Instagram → Is Opened → Next",
            systemImage: "gearshape.2.fill",
            action: nil,
            actionURL: nil,
            copyText: nil
        ),
        SetupStep(
            title: "Step 8: Run Shortcut",
            description: "Add action: 'Run Shortcut'\nSelect 'OneSec Gate'\n\nTap Next → Turn OFF 'Ask Before Running' → Done",
            systemImage: "play.fill",
            action: nil,
            actionURL: nil,
            copyText: nil
        ),
        SetupStep(
            title: "You're Ready!",
            description: "✓ First open: Breathing exercise\n✓ After Continue: Instagram opens\n✓ Within 60 sec: Goes straight to Instagram",
            systemImage: "checkmark.circle.fill",
            action: nil,
            actionURL: nil,
            copyText: nil
        )
    ]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Progress indicator
                HStack(spacing: 4) {
                    ForEach(0..<steps.count, id: \.self) { index in
                        Capsule()
                            .fill(index <= currentStep ? Color.green : Color.gray.opacity(0.3))
                            .frame(height: 3)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 16)
                
                Text("\(currentStep + 1) / \(steps.count)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.top, 8)
                
                // Step content
                TabView(selection: $currentStep) {
                    ForEach(0..<steps.count, id: \.self) { index in
                        StepView(step: steps[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                
                // Navigation buttons
                HStack(spacing: 16) {
                    if currentStep > 0 {
                        Button(action: {
                            withAnimation { currentStep -= 1 }
                        }) {
                            HStack {
                                Image(systemName: "chevron.left")
                                Text("Back")
                            }
                            .foregroundColor(.primary)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 12)
                            .background(Color.gray.opacity(0.2))
                            .cornerRadius(10)
                        }
                    }
                    
                    Spacer()
                    
                    if currentStep < steps.count - 1 {
                        Button(action: {
                            withAnimation { currentStep += 1 }
                        }) {
                            HStack {
                                Text("Next")
                                Image(systemName: "chevron.right")
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 12)
                            .background(Color.green)
                            .cornerRadius(10)
                        }
                    } else {
                        Button(action: { dismiss() }) {
                            Text("Done")
                                .foregroundColor(.white)
                                .padding(.horizontal, 28)
                                .padding(.vertical, 12)
                                .background(Color.green)
                                .cornerRadius(10)
                        }
                    }
                }
                .padding(24)
            }
            .navigationTitle("Setup")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Skip") { dismiss() }
                        .foregroundColor(.secondary)
                }
            }
        }
    }
}

struct SetupStep {
    let title: String
    let description: String
    let systemImage: String
    let action: String?
    let actionURL: String?
    let copyText: String?
}

struct StepView: View {
    let step: SetupStep
    @State private var copied = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Spacer(minLength: 10)
                
                ZStack {
                    Circle()
                        .fill(Color.green.opacity(0.15))
                        .frame(width: 80, height: 80)
                    Image(systemName: step.systemImage)
                        .font(.system(size: 35))
                        .foregroundColor(.green)
                }
                
                Text(step.title)
                    .font(.title3)
                    .fontWeight(.bold)
                
                Text(step.description)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)
                
                if let copyText = step.copyText {
                    Button(action: {
                        UIPasteboard.general.string = copyText
                        copied = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { copied = false }
                    }) {
                        HStack {
                            Text(copyText)
                                .font(.system(.caption, design: .monospaced))
                            Image(systemName: copied ? "checkmark" : "doc.on.doc")
                        }
                        .foregroundColor(copied ? .green : .blue)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
                
                if let action = step.action, let urlString = step.actionURL {
                    Button(action: {
                        if let url = URL(string: urlString) {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack {
                            Image(systemName: "arrow.up.right.square")
                            Text(action)
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(Color.blue)
                        .cornerRadius(8)
                    }
                }
                
                Spacer(minLength: 30)
            }
        }
    }
}

#Preview {
    SetupGuideView()
}
