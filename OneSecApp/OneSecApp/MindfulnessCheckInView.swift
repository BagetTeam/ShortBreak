//
//  MindfulnessCheckInView.swift
//  OneSecApp
//
//  The choice screen - continue to Instagram or go to ShortBreak
//

import SwiftUI
import UIKit
import CoreText

struct MindfulnessCheckInView: View {
    @EnvironmentObject var appState: AppState
    
    // Timer for countdown
    @State private var timeUntilClaim: Double = 0
    @State private var timer: Timer?
    
    // Placeholder URL for ShortBreak web app
    private let shortBreakURL = "https://www.pleasestopscrolling.tech/"
    
    // Beige background color
    private let beigeBackground = Color(red: 0.96, green: 0.94, blue: 0.90)
    // Soft white for cards
    private let softWhite = Color(red: 0.99, green: 0.99, blue: 0.98)
    // Light grey for borders
    private let lightGrey = Color(red: 0.85, green: 0.85, blue: 0.85)
    // Gold color for claim button
    private let goldColor = Color(red: 1.0, green: 0.84, blue: 0.0)
    
    init() {
        // Register fonts from bundle if not already registered
        registerFonts()
    }
    
    private func registerFonts() {
        // Try multiple paths for Coming Soon font
        let comingSoonPaths = [
            ("ComingSoon-Regular", "ttf", "Fonts"),
            ("ComingSoon-Regular", "ttf", nil),
            ("ComingSoon", "ttf", "Fonts"),
            ("ComingSoon", "ttf", nil)
        ]
        
        for (name, ext, subdir) in comingSoonPaths {
            if let url = Bundle.main.url(forResource: name, withExtension: ext, subdirectory: subdir) {
                if let fontDataProvider = CGDataProvider(url: url as CFURL),
                   let font = CGFont(fontDataProvider) {
                    var error: Unmanaged<CFError>?
                    CTFontManagerRegisterGraphicsFont(font, &error)
                    break
                }
            }
        }
        
        // Try multiple paths for Shizuru font
        let shizuruPaths = [
            ("Shizuru-Regular", "ttf", "Fonts"),
            ("Shizuru-Regular", "ttf", nil),
            ("Shizuru", "ttf", "Fonts"),
            ("Shizuru", "ttf", nil)
        ]
        
        for (name, ext, subdir) in shizuruPaths {
            if let url = Bundle.main.url(forResource: name, withExtension: ext, subdirectory: subdir) {
                if let fontDataProvider = CGDataProvider(url: url as CFURL),
                   let font = CGFont(fontDataProvider) {
                    var error: Unmanaged<CFError>?
                    CTFontManagerRegisterGraphicsFont(font, &error)
                    break
                }
            }
        }
    }
    
    // Helper function to get Comfortaa font with fallback
    private func comfortaaFont(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        // Try different font name variations for Comfortaa
        let fontNames: [String]
        if weight == .bold {
            fontNames = ["Comfortaa-Bold", "Comfortaa Bold", "Comfortaa"]
        } else {
            fontNames = ["Comfortaa-Regular", "Comfortaa Regular", "Comfortaa"]
        }
        
        for fontName in fontNames {
            if let font = UIFont(name: fontName, size: size) {
                return Font(font)
            }
        }
        
        // If Comfortaa not found, try to find any Comfortaa font and apply weight
        if let comfortaaFont = UIFont(name: "Comfortaa", size: size) {
            let descriptor = comfortaaFont.fontDescriptor
            if weight == .bold {
                if let boldDescriptor = descriptor.withSymbolicTraits(.traitBold) {
                    return Font(UIFont(descriptor: boldDescriptor, size: size) ?? comfortaaFont)
                }
            }
            return Font(comfortaaFont)
        }
        
        // Fallback to system rounded font
        return .system(size: size, design: .rounded)
            .weight(weight)
    }
    
