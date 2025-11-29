import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeHistory from "./pages/employee/EmployeeHistory";
import EmployeeSummary from "./pages/employee/EmployeeSummary";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import EmployeeCalendar from "./pages/employee/EmployeeCalendar";

import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerTeam from "./pages/manager/ManagerTeam";
import ManagerReports from "./pages/manager/ManagerReports";

import Home from "./pages/Home";
import About from "./pages/About";

import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from "./components/AppLayout";

export default function App() {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* PROTECTED ROUTES (EMPLOYEE + MANAGER) */}
      <Route element={<ProtectedRoute />}>

        {/* ========================== EMPLOYEE ROUTES ========================== */}
        <Route
          path="/employee/dashboard"
          element={<AppLayout><EmployeeDashboard /></AppLayout>}
        />
        <Route
          path="/employee/history"
          element={<AppLayout><EmployeeHistory /></AppLayout>}
        />
        <Route
          path="/employee/summary"
          element={<AppLayout><EmployeeSummary /></AppLayout>}
        />
        <Route
          path="/employee/profile"
          element={<AppLayout><EmployeeProfile /></AppLayout>}
        />
        <Route
          path="/employee/calendar"
          element={<AppLayout><EmployeeCalendar /></AppLayout>}
        />

        {/* ========================== MANAGER ROUTES ========================== */}
        <Route
          path="/manager/dashboard"
          element={<AppLayout><ManagerDashboard /></AppLayout>}
        />
        <Route
          path="/manager/team"
          element={<AppLayout><ManagerTeam /></AppLayout>}
        />
        <Route
          path="/manager/reports"
          element={<AppLayout><ManagerReports /></AppLayout>}
        />

      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<div>404 - Not Found</div>} />

    </Routes>
  );
}
