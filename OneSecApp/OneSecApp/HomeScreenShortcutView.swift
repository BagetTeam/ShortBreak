//
//  HomeScreenShortcutView.swift
//  OneSecApp
//
//  Guides users to create a Home Screen shortcut instead of using automation
//  This avoids the infinite loop problem entirely
//

import SwiftUI

struct HomeScreenShortcutView: View {
    @Environment(\.dismiss) var dismiss
    @State private var currentStep = 0
    
    let steps = [
        ShortcutStep(
            title: "How This Works",
            description: "Instead of an automation that loops, you'll create a Home Screen shortcut. When you want Instagram, tap this shortcut first - it opens One Sec, then Instagram.\n\nNo loops. No complexity.",
            systemImage: "lightbulb.fill",
            showButton: false
        ),
        ShortcutStep(
            title: "Open Shortcuts App",
            description: "First, let's create the shortcut",
            systemImage: "square.stack.3d.up.fill",
            showButton: true
        ),
        ShortcutStep(
            title: "Create New Shortcut",
            description: "Tap '+' in the top right to create a new shortcut (NOT an automation)",
            systemImage: "plus.circle.fill",
            showButton: false
        ),
        ShortcutStep(
            title: "Add Open URL Action",
            description: "1. Tap 'Add Action'\n2. Search for 'Open URLs'\n3. Add it and set the URL to:\n\nonesec://?target=instagram://",
            systemImage: "link",
            showButton: false
        ),
        ShortcutStep(
            title: "Name Your Shortcut",
            description: "Tap the name at the top and rename it to 'Instagram' or 'Open Instagram'",
            systemImage: "pencil",
            showButton: false
        ),
        ShortcutStep(
            title: "Add to Home Screen",
            description: "1. Tap the dropdown arrow next to the name\n2. Select 'Add to Home Screen'\n3. Choose an icon (you can use the Instagram icon)\n4. Tap 'Add'",
            systemImage: "plus.app.fill",
            showButton: false
        ),
        ShortcutStep(
            title: "Hide Real Instagram",
            description: "Finally, hide the real Instagram app:\n\n1. Long-press Instagram icon\n2. Tap 'Remove App'\n3. Choose 'Remove from Home Screen'\n\n(This keeps the app but hides the icon)",
            systemImage: "eye.slash.fill",
            showButton: false
        ),
        ShortcutStep(
            title: "You're All Set!",
            description: "Now when you tap 'Instagram' on your home screen, it goes through One Sec first!\n\nNo infinite loops. No complex automations.",
            systemImage: "checkmark.circle.fill",
            showButton: false
        )
    ]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Progress indicator
                HStack(spacing: 6) {
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
                        ShortcutStepView(step: steps[index])
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

struct ShortcutStep {
    let title: String
    let description: String
    let systemImage: String
    let showButton: Bool
}

struct ShortcutStepView: View {
    let step: ShortcutStep
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Spacer(minLength: 20)
                
                // Icon
                ZStack {
                    Circle()
                        .fill(Color.green.opacity(0.15))
                        .frame(width: 100, height: 100)
                    
                    Image(systemName: step.systemImage)
                        .font(.system(size: 40))
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
                    .padding(.horizontal, 24)
                
                // Optional action button
                if step.showButton {
                    Button(action: {
                        if let url = URL(string: "shortcuts://") {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack {
                            Image(systemName: "arrow.up.right.square")
                            Text("Open Shortcuts")
                        }
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.blue)
                        .cornerRadius(10)
                    }
                }
                
                Spacer(minLength: 40)
            }
        }
    }
}

#Preview {
    HomeScreenShortcutView()
}
