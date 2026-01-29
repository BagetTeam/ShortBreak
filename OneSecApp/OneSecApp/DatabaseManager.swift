//
//  DatabaseManager.swift
//  OneSecApp
//
//  SQLite database manager for tracking Instagram screen time
//  Uses native SQLite3 C API (no external dependencies)
//
//  Schema:
//  - allocated_screen_time: Total seconds available for the day (random hourly allocation)
//  - used_screen_time: Seconds already spent on Instagram today (can go negative)
//  - last_reset_date: Date string (YYYY-MM-DD) to track daily reset
//  - last_went_in: Unix timestamp when user last entered Instagram
//  - last_give_away: Unix timestamp of last hourly allocation
//

import Foundation
import SQLite3

// MARK: - Database Manager
class DatabaseManager {
    static let shared = DatabaseManager()
    
    private var db: OpaquePointer?
    
    private init() {
        setupDatabase()
    }
    
    deinit {
        if db != nil {
            sqlite3_close(db)
        }
    }
    
    // MARK: - Database Setup
    
    private func setupDatabase() {
        let path = getDocumentsDirectory().appendingPathComponent("shortbreak.sqlite3").path
        
        if sqlite3_open(path, &db) == SQLITE_OK {
            print("📂 Database path: \(path)")
            createTables()
            ensureRowExists()
            checkAndResetDaily()
        } else {
            print("❌ Failed to open database")
        }
    }
    
