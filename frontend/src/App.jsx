import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import AdminNavbar from "./components/AdminNavbar/AdminNavbar";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import ManageInventory from "./components/ManageInventory/ManageInventory";
import UserManagement from "./components/UserManagement/UserManagement";
import RequestList from "./components/RequestList/RequestList";
import UserDashboard from "./components/UserDashboard/UserDashboard";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import ProfileManagement from "./components/ProfileManagement/ProfileManagement";
import OrderTracking from "./components/OrderTracking/OrderTracking";
import RequestForm from "./components/RequestForm/RequestForm";
import { isAuthenticated, getUserRole } from "./utils/auth";

const App = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

const ProtectedRoute = ({ element, allowedRoles }) => {
  const isAuth = isAuthenticated();
  const role = getUserRole();

  if (!isAuth) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) {
    return <Navigate to={role === "admin" ? "/admin-dashboard" : "/user-dashboard"} replace />;
  }
  return element;
};

const MainLayout = () => {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const isAuth = isAuthenticated();

  return (
    <div style={{ display: "flex" }}>
      {!isAuthPage && isAuth && <Sidebar />}
      <div style={{ flex: 1 }}>
        {isAuth && !isAuthPage && <AdminNavbar />}
        <Routes>
          <Route path="/" element={<ProtectedRoute element={<UserDashboard />} allowedRoles={["user"]} />} />
          <Route path="/" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={["admin"]} />} />
          <Route path="/manage-inventory" element={<ProtectedRoute element={<ManageInventory />} allowedRoles={["admin"]} />} />
          <Route path="/user-management" element={<ProtectedRoute element={<UserManagement />} allowedRoles={["admin"]} />} />
          <Route path="/request-list" element={<ProtectedRoute element={<RequestList />} allowedRoles={["admin"]} />} />
          <Route path="/profile" element={<ProtectedRoute element={<ProfileManagement />} allowedRoles={["admin", "user"]} />} />
          <Route path="/order-tracking" element={<ProtectedRoute element={<OrderTracking />} allowedRoles={["admin", "user"]} />} />
          <Route path="/user-dashboard" element={<ProtectedRoute element={<UserDashboard />} allowedRoles={["user"]} />} />
          <Route path="/request-product" element={<ProtectedRoute element={<RequestForm />} allowedRoles={["user"]} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;