import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", department: "", status: "Active" });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    if (newUser.name && newUser.email && newUser.phone && newUser.department) {
      setLoading(true);
      try {
        const res = await axios.post("http://localhost:5000/api/users", newUser, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers([...users, res.data]);
        setNewUser({ name: "", email: "", phone: "", department: "", status: "Active" });
      } catch (err) {
        setError("Failed to add user");
        console.error("Error adding user:", err);
      } finally {
        setLoading(false);
      }
    } else {
      alert("All fields are required.");
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      setError("Failed to delete user");
      console.error("Error deleting user:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id) => {
    const userToUpdate = users.find((user) => user._id === id);
    const newStatus = userToUpdate.status === "Active" ? "Blocked" : "Active";
    setLoading(true);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/${id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUsers(users.map((user) => (user._id === id ? res.data : user)));
    } catch (err) {
      setError("Failed to update user status");
      console.error("Error updating user status:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone && user.phone.includes(searchQuery)) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="user-management">
      <h2 className="user-management-title">User Management</h2>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <input
        type="text"
        placeholder="Search by Name, Email, Phone, or Department"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      <div className="add-user-form">
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="form-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="form-input"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={newUser.phone}
          onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          className="form-input"
        />
        <input
          type="text"
          placeholder="Department"
          value={newUser.department}
          onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
          className="form-input"
        />
        <button onClick={addUser} className="add-btn" disabled={loading}>
          Add User
        </button>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || "N/A"}</td>
                <td>{user.department}</td>
                <td className={user.status === "Active" ? "status-active" : "status-blocked"}>
                  {user.status}
                </td>
                <td>
                  <button onClick={() => deleteUser(user._id)} className="delete-btn" disabled={loading}>
                    Delete
                  </button>
                  <button
                    onClick={() => toggleUserStatus(user._id)}
                    className={user.status === "Active" ? "block-btn" : "unblock-btn"}
                    disabled={loading}
                  >
                    {user.status === "Active" ? "Block" : "Unblock"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No matching users found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;