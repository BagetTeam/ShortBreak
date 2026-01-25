//
//  SetupGuideView.swift
//  OneSecApp
//
//  In-app setup guide to help users configure the Shortcut automation
//

import SwiftUI

struct SetupGuideView: View {
    @Environment(\.dismiss) var dismiss
    @State private var currentStep = 0
    
    let steps = [
        SetupStep(
            title: "Open Shortcuts App",
            description: "Open the Shortcuts app on your iPhone",
            systemImage: "square.stack.3d.up.fill",
            action: "Open Shortcuts",
            actionURL: "shortcuts://"
        ),
        SetupStep(
            title: "Go to Automation",
            description: "Tap the 'Automation' tab at the bottom of the screen",
            systemImage: "gearshape.2.fill",
            action: nil,
            actionURL: nil
        ),
        SetupStep(
            title: "Create New Automation",
            description: "Tap the '+' button, then select 'Create Personal Automation'",
            systemImage: "plus.circle.fill",
            action: nil,
            actionURL: nil
        ),
        SetupStep(
            title: "Select App Trigger",
            description: "Choose 'App' → Select 'Instagram' → Choose 'Is Opened' → Tap Next",
            systemImage: "app.fill",
            action: nil,
            actionURL: nil
        ),
        SetupStep(
            title: "Add the Actions",
            description: "Search for 'One Sec' or 'Mindful Check-In' and add it as the action. This will appear because you installed this app!",
            systemImage: "leaf.fill",
            action: nil,
            actionURL: nil
        ),
        SetupStep(
            title: "Disable Ask Before Running",
            description: "Tap 'Next', then turn OFF 'Ask Before Running' so it works automatically. Tap 'Done' to finish!",
            systemImage: "checkmark.circle.fill",
            action: nil,
            actionURL: nil
        )
    ]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Progress indicator
                HStack(spacing: 8) {
                    ForEach(0..<steps.count, id: \.self) { index in
                        Capsule()
                            .fill(index <= currentStep ? Color.green : Color.gray.opacity(0.3))
                            .frame(height: 4)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 16)
                
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
                            withAnimation {
                                currentStep -= 1
                            }
                        }) {
                            HStack {
                                Image(systemName: "chevron.left")
                                Text("Back")
                            }
                            .foregroundColor(.primary)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 14)
                            .background(Color.gray.opacity(0.2))
                            .cornerRadius(12)
                        }
                    }
                    
                    Spacer()
                    
                    if currentStep < steps.count - 1 {
                        Button(action: {
                            withAnimation {
                                currentStep += 1
                            }
                        }) {
                            HStack {
                                Text("Next")
                                Image(systemName: "chevron.right")
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 14)
                            .background(Color.green)
                            .cornerRadius(12)
                        }
                    } else {
                        Button(action: {
                            dismiss()
                        }) {
                            Text("Done")
                                .foregroundColor(.white)
                                .padding(.horizontal, 32)
                                .padding(.vertical, 14)
                                .background(Color.green)
                                .cornerRadius(12)
                        }
                    }
                }
                .padding(24)
            }
            .navigationTitle("Setup Guide")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Skip") {
                        dismiss()
                    }
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
}

struct StepView: View {
    let step: SetupStep
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            // Icon
            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.15))
                    .frame(width: 120, height: 120)
                
                Image(systemName: step.systemImage)
                    .font(.system(size: 50))
                    .foregroundColor(.green)
            }
            
            // Title
            Text(step.title)
                .font(.title2)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
            
            // Description
            Text(step.description)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            
            // Optional action button
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
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.blue)
                    .cornerRadius(10)
                }
            }
            
            Spacer()
            Spacer()
        }
        .padding()
    }
}

#Preview {
    SetupGuideView()
}
