import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoadingState } from './AsyncBoundary.jsx';

/**
 * Waits for session restoration before deciding, so a page refresh never
 * bounces a signed-in user back to the login screen.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) return <LoadingState label="Restoring your session…" />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

/** Keeps signed-in users away from the login/register screens. */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isRestoring } = useAuth();
  if (isRestoring) return <LoadingState label="Restoring your session…" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}
