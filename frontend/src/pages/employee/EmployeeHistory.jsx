
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

/**
 * EmployeeHistory (UI upgrade)
 * - Uses GET /api/attendance/my-history
 * - Optional month filter (sends ?month=YYYY-MM if selected)
 * - Keeps same backend contract
 */

export default function EmployeeHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [month]);

  async function fetchHistory() {
    setLoading(true);
    setError("");
    try {
      const q = month ? `?month=${month}&limit=500` : '?limit=500';
      const res = await axiosClient.get(`/api/attendance/my-history${q}`);
      if (!res.data?.success) {
        setError(res.data?.message || "Failed to load history");
        setLoading(false);
        return;
      }

      // normalize array (support both .data and .data.items shapes)
      let items = [];
      if (Array.isArray(res.data.data)) items = res.data.data;
      else if (res.data.data?.items) items = res.data.data.items;
      else if (Array.isArray(res.data.items)) items = res.data.items;
      else items = res.data.data || [];

      setRecords(items);
      setLoading(false);
    } catch (err) {
      console.error("History fetch error", err);
      setError(err.response?.data?.message || "Network error");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Attendance History</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-300">Filter month</label>
          <input type="month" value={month} onChange={(e)=>setMonth(e.target.value)} className="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100" />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-gray-400">Loading history...</div>
      ) : error ? (
        <div className="mb-4 p-3 rounded bg-red-900/30 text-red-300 text-sm">{error}</div>
      ) : (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Records</h3>
            <div className="text-sm text-gray-400">{records.length} rows</div>
          </div>

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
                {records.length ? records.map((rec)=>(
                  <tr key={rec.date + (rec._id || "")} className="border-t border-gray-700">
                    <td className="py-2">{rec.date}</td>
                    <td className="py-2">{rec.status}</td>
                    <td className="py-2">{rec.checkInTime || "—"}</td>
                    <td className="py-2">{rec.checkOutTime || "—"}</td>
                    <td className="py-2">{rec.totalHours ?? 0}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-gray-400 text-center">No records found for selected month.</td>
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
