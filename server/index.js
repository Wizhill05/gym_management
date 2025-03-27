import express from "express";
import cors from "cors";
import { getDatabase } from "./db.js";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

let db;

// Initialize database before starting the server
const initializeApp = async () => {
  try {
    db = await getDatabase();

    // Start the server only after database is initialized
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
};

// Initialize the application
initializeApp();

// Helper functions
const getPatient = (patientId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM patient WHERE patient_id = ?",
      [patientId],
      (err, row) => {
        if (err) reject(err);
        if (!row) reject(new Error("Patient not found"));
        resolve(row);
      }
    );
  });
};

const getDoctor = (doctorId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM doctor WHERE doctor_id = ?",
      [doctorId],
      (err, row) => {
        if (err) reject(err);
        if (!row) reject(new Error("Doctor not found"));
        resolve(row);
      }
    );
  });
};

const getDisease = (diseaseId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM disease WHERE disease_id = ?",
      [diseaseId],
      (err, row) => {
        if (err) reject(err);
        if (!row) reject(new Error("Disease not found"));
        resolve(row);
      }
    );
  });
};

// PATIENT ENDPOINTS

// Get all patients
app.get("/api/patients", (req, res) => {
  db.all(
    "SELECT * FROM patient ORDER BY last_name, first_name",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get patient by ID
app.post("/api/patients", (req, res) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    gender,
    contact_number,
    email,
    blood_group,
    address,
    emergency_contact,
  } = req.body;

  if (!first_name || !last_name || !date_of_birth || !gender) {
    return res.status(400).json({
      error: "First name, last name, date of birth, and gender are required",
    });
  }

  const query = `
    INSERT INTO patient (
      first_name, last_name, date_of_birth, gender, 
      contact_number, email, blood_group, address, emergency_contact
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      first_name,
      last_name,
      date_of_birth,
      gender,
      contact_number,
      email,
      blood_group,
      address,
      emergency_contact,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Patient created successfully",
        patient_id: this.lastID,
      });
    }
  );
});

// Update patient
app.put("/api/patients/:id", (req, res) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    gender,
    contact_number,
    email,
    blood_group,
    address,
    emergency_contact,
  } = req.body;

  if (!first_name || !last_name || !date_of_birth || !gender) {
    return res.status(400).json({
      error: "First name, last name, date of birth, and gender are required",
    });
  }

  const query = `
    UPDATE patient
    SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?,
        contact_number = ?, email = ?, blood_group = ?, address = ?, emergency_contact = ?
    WHERE patient_id = ?
  `;

  db.run(
    query,
    [
      first_name,
      last_name,
      date_of_birth,
      gender,
      contact_number,
      email,
      blood_group,
      address,
      emergency_contact,
      req.params.id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json({ message: "Patient updated successfully" });
    }
  );
});

// DOCTOR ENDPOINTS

// Get all doctors
app.get("/api/doctors", (req, res) => {
  db.all(
    "SELECT * FROM doctor ORDER BY last_name, first_name",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get doctor by ID
app.get("/api/doctors/:id", (req, res) => {
  db.get(
    "SELECT * FROM doctor WHERE doctor_id = ?",
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: "Doctor not found" });
      }
      res.json(row);
    }
  );
});

// Create new doctor
app.post("/api/doctors", (req, res) => {
  const {
    first_name,
    last_name,
    specialization,
    contact_number,
    email,
    qualification,
    consultation_fee,
  } = req.body;

  if (!first_name || !last_name || !specialization) {
    return res.status(400).json({
      error: "First name, last name, and specialization are required",
    });
  }

  const query = `
    INSERT INTO doctor (
      first_name, last_name, specialization, 
      contact_number, email, qualification, consultation_fee
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      first_name,
      last_name,
      specialization,
      contact_number,
      email,
      qualification,
      consultation_fee,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Doctor created successfully",
        doctor_id: this.lastID,
      });
    }
  );
});

// DISEASE ENDPOINTS

// Get all diseases
app.get("/api/diseases", (req, res) => {
  db.all("SELECT * FROM disease ORDER BY name", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get disease by ID
app.get("/api/diseases/:id", (req, res) => {
  db.get(
    "SELECT * FROM disease WHERE disease_id = ?",
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: "Disease not found" });
      }
      res.json(row);
    }
  );
});

