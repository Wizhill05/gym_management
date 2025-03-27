import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./App.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [page, setPage] = useState("dashboard");
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [message, setMessage] = useState("");
  const [membershipStats, setMembershipStats] = useState({});
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [expiringMemberships, setExpiringMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [memberForm, setMemberForm] = useState({
    first_name: "",
    last_name: "",
    trainer_id: "",
    contact_number: "",
    email: "",
    date_of_birth: "",
    gender: "Male",
  });

  const [membershipForm, setMembershipForm] = useState({
    member_id: "",
    membership_type: "Standard",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split("T")[0],
    monthly_fee: 50,
    payment_status: "Paid",
  });

  const [attendanceForm, setAttendanceForm] = useState({
    member_id: "",
  });

  const backendUrl = "http://localhost:5000";

  // Fetch data based on current page
  useEffect(() => {
    if (page === "dashboard") {
      fetchDashboardData();
    } else if (page === "members") {
      fetchMembers();
      fetchTrainers();
    } else if (page === "memberships") {
      fetchMemberships();
      fetchMembers();
    } else if (page === "attendance") {
      fetchTodayAttendance();
      fetchMembers();
    }
  }, [page]);

  // Dashboard data fetching
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all required data for dashboard
      const [
        membersRes,
        membershipStatsRes,
        membershipTypesRes,
        attendanceStatsRes,
        expiringMembershipsRes,
        todayAttendanceRes,
      ] = await Promise.all([
        fetch(`${backendUrl}/api/members`),
        fetch(`${backendUrl}/api/stats/memberships`),
        fetch(`${backendUrl}/api/stats/membership-types`),
        fetch(`${backendUrl}/api/stats/attendance`),
        fetch(`${backendUrl}/api/stats/expiring-memberships`),
        fetch(`${backendUrl}/api/attendance/today`),
      ]);

      const members = await membersRes.json();
      const membershipStats = await membershipStatsRes.json();
      const membershipTypes = await membershipTypesRes.json();
      const attendanceStats = await attendanceStatsRes.json();
      const expiringMemberships = await expiringMembershipsRes.json();
      const todayAttendance = await todayAttendanceRes.json();

      setMembers(members);
      setMembershipStats(membershipStats);
      setMembershipTypes(membershipTypes);
      setAttendanceStats(attendanceStats);
      setExpiringMemberships(expiringMemberships);
      setTodayAttendance(todayAttendance);
    } catch (err) {
      setMessage("Error fetching dashboard data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Members data fetching
  const fetchMembers = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/members`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setMessage("Error fetching members");
      console.error(err);
    }
  };

  // Trainers data fetching
  const fetchTrainers = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/trainers`);
      const data = await res.json();
      setTrainers(data);
    } catch (err) {
      setMessage("Error fetching trainers");
      console.error(err);
    }
  };

  // Memberships data fetching
  const fetchMemberships = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/memberships`);
      const data = await res.json();
      setMemberships(data);
    } catch (err) {
      setMessage("Error fetching memberships");
      console.error(err);
    }
  };

  // Attendance data fetching
  const fetchTodayAttendance = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/attendance/today`);
      const data = await res.json();
      setTodayAttendance(data);
    } catch (err) {
      setMessage("Error fetching today's attendance");
      console.error(err);
    }
  };

  // Handle member form submission
  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberForm),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Member registered successfully");
        setMemberForm({
          first_name: "",
          last_name: "",
          trainer_id: "",
          contact_number: "",
          email: "",
          date_of_birth: "",
          gender: "Male",
        });
        fetchMembers();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Error registering member");
      console.error(err);
    }
  };

  // Handle membership form submission
  const handleMembershipSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/memberships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(membershipForm),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Membership created successfully");
        setMembershipForm({
          member_id: "",
          membership_type: "Standard",
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split("T")[0],
          monthly_fee: 50,
          payment_status: "Paid",
        });
        fetchMemberships();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Error creating membership");
      console.error(err);
    }
  };

  // Handle attendance form submission
  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceForm),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Attendance recorded successfully");
        setAttendanceForm({
          member_id: "",
        });
        fetchTodayAttendance();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Error recording attendance");
      console.error(err);
    }
  };

  // Handle membership payment status update
  const handleUpdatePaymentStatus = async (membershipId, newStatus) => {
    try {
      // Find the membership to update
      const membershipToUpdate = memberships.find(
        (m) => m.membership_id === membershipId
      );

      if (!membershipToUpdate) {
        setMessage("Membership not found");
        return;
      }

      const res = await fetch(`${backendUrl}/api/memberships/${membershipId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...membershipToUpdate,
          payment_status: newStatus,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Payment status updated to ${newStatus}`);
        fetchMemberships();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Error updating payment status");
      console.error(err);
    }
  };

  // Prepare chart data for membership types
  const prepareMembershipTypeChartData = () => {
    if (!membershipTypes || membershipTypes.length === 0) {
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

    return {
      labels: membershipTypes.map((type) => type.membership_type),
      datasets: [
        {
          data: membershipTypes.map((type) => type.count),
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare chart data for payment status
  const preparePaymentStatusChartData = () => {
    if (!membershipStats) {
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

    return {
      labels: ["Paid", "Pending", "Overdue"],
      datasets: [
        {
          data: [
            membershipStats.paid_memberships || 0,
            membershipStats.pending_memberships || 0,
            membershipStats.overdue_memberships || 0,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(255, 99, 132, 0.5)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Render dashboard
  const renderDashboard = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Gym Management Dashboard</h2>
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
          <h3>Members</h3>
          <p className="stat-value">{members.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Memberships</h3>
          <p className="stat-value">{membershipStats.total_memberships || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Attendance</h3>
          <p className="stat-value">{attendanceStats.today_attendance || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Monthly Revenue</h3>
          <p className="stat-value">
            ${membershipStats.total_monthly_revenue || 0}
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-item">
          <h3>Membership Types</h3>
          <div className="chart-container">
            <Pie data={prepareMembershipTypeChartData()} />
          </div>
        </div>

        <div className="dashboard-item">
          <h3>Payment Status</h3>
          <div className="chart-container">
            <Pie data={preparePaymentStatusChartData()} />
          </div>
        </div>

        <div className="dashboard-item">
          <h3>Today's Attendance</h3>
          {todayAttendance.length === 0 ? (
            <p className="empty-message">No attendance records for today</p>
          ) : (
            <ul className="mini-list">
              {todayAttendance.slice(0, 5).map((record) => (
                <li key={record.attendance_id} className="mini-list-item">
                  {record.first_name} {record.last_name} -{" "}
                  {record.check_in_time
                    ? new Date(record.check_in_time).toLocaleTimeString()
                    : "N/A"}
                </li>
              ))}
              {todayAttendance.length > 5 && (
                <li className="mini-list-item see-more">
                  <button onClick={() => setPage("attendance")}>
                    See all {todayAttendance.length} records
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="dashboard-item">
          <h3>Expiring Memberships</h3>
          {expiringMemberships.length === 0 ? (
            <p className="empty-message">No memberships expiring soon</p>
          ) : (
            <ul className="mini-list">
              {expiringMemberships.slice(0, 5).map((membership) => (
                <li key={membership.membership_id} className="mini-list-item">
                  {membership.first_name} {membership.last_name} - Expires{" "}
                  {new Date(membership.end_date).toLocaleDateString()}
                </li>
              ))}
              {expiringMemberships.length > 5 && (
                <li className="mini-list-item see-more">
                  <button onClick={() => setPage("memberships")}>
                    See all {expiringMemberships.length} expiring memberships
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  // Render members page
  const renderMembers = () => (
    <div className="members-page">
      <div className="form-container">
        <h2>Register New Member</h2>
        <form onSubmit={handleMemberSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name*</label>
              <input
                type="text"
                value={memberForm.first_name}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, first_name: e.target.value })
                }
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Last Name*</label>
              <input
                type="text"
                value={memberForm.last_name}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, last_name: e.target.value })
                }
                required
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={memberForm.email}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, email: e.target.value })
                }
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="text"
                value={memberForm.contact_number}
                onChange={(e) =>
                  setMemberForm({
                    ...memberForm,
                    contact_number: e.target.value,
                  })
                }
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={memberForm.date_of_birth}
                onChange={(e) =>
                  setMemberForm({
                    ...memberForm,
                    date_of_birth: e.target.value,
                  })
                }
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                value={memberForm.gender}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, gender: e.target.value })
                }
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
              <label>Trainer</label>
              <select
                value={memberForm.trainer_id}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, trainer_id: e.target.value })
                }
                className="select"
              >
                <option value="">No Trainer</option>
                {trainers.map((trainer) => (
                  <option key={trainer.trainer_id} value={trainer.trainer_id}>
                    {trainer.first_name} {trainer.last_name} -{" "}
                    {trainer.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="button primary">
            Register Member
          </button>
        </form>
      </div>

      <div className="list-container">
        <h2>All Members</h2>
        {members.length === 0 ? (
          <p className="empty-message">No members registered</p>
        ) : (
          <ul className="list">
            {members.map((member) => (
              <li key={member.member_id} className="list-item">
                <div className="member-info">
                  <strong>
                    {member.first_name} {member.last_name}
                  </strong>
                  <p>Email: {member.email || "N/A"}</p>
                  <p>Contact: {member.contact_number || "N/A"}</p>
                  <p>
                    Trainer:{" "}
                    {member.trainer_first_name
                      ? `${member.trainer_first_name} ${member.trainer_last_name}`
                      : "None"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // Render memberships page
  const renderMemberships = () => (
    <div className="memberships-page">
      <div className="form-container">
        <h2>Create New Membership</h2>
        <form onSubmit={handleMembershipSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Member*</label>
              <select
                value={membershipForm.member_id}
                onChange={(e) =>
                  setMembershipForm({
                    ...membershipForm,
                    member_id: e.target.value,
                  })
                }
                required
                className="select"
              >
                <option value="">Select Member</option>
                {members.map((member) => (
                  <option key={member.member_id} value={member.member_id}>
                    {member.first_name} {member.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Membership Type*</label>
              <select
                value={membershipForm.membership_type}
                onChange={(e) =>
                  setMembershipForm({
                    ...membershipForm,
                    membership_type: e.target.value,
                  })
                }
                required
                className="select"
              >
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date*</label>
              <input
                type="date"
                value={membershipForm.start_date}
                onChange={(e) =>
                  setMembershipForm({
                    ...membershipForm,
                    start_date: e.target.value,
                  })
                }
                required
                className="input"
              />
            </div>
            <div className="form-group">
              <label>End Date*</label>
              <input
                type="date"
                value={membershipForm.end_date}
                onChange={(e) =>
                  setMembershipForm({
                    ...membershipForm,
                    end_date: e.target.value,
                  })
                }
                required
                className="input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Monthly Fee*</label>
              <input
                type="number"
                value={membershipForm.monthly_fee}
                onChange={(e) =>
                  setMembershipForm({
                    ...membershipForm,
                    monthly_fee: e.target.value,
                  })
                }
                required
                min="0"
                step="0.01"
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Payment Status*</label>
              <select
                value={membershipForm.payment_status}
                onChange={(e) =>
                  setMembershipForm({
                    ...membershipForm,
                    payment_status: e.target.value,
                  })
                }
                required
                className="select"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <button type="submit" className="button primary">
            Create Membership
          </button>
        </form>
      </div>

      <div className="list-container">
        <h2>All Memberships</h2>
        {memberships.length === 0 ? (
          <p className="empty-message">No memberships found</p>
        ) : (
          <ul className="list">
            {memberships.map((membership) => (
              <li key={membership.membership_id} className="list-item">
                <div className="membership-info">
                  <strong>
                    {membership.first_name} {membership.last_name}
                  </strong>
                  <p>Type: {membership.membership_type}</p>
                  <p>
                    Period:{" "}
                    {new Date(membership.start_date).toLocaleDateString()} to{" "}
                    {new Date(membership.end_date).toLocaleDateString()}
                  </p>
                  <p>Monthly Fee: ${membership.monthly_fee}</p>
                  <p
                    className={`payment-status ${membership.payment_status.toLowerCase()}`}
                  >
                    Status: {membership.payment_status}
                  </p>
                </div>
                <div className="membership-actions">
                  {membership.payment_status !== "Paid" && (
                    <button
                      className="button primary"
                      onClick={() =>
                        handleUpdatePaymentStatus(
                          membership.membership_id,
                          "Paid"
                        )
                      }
                    >
                      Mark as Paid
                    </button>
                  )}
                  {membership.payment_status !== "Pending" && (
                    <button
                      className="button secondary"
                      onClick={() =>
                        handleUpdatePaymentStatus(
                          membership.membership_id,
                          "Pending"
                        )
                      }
                    >
                      Mark as Pending
                    </button>
                  )}
                  {membership.payment_status !== "Overdue" && (
                    <button
                      className="button warning"
                      onClick={() =>
                        handleUpdatePaymentStatus(
                          membership.membership_id,
                          "Overdue"
                        )
                      }
                    >
                      Mark as Overdue
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // Render attendance page
  const renderAttendance = () => (
    <div className="attendance-page">
      <div className="form-container">
        <h2>Record Attendance</h2>
        <form onSubmit={handleAttendanceSubmit}>
          <div className="form-group">
            <label>Member*</label>
            <select
              value={attendanceForm.member_id}
              onChange={(e) =>
                setAttendanceForm({
                  ...attendanceForm,
                  member_id: e.target.value,
                })
              }
              required
              className="select"
            >
              <option value="">Select Member</option>
              {members.map((member) => (
                <option key={member.member_id} value={member.member_id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="button primary">
            Record Check-in
          </button>
        </form>
      </div>

      <div className="list-container">
        <h2>Today's Attendance</h2>
        {todayAttendance.length === 0 ? (
          <p className="empty-message">No attendance records for today</p>
        ) : (
          <ul className="list">
            {todayAttendance.map((record) => (
              <li key={record.attendance_id} className="list-item">
                <div className="attendance-info">
                  <strong>
                    {record.first_name} {record.last_name}
                  </strong>
                  <p>
                    Check-in Time:{" "}
                    {record.check_in_time
                      ? new Date(record.check_in_time).toLocaleTimeString()
                      : "N/A"}
                  </p>
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
        <h1>Gym Management System</h1>
        <nav className="nav">
          <button
            className={`nav-btn ${page === "dashboard" ? "active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-btn ${page === "members" ? "active" : ""}`}
            onClick={() => setPage("members")}
          >
            Members
          </button>
          <button
            className={`nav-btn ${page === "memberships" ? "active" : ""}`}
            onClick={() => setPage("memberships")}
          >
            Memberships
          </button>
          <button
            className={`nav-btn ${page === "attendance" ? "active" : ""}`}
            onClick={() => setPage("attendance")}
          >
            Attendance
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
        {page === "members" && renderMembers()}
        {page === "memberships" && renderMemberships()}
        {page === "attendance" && renderAttendance()}
      </main>
    </div>
  );
}

export default App;
