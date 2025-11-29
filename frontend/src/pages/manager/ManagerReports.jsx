import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function ManagerReports() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handlePreview = async (e) => {
    e?.preventDefault();
    setMsg("");
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (start) q.set("start", start);
      if (end) q.set("end", end);
      if (employeeId) q.set("employeeId", employeeId);

      // use manager 'all' endpoint for preview
      const res = await axiosClient.get(`/api/attendance/all?${q.toString()}&limit=100`);
      setPreview(res.data.data.items || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMsg("Preview failed");
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setMsg("Exporting...");
      const q = new URLSearchParams();
      if (start) q.set("start", start);
      if (end) q.set("end", end);
      if (employeeId) q.set("employeeId", employeeId);

      const url = `/api/attendance/export?${q.toString()}`;
      const res = await axiosClient.get(url, { responseType: "blob" });

      // download CSV blob
      const blob = new Blob([res.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `attendance_export_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMsg("Export downloaded");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setMsg("Export failed");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Manager Reports & Export</h2>

      <div style={styles.card}>
        <form onSubmit={handlePreview} style={styles.form}>
          <div style={styles.row}>
            <div>
              <label>Start date</label><br />
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={styles.input} />
            </div>

            <div>
              <label>End date</label><br />
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={styles.input} />
            </div>

            <div>
              <label>Employee ID (optional)</label><br />
              <input placeholder="EMP2002" value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)} style={styles.input} />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <button style={styles.button} type="submit">Preview</button>
              <button type="button" onClick={() => { setStart(""); setEnd(""); setEmployeeId(""); setPreview([]); setMsg(""); }} style={styles.buttonSecondary}>Clear</button>
            </div>
          </div>
        </form>

        <div style={{ marginTop: 12 }}>
          <button style={styles.button} onClick={handleExport} disabled={!start && !end}>Export CSV</button>
          <span style={{ marginLeft: 12 }}>{msg}</span>
        </div>
      </div>

      <div style={styles.card}>
        <h3>Preview (first 100 rows)</h3>
        {loading ? <p>Loading...</p> : (
          preview.length === 0 ? <p>No rows to preview.</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Date</th><th>Employee</th><th>EmpID</th><th>Dept</th><th>Status</th><th>CheckIn</th><th>CheckOut</th><th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {preview.map(r => (
                  <tr key={r._id}>
                    <td>{r.date}</td>
                    <td>{r.userId?.name || '—'}</td>
                    <td>{r.userId?.employeeId || '—'}</td>
                    <td>{r.userId?.department || '—'}</td>
                    <td>{r.status}</td>
                    <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleString() : '—'}</td>
                    <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleString() : '—'}</td>
                    <td>{r.totalHours ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 1100, margin: "24px auto", padding: 12, fontFamily: "Arial" },
  card: { padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 12 },
  row: { display: "flex", gap: 12, alignItems: "flex-end" },
  input: { padding: 8, borderRadius: 6, border: "1px solid #ccc", minWidth: 150 },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 12 },
  button: { padding: "8px 12px", background: "#007bff", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  buttonSecondary: { padding: "8px 12px", background: "#6c757d", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }
};
