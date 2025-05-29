import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import logo from "../assets/logo1.png";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post("https://swiftora-be.onrender.com/api/users/login", {
      username: formData.username,
      password: formData.password,
    });

    const { token, user, supplierDetails, supermarketDetails, supermarket_id } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "supplier" && supplierDetails) {
      localStorage.setItem("supplierDetails", JSON.stringify(supplierDetails));
    }

    if (user.role === "supermarket" && supermarketDetails) {
      localStorage.setItem("supermarketDetails", JSON.stringify(supermarketDetails));
      localStorage.setItem("supermarket_id", supermarket_id); // ✅ Fixed
    }

    navigate(user.role === "supplier" ? "/supplier-dashboard" : "/supermarket-dashboard");
  } catch (error) {
    setError(error.response?.data?.message || "Login failed. Please try again.");
  }
};


  return (
    <motion.div
      className="flex h-screen w-screen bg-[#f7f4f3]"
      initial={{ x: "-100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100vw", opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      {/* Blue Section (Sliding in from Left) */}
      <motion.div
        className="w-1/2 h-full bg-[#5b2333] flex flex-col justify-center items-center text-white p-10 relative rounded-r-[150px]"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img src={logo} alt="Swiftora Logo" className="w-24 mb-4 rounded-full" />
        <h2 className="text-3xl font-bold">Welcome to Swiftora</h2>
        <p className="text-lg mt-2">Don't have an account?</p>
        <button
          className="mt-4 bg-white text-[#87475a] px-6 py-3 rounded-lg font-medium"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </motion.div>

      {/* Login Form Section */}
      <div className="w-1/2 h-full flex flex-col justify-center items-center">
        <div className="w-full max-w-md p-8">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">Login</h2>
          {error && <p className="text-red-600 text-center">{error}</p>}
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

            <button
              type="submit"
              className="w-full bg-[#5b2333] text-white py-3 rounded-lg hover:bg-[#87475a]"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
