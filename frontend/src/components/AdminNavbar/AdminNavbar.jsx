import React, { useState } from "react";
import { logout } from "../../utils/auth";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa"; // Added icons for toggle
import "./AdminNavbar.css";

const AdminNavbar = () => {
  const role = localStorage.getItem("role");
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu toggle

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="navbar">
      <a href="/" className="navbar-title">Consumable Management</a>
      <button className="menu-toggle" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      <div className={`navbar-links ${isOpen ? "open" : ""}`}>
        {role === "user" && <a href="/user-dashboard" className="nav-link">User Dashboard</a>}
        {role === "admin" && <a href="/admin-dashboard" className="nav-link">Admin Dashboard</a>}
        <button onClick={logout} className="logout-btn">
          <FaSignOutAlt className="logout-icon" /> Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;