//
//  TimeSpinnerView.swift
//  OneSecApp
//
//  Lottery/Gacha style spinner for screen time allocation
//  Shows a carousel animation and reveals the won time
//

import SwiftUI
import UIKit
import CoreText

struct TimeSpinnerView: View {
    @EnvironmentObject var appState: AppState
    
    // Animation state
    @State private var currentIndex: Int = 0
    @State private var isSpinning = true
    @State private var spinSpeed: Double = 0.05
    @State private var showResult = false
    
    // All possible time options
    private let options = AppState.spinnerOptions
    
    // Colors
    private let beigeBackground = Color(red: 0.96, green: 0.94, blue: 0.90)
    private let softWhite = Color(red: 0.99, green: 0.99, blue: 0.98)
    private let goldColor = Color(red: 1.0, green: 0.84, blue: 0.0)
    
    init() {
        registerFonts()
    }
    
    private func registerFonts() {
        let fontPaths = [
            ("ComingSoon-Regular", "ttf", "Fonts"),
            ("Shizuru-Regular", "ttf", "Fonts"),
        ]
        
        for (name, ext, subdir) in fontPaths {
            if let url = Bundle.main.url(forResource: name, withExtension: ext, subdirectory: subdir) {
                if let fontDataProvider = CGDataProvider(url: url as CFURL),
                   let font = CGFont(fontDataProvider) {
                    var error: Unmanaged<CFError>?
                    CTFontManagerRegisterGraphicsFont(font, &error)
                }
            }
        }
    }
    
    private func comingSoonFont(size: CGFloat) -> Font {
        let fontNames = ["Coming Soon", "ComingSoon", "ComingSoon-Regular"]
        for fontName in fontNames {
            if let font = UIFont(name: fontName, size: size) {
                return Font(font)
            }
        }
        return .system(size: size)
    }
    
    private func shizuruFont(size: CGFloat) -> Font {
        let fontNames = ["Shizuru", "Shizuru-Regular"]
        for fontName in fontNames {
            if let font = UIFont(name: fontName, size: size) {
                return Font(font)
            }
        }
        return .system(size: size, design: .rounded)
    }
    
    var body: some View {
        ZStack {
            beigeBackground
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                Text("ShortBreak")
                    .font(shizuruFont(size: 40))
                    .foregroundColor(.black)
                    .shadow(color: Color.black.opacity(0.3), radius: 2, x: 0, y: 1)
                    .padding(.top, 60)
                
                Spacer()
                
                // Spinner title
                Text(showResult ? "You Won!" : "Spinning...")
                    .font(comingSoonFont(size: 28))
                    .foregroundColor(.black)
                    .padding(.bottom, 20)
                
                // Spinner carousel
                ZStack {
                    // Background glow for result
                    if showResult {
                        Circle()
                            .fill(goldColor.opacity(0.3))
                            .frame(width: 250, height: 250)
                            .blur(radius: 30)
                    }
                    
                    // Main spinner display
                    VStack(spacing: 8) {
                        // Previous value (faded)
                        Text("\(options[previousIndex])m")
                            .font(shizuruFont(size: 36))
                            .foregroundColor(.black.opacity(0.2))
                            .animation(.easeInOut(duration: spinSpeed), value: currentIndex)
                        
                        // Current value (highlighted)
                        Text("\(options[currentIndex])m")
                            .font(shizuruFont(size: showResult ? 80 : 64))
                            .foregroundColor(showResult ? goldColor : .black)
                            .shadow(color: showResult ? goldColor.opacity(0.5) : .clear, radius: 10)
                            .scaleEffect(showResult ? 1.1 : 1.0)
                            .animation(.spring(response: 0.3), value: showResult)
                            .animation(.easeInOut(duration: spinSpeed), value: currentIndex)
                        
                        // Next value (faded)
                        Text("\(options[nextIndex])m")
                            .font(shizuruFont(size: 36))
                            .foregroundColor(.black.opacity(0.2))
                            .animation(.easeInOut(duration: spinSpeed), value: currentIndex)
                    }
                    .frame(width: 200, height: 200)
                    .background(
                        RoundedRectangle(cornerRadius: 30)
                            .fill(softWhite)
                            .shadow(color: Color.black.opacity(0.15), radius: 20, x: 0, y: 10)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 30)
                            .stroke(showResult ? goldColor : Color.black.opacity(0.3), lineWidth: showResult ? 3 : 1.5)
                    )
                }
                
                Spacer()
                
                // Result message
                if showResult {
                    VStack(spacing: 12) {
                        Text("+\(appState.wonScreenTime) minutes")
                            .font(comingSoonFont(size: 24))
                            .foregroundColor(.black)
                        
                        Text("added to your screen time!")
                            .font(comingSoonFont(size: 16))
                            .foregroundColor(.black.opacity(0.6))
                    }
                    .padding(.bottom, 20)
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
                    
                    // Continue button
                    Button(action: {
                        appState.finishSpinner()
                    }) {
                        Text("Continue")
                            .font(comingSoonFont(size: 20))
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .frame(height: 60)
                            .background(softWhite)
                            .cornerRadius(30)
                            .overlay(
                                RoundedRectangle(cornerRadius: 30)
                                    .stroke(Color.black, lineWidth: 1.5)
                            )
                            .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 4)
                    }
                    .padding(.horizontal, 40)
                    .transition(.opacity)
                }
                
                Spacer()
                    .frame(height: 60)
            }
        }
        .onAppear {
            startSpinAnimation()
        }
    }
    
    private var previousIndex: Int {
        (currentIndex - 1 + options.count) % options.count
    }
    
    private var nextIndex: Int {
        (currentIndex + 1) % options.count
    }
    
    private func startSpinAnimation() {
        // Find the target index for the won amount
        let targetIndex = options.firstIndex(of: appState.wonScreenTime) ?? 0
        
        // Total spins: at least 3 full rotations + land on target
        let fullRotations = 3
        var totalSteps = fullRotations * options.count
        
        // Calculate steps to land on target
        let stepsToTarget = (targetIndex - currentIndex + options.count) % options.count
        totalSteps += stepsToTarget
        
        var stepCount = 0
        
        // Spin animation with easing
        func spin() {
            guard stepCount < totalSteps else {
                // Animation complete - show result
                withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                    showResult = true
                    isSpinning = false
                }
                return
            }
            
            // Ease out - slow down as we approach the end
            let progress = Double(stepCount) / Double(totalSteps)
            
            if progress < 0.5 {
                // Fast at the beginning
                spinSpeed = 0.05
            } else if progress < 0.7 {
                spinSpeed = 0.08
            } else if progress < 0.85 {
                spinSpeed = 0.15
            } else if progress < 0.95 {
                spinSpeed = 0.25
            } else {
                // Slow down dramatically at the end
                spinSpeed = 0.4
            }
            
            withAnimation(.easeInOut(duration: spinSpeed)) {
                currentIndex = (currentIndex + 1) % options.count
            }
            
            stepCount += 1
            
            DispatchQueue.main.asyncAfter(deadline: .now() + spinSpeed) {
                spin()
            }
        }
        
        // Start spinning after a brief delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            spin()
        }
    }
}
