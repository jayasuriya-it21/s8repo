import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const role = localStorage.getItem("role");

  return (
    <div className="sidebar">
      <h2 className="sidebar-header">{role === "admin" ? "Admin" : "User"}</h2>
      <ul className="sidebar-list">
        {role === "admin" ? (
          <>
            <li>
              <Link to="/admin-dashboard" className="sidebar-link" data-text="Dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/manage-inventory" className="sidebar-link" data-text="Manage Inventory">Manage Inventory</Link>
            </li>
            <li>
              <Link to="/user-management" className="sidebar-link" data-text="User Management">User Management</Link>
            </li>
            <li>
              <Link to="/request-list" className="sidebar-link" data-text="User Requests">User Requests</Link>
            </li>
            <li>
              <Link to="/order-tracking" className="sidebar-link" data-text="Order Tracking">Order Tracking</Link>
            </li>
            <li>
              <Link to="/profile" className="sidebar-link" data-text="Profile">Profile</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/user-dashboard" className="sidebar-link" data-text="Dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/request-product" className="sidebar-link" data-text="Request Product">Request Product</Link>
            </li>
            <li>
              <Link to="/order-tracking" className="sidebar-link" data-text="Order Tracking">Order Tracking</Link>
            </li>
            <li>
              <Link to="/profile" className="sidebar-link" data-text="Profile">Profile</Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;