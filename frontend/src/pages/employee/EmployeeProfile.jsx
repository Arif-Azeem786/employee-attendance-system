import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function EmployeeProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const storeUser = useSelector((s) => s.auth.user);

  const [user, setUser] = useState(storeUser || null);
  const [loading, setLoading] = useState(!storeUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    department: ""
  });
  const [msg, setMsg] = useState("");

  // fetch /api/auth/me if store doesn't have user (fallback)
  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/api/auth/me");
      if (res.data && res.data.data) {
        setUser(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!storeUser) {
      fetchMe();
    } else {
      setUser(storeUser);
    }
  }, [storeUser]);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", department: user.department || "" });
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  // local "save" only — backend update endpoint not implemented in server (avoid calling non-existent routes)
  const handleSaveLocal = (e) => {
    e?.preventDefault();
    setMsg("Profile updated locally. (To persist, add a backend update endpoint)");
    // update local state only (not persisted to server)
    const updated = { ...user, name: form.name, department: form.department };
    setUser(updated);
    // Also update auth in localStorage so UI stays consistent
    try {
      const raw = localStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.user = updated;
        localStorage.setItem("auth", JSON.stringify(parsed));
      }
    } catch (e) { /* ignore */ }
    setEditing(false);
    setTimeout(() => setMsg(""), 4000);
  };

  if (loading) return <div style={{ padding: 20 }}>Loading profile…</div>;

  if (!user) return <div style={{ padding: 20 }}>No user data available.</div>;

  return (
    <div style={styles.container}>
      <h2>My Profile</h2>

      {msg && <div style={styles.info}>{msg}</div>}

      <div style={styles.card}>
        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Name</label>
            {editing ? (
              <input style={styles.input} value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
            ) : (
              <div style={styles.value}>{user.name}</div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>Email</label>
            <div style={styles.value}>{user.email}</div>
          </div>
        </div>

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Employee ID</label>
            <div style={styles.value}>{user.employeeId || "—"}</div>
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>Department</label>
            {editing ? (
              <input style={styles.input} value={form.department} onChange={(e)=>setForm({...form, department: e.target.value})} />
            ) : (
              <div style={styles.value}>{user.department || "—"}</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          {editing ? (
            <>
              <button style={styles.saveBtn} onClick={handleSaveLocal}>Save (local)</button>
              <button style={styles.cancelBtn} onClick={()=>{ setEditing(false); setForm({ name: user.name, department: user.department }); }}>Cancel</button>
            </>
          ) : (
            <button style={styles.editBtn} onClick={()=>setEditing(true)}>Edit</button>
          )}

          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.card}>
        <h4>Notes</h4>
        <ul>
          <li>To make profile edits permanent, add a backend endpoint (PATCH /api/auth/me) and I can integrate it.</li>
          <li>Password change endpoint is not implemented; we can add it as well if you want.</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 800, margin: "24px auto", fontFamily: "Arial", padding: 12 },
  card: { padding: 16, border: "1px solid #ddd", borderRadius: 8, marginBottom: 12 },
  row: { display: "flex", gap: 12, marginBottom: 12 },
  label: { fontSize: 13, color: "#555", marginBottom: 6 },
  value: { padding: "8px 10px", background: "#f9f9f9", borderRadius: 6, border: "1px solid #eee" },
  input: { padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", width: "100%" },
  editBtn: { padding: "8px 12px", background: "#007bff", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  saveBtn: { padding: "8px 12px", background: "#198754", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  cancelBtn: { padding: "8px 12px", background: "#6c757d", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  logoutBtn: { padding: "8px 12px", background: "#dc3545", color: "white", border: "none", borderRadius: 6, cursor: "pointer" },
  info: { padding: 10, background: "#e9f7ef", border: "1px solid #d4f1d9", color: "#155724", borderRadius: 6, marginBottom: 12 }
};
