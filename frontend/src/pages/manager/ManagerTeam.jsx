import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ManagerTeam() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // filters
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [exportMsg, setExportMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      q.set("page", page);
      q.set("limit", limit);
      if (employeeId) q.set("employeeId", employeeId);
      if (date) q.set("date", date);
      if (status) q.set("status", status);

      const res = await axiosClient.get(`/api/attendance/all?${q.toString()}`);
      setItems(res.data.data.items || []);
      setTotal(res.data.data.total || 0);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleExport = async () => {
    try {
      setExportMsg("Exporting...");
      const q = new URLSearchParams();
      if (employeeId) q.set("employeeId", employeeId);
      if (date) q.set("start", date) && q.set("end", date); // single date export
      if (status) q.set("status", status);

      const url = `/api/attendance/export?${q.toString()}`;
      const res = await axiosClient.get(url, { responseType: "blob" });

      const blob = new Blob([res.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `attendance_export_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setExportMsg("Downloaded");
      setTimeout(() => setExportMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setExportMsg("Export failed");
      setTimeout(() => setExportMsg(""), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Team Attendance</h2>

      <div style={styles.card}>
        <form onSubmit={handleSearch} style={styles.form}>
          <div style={styles.row}>
            <div>
              <label>Employee ID</label><br />
              <input value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)} placeholder="EMP2001" style={styles.input} />
            </div>

            <div>
              <label>Date</label><br />
              <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} style={styles.input} />
            </div>

            <div>
              <label>Status</label><br />
              <select value={status} onChange={(e)=>setStatus(e.target.value)} style={styles.input}>
                <option value="">All</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half-day">Half-Day</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <button style={styles.button} type="submit">Filter</button>
              <button type="button" onClick={() => { setEmployeeId(""); setDate(""); setStatus(""); setPage(1); fetchData(); }} style={styles.buttonSecondary}>Clear</button>
            </div>
          </div>
        </form>

        <div style={{ marginTop: 12 }}>
          <button style={styles.button} onClick={handleExport}>Export CSV (filtered)</button>
          {exportMsg && <span style={{ marginLeft: 10 }}>{exportMsg}</span>}
        </div>
      </div>

      <div style={styles.card}>
        {loading ? <p>Loading...</p> : (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>EmployeeId</th>
                  <th>Dept</th>
                  <th>Status</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center" }}>No records</td></tr>
                ) : items.map(it => (
                  <tr key={it._id}>
                    <td>{it.date}</td>
                    <td>{it.userId?.name || "—"}</td>
                    <td>{it.userId?.employeeId || "—"}</td>
                    <td>{it.userId?.department || "—"}</td>
                    <td>{it.status}</td>
                    <td>{it.checkInTime ? new Date(it.checkInTime).toLocaleTimeString() : "—"}</td>
                    <td>{it.checkOutTime ? new Date(it.checkOutTime).toLocaleTimeString() : "—"}</td>
                    <td>{it.totalHours || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={styles.pagination}>
              <button disabled={page <= 1} onClick={()=>setPage(page-1)} style={styles.button}>Prev</button>
              <span>Page {page} of {Math.max(1, Math.ceil(total/limit))}</span>
              <button disabled={page >= Math.ceil(total/limit)} onClick={()=>setPage(page+1)} style={styles.button}>Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1000, margin: "24px auto", padding: 12, fontFamily: "Arial" },
  card: { padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 12 },
  form: {},
  row: { display: "flex", gap: 12, alignItems: "flex-end" },
  input: { padding: 8, borderRadius: 6, border: "1px solid #ccc", minWidth: 150 },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 12 },
  button: { padding: "8px 12px", background: "#007bff", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  buttonSecondary: { padding: "8px 12px", background: "#6c757d", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  pagination: { display: "flex", gap: 12, alignItems: "center", justifyContent: "center", marginTop: 12 }
};