    private func getDocumentsDirectory() -> URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }
    
    private func createTables() {
        let createTableSQL = """
            CREATE TABLE IF NOT EXISTS screen_time (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                allocated_screen_time REAL DEFAULT 0,
                used_screen_time REAL DEFAULT 0,
                last_reset_date TEXT DEFAULT '',
                last_went_in REAL,
                last_give_away REAL
            );
        """
        
        if sqlite3_exec(db, createTableSQL, nil, nil, nil) == SQLITE_OK {
            print("✅ Tables created/verified")
        } else {
            print("❌ Failed to create tables")
        }
    }
    
    /// Ensures we always have exactly one row in the table (single user local storage)
    private func ensureRowExists() {
        let countSQL = "SELECT COUNT(*) FROM screen_time;"
        var statement: OpaquePointer?
        
        if sqlite3_prepare_v2(db, countSQL, -1, &statement, nil) == SQLITE_OK {
            if sqlite3_step(statement) == SQLITE_ROW {
                let count = sqlite3_column_int(statement, 0)
                sqlite3_finalize(statement)
                
                if count == 0 {
                    let today = getCurrentDateString()
                    let insertSQL = "INSERT INTO screen_time (allocated_screen_time, used_screen_time, last_reset_date) VALUES (0, 0, '\(today)');"
                    
                    if sqlite3_exec(db, insertSQL, nil, nil, nil) == SQLITE_OK {
                        print("✅ Initial row created with date: \(today)")
                    }
                }
            }
        } else {
            sqlite3_finalize(statement)
        }
    }
    
    // MARK: - Date Utilities
    
    private func getCurrentDateString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.timeZone = TimeZone.current
        return formatter.string(from: Date())
    }
    
    private func getCurrentUnixTime() -> Double {
        return Date().timeIntervalSince1970
    }
    
    // MARK: - Helper Methods
    
    private func executeUpdate(_ sql: String) -> Bool {
        return sqlite3_exec(db, sql, nil, nil, nil) == SQLITE_OK
    }
    
    private func queryRow() -> (allocatedScreenTime: Double, usedScreenTime: Double, lastResetDate: String, lastWentIn: Double?, lastGiveAway: Double?)? {
        let querySQL = "SELECT allocated_screen_time, used_screen_time, last_reset_date, last_went_in, last_give_away FROM screen_time LIMIT 1;"
        var statement: OpaquePointer?
        
        guard sqlite3_prepare_v2(db, querySQL, -1, &statement, nil) == SQLITE_OK else {
            return nil
        }
        
        defer { sqlite3_finalize(statement) }
        
        guard sqlite3_step(statement) == SQLITE_ROW else {
            return nil
        }
        
        let allocated = sqlite3_column_double(statement, 0)
        let used = sqlite3_column_double(statement, 1)
        
        let lastResetDatePtr = sqlite3_column_text(statement, 2)
        let lastResetDate = lastResetDatePtr != nil ? String(cString: lastResetDatePtr!) : ""
        
        let lastWentIn: Double? = sqlite3_column_type(statement, 3) != SQLITE_NULL ? sqlite3_column_double(statement, 3) : nil
        let lastGiveAway: Double? = sqlite3_column_type(statement, 4) != SQLITE_NULL ? sqlite3_column_double(statement, 4) : nil
        
        return (allocated, used, lastResetDate, lastWentIn, lastGiveAway)
    }
    
    // MARK: - Daily Reset Logic
    
    /// Check if we need to reset screen time for a new day
    func checkAndResetDaily() {
        guard db != nil else { return }
        
        let today = getCurrentDateString()
        
        if let row = queryRow() {
            if row.lastResetDate != today {
                // New day! Reset all screen time
                let updateSQL = "UPDATE screen_time SET allocated_screen_time = 0, used_screen_time = 0, last_reset_date = '\(today)', last_went_in = NULL, last_give_away = NULL;"
                if executeUpdate(updateSQL) {
                    print("🌅 Daily reset performed. New date: \(today)")
                }
            }
        }
    }
    
    // MARK: - Screen Time Allocation
    
    /// Add random screen time (called every hour by external trigger or manual action)
    /// Returns the amount of seconds added
    @discardableResult
    func addRandomScreenTime() -> Double {
        guard db != nil else { return 0 }
        
        // Ensure we're on the right day first
        checkAndResetDaily()
        
        // Generate random screen time between 1-10 minutes (60-600 seconds)
        let randomMinutes = Double.random(in: 1...10)
        let randomSeconds = randomMinutes * 60
        
        if let row = queryRow() {
            let newAllocated = row.allocatedScreenTime + randomSeconds
            let currentTime = getCurrentUnixTime()
            
            let updateSQL = "UPDATE screen_time SET allocated_screen_time = \(newAllocated), last_give_away = \(currentTime);"
            if executeUpdate(updateSQL) {
                print("🎲 Added \(Int(randomSeconds))s (\(Int(randomMinutes))min) of screen time. Total: \(Int(newAllocated))s")
                return randomSeconds
            }
        }
        
        return 0
    }
    
    /// Add specific amount of screen time (in seconds) and update lastGiveAway
    /// Used by the lottery/spinner feature
    @discardableResult
    func addScreenTime(seconds: Double) -> Bool {
        guard db != nil else { return false }
        
        checkAndResetDaily()
        
        if let row = queryRow() {
            let newAllocated = row.allocatedScreenTime + seconds
            let currentTime = getCurrentUnixTime()
            
            let updateSQL = "UPDATE screen_time SET allocated_screen_time = \(newAllocated), last_give_away = \(currentTime);"
            if executeUpdate(updateSQL) {
                print("🎰 Added \(Int(seconds))s (\(Int(seconds/60))min) of screen time. Total: \(Int(newAllocated))s")
                return true
            }
        }
        
        return false
    }
    
    /// Update only the lastGiveAway timestamp (called when starting the spinner)
    func updateLastGiveAway() {
        guard db != nil else { return }
        
        let currentTime = getCurrentUnixTime()
        let updateSQL = "UPDATE screen_time SET last_give_away = \(currentTime);"
        
        if executeUpdate(updateSQL) {
            print("⏰ Updated lastGiveAway to: \(currentTime)")
        }
    }
    
    /// Check if enough time has passed since last give away
    /// - Parameter requiredSeconds: Number of seconds that must pass (default 180 for 3 min, use 3600 for 1 hour)
    /// - Returns: Time remaining in seconds, or 0 if claim is available
    func timeUntilNextClaim(requiredSeconds: Double = 180) -> Double {
        guard db != nil else { return requiredSeconds }
        
        checkAndResetDaily()
        
        if let row = queryRow() {
            guard let lastGiveAway = row.lastGiveAway else {
                // Never claimed before, available now
                return 0
            }
            
            let currentTime = getCurrentUnixTime()
            let elapsed = currentTime - lastGiveAway
            let remaining = requiredSeconds - elapsed
            
            return max(0, remaining)
        }
        
        return 0
    }
    
    /// Check if claim is available
    func isClaimAvailable(requiredSeconds: Double = 180) -> Bool {
        return timeUntilNextClaim(requiredSeconds: requiredSeconds) <= 0
    }
    
    // MARK: - Instagram Entry/Exit Tracking
    
    /// Record when user enters Instagram (sets last_went_in to current Unix time)
    func recordInstagramEntry() {
        guard db != nil else { return }
        
        // Ensure we're on the right day first
        checkAndResetDaily()
        
        let currentTime = getCurrentUnixTime()
        let updateSQL = "UPDATE screen_time SET last_went_in = \(currentTime);"
        
        if executeUpdate(updateSQL) {
            print("📱 Recorded Instagram entry at Unix time: \(currentTime)")
        } else {
            print("❌ Record entry error")
        }
    }
    
    /// Record when user exits Instagram and calculate time spent
    /// Returns the session duration in seconds (or nil if no entry was recorded)
    @discardableResult
    func recordInstagramExit() -> Double? {
        guard db != nil else { return nil }
        
        guard let row = queryRow(), let entryTime = row.lastWentIn else {
            print("⚠️ No entry time recorded, cannot calculate session")
            return nil
        }
        
        let exitTime = getCurrentUnixTime()
        let sessionDuration = exitTime - entryTime
        let newUsed = row.usedScreenTime + sessionDuration
        
        let updateSQL = "UPDATE screen_time SET used_screen_time = \(newUsed), last_went_in = NULL;"
        
        if executeUpdate(updateSQL) {
            print("🚪 Recorded exit. Session: \(Int(sessionDuration))s. Total used: \(Int(newUsed))s")
            return sessionDuration
        }
        
        print("❌ Record exit error")
        return nil
    }
    
    // MARK: - Screen Time Queries
    
    /// Get the remaining screen time in seconds (can be negative)
    func getRemainingScreenTime() -> Double {
        guard db != nil else { return 0 }
        
        checkAndResetDaily()
        
        if let row = queryRow() {
            return row.allocatedScreenTime - row.usedScreenTime
        }
        
        return 0
    }
    
    /// Get the allocated screen time for today in seconds
    func getAllocatedScreenTime() -> Double {
        guard db != nil else { return 0 }
        
        checkAndResetDaily()
        
        if let row = queryRow() {
            return row.allocatedScreenTime
        }
        
        return 0
    }
    
    /// Get the used screen time for today in seconds
    func getUsedScreenTime() -> Double {
        guard db != nil else { return 0 }
        
        checkAndResetDaily()
        
        if let row = queryRow() {
            return row.usedScreenTime
        }
        
        return 0
    }
    
    /// Get the last entry time (Unix timestamp) or nil if not currently in session
    func getLastEntryTime() -> Double? {
        guard db != nil else { return nil }
        
        if let row = queryRow() {
            return row.lastWentIn
        }
        
        return nil
    }
    
    /// Get the last give away time (Unix timestamp) or nil
    func getLastGiveAwayTime() -> Double? {
        guard db != nil else { return nil }
        
        if let row = queryRow() {
            return row.lastGiveAway
        }
        
        return nil
    }
    
    /// Check if user has exceeded their allocated time
    func hasExceededScreenTime() -> Bool {
        return getRemainingScreenTime() < 0
    }
    
    /// Get all current data as a struct for easy access
    func getCurrentData() -> ScreenTimeData? {
        guard db != nil else { return nil }
        
        checkAndResetDaily()
        
        if let row = queryRow() {
            return ScreenTimeData(
                allocatedScreenTime: row.allocatedScreenTime,
                usedScreenTime: row.usedScreenTime,
                lastResetDate: row.lastResetDate,
                lastWentIn: row.lastWentIn,
                lastGiveAway: row.lastGiveAway
            )
        }
        
        return nil
    }
    
    // MARK: - Debug / Testing
    
    /// Reset all data (for testing purposes)
    func resetAllData() {
        guard db != nil else { return }
        
        let today = getCurrentDateString()
        let updateSQL = "UPDATE screen_time SET allocated_screen_time = 0, used_screen_time = 0, last_reset_date = '\(today)', last_went_in = NULL, last_give_away = NULL;"
        
        if executeUpdate(updateSQL) {
            print("🔄 All data reset")
        } else {
            print("❌ Reset error")
        }
    }
    
    // TODO: Remove this in production
    /// Reset allocated screen time to match used time (so remaining = 0)
    func resetAllocatedTimeToZero() {
        guard db != nil else { return }
        
        checkAndResetDaily()
        
        if let row = queryRow() {
            // Set allocated = used so remaining = 0
            let updateSQL = "UPDATE screen_time SET allocated_screen_time = \(row.usedScreenTime);"
            
            if executeUpdate(updateSQL) {
                print("Debug: Reset allocated time to \(row.usedScreenTime)s (remaining = 0)")
            } else {
                print("Reset allocated time error")
            }
        }
    }
}

