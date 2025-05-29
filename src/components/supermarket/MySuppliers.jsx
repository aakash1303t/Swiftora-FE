import React, { useState, useEffect } from "react";
import axios from "axios";

const MySuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState({});
  const [supermarketId, setSupermarketId] = useState(null);

  const fetchAddress = async (lat, lng) => {
    const key = `${lat},${lng}`;
    if (addresses[key]) return addresses[key];

    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: { lat, lon: lng, format: "json" },
      });
      return response.data.display_name || "Address not found";
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return "Address lookup failed";
    }
  };

  useEffect(() => {
    const fetchSupermarketUserId = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated. Please login.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("https://swiftora-be.onrender.com/api/supermarkets/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userId = res.data.user_id || res.data.supermarket_user_id || res.data.userId;
        if (!userId) {
          setError("Supermarket user ID not found. Please login again.");
          setLoading(false);
          return;
        }

        setSupermarketId(userId);
      } catch (err) {
        console.error("Error fetching supermarket user ID:", err);
        setError("Failed to fetch supermarket info. Please login again.");
        setLoading(false);
      }
    };

    fetchSupermarketUserId();
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!supermarketId) return;

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      console.log("Fetching suppliers for supermarket ID:", supermarketId);

      try {
        const res = await axios.get(
          `https://swiftora-be.onrender.com/api/supermarkets/accepted-status/${supermarketId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const tieUps = res.data.acceptedTieUps;
        if (Array.isArray(tieUps)) {
          console.log("Fetched suppliers:", tieUps);
          setSuppliers(tieUps);

          const addrMap = {};
          await Promise.all(
            tieUps.map(async (supplier) => {
              const { lat, lng } = supplier.location || {};
              if (lat && lng) {
                const addr = await fetchAddress(lat, lng);
                addrMap[supplier.supplier_id] = addr;
              } else {
                addrMap[supplier.supplier_id] = "No location data";
              }
            })
          );
          setAddresses(addrMap);
        } else {
          setError("No suppliers found or unexpected data format.");
        }
      } catch (err) {
        console.error("❌ Error fetching accepted suppliers:", err);
        setError("Failed to load accepted suppliers.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [supermarketId]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Available Suppliers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Here is the list of accepted suppliers for your supermarket.
        </p>
      </div>

      <div className="border-t-2 border-gray-400 pt-6 mt-4" />

      {suppliers.length === 0 ? (
        <p>No suppliers found</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
          {suppliers.map((supplier) => (
            <div
              key={supplier.supplier_id}
              className="border border-gray-300 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  <strong>Name:</strong> {supplier.name}
                </h3>
                <p className="text-sm text-gray-700"><strong>Email:</strong> {supplier.email}</p>
                <p className="text-sm text-gray-700"><strong>Contact:</strong> {supplier.contact}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-700"><strong>Supplier ID:</strong> {supplier.supplier_id}</p>
                <p className="text-sm text-gray-700"><strong>User ID:</strong> {supplier.user_id}</p>
                <p className="text-sm text-gray-700"><strong>Username:</strong> {supplier.username}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  <strong>Created At:</strong>{" "}
                  {supplier.created_at
                    ? new Date(supplier.created_at).toLocaleString()
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Address:</strong> {addresses[supplier.supplier_id] || "Loading address..."}
                </p>
              </div>

              {supplier.tie_up_id != null && (
                <div className="col-span-1 md:col-span-3 mt-2 border-t pt-2 space-y-1 text-sm text-gray-700">
                  <p><strong>Tie-up ID:</strong> {supplier.tie_up_id}</p>
                  <p><strong>Supermarket ID:</strong> {supplier.supermarket_id}</p>
                  <p><strong>Supermarket User ID:</strong> {supplier.supermarket_user_id}</p>
                  <p><strong>Status:</strong> {supplier.status}</p>
                  <p><strong>Requested At:</strong>{" "}
                    {supplier.requested_at
                      ? new Date(supplier.requested_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySuppliers;
