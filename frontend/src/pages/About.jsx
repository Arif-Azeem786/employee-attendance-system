import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>About — Employee Attendance System</h1>

        <p style={styles.lead}>
          This project is a lightweight full-stack Employee Attendance System (MERN)
          built for the Tap Academy selection process. It supports employee
          check-in/check-out, monthly summaries, manager reporting and CSV export.
        </p>

        <section style={styles.section}>
          <h3>Goals & Objectives</h3>
          <ul>
            <li>Provide an easy-to-use attendance workflow for employees.</li>
            <li>Allow managers to view team attendance, filter records and export CSV reports.</li>
            <li>Implement secure authentication (JWT) and role-based access control.</li>
            <li>Deliver a small, testable codebase suitable for evaluation and extension.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h3>Modules (mapped to project PDF)</h3>
          <ol>
            <li><b>Authentication</b> — Register, Login, JWT-based protected routes.</li>
            <li><b>Employee</b> — Dashboard (today status), Check-in, Check-out, History, Monthly summary.</li>
            <li><b>Manager</b> — Dashboard (team summary), Team Attendance (filters), Reports & CSV export.</li>
            <li><b>Database</b> — MongoDB (Users, Attendance).</li>
            <li><b>Frontend</b> — React, Redux Toolkit, React Router; responsive UI and charts.</li>
          </ol>
        </section>

        <section style={styles.section}>
          <h3>Key APIs (short list)</h3>
          <table style={styles.table}>
            <thead>
              <tr><th>Endpoint</th><th>Purpose</th></tr>
            </thead>
            <tbody>
              <tr><td>POST /api/auth/register</td><td>Register user (employee/manager)</td></tr>
              <tr><td>POST /api/auth/login</td><td>Login → returns JWT</td></tr>
              <tr><td>GET /api/auth/me</td><td>Get current user</td></tr>
              <tr><td>POST /api/attendance/checkin</td><td>Employee check-in</td></tr>
              <tr><td>POST /api/attendance/checkout</td><td>Employee check-out</td></tr>
              <tr><td>GET /api/attendance/my-history</td><td>Employee attendance list</td></tr>
              <tr><td>GET /api/attendance/my-summary</td><td>Monthly summary for employee</td></tr>
              <tr><td>GET /api/attendance/all</td><td>Manager: filtered attendance list</td></tr>
              <tr><td>GET /api/attendance/export</td><td>Manager: CSV export (date range / employee)</td></tr>
            </tbody>
          </table>
        </section>

        <section style={styles.section}>
          <h3>Tech Stack</h3>
          <ul>
            <li>Backend: Node.js, Express, Mongoose (MongoDB)</li>
            <li>Frontend: React (Vite), Redux Toolkit, React Router, Chart.js</li>
            <li>Auth: JSON Web Tokens (JWT), bcrypt for password hashing</li>
            <li>Dev tools: nodemon, axios, json2csv</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h3>How to run (quick)</h3>
          <div style={styles.codeBlock}>
            <strong>Backend</strong>
            <pre>cd EMPLOYEE_MANAGEMENT/backend
npm install
# create .env (MONGO_URI, JWT_SECRET, PORT)
npm run dev</pre>

            <strong>Frontend</strong>
            <pre>cd EMPLOYEE_MANAGEMENT/frontend
npm install
npm run dev
# open http://localhost:5173</pre>
          </div>
        </section>

        <section style={styles.section}>
          <h3>Screenshots (include these in README / PDF)</h3>
          <ol>
            <li>Landing page</li>
            <li>Employee - Dashboard (today status, check-in button)</li>
            <li>Employee - History table</li>
            <li>Employee - Monthly summary chart</li>
            <li>Manager - Dashboard (team summary)</li>
            <li>Manager - Team attendance (filtered view)</li>
            <li>Manager - CSV export file (sample)</li>
          </ol>
        </section>

        <section style={styles.section}>
          <h3>Notes for evaluators</h3>
          <ul>
            <li>Late arrival logic: check-ins after 09:30 → status "late".</li>
            <li>Half-day: total hours &lt; 4 at checkout marks "half-day".</li>
            <li>Dates are stored as YYYY-MM-DD for easy aggregation.</li>
            <li>CSV export streams a filtered dataset (no temp files).</li>
          </ul>
        </section>

        <div style={styles.footerRow}>
          <Link to="/" style={styles.linkBtn}>Back Home</Link>
          <a href="#" onClick={(e)=>e.preventDefault()} style={styles.linkSecondary}>Contact: Arif (add phone in README)</a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: 24, fontFamily: "Arial", display: "flex", justifyContent: "center" },
  card: { maxWidth: 1000, width: "100%", background: "white", padding: 26, borderRadius: 10, boxShadow: "0 6px 20px rgba(0,0,0,0.06)", border: "1px solid #eee" },
  title: { margin: 0, color: "#0b5ed7" },
  lead: { color: "#444", marginTop: 8 },
  section: { marginTop: 18 },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 8, border: "1px solid #eee" },
  codeBlock: { background: "#f8f9fa", padding: 12, borderRadius: 6, marginTop: 8 },
  footerRow: { marginTop: 18, display: "flex", gap: 12, alignItems: "center" },
  linkBtn: { padding: "8px 12px", background: "#007bff", color: "white", textDecoration: "none", borderRadius: 6 },
  linkSecondary: { color: "#6c757d", textDecoration: "none" }
};
