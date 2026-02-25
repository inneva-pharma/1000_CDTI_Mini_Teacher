import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingDots } from "./LoadingDots";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredMaxRole?: number; // e.g. 2 means role_id <= 2 required
}

export function ProtectedRoute({ children, requiredMaxRole }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingDots />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requiredMaxRole && profile && profile.role_id > requiredMaxRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
