
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // today: attendance for today (status, checkInTime, checkOutTime, totalHours)
  // monthly: present/absent/late/halfDay/totalHours
  // recent: array of attendance rows
  const [today, setToday] = useState(null);
  const [monthly, setMonthly] = useState({});
  const [recent, setRecent] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      // request three endpoints in parallel
      const [todayRes, summaryRes, historyRes] = await Promise.allSettled([
        axiosClient.get("/api/attendance/today"),
        axiosClient.get("/api/attendance/my-summary"),
        axiosClient.get("/api/attendance/my-history?limit=7")
      ]);

      // TODAY
      if (todayRes.status === "fulfilled" && todayRes.value?.data?.success !== false) {
        const payload = todayRes.value.data?.data ?? todayRes.value.data ?? {};
        setToday({
          status: payload.status ?? payload.attendanceStatus ?? payload.state ?? "Not Checked In",
          checkInTime: payload.checkInTime ?? payload.checkIn ?? null,
          checkOutTime: payload.checkOutTime ?? payload.checkOut ?? null,
          totalHours: payload.totalHours ?? payload.hours ?? 0
        });
      } else {
        setToday(null);
      }

      // MONTHLY / SUMMARY
      if (summaryRes.status === "fulfilled" && summaryRes.value?.data?.success !== false) {
        const payload = summaryRes.value.data?.data ?? summaryRes.value.data ?? {};
        setMonthly({
          present: payload.present ?? payload.presentDays ?? 0,
          absent: payload.absent ?? payload.absentDays ?? 0,
          late: payload.late ?? 0,
          halfDay: payload.halfDay ?? payload.half_day ?? payload.halfDays ?? 0,
          totalHours: payload.totalHours ?? payload.total_hours ?? 0
        });
      } else {
        setMonthly({});
      }

      // RECENT HISTORY (last 7)
      if (historyRes.status === "fulfilled" && historyRes.value?.data?.success !== false) {
        // Accept several shapes: { data: { items: [...] } } or { data: [...] } or { items: [...] }
        const res = historyRes.value.data;
        let items = [];
        if (Array.isArray(res?.data)) items = res.data;
        else if (Array.isArray(res?.items)) items = res.items;
        else if (Array.isArray(res?.data?.items)) items = res.data.items;
        else if (Array.isArray(res?.data?.data)) items = res.data.data;
        else items = res?.data ?? res?.items ?? [];

        // normalize each record to have: date, status, checkInTime, checkOutTime, totalHours
        const normalized = (items || []).map((r) => ({
          _id: r._id || r.id || `${r.date}_${r.userId || ""}`,
          date: r.date ?? r.day ?? r.createdAt ?? null,
          status: r.status ?? r.attendanceStatus ?? r.state ?? "—",
          checkInTime: r.checkInTime ?? r.checkIn ?? r.in ?? null,
          checkOutTime: r.checkOutTime ?? r.checkOut ?? r.out ?? null,
          totalHours: r.totalHours ?? r.hours ?? r.duration ?? 0
        }));
        setRecent(normalized);
      } else {
        setRecent([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch error", err);
      setError("Network error fetching dashboard");
      setLoading(false);
    }
  }

  async function doAction(action) {
    setActionLoading(true);
    setError("");
    try {
      const res = await axiosClient.post(`/api/attendance/${action}`);
      if (!res.data?.success) {
        setError(res.data?.message || "Action failed");
        setActionLoading(false);
        return;
      }
      // refresh dashboard after action
      await fetchAll();
      setActionLoading(false);
    } catch (err) {
      console.error("Attendance action error", err);
      setError(err.response?.data?.message || "Network error");
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-400">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
        <div className="text-sm text-gray-400">Welcome back</div>
      </div>

      {error && <div className="mb-4 p-3 rounded bg-red-900/30 text-red-300 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's status */}
        <div className="card">
          <h3 className="font-semibold mb-3">Today's Status</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <div><span className="text-gray-400">Status: </span><span className="font-medium">{today?.status || "Not Checked In"}</span></div>
            <div><span className="text-gray-400">Check-In: </span><span className="font-medium">{today?.checkInTime ? fmtTime(today.checkInTime) : "—"}</span></div>
            <div><span className="text-gray-400">Check-Out: </span><span className="font-medium">{today?.checkOutTime ? fmtTime(today.checkOutTime) : "—"}</span></div>
            <div><span className="text-gray-400">Total Hours: </span><span className="font-medium">{today?.totalHours ?? "—"}</span></div>
          </div>

          <div className="mt-4 flex gap-3">
            {!today?.checkInTime && (
              <button
                onClick={() => doAction("checkin")}
                disabled={actionLoading}
                className="bg-brand-fallback hover:bg-[#0ea36b] text-black px-4 py-2 rounded font-medium"
              >
                {actionLoading ? "Processing..." : "Check In"}
              </button>
            )}

            {today?.checkInTime && !today?.checkOutTime && (
              <button
                onClick={() => doAction("checkout")}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
              >
                {actionLoading ? "Processing..." : "Check Out"}
              </button>
            )}
          </div>
        </div>

        {/* Monthly summary */}
        <div className="card">
          <h3 className="font-semibold mb-3">This Month</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-900 rounded">
              <div className="text-sm text-gray-300">Present</div>
              <div className="text-xl font-bold">{monthly.present ?? 0}</div>
            </div>
            <div className="p-3 bg-gray-900 rounded">
              <div className="text-sm text-gray-300">Absent</div>
              <div className="text-xl font-bold">{monthly.absent ?? 0}</div>
            </div>
            <div className="p-3 bg-gray-900 rounded">
              <div className="text-sm text-gray-300">Late</div>
              <div className="text-xl font-bold">{monthly.late ?? 0}</div>
            </div>
            <div className="p-3 bg-gray-900 rounded">
              <div className="text-sm text-gray-300">Half-Day</div>
              <div className="text-xl font-bold">{monthly.halfDay ?? 0}</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            <div>Total hours: <span className="font-medium">{monthly.totalHours ?? 0}</span></div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/employee/history")} className="text-left bg-gray-700/30 px-3 py-2 rounded hover:bg-gray-700">View History</button>
            <button onClick={() => navigate("/employee/summary")} className="text-left bg-gray-700/30 px-3 py-2 rounded hover:bg-gray-700">View Summary</button>
            <button onClick={() => navigate("/employee/calendar")} className="text-left bg-gray-700/30 px-3 py-2 rounded hover:bg-gray-700">Open Calendar</button>
          </div>
        </div>
      </div>

      {/* Last 7 days */}
      <div className="mt-6 card">
        <h3 className="font-semibold mb-3">Recent Attendance (Last 7 Days)</h3>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-400">
              <tr>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Check-In</th>
                <th className="py-2 pr-4">Check-Out</th>
                <th className="py-2 pr-4">Hours</th>
              </tr>
            </thead>
            <tbody>
              {recent && recent.length ? (
                recent.map((r) => (
                  <tr key={r._id} className="border-t border-gray-700">
                    <td className="py-2">{fmtDate(r.date)}</td>
                    <td className="py-2">{r.status}</td>
                    <td className="py-2">{r.checkInTime ? fmtTime(r.checkInTime) : "—"}</td>
                    <td className="py-2">{r.checkOutTime ? fmtTime(r.checkOutTime) : "—"}</td>
                    <td className="py-2">{r.totalHours ?? 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-gray-400 text-center">No recent records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
