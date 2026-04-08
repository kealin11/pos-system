import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthToken, selectCurrentUser } from '../redux/slices/authSlice.js';

// Redirect to /auth if not logged in
export const ProtectedRoute = ({ allowedRoles }) => {
  const token = useSelector(selectAuthToken);
  const user = useSelector(selectCurrentUser);

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Redirect to / if already logged in
export const PublicRoute = () => {
  const token = useSelector(selectAuthToken);
  return token ? <Navigate to="/" replace /> : <Outlet />;
};