// Create new disease
app.post("/api/diseases", (req, res) => {
  const { name, description, symptoms, severity, is_contagious } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      error: "Disease name and description are required",
    });
  }

  const query = `
    INSERT INTO disease (name, description, symptoms, severity, is_contagious)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [name, description, symptoms, severity, is_contagious],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Disease created successfully",
        disease_id: this.lastID,
      });
    }
  );
});

// CHECKIN ENDPOINTS

// Get all checkins
app.get("/api/checkins", (req, res) => {
  const query = `
    SELECT c.*, 
           p.first_name as patient_first_name, p.last_name as patient_last_name,
           d.first_name as doctor_first_name, d.last_name as doctor_last_name,
           ds.name as disease_name
    FROM checkin c
    JOIN patient p ON c.patient_id = p.patient_id
    JOIN doctor d ON c.doctor_id = d.doctor_id
    JOIN disease ds ON c.disease_id = ds.disease_id
    ORDER BY c.checkin_date DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get checkin by ID
app.get("/api/checkins/:id", (req, res) => {
  const query = `
    SELECT c.*, 
           p.first_name as patient_first_name, p.last_name as patient_last_name,
           d.first_name as doctor_first_name, d.last_name as doctor_last_name,
           ds.name as disease_name
    FROM checkin c
    JOIN patient p ON c.patient_id = p.patient_id
    JOIN doctor d ON c.doctor_id = d.doctor_id
    JOIN disease ds ON c.disease_id = ds.disease_id
    WHERE c.checkin_id = ?
  `;
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Checkin not found" });
    }
    res.json(row);
  });
});

// Create new checkin
app.post("/api/checkins", (req, res) => {
  const {
    patient_id,
    doctor_id,
    disease_id,
    status,
    symptoms,
    diagnosis,
    prescription,
    follow_up_date,
  } = req.body;

  if (!patient_id || !doctor_id || !disease_id || !status) {
    return res.status(400).json({
      error: "Patient ID, Doctor ID, Disease ID, and status are required",
    });
  }

  const query = `
    INSERT INTO checkin (
      patient_id, doctor_id, disease_id, status,
      symptoms, diagnosis, prescription, follow_up_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      patient_id,
      doctor_id,
      disease_id,
      status,
      symptoms,
      diagnosis,
      prescription,
      follow_up_date,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Checkin created successfully",
        checkin_id: this.lastID,
      });
    }
  );
});

// MEDICAL HISTORY ENDPOINTS

// Get patient's medical history
app.get("/api/patients/:id/history", (req, res) => {
  const query = `
    SELECT h.*, d.name as disease_name
    FROM medical_history h
    JOIN disease d ON h.disease_id = d.disease_id
    WHERE h.patient_id = ?
    ORDER BY h.diagnosis_date DESC
  `;
  db.all(query, [req.params.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Create medical history entry
app.post("/api/medical-history", (req, res) => {
  const {
    patient_id,
    disease_id,
    diagnosis_date,
    treatment,
    notes,
    is_chronic,
  } = req.body;

  if (!patient_id || !disease_id || !diagnosis_date) {
    return res.status(400).json({
      error: "Patient ID, Disease ID, and diagnosis date are required",
    });
  }

  const query = `
    INSERT INTO medical_history (
      patient_id, disease_id, diagnosis_date,
      treatment, notes, is_chronic
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [patient_id, disease_id, diagnosis_date, treatment, notes, is_chronic],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: "Medical history entry created successfully",
        history_id: this.lastID,
      });
    }
  );
});

// DASHBOARD ENDPOINTS

// Get hospital statistics
app.get("/api/stats/hospital", (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM patient) as total_patients,
      (SELECT COUNT(*) FROM doctor) as total_doctors,
      (SELECT COUNT(*) FROM checkin WHERE date(checkin_date) = date('now')) as today_checkins,
      (SELECT COUNT(*) FROM checkin WHERE date(checkin_date) >= date('now', '-7 days')) as week_checkins,
      (SELECT COUNT(*) FROM disease) as total_diseases
  `;
  db.get(query, [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row);
  });
});

// Get disease statistics
app.get("/api/stats/diseases", (req, res) => {
  const query = `
    SELECT 
      d.name,
      COUNT(c.checkin_id) as total_cases,
      COUNT(CASE WHEN date(c.checkin_date) >= date('now', '-30 days') THEN 1 END) as month_cases
    FROM disease d
    LEFT JOIN checkin c ON d.disease_id = c.disease_id
    GROUP BY d.disease_id, d.name
    ORDER BY total_cases DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get doctor workload
app.get("/api/stats/doctor-workload", (req, res) => {
  const query = `
    SELECT 
      d.doctor_id,
      d.first_name,
      d.last_name,
      COUNT(c.checkin_id) as total_patients,
      COUNT(CASE WHEN date(c.checkin_date) = date('now') THEN 1 END) as today_patients
    FROM doctor d
    LEFT JOIN checkin c ON d.doctor_id = c.doctor_id
    GROUP BY d.doctor_id, d.first_name, d.last_name
    ORDER BY today_patients DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});
