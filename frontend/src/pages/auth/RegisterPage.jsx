
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials, setLoading } from "../../store/authSlice";
import axiosClient from "../../api/axiosClient";

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
  });
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required.");
      return;
    }

    setLoadingLocal(true);
    dispatch(setLoading(true));

    try {
      const res = await axiosClient.post("/api/auth/register", form);
      const data = res.data;

      if (!data.success) {
        setError(data.message || "Registration failed");
        setLoadingLocal(false);
        dispatch(setLoading(false));
        return;
      }

      const user = data.data;
      const token = user.token || data.token || "";

      dispatch(setCredentials({ user, token }));

      if (user.role === "manager") {
        navigate("/manager/dashboard");
      } else {
        navigate("/employee/dashboard");
      }

      setLoadingLocal(false);
      dispatch(setLoading(false));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Network error — please try again.");
      setLoadingLocal(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Register</h2>

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Full name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={onChange}
                placeholder="John Doe"
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="Choose a secure password"
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Department</label>
              <input
                name="department"
                type="text"
                value={form.department}
                onChange={onChange}
                placeholder="e.g. Development"
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100 focus:outline-none"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Already registered? <Link to="/login" className="text-brand-fallback hover:underline">Sign in</Link>
              </div>

              <button
                type="submit"
                disabled={loadingLocal}
                className="bg-brand-fallback hover:bg-[#0ea36b] text-black px-4 py-2 rounded font-medium"
              >
                {loadingLocal ? "Creating..." : "Register"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          Tip: if you need seeded sample users, run the `node seeder/seed.js` from backend.
        </div>
      </div>
    </div>
  );
}
