import React from "react";
import { Routes, Route } from "react-router-dom";
import Registration from "./pages/Registration";
import CurrentInventoryPage from "./pages/supplier/CurrentInventoryPage";
import MySupermarkets from "./pages/supplier/MySupermarkets";
import Orders from "./pages/supplier/Orders";
import SupplierProfilePage from "./pages/supplier/SupplierProfilePage";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupermarketDashboard from "./pages/supermarket/SupermarketDashboard";

import Login from "./pages/Login";
import SupermarketProfilePage from "./pages/supermarket/SupermarketProfilePage";
import FindSupplierPage from "./pages/supermarket/FindSupplierPage";
import Mysupplierdashboard from "./pages/supermarket/Mysupplierdashboard";
import MyOrderDashboard from "./pages/supermarket/MyOrderDashboard";
import OrderTrackingDashboard from "./pages/supermarket/OrderTrackingDashboard";

function App() {
  return (
    <Routes>
      {/* public root */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      {/* Supplier root */}
      <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
      <Route path="/supplier-profile" element={<SupplierProfilePage />} />
      <Route path="/my-supermarkets" element={<MySupermarkets />} /> 
      <Route path="/inventory" element={<CurrentInventoryPage />} />

      <Route path="/my-orders" element={<Orders />} />
      {/* Supermarket root */}
      <Route path="/supermarket-dashboard" element={<SupermarketDashboard />} />
      <Route path="/supermarket-profile" element={<SupermarketProfilePage />} />
      <Route path="/find-suppliers" element={<FindSupplierPage />} />
      <Route path="/my-suppliers" element={<Mysupplierdashboard />} />
      <Route path="/my-order" element={<MyOrderDashboard />} />
      <Route path="/track-orders" element={<OrderTrackingDashboard />} />
    </Routes>
  );
}

export default App;
