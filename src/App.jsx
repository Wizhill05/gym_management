import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./App.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [page, setPage] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [message, setMessage] = useState("");
  const [hospitalStats, setHospitalStats] = useState({});
  const [diseaseStats, setDiseaseStats] = useState([]);
  const [doctorWorkload, setDoctorWorkload] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);

  // Form states
  const [patientForm, setPatientForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "Male",
    contact_number: "",
    email: "",
    blood_group: "",
    address: "",
    emergency_contact: "",
  });

  const [checkinForm, setCheckinForm] = useState({
    patient_id: "",
    doctor_id: "",
    disease_id: "",
    status: "Pending",
    symptoms: "",
    diagnosis: "",
    prescription: "",
    follow_up_date: "",
  });

  const backendUrl = "http://localhost:5000";

  // Fetch data based on current page
  useEffect(() => {
    if (page === "dashboard") {
      fetchDashboardData();
    } else if (page === "patients") {
      fetchPatients();
    } else if (page === "checkins") {
      fetchCheckins();
      fetchPatients();
      fetchDoctors();
      fetchDiseases();
    } else if (page === "patientRecords") {
      fetchPatients();
    }
  }, [page]);

  // Dashboard data fetching
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        patientsRes,
        hospitalStatsRes,
        diseaseStatsRes,
        doctorWorkloadRes,
      ] = await Promise.all([
        fetch(`${backendUrl}/api/patients`),
        fetch(`${backendUrl}/api/stats/hospital`),
        fetch(`${backendUrl}/api/stats/diseases`),
        fetch(`${backendUrl}/api/stats/doctor-workload`),
      ]);

      const patients = await patientsRes.json();
      const hospitalStats = await hospitalStatsRes.json();
      const diseaseStats = await diseaseStatsRes.json();
      const doctorWorkload = await doctorWorkloadRes.json();

      setPatients(patients);
      setHospitalStats(hospitalStats);
      setDiseaseStats(diseaseStats);
      setDoctorWorkload(doctorWorkload);
    } catch (err) {
      setMessage("Error fetching dashboard data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/patients`);
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      setMessage("Error fetching patients");
      console.error(err);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/doctors`);
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      setMessage("Error fetching doctors");
      console.error(err);
    }
  };

  // Fetch diseases
  const fetchDiseases = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/diseases`);
      const data = await res.json();
      setDiseases(data);
    } catch (err) {
      setMessage("Error fetching diseases");
      console.error(err);
    }
  };

  // Fetch checkins
  const fetchCheckins = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/checkins`);
      const data = await res.json();
      setCheckins(data);
    } catch (err) {
      setMessage("Error fetching checkins");
      console.error(err);
    }
  };

  // Fetch patient medical history
  const fetchPatientHistory = async (patientId) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${backendUrl}/api/patients/${patientId}/history`
      );
      const data = await res.json();
      setPatientHistory(data);

      // Find the patient details
      const patient = patients.find(
        (p) => p.patient_id === parseInt(patientId)
      );
      setSelectedPatient(patient);
    } catch (err) {
      setMessage("Error fetching patient history");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle patient form submission
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientForm),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Patient registered successfully");
        setPatientForm({
          first_name: "",
          last_name: "",
          date_of_birth: "",
          gender: "Male",
          contact_number: "",
          email: "",
          blood_group: "",
          address: "",
          emergency_contact: "",
        });
        fetchPatients();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Error registering patient");
      console.error(err);
    }
  };

  // Handle checkin form submission
  const handleCheckinSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/checkins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkinForm),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Checkin created successfully");
        setCheckinForm({
          patient_id: "",
          doctor_id: "",
          disease_id: "",
          status: "Pending",
          symptoms: "",
          diagnosis: "",
          prescription: "",
          follow_up_date: "",
        });
        fetchCheckins();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Error creating checkin");
      console.error(err);
    }
  };

  // Prepare chart data for disease statistics
  const prepareDiseaseChartData = () => {
    if (!diseaseStats || diseaseStats.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          },
        ],
      };
    }

    const colors = [
      "rgba(255, 99, 132, 0.5)",
      "rgba(54, 162, 235, 0.5)",
      "rgba(255, 206, 86, 0.5)",
      "rgba(75, 192, 192, 0.5)",
      "rgba(153, 102, 255, 0.5)",
    ];

    return {
      labels: diseaseStats.map((disease) => disease.name),
      datasets: [
        {
          data: diseaseStats.map((disease) => disease.total_cases),
          backgroundColor: colors,
          borderColor: colors.map((color) => color.replace("0.5", "1")),
          borderWidth: 1,
        },
      ],
    };
  };

  // Render dashboard
  const renderDashboard = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Hospital Management Dashboard</h2>
        <button
          className="button refresh-btn"
          onClick={fetchDashboardData}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p className="stat-value">{hospitalStats.total_patients || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Doctors</h3>
          <p className="stat-value">{hospitalStats.total_doctors || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Checkins</h3>
          <p className="stat-value">{hospitalStats.today_checkins || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Weekly Checkins</h3>
          <p className="stat-value">{hospitalStats.week_checkins || 0}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-item">
          <h3>Disease Statistics</h3>
          <div className="chart-container">
            <Pie data={prepareDiseaseChartData()} />
          </div>
        </div>

        <div className="dashboard-item">
          <h3>Doctor Workload</h3>
          <ul className="mini-list">
            {doctorWorkload.map((doctor) => (
              <li key={doctor.doctor_id} className="mini-list-item">
                <strong>
                  {doctor.first_name} {doctor.last_name}
                </strong>
                <p>Today's Patients: {doctor.today_patients}</p>
                <p>Total Patients: {doctor.total_patients}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  // Render patients page
  const renderPatients = () => (
    <div className="patients-page">
      <div className="form-container">
        <h2>Register New Patient</h2>
        <form onSubmit={handlePatientSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name*</label>
              <input
                type="text"
                value={patientForm.first_name}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, first_name: e.target.value })
                }
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Last Name*</label>
              <input
                type="text"
                value={patientForm.last_name}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, last_name: e.target.value })
                }
                required
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth*</label>
              <input
                type="date"
                value={patientForm.date_of_birth}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    date_of_birth: e.target.value,
                  })
                }
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Gender*</label>
              <select
                value={patientForm.gender}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, gender: e.target.value })
                }
                required
                className="select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={patientForm.email}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, email: e.target.value })
                }
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="text"
                value={patientForm.contact_number}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    contact_number: e.target.value,
                  })
                }
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Blood Group</label>
              <input
                type="text"
                value={patientForm.blood_group}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    blood_group: e.target.value,
                  })
                }
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Emergency Contact</label>
              <input
                type="text"
                value={patientForm.emergency_contact}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    emergency_contact: e.target.value,
                  })
                }
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                value={patientForm.address}
                onChange={(e) =>
                  setPatientForm({ ...patientForm, address: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          <button type="submit" className="button primary">
            Register Patient
          </button>
        </form>
      </div>

      <div className="list-container">
        <h2>All Patients</h2>
        {patients.length === 0 ? (
          <p className="empty-message">No patients registered</p>
        ) : (
          <ul className="list">
            {patients.map((patient) => (
              <li key={patient.patient_id} className="list-item">
                <div className="patient-info">
                  <strong>
                    {patient.first_name} {patient.last_name}
                  </strong>
                  <p>Gender: {patient.gender}</p>
                  <p>
                    DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                  </p>
                  <p>Blood Group: {patient.blood_group || "N/A"}</p>
                  <p>Contact: {patient.contact_number || "N/A"}</p>
                  <p>Email: {patient.email || "N/A"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // Render patient records page
  const renderPatientRecords = () => (
    <div className="patient-records-page">
      <div className="list-container">
        <h2>Patient Records</h2>
        {selectedPatient ? (
          <div>
            <div className="patient-detail-header">
              <button
                className="button secondary"
                onClick={() => {
                  setSelectedPatient(null);
                  setPatientHistory([]);
                }}
              >
                ← Back to Patients
              </button>
              <h3>
                {selectedPatient.first_name} {selectedPatient.last_name}'s
                Medical History
              </h3>
            </div>

            {isLoading ? (
              <p className="loading-message">Loading patient history...</p>
            ) : patientHistory.length === 0 ? (
              <p className="empty-message">
                No medical history records found for this patient
              </p>
            ) : (
              <ul className="list">
                {patientHistory.map((record) => (
                  <li key={record.history_id} className="list-item">
                    <div className="history-info">
                      <strong>{record.disease_name}</strong>
                      <p>
                        Diagnosis Date:{" "}
                        {new Date(record.diagnosis_date).toLocaleDateString()}
                      </p>
                      <p>Treatment: {record.treatment || "N/A"}</p>
                      <p>Notes: {record.notes || "N/A"}</p>
                      <p>
                        Chronic Condition: {record.is_chronic ? "Yes" : "No"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div>
            <p className="instruction-message">
              Select a patient to view their medical history:
            </p>
            {patients.length === 0 ? (
              <p className="empty-message">No patients registered</p>
            ) : (
              <ul className="list">
                {patients.map((patient) => (
                  <li
                    key={patient.patient_id}
                    className="list-item clickable"
                    onClick={() => fetchPatientHistory(patient.patient_id)}
                  >
                    <div className="patient-info">
                      <strong>
                        {patient.first_name} {patient.last_name}
                      </strong>
                      <p>Gender: {patient.gender}</p>
                      <p>
                        DOB:{" "}
                        {new Date(patient.date_of_birth).toLocaleDateString()}
                      </p>
                      <p>Blood Group: {patient.blood_group || "N/A"}</p>
                      <p>Contact: {patient.contact_number || "N/A"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render checkins page
  const renderCheckins = () => (
    <div className="checkins-page">
      <div className="form-container">
        <h2>Create New Checkin</h2>
        <form onSubmit={handleCheckinSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Patient*</label>
              <select
                value={checkinForm.patient_id}
                onChange={(e) =>
                  setCheckinForm({ ...checkinForm, patient_id: e.target.value })
                }
                required
                className="select"
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.patient_id} value={patient.patient_id}>
                    {patient.first_name} {patient.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Doctor*</label>
              <select
                value={checkinForm.doctor_id}
                onChange={(e) =>
                  setCheckinForm({ ...checkinForm, doctor_id: e.target.value })
                }
                required
                className="select"
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctor_id} value={doctor.doctor_id}>
                    {doctor.first_name} {doctor.last_name} -{" "}
                    {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Disease*</label>
              <select
                value={checkinForm.disease_id}
                onChange={(e) =>
                  setCheckinForm({ ...checkinForm, disease_id: e.target.value })
                }
                required
                className="select"
              >
                <option value="">Select Disease</option>
                {diseases.map((disease) => (
                  <option key={disease.disease_id} value={disease.disease_id}>
                    {disease.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status*</label>
              <select
                value={checkinForm.status}
                onChange={(e) =>
                  setCheckinForm({ ...checkinForm, status: e.target.value })
                }
                required
                className="select"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Symptoms</label>
              <textarea
                value={checkinForm.symptoms}
                onChange={(e) =>
                  setCheckinForm({ ...checkinForm, symptoms: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Diagnosis</label>
              <textarea
                value={checkinForm.diagnosis}
                onChange={(e) =>
                  setCheckinForm({ ...checkinForm, diagnosis: e.target.value })
                }
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Prescription</label>
              <textarea
                value={checkinForm.prescription}
                onChange={(e) =>
                  setCheckinForm({
                    ...checkinForm,
                    prescription: e.target.value,
                  })
                }
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Follow-up Date</label>
              <input
                type="date"
                value={checkinForm.follow_up_date}
                onChange={(e) =>
                  setCheckinForm({
                    ...checkinForm,
                    follow_up_date: e.target.value,
                  })
                }
                className="input"
              />
            </div>
          </div>

          <button type="submit" className="button primary">
            Create Checkin
          </button>
        </form>
      </div>

      <div className="list-container">
        <h2>Recent Checkins</h2>
        {checkins.length === 0 ? (
          <p className="empty-message">No checkins recorded</p>
        ) : (
          <ul className="list">
            {checkins.map((checkin) => (
              <li key={checkin.checkin_id} className="list-item">
                <div className="checkin-info">
                  <strong>
                    {checkin.patient_first_name} {checkin.patient_last_name}
                  </strong>
                  <p>
                    Doctor: Dr. {checkin.doctor_first_name}{" "}
                    {checkin.doctor_last_name}
                  </p>
                  <p>Disease: {checkin.disease_name}</p>
                  <p>Status: {checkin.status}</p>
                  <p>Date: {new Date(checkin.checkin_date).toLocaleString()}</p>
                  {checkin.follow_up_date && (
                    <p>
                      Follow-up:{" "}
                      {new Date(checkin.follow_up_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="header">
        <h1>Hospital Management System</h1>
        <nav className="nav">
          <button
            className={`nav-btn ${page === "dashboard" ? "active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-btn ${page === "patients" ? "active" : ""}`}
            onClick={() => setPage("patients")}
          >
            Patients
          </button>
          <button
            className={`nav-btn ${page === "checkins" ? "active" : ""}`}
            onClick={() => setPage("checkins")}
          >
            Check-ins
          </button>
          <button
            className={`nav-btn ${page === "patientRecords" ? "active" : ""}`}
            onClick={() => {
              setPage("patientRecords");
              setSelectedPatient(null);
              setPatientHistory([]);
            }}
          >
            Patient Records
          </button>
        </nav>
      </header>

      <main className="main">
        {message && (
          <div
            className={`message ${
              message.includes("Error") ? "error" : "success"
            }`}
          >
            {message}
            <button className="close-btn" onClick={() => setMessage("")}>
              ×
            </button>
          </div>
        )}

        {page === "dashboard" && renderDashboard()}
        {page === "patients" && renderPatients()}
        {page === "checkins" && renderCheckins()}
        {page === "patientRecords" && renderPatientRecords()}
      </main>
    </div>
  );
}

export default App;
