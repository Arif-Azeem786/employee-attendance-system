import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function EmployeeDashboard() {
  const [today, setToday] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1) Today's status
      const todayRes = await axiosClient.get("/api/attendance/today");
      setToday(todayRes.data.data);

      // 2) Monthly summary
      const summaryRes = await axiosClient.get("/api/attendance/my-summary");
      setSummary(summaryRes.data.data);

      // 3) Recent history (last 7 days)
      const historyRes = await axiosClient.get("/api/attendance/my-history?limit=7");
      setRecent(historyRes.data.data.items);

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CHECK-IN
  const handleCheckIn = async () => {
    setMsg("");
    try {
      const res = await axiosClient.post("/api/attendance/checkin");
      setMsg(res.data.message);
      fetchData();
    } catch (err) {
      setMsg(err.response?.data?.message || "Check-in failed");
    }
  };

  // CHECK-OUT
  const handleCheckOut = async () => {
    setMsg("");
    try {
      const res = await axiosClient.post("/api/attendance/checkout");
      setMsg(res.data.message);
      fetchData();
    } catch (err) {
      setMsg(err.response?.data?.message || "Check-out failed");
    }
  };
  
<p><a href="/employee/history">View Full History</a>
<p><a href="/employee/summary">View Monthly Summary & Charts</a></p>
</p>

  if (loading) return <div style={{ padding: 20 }}>Loading dashboard…</div>;

  return (
    <div style={styles.container}>
      <h2>Employee Dashboard</h2>

      {msg && <p style={{ color: "green" }}>{msg}</p>}

      {/* Today's Status */}
      <div style={styles.card}>
        <h3>Today's Status</h3>
        <p>Status: <b>{today?.status}</b></p>

        <p>Check-In: {today?.checkInTime ? new Date(today.checkInTime).toLocaleTimeString() : "--"}</p>
        <p>Check-Out: {today?.checkOutTime ? new Date(today.checkOutTime).toLocaleTimeString() : "--"}</p>

        {/* Quick Check-In / Out */}
        {today?.checkInTime ? (
          today.checkOutTime ? (
            <p style={{ color: "green" }}>✔ You already checked out</p>
          ) : (
            <button style={styles.button} onClick={handleCheckOut}>
              Check Out
            </button>
          )
        ) : (
          <button style={styles.button} onClick={handleCheckIn}>
            Check In
          </button>
        )}
      </div>

      {/* Monthly Summary */}
      <div style={styles.card}>
        <h3>Monthly Summary</h3>
        <p>Present: {summary?.present}</p>
        <p>Late: {summary?.late}</p>
        <p>Half-Day: {summary?.halfDay}</p>
        <p>Absent: {summary?.absent}</p>
        <p>Total Hours: {summary?.totalHours}</p>
      </div>

      {/* Recent Attendance */}
      <div style={styles.card}>
        <h3>Last 7 Days</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((row) => (
              <tr key={row._id}>
                <td>{row.date}</td>
                <td>{row.status}</td>
                <td>{row.totalHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "30px auto",
    padding: "20px",
    fontFamily: "Arial"
  },
  card: {
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  }
};