    // Helper function to get Coming Soon font with fallback
    private func comingSoonFont(size: CGFloat) -> Font {
        // Try many variations of the font name
        let fontNames = [
            "Coming Soon",
            "ComingSoon",
            "ComingSoon-Regular",
            "ComingSoon Regular",
            "ComingSoonRegular"
        ]
        
        for fontName in fontNames {
            if let font = UIFont(name: fontName, size: size) {
                return Font(font)
            }
        }
        
        // Try to find any font containing "Coming" in the family name
        for family in UIFont.familyNames.sorted() {
            if family.lowercased().contains("coming") {
                if let font = UIFont(name: family, size: size) {
                    return Font(font)
                }
                // Try with Regular suffix
                if let font = UIFont(name: "\(family)-Regular", size: size) {
                    return Font(font)
                }
            }
        }
        
        // Fallback to system font
        return .system(size: size)
    }
    
    // Helper function to get Shizuru font with fallback
    private func shizuruFont(size: CGFloat) -> Font {
        // Try many variations of the font name
        let fontNames = [
            "Shizuru",
            "Shizuru-Regular",
            "Shizuru Regular",
            "ShizuruRegular"
        ]
        
        for fontName in fontNames {
            if let font = UIFont(name: fontName, size: size) {
                return Font(font)
            }
        }
        
        // Try to find any font containing "Shizuru" in the family name
        for family in UIFont.familyNames.sorted() {
            if family.lowercased().contains("shizuru") {
                if let font = UIFont(name: family, size: size) {
                    return Font(font)
                }
                // Try with Regular suffix
                if let font = UIFont(name: "\(family)-Regular", size: size) {
                    return Font(font)
                }
            }
        }
        
        // Fallback to system font with rounded design
        return .system(size: size, design: .rounded)
    }
    
