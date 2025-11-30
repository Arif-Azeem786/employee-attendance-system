
import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";

/* small format helpers */
function fmtDate(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}
function fmtTime(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleTimeString();
  } catch {
    return d;
  }
}

/* CSV builder (simple) */
function buildCsv(rows) {
  const cols = ["date", "employeeId", "name", "department", "checkInTime", "checkOutTime", "status", "totalHours"];
  const lines = [cols.join(",")];
  rows.forEach((r) => {
    const row = {
      date: r.date ?? "",
      employeeId: r.userId?.employeeId ?? r.employeeId ?? "",
      name: r.userId?.name ?? r.name ?? "",
      department: r.userId?.department ?? r.department ?? "",
      checkInTime: r.checkInTime ? new Date(r.checkInTime).toISOString() : "",
      checkOutTime: r.checkOutTime ? new Date(r.checkOutTime).toISOString() : "",
      status: r.status ?? "",
      totalHours: r.totalHours ?? r.hours ?? 0,
    };
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    lines.push(cols.map(c => esc(row[c])).join(","));
  });
  return lines.join("\n");
}

export default function ManagerReports() {
  const [filters, setFilters] = useState({ employeeQuery: "", dateFrom: "", dateTo: "" });
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(""); // friendly messages when preview empty etc.

  function onChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setNotice("");
    setError("");
  }

  function buildQuery(params = {}) {
    const p = { ...params };
    if (filters.dateFrom) p.start = filters.dateFrom;
    if (filters.dateTo) p.end = filters.dateTo;
    if (params.limit) p.limit = params.limit;

    // Only include employeeId param when user explicitly typed an EMP-style id
    const emp = (filters.employeeQuery || "").trim();
    if (emp && /^EMP/i.test(emp)) {
      p.employeeId = emp;
    }

    const parts = Object.entries(p)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return parts.length ? `?${parts.join("&")}` : "";
  }

  async function onPreview(e) {
    e?.preventDefault();
    setLoading(true);
    setPreview([]);
    setError("");
    setNotice("");
    try {
      // request a large page (server-side limit might still apply)
      const q = buildQuery({ limit: 1000 });
      const res = await axiosClient.get(`/api/attendance/all${q}`);

      // robust extraction
      let items = [];
      if (Array.isArray(res.data?.data)) items = res.data.data;
      else if (Array.isArray(res.data?.items)) items = res.data.items;
      else if (Array.isArray(res.data?.data?.items)) items = res.data.data.items;
      else items = res.data?.data || res.data?.items || [];

      // If user typed a name (not EMP id), filter client-side by name substring
      const qText = (filters.employeeQuery || "").trim().toLowerCase();
      if (qText && !/^EMP/i.test(qText)) {
        const filtered = items.filter((r) => {
          const name =
            (r.userId && (r.userId.name || r.userId.fullName)) ||
            r.name ||
            r.employeeName ||
            "";
          return name.toString().toLowerCase().includes(qText);
        });
        items = filtered;
      }

      setPreview(items || []);
      if (!items || items.length === 0) {
        setNotice("No preview data (try widening date range or check employee id/name).");
      }
      setLoading(false);
    } catch (err) {
      console.error("Preview error", err);
      setError(err?.response?.data?.message || "Network error while fetching preview");
      setLoading(false);
    }
  }

  async function onExport(e) {
    e?.preventDefault();
    setExporting(true);
    setError("");
    setNotice("");
    try {
      const empQuery = (filters.employeeQuery || "").trim();
      // If user entered EMP ID (server supports employeeId), we'll use backend export for efficiency
      if (empQuery && /^EMP/i.test(empQuery)) {
        // build backend query for export
        const parts = [];
        if (filters.dateFrom) parts.push(`start=${encodeURIComponent(filters.dateFrom)}`);
        if (filters.dateTo) parts.push(`end=${encodeURIComponent(filters.dateTo)}`);
        parts.push(`employeeId=${encodeURIComponent(empQuery)}`);
        const url = `/api/attendance/export?${parts.join("&")}`;
        const res = await axiosClient.get(url, { responseType: "blob" });

        // get filename from content-disposition if present
        const disposition = res.headers["content-disposition"] || res.headers["Content-Disposition"];
        let filename = `attendance_export_${Date.now()}.csv`;
        if (disposition) {
          const match = disposition.match(/filename="?([^"]+)"?/);
          if (match) filename = match[1];
        }

        const urlBlob = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = urlBlob;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(urlBlob);
        setExporting(false);
        return;
      }

      // Otherwise (search by name or no emp), we export client-side from preview dataset.
      // If preview is empty, fetch the large dataset then filter by name (same as preview logic)
      let rows = preview && preview.length ? preview : [];
      if ((!rows || rows.length === 0)) {
        // fetch large page and filter
        const q = buildQuery({ limit: 2000 });
        const res = await axiosClient.get(`/api/attendance/all${q}`);
        rows = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data?.data?.items)
          ? res.data.data.items
          : res.data?.data || res.data?.items || [];
        const qText = (filters.employeeQuery || "").trim().toLowerCase();
        if (qText) {
          rows = rows.filter((r) => {
            const name =
              (r.userId && (r.userId.name || r.userId.fullName)) ||
              r.name ||
              r.employeeName ||
              "";
            return name.toString().toLowerCase().includes(qText);
          });
        }
      }

      // Build CSV client-side and download
      const csv = buildCsv(rows || []);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const urlBlob = window.URL.createObjectURL(blob);
      link.href = urlBlob;
      link.setAttribute("download", `attendance_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);

      setExporting(false);
      setNotice("Export downloaded (client-side).");
    } catch (err) {
      console.error("Export error", err);
      setError(err?.response?.data?.message || "Export failed");
      setExporting(false);
    }
  }

  function getName(r) {
    return r.userId?.name || r.name || r.employeeName || "—";
  }
  function getEmployeeId(r) {
    return r.userId?.employeeId || r.employeeId || r.empId || "—";
  }
  function getHours(r) {
    return r.totalHours ?? r.hours ?? r.duration ?? r.total ?? 0;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <div className="text-sm text-gray-400">Generate and export CSV</div>
      </div>

      <div className="card mb-4">
        <form onSubmit={onPreview} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            name="employeeQuery"
            value={filters.employeeQuery}
            onChange={onChange}
            placeholder="Employee ID (EMP...) or partial name"
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100"
          />
          <input
            name="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={onChange}
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100"
          />
          <input
            name="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={onChange}
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100"
          />
          <div className="flex gap-2 items-center">
            <button type="submit" className="bg-[#10b981] hover:bg-[#0ea36b] text-black px-4 py-2 rounded">
              Preview
            </button>
            <button onClick={onExport} className="bg-gray-700/40 px-4 py-2 rounded" disabled={exporting}>
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </form>
        <div className="mt-2 text-xs text-gray-400">
          Tip: Type an <strong>EMP id</strong> (e.g. EMP001) to let the backend filter & export faster. Type a partial name to search by name (client-side).
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded bg-red-900/30 text-red-300 text-sm">{error}</div>}
      {notice && <div className="mb-4 p-3 rounded bg-yellow-900/20 text-yellow-200 text-sm">{notice}</div>}

      <div className="card">
        <h3 className="font-semibold mb-3">Preview</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-400">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">EmployeeId</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Check-In</th>
                <th className="py-2 pr-4">Check-Out</th>
                <th className="py-2 pr-4">Hours</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-gray-400 text-center">Loading...</td>
                </tr>
              ) : preview && preview.length ? (
                preview.map((r) => (
                  <tr key={r._id || r.id || `${getEmployeeId(r)}_${r.date}`} className="border-t border-gray-700">
                    <td className="py-2">{getName(r)}</td>
                    <td className="py-2">{getEmployeeId(r)}</td>
                    <td className="py-2">{fmtDate(r.date || r.createdAt)}</td>
                    <td className="py-2">{r.status ?? r.attendanceStatus ?? "—"}</td>
                    <td className="py-2">{fmtTime(r.checkInTime ?? r.checkIn)}</td>
                    <td className="py-2">{fmtTime(r.checkOutTime ?? r.checkOut)}</td>
                    <td className="py-2">{getHours(r)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-gray-400 text-center">No preview data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
