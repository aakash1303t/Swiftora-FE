import React, { useState, useEffect } from "react";
import axios from "axios";

const FindSupplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingTieUp, setLoadingTieUp] = useState(null);
  const [tieUpStatuses, setTieUpStatuses] = useState({});
  const [supermarketUserId, setSupermarketUserId] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch supermarket profile to get supermarketUserId (userId)
  useEffect(() => {
    const fetchSupermarketUserId = async () => {
      if (!token) {
        setError("User not authenticated. Please login.");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("http://localhost:5000/api/supermarkets/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // The /me endpoint returns supermarket data including user_id
        const userId = res.data.user_id || res.data.supermarket_user_id || res.data.userId;
        if (!userId) {
          setError("Supermarket user ID not found. Please login again.");
          setLoading(false);
          return;
        }
        setSupermarketUserId(userId);
      } catch (err) {
        console.error("Error fetching supermarket user ID:", err);
        setError("Failed to fetch supermarket info. Please login again.");
        setLoading(false);
      }
    };

    fetchSupermarketUserId();
  }, [token]);

  // Once we have supermarketUserId, fetch suppliers and tie-up statuses
  useEffect(() => {
    if (!supermarketUserId) return;

    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/supermarkets/findsupplier", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawSuppliers = res.data.Items || res.data || [];
        setSuppliers(rawSuppliers);

        const statuses = {};
        await Promise.all(
          rawSuppliers.map(async (supplier) => {
            const supplierId = supplier.supplierId || supplier.supplier_id;
            if (!supplierId) return;
            const status = await fetchTieUpStatus(supermarketUserId, supplierId);
            statuses[supplierId] = status || "not_requested";
          })
        );
        setTieUpStatuses(statuses);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        setError("Failed to fetch suppliers.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTieUpStatus = async (supermarketUserId, supplierId) => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/supermarkets/tieup-status?supplierId=${supplierId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data.tieUp?.status || "not_requested";
      } catch (err) {
        // If 404 or no tie-up found, default to not_requested
        if (err.response?.status === 404) return "not_requested";
        console.error("Error fetching tie-up status:", err.response?.data || err.message);
        return "not_requested";
      }
    };

    fetchSuppliers();
  }, [supermarketUserId, token]);

  const handleTieUp = async (supplierId) => {
    setLoadingTieUp(supplierId);
    try {
      await axios.post(
        "http://localhost:5000/api/supermarkets/request-tieup",
        { supplierId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTieUpStatuses((prev) => ({ ...prev, [supplierId]: "pending" }));
    } catch (err) {
      console.error("Tie-up failed:", err);
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoadingTieUp(null);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tie-up with Your Suppliers</h1>
        <p className="text-sm text-gray-500 mt-1">Below is the list of suppliers you are tied up with.</p>
      </div>

      <div className="border-t-2 border-gray-400 pt-6 mt-4"></div>

      {suppliers.length === 0 ? (
        <p>No suppliers found</p>
      ) : (
        <div className="space-y-4">
          {suppliers.map((supplier) => {
            const supplierId = supplier.supplierId || supplier.supplier_id;
            return (
              <div
                key={supplierId}
                className="border-b border-gray-300 pb-3 flex justify-between items-start"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{supplier.name}</h3>
                  <p className="text-sm text-gray-700">
                    📧 {supplier.email} &nbsp;&nbsp; 📞 {supplier.contact || "N/A"} | 👤 {supplier.username || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">📍 {supplier.fullAddress || "N/A"}</p>
                  <p className="text-sm text-gray-700">
                    🛒 Products:{" "}
                    {supplier.products && supplier.products.length > 0
                      ? supplier.products.map((product) => (
                          <span key={product.productId || product.productName || product}>
                            {product.productName || product}
                            {supplier.products.indexOf(product) !== supplier.products.length - 1 ? ", " : ""}
                          </span>
                        ))
                      : "No products"}
                  </p>
                </div>

                <div className="ml-4">
                  {tieUpStatuses[supplierId] === "accepted" ? (
                    <span className="text-green-600">Successfully Tied-up</span>
                  ) : tieUpStatuses[supplierId] === "pending" ? (
                    <span className="text-yellow-600">Request Sent…</span>
                  ) : loadingTieUp === supplierId ? (
                    <span className="text-yellow-600">Sending Request...</span>
                  ) : (
                    <button
                      onClick={() => handleTieUp(supplierId)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Tie-up
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FindSupplier;