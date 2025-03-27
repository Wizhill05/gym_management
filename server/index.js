import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Helper function to get member by ID
const getMember = (memberId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM member WHERE member_id = ?",
      [memberId],
      (err, row) => {
        if (err) reject(err);
        if (!row) reject(new Error("Member not found"));
        resolve(row);
      }
    );
  });
};

// Helper function to get membership by member ID
const getMembership = (memberId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM membership WHERE member_id = ?",
      [memberId],
      (err, row) => {
        if (err) reject(err);
        if (!row) reject(new Error("Membership not found"));
        resolve(row);
      }
    );
  });
};

// Helper function to get trainer by ID
const getTrainer = (trainerId) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM trainer WHERE trainer_id = ?",
      [trainerId],
      (err, row) => {
        if (err) reject(err);
        if (!row) reject(new Error("Trainer not found"));
        resolve(row);
      }
    );
  });
};

// MEMBER ENDPOINTS

// Get all members
app.get("/api/members", (req, res) => {
  const query = `
    SELECT m.*, t.first_name as trainer_first_name, t.last_name as trainer_last_name
    FROM member m
    LEFT JOIN trainer t ON m.trainer_id = t.trainer_id
    ORDER BY m.last_name, m.first_name
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get member by ID
app.get("/api/members/:id", (req, res) => {
  const query = `
    SELECT m.*, t.first_name as trainer_first_name, t.last_name as trainer_last_name
    FROM member m
    LEFT JOIN trainer t ON m.trainer_id = t.trainer_id
    WHERE m.member_id = ?
  `;
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json(row);
  });
});

// Create new member
app.post("/api/members", (req, res) => {
  const {
    first_name,
    last_name,
    trainer_id,
    contact_number,
    email,
    date_of_birth,
    gender,
  } = req.body;

  if (!first_name || !last_name) {
    return res
      .status(400)
      .json({ error: "First name and last name are required" });
  }

  const query = `
    INSERT INTO member (first_name, last_name, trainer_id, contact_number, email, date_of_birth, gender)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      first_name,
      last_name,
      trainer_id,
      contact_number,
      email,
      date_of_birth,
      gender,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Member created successfully",
        member_id: this.lastID,
      });
    }
  );
});

// Update member
app.put("/api/members/:id", (req, res) => {
  const {
    first_name,
    last_name,
    trainer_id,
    contact_number,
    email,
    date_of_birth,
    gender,
  } = req.body;

  if (!first_name || !last_name) {
    return res
      .status(400)
      .json({ error: "First name and last name are required" });
  }

  const query = `
    UPDATE member
    SET first_name = ?, last_name = ?, trainer_id = ?, contact_number = ?, email = ?, date_of_birth = ?, gender = ?
    WHERE member_id = ?
  `;

  db.run(
    query,
    [
      first_name,
      last_name,
      trainer_id,
      contact_number,
      email,
      date_of_birth,
      gender,
      req.params.id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Member not found" });
      }

      res.json({ message: "Member updated successfully" });
    }
  );
});

// Delete member
app.delete("/api/members/:id", (req, res) => {
  db.run(
    "DELETE FROM member WHERE member_id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Member not found" });
      }

      res.json({ message: "Member deleted successfully" });
    }
  );
});

// TRAINER ENDPOINTS

// Get all trainers
app.get("/api/trainers", (req, res) => {
  db.all(
    "SELECT * FROM trainer ORDER BY last_name, first_name",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get trainer by ID
app.get("/api/trainers/:id", (req, res) => {
  db.get(
    "SELECT * FROM trainer WHERE trainer_id = ?",
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: "Trainer not found" });
      }
      res.json(row);
    }
  );
});

// Create new trainer
app.post("/api/trainers", (req, res) => {
  const { first_name, last_name, specialization, contact_number, hourly_rate } =
    req.body;

  if (!first_name || !last_name) {
    return res
      .status(400)
      .json({ error: "First name and last name are required" });
  }

  const query = `
    INSERT INTO trainer (first_name, last_name, specialization, contact_number, hourly_rate)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [first_name, last_name, specialization, contact_number, hourly_rate],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Trainer created successfully",
        trainer_id: this.lastID,
      });
    }
  );
});

// Update trainer
app.put("/api/trainers/:id", (req, res) => {
  const { first_name, last_name, specialization, contact_number, hourly_rate } =
    req.body;

  if (!first_name || !last_name) {
    return res
      .status(400)
      .json({ error: "First name and last name are required" });
  }

  const query = `
    UPDATE trainer
    SET first_name = ?, last_name = ?, specialization = ?, contact_number = ?, hourly_rate = ?
    WHERE trainer_id = ?
  `;

  db.run(
    query,
    [
      first_name,
      last_name,
      specialization,
      contact_number,
      hourly_rate,
      req.params.id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Trainer not found" });
      }

      res.json({ message: "Trainer updated successfully" });
    }
  );
});

// Delete trainer
app.delete("/api/trainers/:id", (req, res) => {
  db.run(
    "DELETE FROM trainer WHERE trainer_id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Trainer not found" });
      }

      res.json({ message: "Trainer deleted successfully" });
    }
  );
});

// MEMBERSHIP ENDPOINTS

// Get all memberships
app.get("/api/memberships", (req, res) => {
  const query = `
    SELECT ms.*, m.first_name, m.last_name
    FROM membership ms
    JOIN member m ON ms.member_id = m.member_id
    ORDER BY ms.end_date
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get membership by ID
app.get("/api/memberships/:id", (req, res) => {
  const query = `
    SELECT ms.*, m.first_name, m.last_name
    FROM membership ms
    JOIN member m ON ms.member_id = m.member_id
    WHERE ms.membership_id = ?
  `;
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Membership not found" });
    }
    res.json(row);
  });
});

