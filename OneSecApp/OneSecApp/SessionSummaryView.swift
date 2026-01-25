//
//  SessionSummaryView.swift
//  OneSecApp
//
//  Shows session summary after user exits Instagram
//  Displays time spent and remaining screen time
//

import SwiftUI
import UIKit
import CoreText

struct SessionSummaryView: View {
    @EnvironmentObject var appState: AppState
    
    // Beige background color
    private let beigeBackground = Color(red: 0.96, green: 0.94, blue: 0.90)
    // Soft white for cards
    private let softWhite = Color(red: 0.99, green: 0.99, blue: 0.98)
    
    init() {
        registerFonts()
    }
    
    private func registerFonts() {
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
    
    private func comingSoonFont(size: CGFloat) -> Font {
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
        
        for family in UIFont.familyNames.sorted() {
            if family.lowercased().contains("coming") {
                if let font = UIFont(name: family, size: size) {
                    return Font(font)
                }
                if let font = UIFont(name: "\(family)-Regular", size: size) {
                    return Font(font)
                }
            }
        }
        
        return .system(size: size)
    }
    
    private func shizuruFont(size: CGFloat) -> Font {
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
        
        for family in UIFont.familyNames.sorted() {
            if family.lowercased().contains("shizuru") {
                if let font = UIFont(name: family, size: size) {
                    return Font(font)
                }
                if let font = UIFont(name: "\(family)-Regular", size: size) {
                    return Font(font)
                }
            }
        }
        
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
                
                Spacer()
                    .frame(height: 40)
                
                // Session Summary Card
                VStack(spacing: 24) {
                    Text("Session Complete")
                        .font(comingSoonFont(size: 28))
                        .foregroundColor(.black)
                    
                    // Time spent on Instagram
                    VStack(spacing: 8) {
                        Text("Time on Instagram")
                            .font(comingSoonFont(size: 16))
                            .foregroundColor(.black.opacity(0.6))
                        
                        Text(appState.formatDuration(appState.lastSessionDuration))
                            .font(shizuruFont(size: 48))
                            .foregroundColor(.black)
                    }
                    .padding(.vertical, 20)
                    .frame(maxWidth: .infinity)
                    .background(softWhite)
                    .cornerRadius(20)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.black, lineWidth: 1.5)
                    )
                    
                    // Remaining screen time
                    VStack(spacing: 8) {
                        Text("Remaining Today")
                            .font(comingSoonFont(size: 16))
                            .foregroundColor(.black.opacity(0.6))
                        
                        let remaining = appState.screenTimeData?.remainingScreenTime ?? 0
                        Text(formatRemainingTime(remaining))
                            .font(shizuruFont(size: 36))
                            .foregroundColor(remaining < 0 ? .red : .black)
                        
                        if remaining < 0 {
                            Text("Over limit!")
                                .font(comingSoonFont(size: 14))
                                .foregroundColor(.red)
                        }
                    }
                    .padding(.vertical, 20)
                    .frame(maxWidth: .infinity)
                    .background(softWhite)
                    .cornerRadius(20)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(remaining < 0 ? Color.red : Color.black, lineWidth: 1.5)
                    )
                    
                    // Stats row
                    HStack(spacing: 20) {
                        // Allocated today
                        VStack(spacing: 4) {
                            Text("Allocated")
                                .font(comingSoonFont(size: 12))
                                .foregroundColor(.black.opacity(0.5))
                            Text(appState.screenTimeData?.allocatedTimeFormatted ?? "0m 0s")
                                .font(comingSoonFont(size: 16))
                                .foregroundColor(.black)
                        }
                        .frame(maxWidth: .infinity)
                        
                        Divider()
                            .frame(height: 40)
                        
                        // Used today
                        VStack(spacing: 4) {
                            Text("Used")
                                .font(comingSoonFont(size: 12))
                                .foregroundColor(.black.opacity(0.5))
                            Text(appState.screenTimeData?.usedTimeFormatted ?? "0m 0s")
                                .font(comingSoonFont(size: 16))
                                .foregroundColor(.black)
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .padding(.vertical, 16)
                    .background(softWhite.opacity(0.5))
                    .cornerRadius(16)
                }
                .padding(.horizontal, 40)
                
                Spacer()
                
                // Dismiss button - exits to iOS home screen
                Button(action: {
                    appState.dismissSessionSummary()
                    // Suspend the app to go back to iOS home screen
                    suspendApp()
                }) {
                    Text("Done")
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
                .padding(.bottom, 60)
            }
        }
    }
    
    private var remaining: Double {
        appState.screenTimeData?.remainingScreenTime ?? 0
    }
    
    private func formatRemainingTime(_ seconds: Double) -> String {
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
    
    /// Suspends the app and returns to iOS home screen
    private func suspendApp() {
        UIControl().sendAction(#selector(URLSessionTask.suspend), to: UIApplication.shared, for: nil)
    }
}
