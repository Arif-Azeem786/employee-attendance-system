
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

/**
 * Employee Summary page (UI upgrade)
 * - Fetches summary from GET /api/attendance/my-summary
 * - If backend doesn't provide a daily breakdown, fetches /api/attendance/my-history
 *   and builds `byDay` for the last N days.
 * - Shows stats and a small SVG donut + bar chart (no extra chart deps required)
 */

export default function EmployeeSummary() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    totalHours: 0,
    byDay: [], // daily breakdown (constructed if backend didn't provide)
  });
  const [error, setError] = useState("");

  // how many past days to show in the "Recent Days" list / sparkline
  const DAYS = 14;

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line
  }, []);

  // helper to format YYYY-MM-DD
  function toYMD(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // build last N dates array (oldest first)
  function lastNDates(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push(toYMD(d));
    }
    return out;
  }

  async function fetchSummary() {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/api/attendance/my-summary");
      if (!res.data) {
        setError("Failed to load summary");
        setLoading(false);
        return;
      }

      const data = res.data.data || {};

      // basic counts (defensive)
      const present = data.present ?? 0;
      const absent = data.absent ?? 0;
      const late = data.late ?? 0;
      const halfDay = data.halfDay ?? data.half_day ?? 0;
      const totalHours = Math.round((data.totalHours ?? data.total_hours ?? 0) * 100) / 100;

      // try probable daily key names
      let byDay = data.byDay || data.daily || data.breakdown || [];

      // if backend did not provide byDay, fetch history and construct it
      if (!Array.isArray(byDay) || byDay.length === 0) {
        try {
          // fetch last 30 history items (server sorts desc)
          const histRes = await axiosClient.get("/api/attendance/my-history?limit=30");
          let items = [];
          if (Array.isArray(histRes.data?.data?.items)) items = histRes.data.data.items;
          else if (Array.isArray(histRes.data?.items)) items = histRes.data.items;
          else items = histRes.data?.data || histRes.data?.items || [];

          // convert attendance items to map by date 'YYYY-MM-DD'
          const map = new Map();
          items.forEach((it) => {
            const d = it.date ?? (it.checkInTime ? toYMD(it.checkInTime) : null) ?? it.day;
            if (!d) return;
            // prefer most recent record per date (attendance.find earlier is fine)
            map.set(String(d), {
              date: String(d),
              status: it.status ?? it.attendanceStatus ?? "present",
              totalHours: it.totalHours ?? it.hours ?? 0,
              presentCount: (it.status ?? it.attendanceStatus ?? "").toString().toLowerCase() === "present" || (it.status ?? "").toString().toLowerCase() === "late" ? 1 : 0,
            });
          });

          // build last N days array using map; if no record => absent
          const dates = lastNDates(DAYS);
          byDay = dates.map((dt) => {
            if (map.has(dt)) return map.get(dt);
            return { date: dt, status: "absent", totalHours: 0, presentCount: 0 };
          });
        } catch (err) {
          console.warn("Couldn't build byDay from history", err);
          byDay = [];
        }
      } else {
        // ensure normalized shape for existing byDay entries (date, status, totalHours)
        byDay = byDay.slice(-DAYS).map((d) => {
          if (typeof d === "number") return { date: "", status: "", totalHours: d, presentCount: d > 0 ? 1 : 0 };
          return {
            date: d.date ?? d.day ?? d.label ?? "",
            status: d.status ?? (d.present ? "present" : d.absent ? "absent" : ""),
            totalHours: d.totalHours ?? d.hours ?? d.h ?? 0,
            presentCount: d.present ? 1 : 0,
          };
        });
      }

      setSummary({ present, absent, late, halfDay, totalHours, byDay });
      setLoading(false);
    } catch (err) {
      console.error("fetchSummary error", err);
      setError(err?.response?.data?.message || "Network error");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-400">Loading summary...</div>
      </div>
    );
  }

  // small chart utilities (same as earlier component)
  const { present, absent, late, halfDay, totalHours, byDay } = summary;
  const total = Math.max(present + absent + late + halfDay, 1);
  const C = 2 * Math.PI * 15;
  const seg = (value) => (value / total) * C;

  const colors = {
    present: "#10b981",
    absent: "#ef4444",
    late: "#f59e0b",
    halfDay: "#fb923c",
  };

  // build spark values from byDay (prefer present counts)
  const sparkValues = Array.isArray(byDay) && byDay.length
    ? byDay.map((d) => (typeof d === "number" ? d : d.presentCount ?? (d.status === "present" || d.status === "late" ? 1 : 0)))
    : [];

  const sparkMax = Math.max(...sparkValues, 1);

  // date display helper
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

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Monthly Summary</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-900/30 text-red-300 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold mb-2">This Month — Overview</h3>
              <p className="text-sm text-gray-300 max-w-xl">
                Summary of attendance for the current month. Counts and total hours are shown below.
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-400">Total hours</div>
              <div className="text-xl font-bold">{totalHours}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center justify-center">
              <svg width="120" height="120" viewBox="0 0 60 60" aria-hidden>
                <g transform="translate(30,30)">
                  <circle r="15" fill="none" stroke="#0f1724" strokeWidth="10" />
                  <circle r="15" fill="none" stroke={colors.present} strokeWidth="10"
                    strokeLinecap="butt" strokeDasharray={`${seg(present)} ${C - seg(present)}`}
                    strokeDashoffset={-0} transform="rotate(-90)" />
                  <circle r="15" fill="none" stroke={colors.absent} strokeWidth="10"
                    strokeLinecap="butt" strokeDasharray={`${seg(absent)} ${C - seg(absent)}`}
                    strokeDashoffset={-seg(present)} transform="rotate(-90)" />
                  <circle r="15" fill="none" stroke={colors.late} strokeWidth="10"
                    strokeLinecap="butt" strokeDasharray={`${seg(late)} ${C - seg(late)}`}
                    strokeDashoffset={-(seg(present) + seg(absent))} transform="rotate(-90)" />
                  <circle r="15" fill="none" stroke={colors.halfDay} strokeWidth="10"
                    strokeLinecap="butt" strokeDasharray={`${seg(halfDay)} ${C - seg(halfDay)}`}
                    strokeDashoffset={-(seg(present) + seg(absent) + seg(late))} transform="rotate(-90)" />

                  <text x="0" y="3" fontSize="6" fill="#cbd5e1" textAnchor="middle" fontWeight="600">
                    {Math.round((present / total) * 100)}%
                  </text>
                  <text x="0" y="10" fontSize="3.8" fill="#94a3b8" textAnchor="middle">
                    Present
                  </text>
                </g>
              </svg>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-900 rounded flex items-center gap-3">
                  <div className="w-12 h-12 rounded flex items-center justify-center bg-green-600/20 text-green-200 font-semibold">P</div>
                  <div>
                    <div className="text-sm text-gray-300">Present</div>
                    <div className="text-lg font-medium">{present}</div>
                  </div>
                </div>

                <div className="p-3 bg-gray-900 rounded flex items-center gap-3">
                  <div className="w-12 h-12 rounded flex items-center justify-center bg-red-600/20 text-red-200 font-semibold">A</div>
                  <div>
                    <div className="text-sm text-gray-300">Absent</div>
                    <div className="text-lg font-medium">{absent}</div>
                  </div>
                </div>

                <div className="p-3 bg-gray-900 rounded flex items-center gap-3">
                  <div className="w-12 h-12 rounded flex items-center justify-center bg-yellow-400/20 text-yellow-300 font-semibold">L</div>
                  <div>
                    <div className="text-sm text-gray-300">Late</div>
                    <div className="text-lg font-medium">{late}</div>
                  </div>
                </div>

                <div className="p-3 bg-gray-900 rounded flex items-center gap-3">
                  <div className="w-12 h-12 rounded flex items-center justify-center bg-orange-500/20 text-orange-200 font-semibold">H</div>
                  <div>
                    <div className="text-sm text-gray-300">Half-Day</div>
                    <div className="text-lg font-medium">{halfDay}</div>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <h4 className="text-sm text-gray-300 mb-3">Distribution</h4>
                <div className="space-y-3">
                  {[
                    { label: "Present", value: present, color: colors.present },
                    { label: "Absent", value: absent, color: colors.absent },
                    { label: "Late", value: late, color: colors.late },
                    { label: "Half-Day", value: halfDay, color: colors.halfDay }
                  ].map((it) => {
                    const widthPct = Math.round((it.value / total) * 100);
                    return (
                      <div key={it.label} className="flex items-center gap-4">
                        <div className="w-28 text-sm text-gray-300">{it.label}</div>
                        <div className="flex-1 bg-gray-900 rounded h-3 overflow-hidden">
                          <div style={{ width: `${widthPct}%`, background: it.color }} className="h-3" title={`${widthPct}%`} />
                        </div>
                        <div className="w-12 text-right font-medium">{it.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm text-gray-300 mb-3">Last days (trend)</h4>
            {sparkValues.length ? (
              <div className="w-full bg-gray-900 rounded p-3">
                <svg viewBox={`0 0 ${sparkValues.length * 10} 40`} width="100%" height="60">
                  {sparkValues.map((v, i) => {
                    const barH = Math.max(1, Math.round((v / sparkMax) * 30));
                    const x = i * 10 + 2;
                    const y = 35 - barH;
                    return <rect key={i} x={x} y={y} width={6} height={barH} rx={2} fill="#10b981" opacity={0.9} />;
                  })}
                </svg>
                <div className="text-xs text-gray-400 mt-2">Small trend of present counts (or generated daily metric).</div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">No recent daily breakdown available.</div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Recent Days</h3>

          {Array.isArray(byDay) && byDay.length ? (
            <div className="space-y-2 max-h-[50vh] overflow-auto">
              {byDay.map((d, idx) => {
                const date = d.date ?? d.day ?? d.label ?? `Day ${idx + 1}`;
                const status = d.status ?? (d.presentCount ? "present" : "absent");
                const hours = d.totalHours ?? d.hours ?? d.h ?? 0;
                return (
                  <div key={`${date}_${idx}`} className="flex items-center justify-between border-b border-gray-800 py-2">
                    <div>
                      <div className="text-sm text-gray-300">{fmtDate(date)}</div>
                      <div className="text-xs text-gray-400 capitalize">{String(status)}</div>
                    </div>
                    <div className="text-sm font-medium">{hours}h</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No recent daily breakdown available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
