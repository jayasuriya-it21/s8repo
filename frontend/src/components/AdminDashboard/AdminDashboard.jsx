import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer, Cell } from "recharts";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [requestData, setRequestData] = useState([]);
  const [trackingData, setTrackingData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, ordersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/requests", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get("http://localhost:5000/api/requests", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);

        const requestStats = [
          { name: "Pending", value: requestsRes.data.filter(r => r.status === "Pending").length, fill: "#f39c12" },
          { name: "Approved", value: requestsRes.data.filter(r => r.status === "Approved").length, fill: "#00b894" },
          { name: "Rejected", value: requestsRes.data.filter(r => r.status === "Rejected").length, fill: "#e84393" },
        ];
        setRequestData(requestStats);

        const trackingStats = ordersRes.data
          .filter(r => r.status === "Approved")
          .reduce((acc, order) => {
            const date = new Date(order.requestDate).toLocaleDateString();
            const existing = acc.find(item => item.date === date);
            if (existing) {
              existing.orders += 1;
            } else {
              acc.push({ date, orders: 1 });
            }
            return acc;
          }, [])
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setTrackingData(trackingStats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Welcome, Admin</h2>
      <div className="dashboard-container">
        <div className="charts-section">
          <div className="chart-card card"> {/* Added global .card class */}
            <h4>Request Status Distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={requestData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dfe6e9" />
                <XAxis dataKey="name" stroke="#2d3436" />
                <YAxis stroke="#2d3436" />
                <Tooltip contentStyle={{ background: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  {requestData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card card"> {/* Added global .card class */}
            <h4>Order Trends Over Time</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trackingData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dfe6e9" />
                <XAxis dataKey="date" stroke="#2d3436" />
                <YAxis stroke="#2d3436" />
                <Tooltip contentStyle={{ background: "#fff", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }} />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#00b894"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#00b894" }}
                  activeDot={{ r: 8, fill: "#fff", stroke: "#00b894", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-options">
          <a href="/manage-inventory" className="dashboard-link">Manage Inventory</a>
          <a href="/user-management" className="dashboard-link">Manage Users</a>
          <a href="/request-list" className="dashboard-link">Manage Requests</a>
          <a href="/order-tracking" className="dashboard-link">Track Orders</a>
          <a href="/profile" className="dashboard-link">Profile</a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;