//
//  ContentView.swift
//  OneSecApp
//
//  Main content view that shows mindfulness screen or home
//

import SwiftUI

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
    var body: some View {
        VStack(spacing: 30) {
            Image(systemName: "leaf.fill")
                .font(.system(size: 60))
                .foregroundColor(.green)
            
            Text("One Sec")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("Take a moment before you scroll")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}
