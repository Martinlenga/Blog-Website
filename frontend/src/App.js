import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Public Routes
import PublicRoutes from "./publicSite/PublicRoutes";
import { PublicAuthProvider } from "./auth/PublicAuthContext";// <-- important

// Admin
import AdminRoutes from "./admin/routes/AdminRoutes";
import AdminLogin from "./auth/AdminLogin";

function App() {
  return (
    <Router>
      <PublicAuthProvider>  {/* <-- wrap public routes */}
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/*" element={<PublicRoutes />} />

          {/* ADMIN LOGIN */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ADMIN PROTECTED ROUTES */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* REDIRECT unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PublicAuthProvider>
    </Router>
  );
}

export default App;
