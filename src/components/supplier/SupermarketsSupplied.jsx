import React, { useEffect, useState } from "react";
import axios from "axios";

const SupermarketsSupplied = () => {
  const [supermarkets, setSupermarkets] = useState([]);
  const [addresses, setAddresses] = useState({});
  const [loading, setLoading] = useState(true);
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // 🔄 Reverse geocoding: get readable address from lat/lng
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        return "Unknown location";
      }
    } catch (err) {
      console.error("❌ Reverse geocoding failed:", err);
      return "Error fetching address";
    }
  };

  // 🧠 Format address using pre-fetched addresses state
  const formatLocation = (supermarketId) => {
    const address = addresses[supermarketId];
    return address || "Loading address...";
  };

  
  useEffect(() => {
  const fetchSupermarkets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const supplierId = localStorage.getItem("supplierId");

      console.log("📦 Token:", token?.substring(0, 50), "...");
      console.log("🆔 supplierId from localStorage:", supplierId);

      const response = await axios.get("https://swiftora-be.onrender.com/api/suppliers/tieup-request-details", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Response data:", response.data);

      const data = Array.isArray(response.data) ? response.data : [];
      setSupermarkets(data);

      // 🌍 Fetch addresses
      data.forEach(async (market) => {
        const details = market.supermarketDetails;
        const supermarketId = market.supermarketId;
        console.log("📍 Market ID:", supermarketId, "Details:", details);

        if (details?.location?.lat && details?.location?.lng) {
          const address = await reverseGeocode(details.location.lat, details.location.lng);
          setAddresses((prev) => ({ ...prev, [supermarketId]: address }));
        } else {
          setAddresses((prev) => ({ ...prev, [supermarketId]: "Location not available" }));
        }
      });
    } catch (error) {
      console.error("❌ Error fetching supermarket data:", error);
      setSupermarkets([]);
    } finally {
      setLoading(false);
    }
  };

  fetchSupermarkets();
}, []);

  
  const handleAccept = async (supermarketId, supplierId) => {
    try {
      console.log("👉 Sending request to accept tie-up:", supermarketId, supplierId);
  
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ Token not found in localStorage");
        alert("Access Denied: No Token Provided. Please login again.");
        return;
      }
  
      const response = await axios.put(
        `https://swiftora-be.onrender.com/api/suppliers/tieup/accept/${supermarketId}/${supplierId}`,
        {},
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data.message === "Tie-up accepted successfully") {
        alert("Tie-up accepted successfully!");
        fetchSupermarkets(); // Refresh tie-up list
      } else {
        alert("Failed to accept tie-up: " + response.data.message);
      }
    } catch (error) {
      console.error("❌ Error accepting tie-up:", error);
      alert("Something went wrong while accepting the tie-up.");
    }
  };
  
  
  
  
  
  if (loading) {
    return <p>Loading supermarkets...</p>;
  }

  return (
    <div className="bg-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Partnered Supermarkets</h1>
        <p className="text-sm text-gray-500 mt-1">Below is the list of supermarkets you are tied up with.</p>
      </div>
  
      <div className="border-t-2 border-gray-400 pt-6 mt-4"></div>
  
      {loading ? (
        <p>Loading supermarkets...</p>
      ) : supermarkets.length === 0 ? (
        <p>No supermarkets found</p>
      ) : (
        <div className="space-y-4">
          {supermarkets.map((market, index) => {
            const details = market.supermarketDetails;
            if (!details) return null;
  
            const isAccepted = market.status === "accepted";
            return (
              <div
                key={index}
                className={`grid ${isAccepted ? "grid-cols-3" : "grid-cols-4"} gap-4 items-center border-b border-gray-100 pb-4`}
                style={{ minHeight: "80px" }}
              >
                {/* Column 1: Name */}
                <div className="col-span-1">
                  <h3 className="text-base font-semibold text-gray-600">{details.supermarketName}</h3>
                  <p className="text-xs text-gray-500">👤 {details.username || "N/A"}</p>
                </div>
  
                {/* Column 2: Contact Info */}
                <div className="col-span-1 text-sm text-gray-700 leading-relaxed">
                  📧 {details.email}<br />
                  📞 {details.phone || "N/A"}<br />
                  📍 {formatLocation(market.supermarketId)}
                </div>
  
                {/* Column 3: Status Info */}
                <div className="col-span-1 text-sm text-gray-700">
                  {market.status === "accepted" ? (
                    <span className="text-green-700 font-medium">Successfully Tied-up</span>
                  ) : market.status === "pending" ? (
                    <span className="text-yellow-700 font-medium">Request Pending…</span>
                  ) : (
                    <span className="text-gray-700 capitalize font-medium">{market.status || "Unknown"}</span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">ID: {market.tie_up_id}</p>
                </div>
  
                {/* Column 4: Accept Button (Only for Pending) */}
                {!isAccepted && (
                  <div className="col-span-1 text-right">
                    {market.status === "pending" && (
                      <button
                        onClick={() => handleAccept(market.supermarketId, market.supplierId)}
                        className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );  
  
};

export default SupermarketsSupplied;
