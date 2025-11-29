import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>Employee Attendance System</h1>
        <p style={styles.subtitle}>
          Lightweight attendance tracking — Check In / Check Out, manager reports, and CSV export.
        </p>

        <div style={styles.buttons}>
          <Link to="/login" style={styles.btnPrimary}>Login</Link>
          <Link to="/register" style={styles.btnSecondary}>Register</Link>
        </div>

        <div style={styles.info}>
          <p><b>For demo:</b> Use the sample accounts you seeded (employee / manager) or register a new user.</p>
        </div>
        <div style={styles.footer}>
  <small>Project by Arif — Final Year B.Tech</small>
  <div style={{ marginTop: 8 }}>
    <Link to="/about" style={{ color: "#0b5ed7", textDecoration: "none" }}>About this project</Link>
  </div>
</div>

      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial",
    padding: 20
  },
  card: {
    width: 700,
    maxWidth: "95%",
    textAlign: "center",
    padding: 30,
    borderRadius: 12,
    boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
    border: "1px solid #eee",
    background: "white"
  },
  title: {
    margin: 0,
    fontSize: 32,
    color: "#0b5ed7"
  },
  subtitle: {
    color: "#444",
    marginTop: 8,
    marginBottom: 20
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16
  },
  btnPrimary: {
    padding: "10px 18px",
    background: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: 8
  },
  btnSecondary: {
    padding: "10px 18px",
    background: "#6c757d",
    color: "white",
    textDecoration: "none",
    borderRadius: 8
  },
  info: {
    marginTop: 12,
    color: "#666"
  },
  footer: {
    marginTop: 18,
    color: "#999"
  }
};
