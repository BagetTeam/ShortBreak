//
//  ContentView.swift
//  OneSecApp
//
//  Main content view that shows choice screen or home
//

import SwiftUI
import UIKit
import CoreText

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
    
    // Your iCloud shortcut link for "OneSec Gate"
    let shortcutInstallURL = "https://www.icloud.com/shortcuts/393fbb98ca1d4af8bd9061ae245b4b42"
    
    // Beige background color
    private let beigeBackground = Color(red: 0.96, green: 0.94, blue: 0.90)
    // Soft white for cards
    private let softWhite = Color(red: 0.99, green: 0.99, blue: 0.98)
    
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
    
    // Helper function to get Coming Soon font with fallback
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
    
    // Helper function to get Shizuru font with fallback
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
                
                // Green cat image below title
                Image("GreenCat")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(maxWidth: 280, maxHeight: 280)
                    .padding(.top, 20)
                
                Spacer()
                    .frame(minHeight: 40)
                
                // Setup section
                VStack(spacing: 16) {
                    Text("Setup in 2 steps")
                        .font(comingSoonFont(size: 18))
                        .foregroundColor(.black)
                    
                    // Step 1: Install Shortcut
                    Button(action: {
                        if let url = URL(string: shortcutInstallURL) {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack {
                            Text("1")
                                .font(comingSoonFont(size: 16))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .frame(width: 32, height: 32)
                                .background(softWhite)
                                .overlay(
                                    Circle()
                                        .stroke(Color.black, lineWidth: 1.5)
                                )
                                .clipShape(Circle())
                            Text("Install 'ShortBreak' Shortcut")
                                .font(comingSoonFont(size: 18))
                                .foregroundColor(.black)
                            Spacer()
                            Image(systemName: "arrow.up.right.square")
                                .foregroundColor(.black)
                        }
                        .padding()
                        .background(softWhite)
                        .cornerRadius(30)
                        .overlay(
                            RoundedRectangle(cornerRadius: 30)
                                .stroke(Color.black, lineWidth: 1.5)
                        )
                        .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 4)
                    }
                    
                    // Step 2: Create Automation
                    Button(action: {
                        showSetupGuide = true
                    }) {
                        HStack {
                            Text("2")
                                .font(comingSoonFont(size: 16))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .frame(width: 32, height: 32)
                                .background(softWhite)
                                .overlay(
                                    Circle()
                                        .stroke(Color.black, lineWidth: 1.5)
                                )
                                .clipShape(Circle())
                            Text("Create Instagram Automation")
                                .font(comingSoonFont(size: 18))
                                .foregroundColor(.black)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.black)
                        }
                        .padding()
                        .background(softWhite)
                        .cornerRadius(30)
                        .overlay(
                            RoundedRectangle(cornerRadius: 30)
                                .stroke(Color.black, lineWidth: 1.5)
                        )
                        .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 4)
                    }
                }
                .padding(.horizontal, 40)
                .padding(.bottom, 80)
            }
        }
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
                        StepRow(number: "7", text: "Select 'ShortBreak shortcut'")
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
