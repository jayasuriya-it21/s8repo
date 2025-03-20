import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaSave } from "react-icons/fa";
import "./ProfileManagement.css";

function ProfileManagement() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    image: null,
  });
  const [newImage, setNewImage] = useState(null);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser({
          ...res.data,
          image: res.data.image ? `data:image/jpeg;base64,${res.data.image}` : null,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      setNewImage(files[0]);
      const reader = new FileReader();
      reader.onloadend = () => setUser((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(files[0]);
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
  };

  const handleSave = async (field) => {
    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("phone", user.phone);
      formData.append("address", user.address);
      formData.append("department", user.department);
      if (field === "image" && newImage) formData.append("image", newImage);

      const res = await axios.put("http://localhost:5000/api/users/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUser({
        ...res.data,
        image: res.data.image ? `data:image/jpeg;base64,${res.data.image}` : null,
      });
      setNewImage(null);
      setEditingField(null);
      alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  const renderField = (label, field, type = "text") => (
    <div className="profile-field">
      <label className="field-label">{label}</label>
      {editingField === field ? (
        type === "file" ? (
          <div className="field-edit">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="field-input file-input"
            />
            <FaSave className="save-icon" onClick={() => handleSave(field)} />
          </div>
        ) : (
          <div className="field-edit">
            <input
              type={type}
              name={field}
              value={user[field] || ""}
              onChange={handleChange}
              className="field-input"
            />
            <FaSave className="save-icon" onClick={() => handleSave(field)} />
          </div>
        )
      ) : (
        <div className="field-display">
          <span>{field === "image" ? (user.image ? "Profile Picture Set" : "No Image") : user[field] || "Not Set"}</span>
          <FaEdit className="edit-icon" onClick={() => handleEdit(field)} />
        </div>
      )}
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">Your Profile</h2>
        <div className="profile-image-section">
          {user.image ? (
            <img src={user.image} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-image-placeholder">No Image</div>
          )}
        </div>
        <div className="profile-details">
          {renderField("Name", "name")}
          {renderField("Email", "email", "email")}
          {renderField("Phone", "phone", "tel")}
          {renderField("Address", "address")}
          {renderField("Department", "department")}
          {renderField("Profile Picture", "image", "file")}
        </div>
      </div>
    </div>
  );
}

export default ProfileManagement;