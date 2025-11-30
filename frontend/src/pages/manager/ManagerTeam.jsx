
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

/* helpers */
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

/* Defensive helpers to extract employee name/id from many shapes */
function extractName(r) {
  if (!r) return "—";
  const tryVals = [];
  tryVals.push(r.name, r.fullName, r.employeeName, r.empName, r.username, r.email);
  if (r.user) {
    tryVals.push(r.user.name, r.user.fullName, r.user.employeeName, r.user.email);
  }
  if (r.employee) {
    tryVals.push(r.employee.name, r.employee.fullName);
  }
  tryVals.push(r._id, r.id);
  for (const v of tryVals) {
    if (v && typeof v === "string" && v.trim()) return v;
  }
  return "—";
}
function extractEmployeeId(r) {
  if (!r) return "—";
  const tryVals = [];
  tryVals.push(r.employeeId, r.empId, r.employee_id, r.employeeID);
  if (r.user) {
    tryVals.push(r.user.employeeId, r.user.empId, r.user.employee_id);
  }
  if (r.employee) {
    tryVals.push(r.employee.employeeId);
  }
  for (const v of tryVals) {
    if (v) return v;
  }
  return "—";
}
function extractHours(r) {
  if (!r) return 0;
  return r.totalHours ?? r.hours ?? r.duration ?? r.total ?? 0;
}

/* simple check if the search text looks like an employeeId */
function looksLikeEmployeeId(q) {
  if (!q) return false;
  const s = q.trim().toUpperCase();
  return /^EMP\d+/.test(s) || /^[0-9]+$/.test(s);
}

export default function ManagerTeam() {
  const [filters, setFilters] = useState({ employeeId: "", status: "", dateFrom: "", dateTo: "" });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line
  }, []);

  function buildQuery(params) {
    const p = { ...filters, ...params };
    const parts = [];
    // Backend expects keys: employeeId, userId, date, status, page, limit, start,end
    // We'll map dateFrom/dateTo -> start/end for export if needed, otherwise leave as date.
    if (p.employeeId) parts.push(`employeeId=${encodeURIComponent(p.employeeId)}`);
    if (p.status) parts.push(`status=${encodeURIComponent(p.status)}`);
    if (p.dateFrom && p.dateTo) parts.push(`start=${encodeURIComponent(p.dateFrom)}&end=${encodeURIComponent(p.dateTo)}`);
    else if (p.dateFrom) parts.push(`start=${encodeURIComponent(p.dateFrom)}`);
    else if (p.dateTo) parts.push(`end=${encodeURIComponent(p.dateTo)}`);
    if (p.limit) parts.push(`limit=${encodeURIComponent(p.limit)}`);
    if (parts.length) return `?${parts.join("&")}`;
    return "";
  }

  async function fetchRecords(params = {}) {
    setLoading(true);
    setError("");
    try {
      // If user typed a name (not an employeeId), we'll fetch records and filter client-side by name
      const qVal = (params?.employeeId ?? filters.employeeId).trim();
      if (qVal && !looksLikeEmployeeId(qVal)) {
        // name search: fetch many rows (limited) then filter by name substring in various fields
        const q = `?limit=1000${filters.status ? `&status=${encodeURIComponent(filters.status)}` : ""}`;
        const res = await axiosClient.get(`/api/attendance/all${q}`);
        let items = [];
        if (Array.isArray(res.data?.data)) items = res.data.data;
        else if (Array.isArray(res.data?.items)) items = res.data.items;
        else if (res.data?.data?.items) items = res.data.data.items;
        else items = res.data?.data || res.data?.items || [];

        const term = qVal.toLowerCase();
        const filtered = items.filter((r) => {
          const nameCandidates = [
            r.name,
            r.employeeName,
            r.fullName,
            r.user?.name,
            r.user?.fullName,
            r.user?.employeeName,
            r.user?.email,
            r.email
          ];
          return nameCandidates.some((c) => (c || "").toString().toLowerCase().includes(term));
        });

        setRecords(filtered);
        setLoading(false);
        return;
      }

      // else normal path: use employeeId or date / status filters
      const q = buildQuery(params);
      const res = await axiosClient.get(`/api/attendance/all${q}`);
      let items = [];
      if (Array.isArray(res.data?.data)) items = res.data.data;
      else if (Array.isArray(res.data?.items)) items = res.data.items;
      else if (res.data?.data?.items) items = res.data.data.items;
      else items = res.data?.data || res.data?.items || [];

      setRecords(items);
      setLoading(false);
    } catch (err) {
      console.error("Team fetch error", err);
      setError(err?.response?.data?.message || "Network error");
      setLoading(false);
    }
  }

  function onChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function onSearch(e) {
    e?.preventDefault();
    // if input looks like employeeId keep as employeeId, otherwise pass as employeeId param empty and filtering will be client-side
    fetchRecords();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Team Attendance</h1>
        <div className="text-sm text-gray-400">View and filter team attendance</div>
      </div>

      <div className="card mb-4">
        <form onSubmit={onSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            name="employeeId"
            value={filters.employeeId}
            onChange={onChange}
            placeholder="Employee ID or name"
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100"
          />
          <select
            name="status"
            value={filters.status}
            onChange={onChange}
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100"
          >
            <option value="">All status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half-day">Half-Day</option>
          </select>

          <input
            name="dateFrom"
            value={filters.dateFrom}
            onChange={onChange}
            type="date"
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100"
          />
          <input
            name="dateTo"
            value={filters.dateTo}
            onChange={onChange}
            type="date"
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100"
          />

          <div className="md:col-span-4 flex gap-2 mt-2">
            <button onClick={onSearch} className="bg-[#10b981] hover:bg-[#0ea36b] text-black px-4 py-2 rounded">
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({ employeeId: "", status: "", dateFrom: "", dateTo: "" });
                fetchRecords({});
              }}
              className="px-4 py-2 rounded border border-gray-700"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-gray-400">Loading team records...</div>
      ) : error ? (
        <div className="mb-4 p-3 rounded bg-red-900/30 text-red-300 text-sm">{error}</div>
      ) : (
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Records</h3>
            <div className="text-sm text-gray-400">{records.length} rows</div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-400">
                <tr>
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">EmployeeId</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Check-In</th>
                  <th className="py-2 pr-4">Check-Out</th>
                  <th className="py-2 pr-4">Hours</th>
                </tr>
              </thead>
              <tbody>
                {records.length ? (
                  records.map((r) => (
                    <tr key={r._id || r.id || `${extractEmployeeId(r)}_${r.date}`} className="border-t border-gray-700">
                      <td className="py-2">{extractName(r)}</td>
                      <td className="py-2">{extractEmployeeId(r)}</td>
                      <td className="py-2">{fmtDate(r.date || r.createdAt || r.day)}</td>
                      <td className="py-2">{r.status ?? r.attendanceStatus ?? r.state ?? "—"}</td>
                      <td className="py-2">{fmtTime(r.checkInTime ?? r.checkIn ?? r.in)}</td>
                      <td className="py-2">{fmtTime(r.checkOutTime ?? r.checkOut ?? r.out)}</td>
                      <td className="py-2">{extractHours(r)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-gray-400 text-center">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
