import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RequestList.css";

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("Pending"); // Default view is "Pending"

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/requests", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setRequests(res.data);
        filterRequests(res.data, "Pending", ""); // Initial filter
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await axios.put(
        `http://localhost:5000/api/requests/${id}`,
        { status: action },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const updatedRequests = requests.map((req) =>
        req._id === id ? { ...req, status: action } : req
      );
      setRequests(updatedRequests);
      filterRequests(updatedRequests, view, searchQuery); // Re-filter after update
      alert(`Request ${action.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request.");
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterRequests(requests, view, query);
  };

  const filterRequests = (data, status, query) => {
    const filtered = data.filter(
      (req) =>
        req.status === status &&
        ((req.userId?.username?.toLowerCase() || "").includes(query) ||
          (req.productId?.name?.toLowerCase() || "").includes(query))
    );
    setFilteredRequests(filtered);
  };

  const handleViewChange = (status) => {
    setView(status);
    filterRequests(requests, status, searchQuery);
  };

  return (
    <div className="request-list">
      <div className="request-list-header">
        <h2>Request List</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by username or product"
          className="search-input"
        />
        <div className="view-buttons">
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
            onClick={() => handleViewChange("Pending")}
            className={`view-btn ${view === "Pending" ? "active" : ""}`}
          >
            Pending
          </button>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
            onClick={() => handleViewChange("Approved")}
            className={`view-btn ${view === "Approved" ? "active" : ""}`}
          >
            Approved
          </button>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button
            onClick={() => handleViewChange("Rejected")}
            className={`view-btn ${view === "Rejected" ? "active" : ""}`}
          >
            Rejected
          </button>
        </div>
      </div>
      <RequestTable requests={filteredRequests} handleAction={handleAction} view={view} />
    </div>
  );
};

const RequestTable = ({ requests, handleAction, view }) => (
  <table className="request-table">
    <thead>
      <tr>
        <th>Username</th>
        <th>Product</th>
        <th>Quantity</th>
        <th>Purpose</th>
        <th>Returnable</th>
        <th>From Date</th>
        <th>To Date</th>
        <th>Request Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {requests.length > 0 ? (
        requests.map((request) => (
          <tr key={request._id}>
            <td>{request.userId?.username || "Unknown"}</td>
            <td>{request.productId?.name || "Unknown"}</td>
            <td>{request.quantity}</td>
            <td>{request.purpose}</td>
            <td>{request.isReturnable ? "Yes" : "No"}</td>
            <td>{new Date(request.fromDate).toLocaleDateString()}</td>
            <td>{request.isReturnable ? new Date(request.toDate).toLocaleDateString() : "N/A"}</td>
            <td>{new Date(request.requestDate).toLocaleString()}</td>
            <td>{request.status}</td>
            <td>
              <div className="action-buttons">
                {request.status === "Pending" ? (
                  <>
                    {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button onClick={() => handleAction(request._id, "Approved")} className="approve-btn">
                      Approve
                    </button>
                    {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button onClick={() => handleAction(request._id, "Rejected")} className="reject-btn">
                      Reject
                    </button>
                  </>
                ) : request.status === "Approved" ? (
                  <>
                    {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button onClick={() => handleAction(request._id, "Pending")} className="pending-btn">
                      Pending
                    </button>
                    {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button onClick={() => handleAction(request._id, "Rejected")} className="reject-btn">
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button onClick={() => handleAction(request._id, "Pending")} className="pending-btn">
                      Pending
                    </button>
                    {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
<button onClick={() => handleAction(request._id, "Approved")} className="approve-btn">
                      Approve
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="10" style={{ textAlign: "center", padding: "20px", color: "#7f8c8d" }}>
            No requests found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

export default RequestList;