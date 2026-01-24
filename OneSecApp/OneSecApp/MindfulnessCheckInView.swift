//
//  MindfulnessCheckInView.swift
//  OneSecApp
//
//  The core mindfulness check-in screen with breathing exercise
//

import SwiftUI

struct MindfulnessCheckInView: View {
    @EnvironmentObject var appState: AppState
    @State private var breathingPhase: BreathingPhase = .inhale
    @State private var scale: CGFloat = 1.0
    @State private var opacity: Double = 0.6
    @State private var timeRemaining: Int = 3
    @State private var timer: Timer?
    @State private var showContinueButton = false
    @State private var showCancelButton = true
    
    enum BreathingPhase {
        case inhale
        case hold
        case exhale
        case pause
    }
    
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
                
                // Breathing circle animation
                ZStack {
                    Circle()
                        .fill(
                            RadialGradient(
                                gradient: Gradient(colors: [
                                    Color.white.opacity(opacity),
                                    Color.white.opacity(opacity * 0.3)
                                ]),
                                center: .center,
                                startRadius: 20,
                                endRadius: 150
                            )
                        )
                        .frame(width: 200, height: 200)
                        .scaleEffect(scale)
                    
                    // Breathing instruction text
                    Text(breathingInstruction)
                        .font(.title2)
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                }
                
                // Reflection question
                if showContinueButton {
                    VStack(spacing: 20) {
                        Text("Why do you want to open this app?")
                            .font(.headline)
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        // Action buttons
                        VStack(spacing: 15) {
                            Button(action: {
                                handleContinue()
                            }) {
                                Text("Continue")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.green)
                                    .cornerRadius(12)
                            }
                            
                            Button(action: {
                                handleCancel()
                            }) {
                                Text("Take a Break Instead")
                                    .font(.subheadline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.clear)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12)
                                            .stroke(Color.white.opacity(0.5), lineWidth: 1)
                                    )
                            }
                        }
                        .padding(.horizontal, 40)
                    }
                    .transition(.opacity)
                } else {
                    // Countdown or breathing instruction
                    Text(breathingText)
                        .font(.title3)
                        .foregroundColor(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                }
                
                Spacer()
            }
        }
        .onAppear {
            startBreathingExercise()
        }
        .onDisappear {
            timer?.invalidate()
        }
    }
    
    private var breathingInstruction: String {
        switch breathingPhase {
        case .inhale:
            return "Breathe In"
        case .hold:
            return "Hold"
        case .exhale:
            return "Breathe Out"
        case .pause:
            return "Pause"
        }
    }
    
    private var breathingText: String {
        if timeRemaining > 0 {
            return "Take \(timeRemaining) more breath\(timeRemaining == 1 ? "" : "es")"
        }
        return ""
    }
    
    private func startBreathingExercise() {
        // Start with 3 breaths
        timeRemaining = 3
        breathingCycle()
    }
    
    private func breathingCycle() {
        // Inhale: 4 seconds
        breathingPhase = .inhale
        animateBreath(duration: 4.0, targetScale: 1.3, targetOpacity: 1.0) {
            // Hold: 2 seconds
            self.breathingPhase = .hold
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                // Exhale: 4 seconds
                self.breathingPhase = .exhale
                self.animateBreath(duration: 4.0, targetScale: 1.0, targetOpacity: 0.6) {
                    // Pause: 2 seconds
                    self.breathingPhase = .pause
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                        self.timeRemaining -= 1
                        if self.timeRemaining > 0 {
                            self.breathingCycle()
                        } else {
                            self.showContinueButton = true
                            withAnimation {
                                self.scale = 1.0
                                self.opacity = 0.6
                            }
                        }
                    }
                }
            }
        }
    }
    
    private func animateBreath(duration: TimeInterval, targetScale: CGFloat, targetOpacity: Double, completion: @escaping () -> Void) {
        withAnimation(.easeInOut(duration: duration)) {
            scale = targetScale
            opacity = targetOpacity
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
            completion()
        }
    }
    
    private func handleContinue() {
        // Determine target app (default to Instagram if not specified)
        let targetApp = appState.targetApp.isEmpty ? "instagram://" : appState.targetApp
        appState.allowAccess(to: targetApp)
    }
    
    private func handleCancel() {
        appState.cancelAccess()
    }
}
