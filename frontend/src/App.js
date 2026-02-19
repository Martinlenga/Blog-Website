import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Public Routes
import PublicRoutes from "./publicSite/PublicRoutes";
import { PublicAuthProvider } from "./auth/PublicAuthContext";

// Admin
import AdminRoutes from "./admin/routes/AdminRoutes";

function App() {
  return (
    <Router>
      <Routes>
        
        {/* ADMIN SECTION (Has its own internal Provider) */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* PUBLIC SECTION */}
        <Route path="/*" element={
           <PublicAuthProvider>
             <PublicRoutes />
           </PublicAuthProvider>
        } />

      </Routes>
    </Router>
  );
}

export default App;