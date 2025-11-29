import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function EmployeeSummary() {
  const [summary, setSummary] = useState(null);
  const [weeklyTrend, setWeeklyTrend] = useState([]); // array of {date, present}
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);

      // backend provides monthly summary and we can reuse /dashboard/employee for trend.
      const sumRes = await axiosClient.get("/api/attendance/my-summary");
      setSummary(sumRes.data.data);

      // We will fetch recent 7 days from my-history and derive counts per day
      const histRes = await axiosClient.get("/api/attendance/my-history?limit=7");
      const items = histRes.data.data.items || [];

      // ensure 7 days ordered oldest->newest
      const sorted = items.slice().sort((a,b) => a.date.localeCompare(b.date));
      const trend = sorted.map(it => ({ date: it.date, present: (it.status === 'present' || it.status === 'late') ? 1 : 0 }));
      setWeeklyTrend(trend);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading summary…</div>;

  // Prepare chart data
  const labels = weeklyTrend.map(d => d.date);
  const data = {
    labels,
    datasets: [
      {
        label: "Present (1 if present)",
        data: weeklyTrend.map(d => d.present),
        backgroundColor: "rgba(54,162,235,0.7)",
      }
    ]
  };

  return (
    <div style={styles.container}>
      <h2>Monthly Summary</h2>

      <div style={styles.row}>
        <div style={styles.card}>
          <h4>This month</h4>
          <p>Present: <b>{summary.present}</b></p>
          <p>Late: <b>{summary.late}</b></p>
          <p>Half-Day: <b>{summary.halfDay}</b></p>
          <p>Absent: <b>{summary.absent}</b></p>
          <p>Total Hours: <b>{summary.totalHours}</b></p>
        </div>

        <div style={styles.card}>
          <h4>Recent 7 days</h4>
          {weeklyTrend.length === 0 ? (
            <p>No recent records.</p>
          ) : (
            <div style={{ width: "100%", height: 240 }}>
              <Bar data={data} options={{
                responsive: true,
                plugins: { legend: { position: "top" }, title: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
              }} />
            </div>
          )}
        </div>
      </div>

      <div style={styles.card}>
        <h4>Notes</h4>
        <p>Late = checked in after 09:30. Half-Day = total hours &lt; 4 on checkout.</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "30px auto",
    padding: "20px",
    fontFamily: "Arial"
  },
  row: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    marginBottom: "20px"
  },
  card: {
    flex: 1,
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd"
  }
};
