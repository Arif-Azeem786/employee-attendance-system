// ProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ redirectTo = '/login' }) {
  const token = useSelector((s) => s.auth.token);
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
}