// MARK: - Data Model

struct ScreenTimeData {
    let allocatedScreenTime: Double  // seconds
    let usedScreenTime: Double       // seconds
    let lastResetDate: String        // YYYY-MM-DD
    let lastWentIn: Double?          // Unix timestamp or nil
    let lastGiveAway: Double?        // Unix timestamp or nil
    
    var remainingScreenTime: Double {
        return allocatedScreenTime - usedScreenTime
    }
    
    var hasExceededTime: Bool {
        return remainingScreenTime < 0
    }
    
    /// Format remaining time as a readable string
    var remainingTimeFormatted: String {
        let remaining = remainingScreenTime
        let absRemaining = abs(remaining)
        let minutes = Int(absRemaining) / 60
        let seconds = Int(absRemaining) % 60
        
        if remaining < 0 {
            return "-\(minutes)m \(seconds)s (over limit)"
        } else {
            return "\(minutes)m \(seconds)s"
        }
    }
    
    /// Format allocated time as readable string
    var allocatedTimeFormatted: String {
        let minutes = Int(allocatedScreenTime) / 60
        let seconds = Int(allocatedScreenTime) % 60
        return "\(minutes)m \(seconds)s"
    }
    
    /// Format used time as readable string
    var usedTimeFormatted: String {
        let minutes = Int(usedScreenTime) / 60
        let seconds = Int(usedScreenTime) % 60
        return "\(minutes)m \(seconds)s"
    }
}
