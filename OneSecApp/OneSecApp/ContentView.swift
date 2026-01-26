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
            if appState.shouldShowSpinner {
                TimeSpinnerView()
            } else if appState.shouldShowSessionSummary {
                SessionSummaryView()
            } else if appState.shouldShowMindfulness {
                MindfulnessCheckInView()
            } else {
                HomeView()
            }
        }
    }
}

struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var appState: AppState
    @State private var showSetupGuide = false
    
    // Shortcut links
    let entryShortcutURL = "https://www.icloud.com/shortcuts/72d884ee96b44ecdb8e9a452cb03a1ad"  // ShortBreak Entry
    let exitShortcutURL = "https://www.icloud.com/shortcuts/7a5f3e08e76d440a96d1bc55fe495e9f"   // ShortBreak Exit
    // Shortcut links
    let entryShortcutURL = "https://www.icloud.com/shortcuts/72d884ee96b44ecdb8e9a452cb03a1ad"  // ShortBreak Entry
    let exitShortcutURL = "https://www.icloud.com/shortcuts/7a5f3e08e76d440a96d1bc55fe495e9f"   // ShortBreak Exit
    
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
                    .frame(maxWidth: 500, maxHeight: 500)
                    .padding(.top, 20)
                
                // View Stats button below cat
                Button(action: {
                    appState.shouldShowMindfulness = true
                }) {
                    Text("View Stats")
                        .font(comingSoonFont(size: 16))
                        .foregroundColor(.black)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(softWhite)
                        .cornerRadius(20)
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(Color.black, lineWidth: 1.5)
                        )
                        .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
                }
                .padding(.top, 20)
                
                Spacer()
                    .frame(minHeight: 40)
                
                // Setup section
                VStack(spacing: 12) {
                    Text("Setup in 3 steps")
                VStack(spacing: 12) {
                    Text("Setup in 3 steps")
                        .font(comingSoonFont(size: 18))
                        .foregroundColor(.black)
                    
                    // Step 1: Install Entry Shortcut
                    // Step 1: Install Entry Shortcut
                    Button(action: {
                        if let url = URL(string: entryShortcutURL) {
                        if let url = URL(string: entryShortcutURL) {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack {
                            Text("1")
                                .font(comingSoonFont(size: 14))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .frame(width: 28, height: 28)
                                .frame(width: 28, height: 28)
                                .background(softWhite)
                                .overlay(
                                    Circle()
                                        .stroke(Color.black, lineWidth: 1.5)
                                )
                                .clipShape(Circle())
                            Text("Install 'Entry' Shortcut")
                                .font(comingSoonFont(size: 16))
                                .foregroundColor(.black)
                            Spacer()
                            Image(systemName: "arrow.up.right.square")
                                .foregroundColor(.black)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .background(softWhite)
                        .cornerRadius(25)
                        .cornerRadius(25)
                        .overlay(
                            RoundedRectangle(cornerRadius: 25)
                            RoundedRectangle(cornerRadius: 25)
                                .stroke(Color.black, lineWidth: 1.5)
                        )
                        .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 3)
                        .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 3)
                    }
                    
                    // Step 2: Install Exit Shortcut
                    Button(action: {
                        if let url = URL(string: exitShortcutURL) {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack {
                            Text("2")
                                .font(comingSoonFont(size: 14))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .frame(width: 28, height: 28)
                                .background(softWhite)
                                .overlay(
                                    Circle()
                                        .stroke(Color.black, lineWidth: 1.5)
                                )
                                .clipShape(Circle())
                            Text("Install 'Exit' Shortcut")
                                .font(comingSoonFont(size: 16))
                                .foregroundColor(.black)
                            Spacer()
                            Image(systemName: "arrow.up.right.square")
                                .foregroundColor(.black)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .background(softWhite)
                        .cornerRadius(25)
                        .overlay(
                            RoundedRectangle(cornerRadius: 25)
                                .stroke(Color.black, lineWidth: 1.5)
                        )
                        .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 3)
                    }
                    
                    // Step 3: Create Automations
                    Button(action: {
                        if let url = URL(string: "shortcuts://") {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack {
                            Text("3")
                                .font(comingSoonFont(size: 14))
                                .fontWeight(.bold)
                                .foregroundColor(.black)
                                .frame(width: 28, height: 28)
                                .frame(width: 28, height: 28)
                                .background(softWhite)
                                .overlay(
                                    Circle()
                                        .stroke(Color.black, lineWidth: 1.5)
                                )
                                .clipShape(Circle())
                            Text("Create Automations")
                                .font(comingSoonFont(size: 16))
                            Text("Create Automations")
                                .font(comingSoonFont(size: 16))
                                .foregroundColor(.black)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.black)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .background(softWhite)
                        .cornerRadius(25)
                        .cornerRadius(25)
                        .overlay(
                            RoundedRectangle(cornerRadius: 25)
                            RoundedRectangle(cornerRadius: 25)
                                .stroke(Color.black, lineWidth: 1.5)
                        )
                        .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 3)
                        .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 3)
                    }
                }
                .padding(.horizontal, 40)
                .padding(.bottom, 60)
                .padding(.bottom, 60)
            }
        }
        .sheet(isPresented: $showSetupGuide) {
            AutomationGuideView()
        }
    }
}

// Guide for creating both automations (entry and exit)
// Guide for creating both automations (entry and exit)
struct AutomationGuideView: View {
    @Environment(\.dismiss) var dismiss
    @State private var selectedTab = 0
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                VStack(spacing: 20) {
                    Image(systemName: "gearshape.2.fill")
                        .font(.system(size: 40))
                        .font(.system(size: 40))
                        .foregroundColor(.green)
                        .padding(.top, 30)
                        .padding(.top, 30)
                    
                    Text("Create 2 Automations")
                    Text("Create 2 Automations")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("You need both automations to track screen time")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    // Tab picker
                    Picker("Automation", selection: $selectedTab) {
                        Text("Entry").tag(0)
                        Text("Exit").tag(1)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, 24)
                    
                    if selectedTab == 0 {
                        // Entry Automation
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Image(systemName: "arrow.right.circle.fill")
                                    .foregroundColor(.blue)
                                Text("When Instagram Opens")
                                    .font(.headline)
                            }
                            .padding(.bottom, 8)
                            
                            VStack(alignment: .leading, spacing: 16) {
                                StepRow(number: "1", text: "Open the Shortcuts app")
                                StepRow(number: "2", text: "Go to the Automation tab")
                                StepRow(number: "3", text: "Tap + → Create Personal Automation")
                                StepRow(number: "4", text: "Select App → Instagram")
                                StepRow(number: "5", text: "Choose 'Is Opened' → Tap Next")
                                StepRow(number: "6", text: "Add action: Run Shortcut")
                                StepRow(number: "7", text: "Select the 'Entry' shortcut")
                                StepRow(number: "8", text: "Tap Next → Turn OFF 'Ask Before Running'")
                                StepRow(number: "9", text: "Tap Done!")
                            }
                        }
                        .padding(20)
                        .background(Color.blue.opacity(0.05))
                        .cornerRadius(16)
                        .padding(.horizontal, 24)
                    } else {
                        // Exit Automation
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Image(systemName: "arrow.left.circle.fill")
                                    .foregroundColor(.orange)
                                Text("When Instagram Closes")
                                    .font(.headline)
                            }
                            .padding(.bottom, 8)
                            
                            VStack(alignment: .leading, spacing: 16) {
                                StepRow(number: "1", text: "Open the Shortcuts app")
                                StepRow(number: "2", text: "Go to the Automation tab")
                                StepRow(number: "3", text: "Tap + → Create Personal Automation")
                                StepRow(number: "4", text: "Select App → Instagram")
                                StepRow(number: "5", text: "Choose 'Is Closed' → Tap Next")
                                StepRow(number: "6", text: "Add action: Run Shortcut")
                                StepRow(number: "7", text: "Select the 'Exit' shortcut")
                                StepRow(number: "8", text: "Tap Next → Turn OFF 'Ask Before Running'")
                                StepRow(number: "9", text: "Tap Done!")
                            }
                        }
                        .padding(20)
                        .background(Color.orange.opacity(0.05))
                        .cornerRadius(16)
                        .padding(.horizontal, 24)
                    }
                    Text("You need both automations to track screen time")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    
                    // Tab picker
                    Picker("Automation", selection: $selectedTab) {
                        Text("Entry").tag(0)
                        Text("Exit").tag(1)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, 24)
                    
                    if selectedTab == 0 {
                        // Entry Automation
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Image(systemName: "arrow.right.circle.fill")
                                    .foregroundColor(.blue)
                                Text("When Instagram Opens")
                                    .font(.headline)
                            }
                            .padding(.bottom, 8)
                            
                            VStack(alignment: .leading, spacing: 16) {
                                StepRow(number: "1", text: "Open the Shortcuts app")
                                StepRow(number: "2", text: "Go to the Automation tab")
                                StepRow(number: "3", text: "Tap + → Create Personal Automation")
                                StepRow(number: "4", text: "Select App → Instagram")
                                StepRow(number: "5", text: "Choose 'Is Opened' → Tap Next")
                                StepRow(number: "6", text: "Add action: Run Shortcut")
                                StepRow(number: "7", text: "Select the 'Entry' shortcut")
                                StepRow(number: "8", text: "Tap Next → Turn OFF 'Ask Before Running'")
                                StepRow(number: "9", text: "Tap Done!")
                            }
                        }
                        .padding(20)
                        .background(Color.blue.opacity(0.05))
                        .cornerRadius(16)
                        .padding(.horizontal, 24)
                    } else {
                        // Exit Automation
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Image(systemName: "arrow.left.circle.fill")
                                    .foregroundColor(.orange)
                                Text("When Instagram Closes")
                                    .font(.headline)
                            }
                            .padding(.bottom, 8)
                            
                            VStack(alignment: .leading, spacing: 16) {
                                StepRow(number: "1", text: "Open the Shortcuts app")
                                StepRow(number: "2", text: "Go to the Automation tab")
                                StepRow(number: "3", text: "Tap + → Create Personal Automation")
                                StepRow(number: "4", text: "Select App → Instagram")
                                StepRow(number: "5", text: "Choose 'Is Closed' → Tap Next")
                                StepRow(number: "6", text: "Add action: Run Shortcut")
                                StepRow(number: "7", text: "Select the 'Exit' shortcut")
                                StepRow(number: "8", text: "Tap Next → Turn OFF 'Ask Before Running'")
                                StepRow(number: "9", text: "Tap Done!")
                            }
                        }
                        .padding(20)
                        .background(Color.orange.opacity(0.05))
                        .cornerRadius(16)
                        .padding(.horizontal, 24)
                    }
                    
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
                        .frame(maxWidth: .infinity)
                        .frame(maxWidth: .infinity)
                        .background(Color.blue)
                        .cornerRadius(12)
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 10)
                    .padding(.horizontal, 24)
                    .padding(.top, 10)
                    
                    Spacer(minLength: 30)
                    Spacer(minLength: 30)
                }
            }
            .navigationTitle("Setup Automations")
            .navigationTitle("Setup Automations")
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
