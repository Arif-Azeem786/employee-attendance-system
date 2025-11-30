
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials, setLoading } from "../../store/authSlice";
import axiosClient from "../../api/axiosClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill both email and password.");
      return;
    }

    setLoadingLocal(true);
    dispatch(setLoading(true));

    try {
      const res = await axiosClient.post("/api/auth/login", form);
      const data = res.data;

      if (!data.success) {
        setError(data.message || "Login failed");
        setLoadingLocal(false);
        dispatch(setLoading(false));
        return;
      }

      // backend returns user object and token inside data.data
      const user = data.data;
      const token = user.token || data.token || "";

      // dispatch to redux and persist (your authSlice handles localStorage in later loads)
      dispatch(setCredentials({ user, token }));

      // navigate based on role
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
          <h2 className="text-2xl font-semibold mb-4">Sign in</h2>

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-gray-100 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Don't have an account? <Link to="/register" className="text-brand-fallback hover:underline">Register</Link>
              </div>
              <button
                type="submit"
                disabled={loadingLocal}
                className="bg-brand-fallback hover:bg-[#0ea36b] text-black px-4 py-2 rounded font-medium"
              >
                {loadingLocal ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          <div>Demo manager: <b>manager@example.com</b> / <b>password123</b></div>
          <div>Demo employee: <b>employee1@example.com</b> / <b>password123</b></div>
        </div>
      </div>
    </div>
  );
}
