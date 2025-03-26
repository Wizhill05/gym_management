import sqlite3 from "sqlite3";

const DBSOURCE = "gym.db";
const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    console.log("Connected to SQLite database.");

    // Create TRAINER table
    db.run(
      `CREATE TABLE IF NOT EXISTS trainer (
        trainer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        specialization TEXT,
        contact_number TEXT,
        hourly_rate DECIMAL(10,2)
      )`
    );

    // Create MEMBER table
    db.run(
      `CREATE TABLE IF NOT EXISTS member (
        member_id INTEGER PRIMARY KEY AUTOINCREMENT,
        trainer_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        contact_number TEXT,
        email TEXT UNIQUE,
        date_of_birth DATE,
        gender TEXT,
        FOREIGN KEY(trainer_id) REFERENCES trainer(trainer_id)
      )`
    );

    // Create MEMBERSHIP table
    db.run(
      `CREATE TABLE IF NOT EXISTS membership (
        membership_id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER UNIQUE,
        membership_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        monthly_fee DECIMAL(10,2) NOT NULL,
        payment_status TEXT NOT NULL,
        FOREIGN KEY(member_id) REFERENCES member(member_id)
      )`
    );

    // Create ATTENDANCE table
    db.run(
      `CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER,
        attendance_date DATE DEFAULT CURRENT_DATE,
        check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(member_id) REFERENCES member(member_id)
      )`
    );

    // Insert sample data for trainers
    db.run(`INSERT OR IGNORE INTO trainer (first_name, last_name, specialization, contact_number, hourly_rate) 
            VALUES ('John', 'Smith', 'Weight Training', '555-1234', 50.00)`);
    db.run(`INSERT OR IGNORE INTO trainer (first_name, last_name, specialization, contact_number, hourly_rate) 
            VALUES ('Sarah', 'Johnson', 'Yoga', '555-5678', 45.00)`);
    db.run(`INSERT OR IGNORE INTO trainer (first_name, last_name, specialization, contact_number, hourly_rate) 
            VALUES ('Mike', 'Williams', 'Cardio', '555-9012', 40.00)`);
  }
});

export default db;
