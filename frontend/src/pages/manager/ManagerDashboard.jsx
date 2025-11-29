import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ManagerDashboard() {
  const [summary, setSummary] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportMsg, setExportMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, todayRes] = await Promise.all([
        axiosClient.get("/api/attendance/summary"),
        axiosClient.get("/api/attendance/today-status")
      ]);
      setSummary(sumRes.data.data);
      setTodayStatus(todayRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      setExportMsg("Exporting...");
      // export entire month by default = last 7 days range (example)
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);

      const format = (d) => {
        const dt = new Date(d);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      };

      const url = `/api/attendance/export?start=${format(start)}&end=${format(end)}`;
      const res = await axiosClient.get(url, { responseType: "blob" });

      // download blob
      const blob = new Blob([res.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `attendance_export_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setExportMsg("Export downloaded");
      setTimeout(() => setExportMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setExportMsg("Export failed");
      setTimeout(() => setExportMsg(""), 3000);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading manager dashboard…</div>;

  return (
    <div style={styles.container}>
      <h2>Manager Dashboard</h2>

      <div style={styles.row}>
        <div style={styles.card}>
          <h3>Total Employees</h3>
          <p style={styles.big}>{summary?.totalEmployees ?? 0}</p>
        </div>

        <div style={styles.card}>
          <h3>Today's Attendance</h3>
          <p>Present: <b>{summary?.todays?.present ?? 0}</b></p>
          <p>Absent (approx): <b>{summary?.todays?.absent ?? 0}</b></p>
          <p>Late: <b>{summary?.todays?.late ?? 0}</b></p>
        </div>

        <div style={styles.card}>
          <h3>Quick Actions</h3>
          <p>
            <a href="/manager/team">View Team Attendance</a>
          </p>
          <p>
            <a href="/manager/reports">Reports & Export</a>
          </p>
          <button style={styles.actionBtn} onClick={handleExport}>Export last 7 days CSV</button>
          {exportMsg && <div style={{ marginTop: 8 }}>{exportMsg}</div>}
        </div>
      </div>

      <div style={styles.card}>
        <h3>Late Arrivals Today (sample)</h3>
        {todayStatus?.present?.length === 0 ? (
          <p>No one present today.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr><th>Name</th><th>EmployeeId</th><th>CheckIn</th><th>Status</th></tr>
            </thead>
            <tbody>
              {todayStatus.present.slice(0, 10).map(p => (
                <tr key={p.userId}>
                  <td>{p.name}</td>
                  <td>{p.employeeId}</td>
                  <td>{p.checkInTime ? new Date(p.checkInTime).toLocaleTimeString() : '--'}</td>
                  <td>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.card}>
        <h3>Weekly Trend (recent)</h3>
        {Array.isArray(summary?.weeklyTrend) && summary.weeklyTrend.length > 0 ? (
          <div>
            {summary.weeklyTrend.map(w => (
              <div key={w.date} style={{ marginBottom: 6 }}>
                <b>{w.date}</b> — Present: {w.present} / Recorded: {w.totalRecorded}
              </div>
            ))}
          </div>
        ) : (
          <p>No weekly data yet.</p>
        )}
      </div>

      <div style={styles.card}>
        <h3>Department-wise</h3>
        {Array.isArray(summary?.departmentWise) && summary.departmentWise.length > 0 ? (
          <table style={styles.table}>
            <thead><tr><th>Department</th><th>Present</th><th>Total</th></tr></thead>
            <tbody>
              {summary.departmentWise.map(d => (
                <tr key={d._id || d.department}>
                  <td>{d._id || 'Unassigned'}</td>
                  <td>{d.present}</td>
                  <td>{d.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No department data.</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: "24px auto", fontFamily: "Arial", padding: 12 },
  row: { display: "flex", gap: 12, marginBottom: 12 },
  card: { flex: 1, padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 12 },
  big: { fontSize: 28, margin: 0 },
  table: { width: "100%", borderCollapse: "collapse" },
  actionBtn: { marginTop: 8, padding: "8px 12px", background: "#007bff", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }
};