// Get membership by member ID
app.get("/api/members/:id/membership", (req, res) => {
  const query = `
    SELECT *
    FROM membership
    WHERE member_id = ?
  `;
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Membership not found" });
    }
    res.json(row);
  });
});

// Create new membership
app.post("/api/memberships", (req, res) => {
  const {
    member_id,
    membership_type,
    start_date,
    end_date,
    monthly_fee,
    payment_status,
  } = req.body;

  if (
    !member_id ||
    !membership_type ||
    !start_date ||
    !end_date ||
    !monthly_fee ||
    !payment_status
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO membership (member_id, membership_type, start_date, end_date, monthly_fee, payment_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      member_id,
      membership_type,
      start_date,
      end_date,
      monthly_fee,
      payment_status,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Membership created successfully",
        membership_id: this.lastID,
      });
    }
  );
});

// Update membership
app.put("/api/memberships/:id", (req, res) => {
  const { membership_type, start_date, end_date, monthly_fee, payment_status } =
    req.body;

  if (
    !membership_type ||
    !start_date ||
    !end_date ||
    !monthly_fee ||
    !payment_status
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    UPDATE membership
    SET membership_type = ?, start_date = ?, end_date = ?, monthly_fee = ?, payment_status = ?
    WHERE membership_id = ?
  `;

  db.run(
    query,
    [
      membership_type,
      start_date,
      end_date,
      monthly_fee,
      payment_status,
      req.params.id,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Membership not found" });
      }

      res.json({ message: "Membership updated successfully" });
    }
  );
});

// Delete membership
app.delete("/api/memberships/:id", (req, res) => {
  db.run(
    "DELETE FROM membership WHERE membership_id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Membership not found" });
      }

      res.json({ message: "Membership deleted successfully" });
    }
  );
});

// ATTENDANCE ENDPOINTS

// Get all attendance records
app.get("/api/attendance", (req, res) => {
  const query = `
    SELECT a.*, m.first_name, m.last_name
    FROM attendance a
    JOIN member m ON a.member_id = m.member_id
    ORDER BY a.attendance_date DESC, a.check_in_time DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get attendance records for today
app.get("/api/attendance/today", (req, res) => {
  const query = `
    SELECT a.*, m.first_name, m.last_name
    FROM attendance a
    JOIN member m ON a.member_id = m.member_id
    WHERE a.attendance_date = date('now')
    ORDER BY a.check_in_time DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get attendance records for a specific member
app.get("/api/members/:id/attendance", (req, res) => {
  const query = `
    SELECT *
    FROM attendance
    WHERE member_id = ?
    ORDER BY attendance_date DESC, check_in_time DESC
  `;
  db.all(query, [req.params.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Record attendance (check-in)
app.post("/api/attendance", (req, res) => {
  const { member_id } = req.body;

  if (!member_id) {
    return res.status(400).json({ error: "Member ID is required" });
  }

  // Check if member exists
  db.get(
    "SELECT * FROM member WHERE member_id = ?",
    [member_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!row) {
        return res.status(404).json({ error: "Member not found" });
      }

      // Check if member has already checked in today
      db.get(
        "SELECT * FROM attendance WHERE member_id = ? AND attendance_date = date('now')",
        [member_id],
        (err, existingAttendance) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (existingAttendance) {
            return res
              .status(400)
              .json({ error: "Member has already checked in today" });
          }

          // Record attendance
          db.run(
            "INSERT INTO attendance (member_id) VALUES (?)",
            [member_id],
            function (err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              res.status(201).json({
                message: "Attendance recorded successfully",
                attendance_id: this.lastID,
              });
            }
          );
        }
      );
    }
  );
});

// DASHBOARD ENDPOINTS

// Get membership statistics
app.get("/api/stats/memberships", (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_memberships,
      SUM(CASE WHEN payment_status = 'Paid' THEN 1 ELSE 0 END) as paid_memberships,
      SUM(CASE WHEN payment_status = 'Pending' THEN 1 ELSE 0 END) as pending_memberships,
      SUM(CASE WHEN payment_status = 'Overdue' THEN 1 ELSE 0 END) as overdue_memberships,
      SUM(monthly_fee) as total_monthly_revenue
    FROM membership
  `;
  db.get(query, [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row);
  });
});

// Get membership types distribution
app.get("/api/stats/membership-types", (req, res) => {
  const query = `
    SELECT 
      membership_type,
      COUNT(*) as count
    FROM membership
    GROUP BY membership_type
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get attendance statistics
app.get("/api/stats/attendance", (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_attendance,
      COUNT(DISTINCT member_id) as unique_members,
      COUNT(CASE WHEN attendance_date = date('now') THEN 1 END) as today_attendance,
      COUNT(CASE WHEN attendance_date >= date('now', '-7 days') THEN 1 END) as week_attendance,
      COUNT(CASE WHEN attendance_date >= date('now', '-30 days') THEN 1 END) as month_attendance
    FROM attendance
  `;
  db.get(query, [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row);
  });
});

// Get members with expiring memberships
app.get("/api/stats/expiring-memberships", (req, res) => {
  const query = `
    SELECT ms.*, m.first_name, m.last_name
    FROM membership ms
    JOIN member m ON ms.member_id = m.member_id
    WHERE ms.end_date BETWEEN date('now') AND date('now', '+30 days')
    ORDER BY ms.end_date
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