    var body: some View {
        ZStack {
            // Beige background
            beigeBackground
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // ShortBreak title at the very top
                Text("ShortBreak")
                    .font(shizuruFont(size: 40))
                    .foregroundColor(.black)
                    .shadow(color: Color.black.opacity(0.3), radius: 2, x: 0, y: 1)
                    .padding(.top, 60)
                
                // Reindeer image below title
                Image("Reindeer")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(maxWidth: 200, maxHeight: 200)
                    .padding(.top, 10)
                
                // Screen Time Display
                screenTimeDisplay
                    .padding(.top, 12)
                
                // Claim Time Button
                claimTimeButton
                    .padding(.top, 12)
                
                Spacer()
                    .frame(minHeight: 16)
                
                // Description text directly above cards
                Text("access instagram with limited time or scroll a custom educational feed")
                    .font(comingSoonFont(size: 14))
                    .foregroundColor(.black.opacity(0.7))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
                    .padding(.bottom, 16)
                
                // Two large vertically stacked cards
                VStack(spacing: 16) {
                    // First card: Continue to Instagram
                    let hasTime = (appState.screenTimeData?.remainingScreenTime ?? 0) > 0
                    
                    Button(action: {
                        if hasTime {
                            handleContinueToInsta()
                        }
                    }) {
                        VStack(spacing: 4) {
                            Text(hasTime ? "Continue on IG" : "No time available")
                                .font(comingSoonFont(size: 18))
                                .foregroundColor(hasTime ? .black : .black.opacity(0.4))
                            
                            if !hasTime {
                                Text("Claim time above to continue")
                                    .font(comingSoonFont(size: 12))
                                    .foregroundColor(.black.opacity(0.3))
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 70)
                        .background(hasTime ? softWhite : softWhite.opacity(0.6))
                        .cornerRadius(30)
                        .overlay(
                            RoundedRectangle(cornerRadius: 30)
                                .stroke(hasTime ? Color.black : Color.black.opacity(0.3), lineWidth: 1.5)
                        )
                        .shadow(color: Color.black.opacity(hasTime ? 0.1 : 0.03), radius: 8, x: 0, y: 4)
                    }
                    .disabled(!hasTime)
                    .padding(.horizontal, 40)
                    
                    // Second card: ShortBreak Website
                    Button(action: {
                        handleGoToShortBreak()
                    }) {
                        Text("Bring me to ShortBreak")
                            .font(comingSoonFont(size: 18))
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .frame(height: 70)
                            .background(softWhite)
                            .cornerRadius(30)
                            .overlay(
                                RoundedRectangle(cornerRadius: 30)
                                    .stroke(Color.black, lineWidth: 1.5)
                            )
                            .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 4)
                    }
                    .padding(.horizontal, 40)
                }
                .padding(.bottom, 50)
            }
        }
        .onAppear {
            appState.refreshScreenTimeData()
            startCountdownTimer()
        }
        .onDisappear {
            stopCountdownTimer()
        }
    }
    
    // MARK: - Claim Time Button
    
    private var claimTimeButton: some View {
        let isAvailable = timeUntilClaim <= 0
        
        return Button(action: {
            if isAvailable {
                stopCountdownTimer()
                appState.startSpinner()
            }
        }) {
            HStack(spacing: 8) {
                Image(systemName: isAvailable ? "gift.fill" : "clock")
                    .font(.system(size: 16))
                
                if isAvailable {
                    Text("Claim Time!")
                        .font(comingSoonFont(size: 16))
                } else {
                    Text("Next claim in \(formatCountdown(timeUntilClaim))")
                        .font(comingSoonFont(size: 14))
                }
            }
            .foregroundColor(isAvailable ? .black : .black.opacity(0.5))
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(
                isAvailable ?
                    LinearGradient(
                        colors: [goldColor, goldColor.opacity(0.8)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ) :
                    LinearGradient(
                        colors: [softWhite, softWhite],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
            )
            .cornerRadius(20)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(isAvailable ? goldColor : Color.black.opacity(0.2), lineWidth: isAvailable ? 2 : 1)
            )
            .shadow(color: isAvailable ? goldColor.opacity(0.3) : Color.black.opacity(0.05), radius: isAvailable ? 8 : 4, x: 0, y: 2)
            .scaleEffect(isAvailable ? 1.0 : 0.95)
            .animation(.spring(response: 0.3), value: isAvailable)
        }
        .disabled(!isAvailable)
    }
    
    // MARK: - Countdown Timer
    
    private func startCountdownTimer() {
        // Get initial value
        timeUntilClaim = appState.timeUntilNextClaim()
        
        // Start timer to update every second
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            timeUntilClaim = appState.timeUntilNextClaim()
        }
    }
    
    private func stopCountdownTimer() {
        timer?.invalidate()
        timer = nil
    }
    
    private func formatCountdown(_ seconds: Double) -> String {
        let mins = Int(seconds) / 60
        let secs = Int(seconds) % 60
        
        if mins > 0 {
            return String(format: "%d:%02d", mins, secs)
        } else {
            return "\(secs)s"
        }
    }
    
    // MARK: - Screen Time Display
    
    private var screenTimeDisplay: some View {
        let remaining = appState.screenTimeData?.remainingScreenTime ?? 0
        let allocated = appState.screenTimeData?.allocatedScreenTime ?? 0
        let used = appState.screenTimeData?.usedScreenTime ?? 0
        
        return VStack(spacing: 8) {
            // Main remaining time
            HStack(spacing: 8) {
                Image(systemName: "clock")
                    .font(.system(size: 18))
                    .foregroundColor(remaining < 0 ? .red : .black.opacity(0.7))
                
                Text("Time Left:")
                    .font(comingSoonFont(size: 16))
                    .foregroundColor(.black.opacity(0.7))
                
                Text(formatTime(remaining))
                    .font(comingSoonFont(size: 18))
                    .fontWeight(.semibold)
                    .foregroundColor(remaining < 0 ? .red : .black)
            }
            
            // Subtitle with allocated/used
            if allocated > 0 || used > 0 {
                Text("\(formatTime(allocated)) allocated · \(formatTime(used)) used")
                    .font(comingSoonFont(size: 12))
                    .foregroundColor(.black.opacity(0.5))
            } else {
                Text("No time allocated yet")
                    .font(comingSoonFont(size: 12))
                    .foregroundColor(.black.opacity(0.5))
            }
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 24)
        .background(softWhite.opacity(0.8))
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(remaining < 0 ? Color.red.opacity(0.5) : Color.black.opacity(0.2), lineWidth: 1)
        )
    }
    
    private func formatTime(_ seconds: Double) -> String {
        let absSeconds = abs(seconds)
        let mins = Int(absSeconds) / 60
        let secs = Int(absSeconds) % 60
        
        let prefix = seconds < 0 ? "-" : ""
        
        if mins > 0 {
            return "\(prefix)\(mins)m \(secs)s"
        } else {
            return "\(prefix)\(secs)s"
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
