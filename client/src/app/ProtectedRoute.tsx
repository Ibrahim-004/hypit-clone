import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken } from '../lib/token-store';
export function ProtectedRoute() {
  if (!getAccessToken()) return <Navigate to="/login" replace />;
  return <Outlet />;
}
