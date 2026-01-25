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
    
    // Placeholder URL for ShortBreak web app
    private let shortBreakURL = "https://github.com/BagetTeam"
    
    // Beige background color
    private let beigeBackground = Color(red: 0.96, green: 0.94, blue: 0.90)
    // Soft white for cards
    private let softWhite = Color(red: 0.99, green: 0.99, blue: 0.98)
    // Light grey for borders
    private let lightGrey = Color(red: 0.85, green: 0.85, blue: 0.85)
    
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
                    .frame(maxWidth: 280, maxHeight: 280)
                    .padding(.top, 20)
                
                Spacer()
                    .frame(minHeight: 40)
                
                // Description text directly above cards
                Text("access instagram with limited time or scroll a custom educational feed")
                    .font(comingSoonFont(size: 16))
                    .foregroundColor(.black.opacity(0.7))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
                    .padding(.bottom, 20)
                
                // Two large vertically stacked cards
                VStack(spacing: 24) {
                    // First card: Continue to Instagram
                    Button(action: {
                        handleContinueToInsta()
                    }) {
                        Text("Continue on Insta")
                            .font(comingSoonFont(size: 20))
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .frame(height: 80)
                            .background(softWhite)
                            .cornerRadius(30)
                            .overlay(
                                RoundedRectangle(cornerRadius: 30)
                                    .stroke(Color.black, lineWidth: 1.5)
                            )
                            .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 4)
                    }
                    .padding(.horizontal, 40)
                    
                    // Second card: ShortBreak Website
                    Button(action: {
                        handleGoToShortBreak()
                    }) {
                        Text("Bring me to ShortBreak")
                            .font(comingSoonFont(size: 20))
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .frame(height: 80)
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
                .padding(.bottom, 80)
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
