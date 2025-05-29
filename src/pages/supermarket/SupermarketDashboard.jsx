import React, { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingCart, Box, Users } from "react-feather";

import SuperMarketSidebar from "../../components/supermarket/SuperMarketSidebar";
import MySuppliers from "../../components/supermarket/MySuppliers";
import MySupermarketOrders from "../../components/supermarket/MySupermarketOrders";
import OrderTracking from "../../components/supermarket/OrderTracking";

const SupermarketDashboard = () => {
  const [tieUpCount, setTieUpCount] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  const [loadingTieUp, setLoadingTieUp] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [errorTieUp, setErrorTieUp] = useState("");
  const [errorSuppliers, setErrorSuppliers] = useState("");
  const [errorOrders, setErrorOrders] = useState("");

  const supermarketId = localStorage.getItem("supermarket_id");
  const token = localStorage.getItem("token");

  // Fetch tie-up count
  useEffect(() => {
    const fetchTieUpCount = async () => {
      if (!supermarketId || !token) {
        setErrorTieUp("Missing credentials.");
        return;
      }

      try {
        setLoadingTieUp(true);
        const res = await axios.get(
          `https://swiftora-be.onrender.com/api/supermarkets/accepted-status/${supermarketId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTieUpCount(res.data.acceptedTieUps?.length || 0);
        setErrorTieUp("");
      } catch (err) {
        console.error("Tie-up count error:", err);
        setErrorTieUp("Failed to fetch tie-up count.");
        setTieUpCount(0);
      } finally {
        setLoadingTieUp(false);
      }
    };

    fetchTieUpCount();
  }, [supermarketId, token]);

  // Fetch total suppliers available
  useEffect(() => {
    const fetchSupplierCount = async () => {
      if (!token) {
        setErrorSuppliers("Missing token.");
        return;
      }

      try {
        setLoadingSuppliers(true);
        const res = await axios.get("https://swiftora-be.onrender.com/api/supermarkets/findsupplier", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawSuppliers = res.data.Items || res.data || [];
        setSupplierCount(rawSuppliers.length);
        setErrorSuppliers("");
      } catch (err) {
        console.error("Supplier count error:", err);
        setErrorSuppliers("Failed to fetch suppliers.");
        setSupplierCount(0);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSupplierCount();
  }, [token]);

  // Fetch total orders placed
  useEffect(() => {
    const fetchOrders = async () => {
      if (!supermarketId) {
        setErrorOrders("Supermarket ID missing.");
        return;
      }

      try {
        setLoadingOrders(true);
        const response = await axios.get(
          `https://swiftora-be.onrender.com/api/orders/supermarket/${supermarketId}`
        );
        setOrderCount(response.data.orders?.length || 0);
        setErrorOrders("");
      } catch (err) {
        console.error("Order count error:", err);
        setErrorOrders("Failed to fetch orders.");
        setOrderCount(0);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [supermarketId]);

  return (
    <div className="flex min-h-screen bg-[#f7f4f3]">
      <SuperMarketSidebar />

      <div className="flex-1 p-4 md:p-6 transition-all duration-300">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#5b2333]">Supermarket Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6 mb-6">
          {/* Tie-up Count */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-[#5b2333]" />
              <h2 className="text-md md:text-lg font-semibold text-[#5b2333]">Supplier Tie-up</h2>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-black mt-2">
              {loadingTieUp ? "..." : errorTieUp ? "0" : tieUpCount}
            </p>
            {errorTieUp && <p className="text-red-500 text-sm mt-1">{errorTieUp}</p>}
          </div>

          {/* Supplier Count */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col">
            <div className="flex items-center space-x-2">
              <Box className="h-5 w-5 text-[#5b2333]" />
              <h2 className="text-md md:text-lg font-semibold text-[#5b2333]">Total Suppliers</h2>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-black mt-2">
              {loadingSuppliers ? "..." : errorSuppliers ? "0" : supplierCount}
            </p>
            {errorSuppliers && <p className="text-red-500 text-sm mt-1">{errorSuppliers}</p>}
          </div>

          {/* Order Count */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-[#5b2333]" />
              <h2 className="text-md md:text-lg font-semibold text-[#5b2333]">Total Orders</h2>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-black mt-2">
              {loadingOrders ? "..." : errorOrders ? "0" : orderCount}
            </p>
            {errorOrders && <p className="text-red-500 text-sm mt-1">{errorOrders}</p>}
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <MySuppliers />
          <MySupermarketOrders />
          <OrderTracking />
        </div>
      </div>
    </div>
  );
};

export default SupermarketDashboard;
