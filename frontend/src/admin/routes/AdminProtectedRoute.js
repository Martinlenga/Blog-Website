import { useAdmin } from "../context/AdminContext";
import { Navigate, useLocation } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F3F4F6]">
        {/* Added screen reader accessibility (a11y) to the loading state */}
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
          role="status"
          aria-label="Validating admin session..."
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!admin) {
    // Redirect to login, but remember exactly where they were trying to go
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;