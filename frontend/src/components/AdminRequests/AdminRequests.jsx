import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminRequests.css";

function AdminRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await axios.get("http://localhost:5000/requests");
        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    }
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/requests/${id}`, { status });
      setRequests(requests.map((req) => (req._id === id ? { ...req, status } : req)));
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  return (
    <div className="admin-requests-container">
      <div className="container request-card"> {/* Use global .container and custom .request-card */}
        <h2 className="admin-requests-title">Manage Requests</h2>
        <ul className="request-list">
          {requests.map((req) => (
            <li key={req._id} className="request-item">
              <span>
                {req.material} - {req.quantity} pcs - <span className="status-text">{req.status}</span>
              </span>
              <div className="action-buttons">
                <button onClick={() => handleStatusChange(req._id, "Approved")} className="approve-btn">Approve</button>
                <button onClick={() => handleStatusChange(req._id, "Rejected")} className="reject-btn">Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminRequests;