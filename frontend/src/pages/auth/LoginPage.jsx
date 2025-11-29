import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useDispatch } from "react-redux";
import { setCredentials, setLoading } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    dispatch(setLoading(true));

    try {
      const res = await axiosClient.post("/api/auth/login", form);

      if (res.data.success) {
        const { user, token } = {
          user: res.data.data,
          token: res.data.data.token,
        };

        dispatch(setCredentials({ user, token }));

        // redirect based on role
        if (user.role === "manager") {
          navigate("/manager/dashboard");
        } else {
          navigate("/employee/dashboard");
        }
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed. Check your email/password.");
    }

    dispatch(setLoading(false));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          style={styles.input}
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.button} type="submit">
          Login
        </button>
      </form>

      <p>
        Don't have an account?{" "}
        <a href="/register" style={styles.link}>
          Register
        </a>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "350px",
    margin: "60px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    fontFamily: "Arial",
  },
  title: {
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginTop: "-8px",
  },
  link: {
    color: "#007bff",
  },
};
