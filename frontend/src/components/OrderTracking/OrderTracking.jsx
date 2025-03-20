import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBox, FaTruck, FaCheckCircle, FaUndo } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import "./OrderTracking.css";

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const role = localStorage.getItem("role");
  const location = useLocation();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const endpoint = role === "admin" ? "/api/requests" : "/api/requests/user";
        const res = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const approvedOrders = res.data.filter((order) => order.status === "Approved");
        setOrders(approvedOrders);
        setFilteredOrders(approvedOrders);

        const params = new URLSearchParams(location.search);
        const orderId = params.get("orderId");
        if (orderId) {
          const orderToSelect = approvedOrders.find((order) => order._id === orderId);
          if (orderToSelect) {
            setSelectedOrder(orderToSelect);
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [role, location]);

  const handleStatusUpdate = async (id, newTrackingStatus) => {
    try {
      const order = orders.find((o) => o._id === id);
      const isDelivered = newTrackingStatus === "Delivered";
      const isReturnedUpdate = newTrackingStatus === "Returned";
      const trackingStatus = isReturnedUpdate ? "Delivered" : newTrackingStatus;
      const isReturned = isReturnedUpdate ? true : isDelivered ? order.isReturned : false;

      await axios.put(
        `http://localhost:5000/api/requests/${id}`,
        { trackingStatus, isReturned },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const updatedOrders = orders.map((o) =>
        o._id === id ? { ...o, trackingStatus, isReturned } : o
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, trackingStatus, isReturned });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = orders.filter(
      (order) =>
        (order.productId?.name?.toLowerCase() || "").includes(query) ||
        (order.userId?.username?.toLowerCase() || "").includes(query) ||
        order._id.toLowerCase().includes(query) ||
        order._id.slice(-6).toLowerCase().includes(query)
    );
    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Shipped":
        return <FaTruck className="status-icon shipped" />;
      case "Delivered":
        return <FaCheckCircle className="status-icon delivered" />;
      default:
        return <FaBox className="status-icon pending" />;
    }
  };

  const getTimelineSteps = (order) => {
    if (!order) return [];
    const steps = [
      { status: "Pending", icon: <FaBox className="timeline-icon pending" />, isActive: order.trackingStatus === "Pending", isCompleted: order.trackingStatus },
      { status: "Shipped", icon: <FaTruck className="timeline-icon shipped" />, isActive: order.trackingStatus === "Shipped", isCompleted: order.trackingStatus === "Delivered" || order.isReturned },
      { status: "Delivered", icon: <FaCheckCircle className="timeline-icon delivered" />, isActive: order.trackingStatus === "Delivered" && !order.isReturned, isCompleted: order.isReturned },
    ];
    if (order.isReturnable) {
      steps.push({
        status: "Returned",
        icon: <FaUndo className="timeline-icon return" />,
        isActive: order.isReturned,
        isCompleted: false,
      });
    }
    return steps;
  };

  return (
    <div className="order-tracking">
      <div className="tracking-header">
        <h2 className="tracking-title">Order Tracking</h2>
        <input
          type="text"
          placeholder="Search by product, username, or order ID"
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>
      <div className="tracking-container">
        <div className="order-list">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className={`order-card ${selectedOrder?._id === order._id ? "selected" : ""}`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="order-header">
                {getStatusIcon(order.trackingStatus || "Pending")}
                <h3>Order #{order._id.slice(-6)}</h3>
              </div>
              <p><strong>Product:</strong> {order.productId?.name || "Unknown"}</p>
              <p><strong>Quantity:</strong> {order.quantity}</p>
              <p><strong>Tracking Status:</strong> {order.trackingStatus || "Pending"}</p>
              {order.isReturnable && (
                <p><strong>Returned:</strong> {order.isReturned ? "Yes" : "No"}</p>
              )}
              {(role === "admin" || (role === "user" && order.isReturnable)) && (
                <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                  {role === "admin" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order._id, "Pending")}
                        className={`status-btn pending ${order.trackingStatus === "Pending" ? "active" : ""}`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order._id, "Shipped")}
                        className={`status-btn shipped ${order.trackingStatus === "Shipped" ? "active" : ""}`}
                      >
                        Ready to Deliver
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order._id, "Delivered")}
                        className={`status-btn delivered ${order.trackingStatus === "Delivered" && !order.isReturned ? "active" : ""}`}
                      >
                        Delivered
                      </button>
                    </>
                  )}
                  {(role === "admin" || role === "user") && order.isReturnable && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, "Returned")}
                      className={`status-btn return ${order.isReturned ? "active" : ""}`}
                      disabled={order.trackingStatus !== "Delivered" || order.isReturned}
                    >
                      {order.isReturned ? "Returned" : "Mark Returned"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="no-orders">No approved orders to track yet.</div>
          )}
        </div>
        <div className="tracking-details">
          {selectedOrder ? (
            <div className="details-card">
              <h3 className="details-title">Order #{selectedOrder._id.slice(-6)}</h3>
              <div className="details-info">
                <p><strong>Username:</strong> {selectedOrder.userId?.username || "Unknown"}</p>
                <p><strong>Product:</strong> {selectedOrder.productId?.name || "Unknown"}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                <p><strong>Purpose:</strong> {selectedOrder.purpose}</p>
                <p><strong>Returnable:</strong> {selectedOrder.isReturnable ? "Yes" : "No"}</p>
                <p><strong>From Date:</strong> {new Date(selectedOrder.fromDate).toLocaleDateString()}</p>
                <p><strong>To Date:</strong> {selectedOrder.isReturnable ? new Date(selectedOrder.toDate).toLocaleDateString() : "N/A"}</p>
                <p><strong>Requested On:</strong> {new Date(selectedOrder.requestDate).toLocaleString()}</p>
                <p><strong>Tracking Status:</strong> {selectedOrder.trackingStatus || "Pending"}</p>
                {selectedOrder.isReturnable && (
                  <p><strong>Returned:</strong> {selectedOrder.isReturned ? "Yes" : "No"}</p>
                )}
              </div>
              <div
                className={`tracking-timeline ${selectedOrder.isReturnable ? "returnable" : "non-returnable"}`}
                style={{
                  '--step-index': selectedOrder.isReturnable
                    ? selectedOrder.isReturned
                      ? 3
                      : selectedOrder.trackingStatus === "Delivered"
                      ? 2
                      : selectedOrder.trackingStatus === "Shipped"
                      ? 1
                      : 0
                    : selectedOrder.trackingStatus === "Delivered"
                    ? 2
                    : selectedOrder.trackingStatus === "Shipped"
                    ? 1
                    : 0,
                }}
              >
                {getTimelineSteps(selectedOrder).map((step, index) => (
                  <div
                    key={index}
                    className={`timeline-step ${step.isActive ? "active" : step.isCompleted ? "completed" : ""}`}
                  >
                    {step.icon}
                    <span>{step.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="details-placeholder">Select an order to view tracking details</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;