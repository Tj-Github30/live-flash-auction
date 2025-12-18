import { ReactNode, useContext } from "react";
import { AuthContext } from "./AuthProvider"; 
import { Navigate, useLocation } from "react-router-dom";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const auth = useContext(AuthContext);
  const location = useLocation();

  if (!auth || auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
