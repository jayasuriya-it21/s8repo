import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer, Cell } from "recharts";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [orderTrendData, setOrderTrendData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/products", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get("http://localhost:5000/api/requests/user", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);
        setProducts(productsRes.data);
        setOrders(ordersRes.data);

        const requestStats = [
          { name: "Pending", value: ordersRes.data.filter(r => r.status === "Pending").length, fill: "#f39c12" },
          { name: "Approved", value: ordersRes.data.filter(r => r.status === "Approved").length, fill: "#00b894" },
          { name: "Rejected", value: ordersRes.data.filter(r => r.status === "Rejected").length, fill: "#e84393" },
        ];
        setRequestData(requestStats);

        const trendData = ordersRes.data.reduce((acc, order) => {
          const date = new Date(order.requestDate).toLocaleDateString();
          const existing = acc.find(item => item.date === date);
          if (existing) {
            existing.orders += 1;
          } else {
            acc.push({ date, orders: 1 });
          }
          return acc;
        }, []).sort((a, b) => new Date(a.date) - new Date(b.date));
        setOrderTrendData(trendData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeImagePopup = () => {
    setSelectedImage(null);
  };

  return (
    <div className="user-dashboard">
      <h2 className="dashboard-title">Welcome, User</h2>
      <div className="dashboard-container">
        {/* Analytics Section */}
        <div className="dashboard-analytics">
          <h3 className="section-title">Your Analytics Overview</h3>
          <div className="charts-row">
            <div className="chart-container">
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
            <div className="chart-container">
              <h4>Your Order Trends Over Time</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={orderTrendData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
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
        </div>

        {/* Available Products Section */}
        <div className="dashboard-section">
          <h3 className="section-title">Available Products</h3>
          <table className="product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Stock</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.productId}</td>
                  <td>{product.name}</td>
                  <td>{product.stockRemaining}</td>
                  <td>
                    {product.image ? (
                      <img
                        src={`data:image/jpeg;base64,${product.image}`}
                        alt={product.name}
                        className="product-image"
                        onClick={() => handleImageClick(product.image)}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>
                    <a href="/request-product" className="request-link">Request</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Orders Section */}
        <div className="dashboard-section">
          <h3 className="section-title">Your Orders</h3>
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Track</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.slice(-6)}</td>
                  <td>{order.productId?.name || "Unknown"}</td>
                  <td>{order.quantity}</td>
                  <td>{order.status}</td>
                  <td>
                    <a href={`/order-tracking?orderId=${order._id}`} className="track-link">Track</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Popup Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={closeImagePopup}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              alt="Large Product View"
              className="large-product-image"
            />
            <button onClick={closeImagePopup} className="close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;