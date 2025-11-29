import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { Link, useNavigate } from "react-router-dom";

export default function AppLayout({ children }) {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isManager = user?.role === "manager";

  return (
    <div style={styles.layout}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.title}>Employee Attendance System</div>

        <div style={styles.menu}>
          {/* EMPLOYEE MENU */}
          {!isManager && (
            <>
              <Link to="/employee/dashboard" style={styles.link}>Dashboard</Link>
              <Link to="/employee/history" style={styles.link}>History</Link>
              <Link to="/employee/summary" style={styles.link}>Summary</Link>
              <Link to="/employee/profile" style={styles.link}>Profile</Link>
            </>
          )}

          {/* MANAGER MENU */}
          {isManager && (
            <>
              <Link to="/manager/dashboard" style={styles.link}>Dashboard</Link>
              <Link to="/manager/team" style={styles.link}>Team</Link>
              <Link to="/manager/reports" style={styles.link}>Reports</Link>
            </>
          )}

          {/* LOGOUT */}
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* PAGE WRAPPER */}
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  layout: { fontFamily: "Arial" },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "#007bff",
    color: "white",
  },

  title: {
    fontSize: "20px",
    fontWeight: "bold",
  },

  menu: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "15px",
    padding: "6px 10px",
  },

  logoutBtn: {
    padding: "6px 10px",
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  content: {
    padding: "20px",
  }
};
