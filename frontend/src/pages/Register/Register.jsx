import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert("All fields are required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        adminKey, // Send adminKey only, let backend decide role
      });
      alert("Registration successful! Please log in.");
      console.log("Registered as:", response.data.role); // Debug role
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      alert(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-heading">Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="register-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="register-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-input"
          />
          <input
            type="text"
            placeholder="Admin Key (optional)"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="register-input"
          />
          <button type="submit" className="register-btn">Register</button>
        </form>
        <p className="register-switch-text">
          Already have an account? <a href="/login" className="register-link">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;