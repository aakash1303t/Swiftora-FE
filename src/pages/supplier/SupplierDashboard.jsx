import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/supplier/Sidebar";
import SupermarketsSupplied from "../../components/supplier/SupermarketsSupplied";
import CurrentInventory from "../../components/supplier/CurrentInventory";
import MyOrders from "../../components/supplier/MyOrders";
import { ShoppingCart, Box, Users } from "react-feather";
import axios from "axios";

const SupplierDashboard = () => {
  const [supermarkets, setSupermarkets] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Mock data for orders
  const orders = [
    { id: "#ORD123", product: "Organic Apples", quantity: 120, date: "March 12, 2025", status: "Delivered" },
    { id: "#ORD124", product: "Fresh Milk", quantity: 80, date: "March 10, 2025", status: "Processing" },
    { id: "#ORD125", product: "Whole Grain Bread", quantity: 50, date: "March 8, 2025", status: "Canceled" },
  ];
    

  useEffect(() => {
    fetchInventory();
    fetchSupermarkets(); 
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const response = await axios.get("https://swiftora-be.onrender.com/api/products/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const products = response.data.products || [];

      const mappedProducts = products.map((product) => {
  let status = "Out of Stock";
  if (product.stock > 10) {
    status = "In Stock";
  } else if (product.stock > 0) {
    status = "Low Stock";
  }

  return {
    id: product.product_id,                                // SQL-based field
    name: product.product_name,                            // SQL-based field
    sku: product.sku,                                      // SQL-based field
    stock: product.stock,                                  // SQL-based field
    lastUpdated: new Date(product.updated_at).toLocaleString(), // SQL-based field
    status,
  };
});

      setInventoryItems(mappedProducts);
    } catch (err) {
      console.error("Error fetching inventory:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupermarkets = async () => {
    try {
    const token = localStorage.getItem("token");
    const response = await axios.get("https://swiftora-be.onrender.com/api/suppliers/tieup-request-details", {
      headers: { Authorization: `Bearer ${token}`},
    });
    setSupermarkets(response.data || []);
    } catch (err) {
    console.error("Supermarket fetch error:", err);
    setSupermarkets([]);
    }
    };

// ✅ Count only accepted tie-ups
const acceptedSupermarkets = supermarkets.filter((m) => m.status === "accepted");

  // Optionally fetch these values from API in future
  const stats = {
    supermarkets: acceptedSupermarkets.length, // Replace with real data when API is ready
    products: inventoryItems.length,
    orders: orders.length, // ₹
  };

  return (
    <div className="flex min-h-screen bg-[#f7f4f3]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 transition-all duration-300">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#5b2333]">Supplier Dashboard</h1>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-4 mb-6">
          <DashboardCard title="Active Supermarkets" value={stats.supermarkets} icon={<Users className="text-[#5b2333]" />} />
          <DashboardCard title="Total Items" value={stats.products} icon={<ShoppingCart className="text-[#5b2333]" />} />
          <DashboardCard title="Total Orders" value={stats.orders} icon={<Box className="text-[#5b2333]" />} />
        </div>

        {/* Dashboard Sections */}
        <div className="space-y-6 md:space-y-8">
          <SupermarketsSupplied />

          {!loading ? (
            <CurrentInventory
              inventoryItems={inventoryItems.slice(0, 4)}
              fullCount={inventoryItems.length}
              allowActions={false}
            />
          ) : (
            <div className="text-center text-gray-600">Loading inventory...</div>
          )}

          <MyOrders orders={orders} />
        </div>
      </div>
    </div>
  );
};

// Reusable Card Component
const DashboardCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col">
    <div className="flex items-center space-x-2">
      <div className="h-5 w-5">{icon}</div>
      <h2 className="text-md md:text-lg font-semibold text-[#5b2333]">{title}</h2>
    </div>
    <p className="text-2xl md:text-3xl font-bold text-black mt-2">{value}</p>
  </div>
);

export default SupplierDashboard;
