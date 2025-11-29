import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function EmployeeHistory() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [month, setMonth] = useState("");

  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const url = `/api/attendance/my-history?page=${page}&limit=${limit}${
        month ? `&month=${month}` : ""
      }`;

      const res = await axiosClient.get(url);

      setItems(res.data.data.items);
      setTotal(res.data.data.total);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, month]);

  return (
    <div style={styles.container}>
      <h2>Attendance History</h2>

      {/* Filter */}
      <div style={styles.filterRow}>
        <label>Select Month:</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={styles.input}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Hours</th>
              </tr>
            </thead>

            <tbody>
              {items.map((row) => (
                <tr key={row._id}>
                  <td>{row.date}</td>
                  <td>{row.status}</td>
                  <td>
                    {row.checkInTime
                      ? new Date(row.checkInTime).toLocaleTimeString()
                      : "--"}
                  </td>
                  <td>
                    {row.checkOutTime
                      ? new Date(row.checkOutTime).toLocaleTimeString()
                      : "--"}
                  </td>
                  <td>{row.totalHours}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={styles.pagination}>
            <button
              style={styles.button}
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>

            <span>
              Page {page} of {Math.ceil(total / limit)}
            </span>

            <button
              style={styles.button}
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "30px auto",
    padding: "20px",
    fontFamily: "Arial",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },
  filterRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "15px",
  },
  input: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  pagination: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    padding: "8px 14px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  }
};
