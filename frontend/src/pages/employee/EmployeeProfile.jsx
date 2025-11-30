
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axiosClient from "../../api/axiosClient";
import { setCredentials } from "../../store/authSlice";

/**
 * EmployeeProfile — read-only view + local edit
 * - Reads user from Redux (auth.user)
 * - Falls back to GET /api/auth/me if not in store
 * - Local edit updates Redux + localStorage (no backend PATCH)
 *
 * Keeps all existing functionality; only changes presentation.
 */

export default function EmployeeProfile() {
  const dispatch = useDispatch();
  const storeUser = useSelector((s) => s.auth?.user);

  const [user, setUser] = useState(storeUser || null);
  const [loading, setLoading] = useState(!storeUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", department: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (storeUser) {
      setUser(storeUser);
      setForm({ name: storeUser.name || "", department: storeUser.department || "" });
      setLoading(false);
    } else {
      fetchMe();
    }
    // eslint-disable-next-line
  }, [storeUser]);

  async function fetchMe() {
    setLoading(true);
    try {
      const res = await axiosClient.get("/api/auth/me");
      if (res.data?.success && res.data.data) {
        setUser(res.data.data);
        setForm({ name: res.data.data.name || "", department: res.data.data.department || "" });
      }
    } catch (err) {
      console.error("Failed to fetch /api/auth/me", err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSaveLocal = (e) => {
    e?.preventDefault();
    const updated = { ...user, name: form.name, department: form.department };

    // update local state
    setUser(updated);
    setEditing(false);
    setMsg("Profile updated locally.");

    // update Redux (so navbar and other components read updated user)
    // we keep token as-is if available in store
    const token = storeUser?.token || (user && user.token) || localStorage.getItem("token") || "";
    dispatch(setCredentials({ user: updated, token }));

    // persist to localStorage in the same shape your app expects
    try {
      const raw = localStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.user = updated;
        localStorage.setItem("auth", JSON.stringify(parsed));
      } else {
        // fallback
        localStorage.setItem("user", JSON.stringify(updated));
        if (token) localStorage.setItem("token", token);
      }
    } catch (e) {
      console.warn("Could not save profile to localStorage", e);
      localStorage.setItem("user", JSON.stringify(updated));
      if (token) localStorage.setItem("token", token);
    }

    // clear message after a short time
    setTimeout(() => setMsg(""), 3500);
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-400">Loading profile...</div>;
  }

  if (!user) {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-400">No user data available.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>

      {msg && <div className="mb-4 p-3 rounded bg-green-900/40 text-green-200">{msg}</div>}

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Full name</label>
            {editing ? (
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100"
              />
            ) : (
              <div className="p-3 bg-gray-900 rounded">{user.name}</div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <div className="p-3 bg-gray-900 rounded">{user.email}</div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Employee ID</label>
            <div className="p-3 bg-gray-900 rounded">{user.employeeId || "—"}</div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Department</label>
            {editing ? (
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100"
              />
            ) : (
              <div className="p-3 bg-gray-900 rounded">{user.department || "—"}</div>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          {editing ? (
            <>
              <button onClick={handleSaveLocal} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-black font-medium">
                Save (local)
              </button>
              <button onClick={() => { setEditing(false); setForm({ name: user.name, department: user.department }); }} className="px-4 py-2 rounded border border-gray-700 text-gray-200">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="bg-brand-fallback hover:bg-[#0ea36b] px-4 py-2 rounded text-black font-medium">
              Edit Profile
            </button>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>Password and server-side profile updates are currently not implemented. To persist changes to the database, add a backend PATCH endpoint (PATCH /api/auth/me) and I can integrate it for you.</p>
        </div>
      </div>
    </div>
  );
}
