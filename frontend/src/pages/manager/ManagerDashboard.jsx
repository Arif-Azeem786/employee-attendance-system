
import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* color palette */
const COLORS = {
  present: "#10B981",
  late: "#F59E0B",
  "half-day": "#6366F1",
  absent: "#EF4444",
  default: "#94A3B8",
};

function toPieData(today) {
  const present = Number(today?.present ?? 0);
  const late = Number(today?.late ?? 0);
  const halfDay = Number(today?.halfDay ?? today?.half_day ?? 0);
  const absent = Number(today?.absent ?? 0);
  return [
    { name: "Present", key: "present", value: present },
    { name: "Late", key: "late", value: late },
    { name: "Half-day", key: "half-day", value: halfDay },
    { name: "Absent", key: "absent", value: absent },
  ].filter(d => typeof d.value === "number");
}

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    todays: { present: 0, absent: 0, late: 0 },
    weeklyTrend: [],
    departmentWise: [],
  });
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      // your existing endpoint (keeps behavior)
      const res = await axiosClient.get("/api/attendance/summary");
      const payload = res.data?.data ?? res.data ?? {};
      // normalize names used in different shapes
      const totalEmployees = payload.totalEmployees ?? payload.total_employees ?? payload.total ?? 0;
      const today = payload.todays ?? payload.today ?? payload.todaySummary ?? payload.today_summary ?? {};
      const weekly = payload.weeklyTrend ?? payload.weekly ?? payload.weekly_trend ?? [];
      const dept = payload.departmentWise ?? payload.deptSummary ?? payload.department_summary ?? [];

      setSummary({
        totalEmployees,
        todays: today,
        weeklyTrend: weekly,
        departmentWise: dept,
      });
      setLoading(false);
    } catch (err) {
      console.error("Manager dashboard error", err);
      setError(err?.response?.data?.message || "Failed to load manager dashboard");
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="min-h-[40vh] flex items-center justify-center text-gray-400">Loading manager dashboard...</div>;
  }

  const pieData = toPieData(summary.todays);
  // weekly bar expects array of { date, present }
  const weeklyBar = (summary.weeklyTrend || []).map(w => ({
    name: (w.date || w.label || "").slice(5) || w.date || w.label || "",
    present: Number(w.present ?? w.value ?? w.presentCount ?? 0),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
        <div className="text-sm text-gray-400">Team overview</div>
      </div>

      {error && <div className="mb-4 p-3 rounded bg-red-900/30 text-red-300 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="text-sm text-gray-400">Total employees</div>
          <div className="text-2xl font-bold">{summary.totalEmployees ?? 0}</div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-400">Present today</div>
          <div className="text-2xl font-bold">{summary.todays?.present ?? 0}</div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-400">Absent today</div>
          <div className="text-2xl font-bold">{summary.todays?.absent ?? 0}</div>
        </div>

        <div className="card">
          <div className="text-sm text-gray-400">Late today</div>
          <div className="text-2xl font-bold">{summary.todays?.late ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Weekly attendance trend</h3>
            <div className="text-sm text-gray-400">Recent</div>
          </div>

          {weeklyBar.length ? (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyBar} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f1724" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8" }} />
                  <YAxis tick={{ fill: "#94a3b8" }} />
                  <ReTooltip />
                  <Bar dataKey="present" fill={COLORS.present} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-sm text-gray-400">No weekly data available.</div>
          )}

          <div className="mt-4">
            <h4 className="text-sm text-gray-300 mb-2">Department summary</h4>
            <div className="space-y-2">
              {(summary.departmentWise || []).length ? summary.departmentWise.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="text-sm text-gray-300">{d._id ?? d.department ?? `Dept ${i+1}`}</div>
                  <div className="text-sm font-medium">{d.present ?? d.presentCount ?? 0} present</div>
                </div>
              )) : <div className="text-sm text-gray-400">No department data</div>}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Today distribution</h3>

          {pieData && pieData.length ? (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={70}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map(entry => {
                      const key = entry.key ?? entry.name.toLowerCase();
                      return <Cell key={entry.name} fill={COLORS[key] ?? COLORS.default} />;
                    })}
                  </Pie>
                  <ReTooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-sm text-gray-400">No today stats available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
