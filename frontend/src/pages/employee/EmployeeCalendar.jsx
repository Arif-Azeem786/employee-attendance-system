
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

/**
 * EmployeeCalendar.jsx - fixed syntax errors and layout tweaks
 * - Uses axiosClient to fetch /api/attendance/my-history?month=YYYY-MM
 * - Renders month picker, calendar grid, legend, and clickable date details
 */

export default function EmployeeCalendar() {
  const today = new Date();
  const [month, setMonth] = useState(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`; // "YYYY-MM"
  });

  const [records, setRecords] = useState([]); // array of attendance records
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null); // "YYYY-MM-DD"
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line
  }, [month]);

  async function fetchRecords() {
    setLoading(true);
    setError("");
    setRecords([]);
    setSelectedDate(null);
    setSelectedRecord(null);

    try {
      const res = await axiosClient.get(`/api/attendance/my-history?month=${month}&limit=500`);
      let items = [];
      if (res.data?.data?.items) items = res.data.data.items;
      else if (Array.isArray(res.data?.data)) items = res.data.data;
      else if (res.data?.items) items = res.data.items;
      else items = res.data?.data || [];

      const normalized = items.map((it) => {
        return {
          ...it,
          date: it.date?.slice(0, 10) || (it.createdAt ? it.createdAt.slice(0, 10) : null),
        };
      });

      setRecords(normalized);
      setLoading(false);
    } catch (err) {
      console.error("Calendar fetch error", err);
      setError(err.response?.data?.message || "Failed to load calendar data.");
      setLoading(false);
    }
  }

  // helper: map date -> record
  const byDate = {};
  records.forEach((r) => {
    if (r?.date) byDate[r.date] = r;
  });

  // build calendar grid for selected month
  const [yStr, mStr] = month.split("-");
  const year = Number(yStr);
  const monthIdx = Number(mStr); // 1-indexed
  const daysInMonth = new Date(year, monthIdx, 0).getDate();
  const firstWeekday = new Date(year, monthIdx - 1, 1).getDay(); // 0..6 (Sun..Sat)

  const colorClassFor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "present":
      case "checked-in":
      case "checked-out":
        return "bg-green-600 text-black";
      case "late":
        return "bg-yellow-300 text-black";
      case "half-day":
      case "halfday":
      case "half_day":
        return "bg-orange-400 text-black";
      case "absent":
      default:
        return "bg-red-600 text-white";
    }
  };

  const handleClickDay = (d) => {
    const dateStr = `${year}-${String(monthIdx).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedRecord(byDate[dateStr] || null);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Attendance Calendar</h1>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-300">Choose month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100"
          />
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block rounded bg-green-600" /> <span className="text-gray-300">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block rounded bg-yellow-300" /> <span className="text-gray-300">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block rounded bg-orange-400" /> <span className="text-gray-300">Half-Day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block rounded bg-red-600" /> <span className="text-gray-300">Absent</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-gray-400">Loading calendar...</div>
      ) : error ? (
        <div className="p-3 rounded bg-red-900/30 text-red-300">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* calendar grid */}
          <div className="card lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">{new Date(year, monthIdx - 1).toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
                <div className="text-xl font-semibold">Monthly Attendance</div>
              </div>
              <div className="text-sm text-gray-400">Click a date to view details</div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* empty leading cells */}
              {Array.from({ length: firstWeekday }).map((_, i) => <div key={"e"+i} className="h-20" />)}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const d = idx + 1;
                const dateStr = `${year}-${String(monthIdx).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const rec = byDate[dateStr];
                return (
                  <button
                    key={dateStr}
                    onClick={() => handleClickDay(d)}
                    className="relative h-20 rounded-md p-2 flex flex-col justify-between items-start border border-gray-700 hover:scale-[1.01] transform transition"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-sm font-medium">{d}</div>
                      <div className={`text-xs px-2 py-0.5 rounded ${rec ? colorClassFor(rec.status) : "bg-red-600 text-white"}`}>
                        {rec ? rec.status : "absent"}
                      </div>
                    </div>

                    <div className="w-full mt-2 flex items-end justify-end">
                      {rec?.totalHours ? (
                        <div className="text-xs text-gray-300">{rec.totalHours}h</div>
                      ) : (
                        <div className="text-xs text-gray-500">—</div>
                      )}
                    </div>

                    {/* colored indicator dot bottom-left */}
                    <div style={{ position: "absolute", bottom: 8, left: 8 }}>
                      <span className={`inline-block w-3 h-3 rounded ${rec ? colorClassFor(rec.status).split(" ")[0] : "bg-red-600"}`}></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* detail panel */}
          <div className="card">
            <h3 className="font-semibold mb-3">Date Details</h3>
            {selectedDate ? (
              selectedRecord ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-300">Date</div>
                  <div className="text-base font-medium">{selectedDate}</div>

                  <div className="text-sm text-gray-300">Status</div>
                  <div className="text-base font-medium">{selectedRecord.status}</div>

                  <div className="text-sm text-gray-300">Check In</div>
                  <div className="text-base font-medium">{selectedRecord.checkInTime ? new Date(selectedRecord.checkInTime).toLocaleString() : "—"}</div>

                  <div className="text-sm text-gray-300">Check Out</div>
                  <div className="text-base font-medium">{selectedRecord.checkOutTime ? new Date(selectedRecord.checkOutTime).toLocaleString() : "—"}</div>

                  <div className="text-sm text-gray-300">Total Hours</div>
                  <div className="text-base font-medium">{selectedRecord.totalHours ?? 0}</div>

                  {selectedRecord.note && (
                    <>
                      <div className="text-sm text-gray-300">Note</div>
                      <div className="text-base">{selectedRecord.note}</div>
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-sm text-gray-300">Date</div>
                  <div className="text-base font-medium">{selectedDate}</div>
                  <div className="mt-4 text-sm text-gray-300">No attendance recorded for this date (Absent)</div>
                </div>
              )
            ) : (
              <div className="text-sm text-gray-400">Select a date to view attendance details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
