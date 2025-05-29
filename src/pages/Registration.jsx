import { useState } from "react";
import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo1.png";

const Registration = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Supplier", // Default role
    supermarketName: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://swiftora-be.onrender.com/api/users/register", formData);
      if (response.status === 201) {
        alert("Registration Successful! Redirecting to login...");
        navigate("/"); // Redirect to login page
      }
    } catch (error) {
      console.error("Registration failed:", error.response?.data?.message || error.message);
      alert("Registration Failed! Please try again.");
    }
  };

  return (
    <motion.div
      className="flex h-screen w-screen bg-[#f7f4f3]"
      initial={{ x: "100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100vw", opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      {/* Left Section */}
      <div className="w-1/2 h-full flex flex-col justify-center items-center">
        <div className="w-full max-w-md p-8">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
            Register as <span className="text-[#87475a]">{formData.role}</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="Supplier">Supplier</option>
                <option value="Supermarket">Supermarket</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-[#5b2333] text-white py-3 rounded-lg hover:bg-[#87475a]">
              Register
            </button>
          </form>
        </div>
      </div>

      {/* Right Section */}
      <motion.div
        className="w-1/2 h-full bg-[#5b2333] flex flex-col justify-center items-center text-white p-10 relative rounded-l-[150px]"
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img src={logo} alt="Swiftora Logo" className="w-24 mb-4 rounded-full" />
        <h2 className="text-3xl font-bold">Welcome to Swiftora</h2>
        <p className="text-lg mt-2">Already have an account?</p>
        <button
          className="mt-4 bg-white text-[#87475a] px-6 py-3 rounded-lg font-medium"
          onClick={() => navigate("/")}
        >
          Login
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Registration;
