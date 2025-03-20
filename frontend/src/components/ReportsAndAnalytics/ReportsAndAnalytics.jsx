import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./ReportsAndAnalytics.css";

const ReportsAndAnalytics = () => {
  const [stockLimitData, setStockLimitData] = useState([]);
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockLimitRes, usageRes] = await Promise.all([
          axios.get("http://localhost:5000/api/stock-limit"),
          axios.get("http://localhost:5000/api/usage-reports"),
        ]);
        setStockLimitData(Array.isArray(stockLimitRes.data) ? stockLimitRes.data : []);
        setUsageData(Array.isArray(usageRes.data) ? usageRes.data : []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load reports. Please try again.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="loading-text">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="reports">
      <h2 className="reports-title">Reports & Analysis</h2>
      <div className="charts-container">
        <div className="chart-card">
          <h3>Stock Limit Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockLimitData.length ? stockLimitData : [{ date: "N/A", stockLimit: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="stockLimit" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Monthly Usage Reports</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageData.length ? usageData : [{ month: "N/A", usage: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="usage" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportsAndAnalytics;