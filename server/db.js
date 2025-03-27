import sqlite3 from "sqlite3";

const DBSOURCE = "hospital.db";

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DBSOURCE, async (err) => {
      if (err) {
        console.error("Error opening database", err);
        reject(err);
        return;
      }

      console.log("Connected to SQLite database.");

      try {
        // Wrap table creation in promises
        await createTables(db);
        await insertSampleData(db);
        resolve(db);
      } catch (error) {
        reject(error);
      }
    });
  });
};

const createTables = (db) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create DOCTOR table
      db.run(
        `CREATE TABLE IF NOT EXISTS doctor (
          doctor_id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          specialization TEXT NOT NULL,
          contact_number TEXT,
          email TEXT UNIQUE,
          qualification TEXT,
          consultation_fee DECIMAL(10,2)
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Create PATIENT table
      db.run(
        `CREATE TABLE IF NOT EXISTS patient (
          patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          date_of_birth DATE NOT NULL,
          gender TEXT NOT NULL,
          contact_number TEXT,
          email TEXT UNIQUE,
          blood_group TEXT,
          address TEXT,
          emergency_contact TEXT
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Create DISEASE table
      db.run(
        `CREATE TABLE IF NOT EXISTS disease (
          disease_id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          symptoms TEXT,
          severity TEXT,
          is_contagious BOOLEAN DEFAULT 0
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Create CHECKIN table
      db.run(
        `CREATE TABLE IF NOT EXISTS checkin (
          checkin_id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          doctor_id INTEGER NOT NULL,
          disease_id INTEGER NOT NULL,
          checkin_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT NOT NULL,
          symptoms TEXT,
          diagnosis TEXT,
          prescription TEXT,
          follow_up_date DATE,
          FOREIGN KEY(patient_id) REFERENCES patient(patient_id),
          FOREIGN KEY(doctor_id) REFERENCES doctor(doctor_id),
          FOREIGN KEY(disease_id) REFERENCES disease(disease_id)
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Create MEDICAL_HISTORY table
      db.run(
        `CREATE TABLE IF NOT EXISTS medical_history (
          history_id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          disease_id INTEGER NOT NULL,
          diagnosis_date DATE NOT NULL,
          treatment TEXT,
          notes TEXT,
          is_chronic BOOLEAN DEFAULT 0,
          FOREIGN KEY(patient_id) REFERENCES patient(patient_id),
          FOREIGN KEY(disease_id) REFERENCES disease(disease_id)
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      resolve();
    });
  });
};

const insertSampleData = (db) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Insert sample data for doctors
      db.run(
        `INSERT OR IGNORE INTO doctor (first_name, last_name, specialization, contact_number, email, qualification, consultation_fee) 
        VALUES ('John', 'Smith', 'Cardiology', '555-1234', 'john.smith@hospital.com', 'MD, Cardiology', 150.00)`,
        (err) => {
          if (err) reject(err);
        }
      );

      db.run(
        `INSERT OR IGNORE INTO doctor (first_name, last_name, specialization, contact_number, email, qualification, consultation_fee) 
        VALUES ('Sarah', 'Johnson', 'Pediatrics', '555-5678', 'sarah.johnson@hospital.com', 'MD, Pediatrics', 100.00)`,
        (err) => {
          if (err) reject(err);
        }
      );

      db.run(
        `INSERT OR IGNORE INTO doctor (first_name, last_name, specialization, contact_number, email, qualification, consultation_fee) 
        VALUES ('Mike', 'Williams', 'Orthopedics', '555-9012', 'mike.williams@hospital.com', 'MD, Orthopedics', 120.00)`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Insert sample patients
      db.run(
        `INSERT OR IGNORE INTO patient (first_name, last_name, date_of_birth, gender, contact_number, email, blood_group, address, emergency_contact) 
        VALUES ('Alice', 'Brown', '1985-04-12', 'Female', '555-1111', 'alice.brown@email.com', 'A+', '123 Main St', '555-2222')`,
        (err) => {
          if (err) reject(err);
        }
      );

      db.run(
        `INSERT OR IGNORE INTO patient (first_name, last_name, date_of_birth, gender, contact_number, email, blood_group, address, emergency_contact) 
        VALUES ('Bob', 'Davis', '1978-09-23', 'Male', '555-3333', 'bob.davis@email.com', 'O-', '456 Oak Ave', '555-4444')`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Insert sample diseases
      db.run(
        `INSERT OR IGNORE INTO disease (name, description, symptoms, severity, is_contagious) 
        VALUES ('Common Cold', 'Viral infection of the upper respiratory tract', 'Runny nose, sore throat, cough', 'Mild', 1)`,
        (err) => {
          if (err) reject(err);
        }
      );

      db.run(
        `INSERT OR IGNORE INTO disease (name, description, symptoms, severity, is_contagious) 
        VALUES ('Hypertension', 'High blood pressure condition', 'Headache, shortness of breath', 'Moderate', 0)`,
        (err) => {
          if (err) reject(err);
        }
      );

      db.run(
        `INSERT OR IGNORE INTO disease (name, description, symptoms, severity, is_contagious) 
        VALUES ('Type 2 Diabetes', 'Metabolic disorder affecting blood sugar levels', 'Increased thirst, frequent urination', 'Severe', 0)`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Insert sample medical history records
      db.run(
        `INSERT OR IGNORE INTO medical_history (patient_id, disease_id, diagnosis_date, treatment, notes, is_chronic) 
        VALUES (1, 2, '2022-03-15', 'Prescribed medication and lifestyle changes', 'Patient advised to reduce salt intake and exercise regularly', 1)`,
        (err) => {
          if (err) reject(err);
        }
      );

      db.run(
        `INSERT OR IGNORE INTO medical_history (patient_id, disease_id, diagnosis_date, treatment, notes, is_chronic) 
        VALUES (1, 1, '2023-01-10', 'Rest and fluids', 'Patient recovered within a week', 0)`,
        (err) => {
          if (err) reject(err);
        }
      );

      db.run(
        `INSERT OR IGNORE INTO medical_history (patient_id, disease_id, diagnosis_date, treatment, notes, is_chronic) 
        VALUES (2, 3, '2021-11-05', 'Insulin therapy and diet management', 'Regular monitoring of blood sugar levels required', 1)`,
        (err) => {
          if (err) reject(err);
        }
      );

      resolve();
    });
  });
};

let db = null;

export const getDatabase = async () => {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
};
