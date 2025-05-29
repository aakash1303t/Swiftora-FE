import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_LIBRARIES = ["places"];
const mapContainerStyle = { width: "100%", height: "300px" };

const SupermarketProfile = () => {
  const [supermarketData, setSupermarketData] = useState({
    supermarketId: "",
    userId: "",
    username: "",
    email: "",
    role: "",
    supermarket_name: "",
    phone: "",
    location: null,
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedLocation, setEditedLocation] = useState(null);
  const [address, setAddress] = useState("");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: API_KEY,
    libraries: MAP_LIBRARIES,
  });

  useEffect(() => {
    fetchSupermarketProfile();
  }, []);

  const fetchSupermarketProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const res = await axios.get("http://localhost:5000/api/supermarkets/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      const location = data.location || null;

      // ✅ Store supermarket_id in localStorage
      if (data.supermarket_id) {
        localStorage.setItem("supermarket_id", data.supermarket_id);
      }

      setSupermarketData({
        supermarketId: data.supermarket_id,
        userId: data.user_id,
        username: data.username,
        email: data.email,
        role: data.role,
        supermarket_name: data.supermarket_name?.trim() || null,
        phone: data.phone,
        location,
      });

      setEditedLocation(location);
      if (location) await reverseGeocode(location.lat, location.lng);
    } catch (err) {
      console.error("❌ Failed to load profile:", err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
      );
      const data = await res.json();
      if (data.results?.length) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress("Address not found");
      }
    } catch (err) {
      console.error("❌ Reverse geocoding error:", err);
    }
  };

  const geocodeAddress = async (newAddress) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(newAddress)}&key=${API_KEY}`
      );
      const data = await res.json();
      if (data.results?.length) {
        const { lat, lng } = data.results[0].geometry.location;
        setEditedLocation({ lat, lng });
      }
    } catch (err) {
      console.error("❌ Geocoding error:", err);
    }
  };

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    geocodeAddress(newAddress);
  };

  const handleMapClick = (e) => {
    if (!isEditing) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newLocation = { lat, lng };
    setEditedLocation(newLocation);
    reverseGeocode(lat, lng);
  };

  const handleAccurateLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setEditedLocation(newLocation);
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        console.error("❌ Geolocation error:", err);
        setError("Unable to fetch location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupermarketData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No token found in localStorage");
        throw new Error("Token not found");
      }

      if (!editedLocation) {
        console.error("❌ Location is missing:", editedLocation);
        throw new Error("Location is required");
      }

      // Log all the data before sending
      console.log("➡️ Submitting update with data:", {
        supermarket_name: supermarketData.supermarket_name,
        phone: supermarketData.phone,
        address,
        location: editedLocation,
      });

      const res = await axios.put(
        `http://localhost:5000/api/supermarkets/${supermarketData.supermarketId}`,
        {
          supermarket_name: supermarketData.supermarket_name,
          phone: supermarketData.phone,
          address,
          location: editedLocation,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Update response:", res.data);

      setMessage("Profile updated successfully!");
      setSupermarketData((prev) => ({
        ...prev,
        location: editedLocation,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Update error:", err.response || err.message || err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-semibold text-[#5b2333]">Supermarket Profile</h2>

      {loading ? (
        <p className="text-gray-600">Loading profile...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {message && <p className="p-2 bg-green-100 text-green-700 rounded">{message}</p>}

          {/* FORM ONLY WHEN EDITING */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {["supermarket_name", "phone", "username", "email"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                  {field === "username" || field === "email" ? (
                    <p className="text-gray-900">{supermarketData[field] || "N/A"}</p>
                  ) : (
                    <input
                      type="text"
                      name={field}
                      value={supermarketData[field] || ""}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={address || ""}
                  onChange={handleAddressChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter address"
                />
              </div>

              <button
                type="button"
                onClick={handleAccurateLocation}
                className="mt-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Use Current Location
              </button>

              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={editedLocation || supermarketData.location || { lat: 0, lng: 0 }}
                  zoom={editedLocation || supermarketData.location ? 15 : 2}
                  onClick={handleMapClick}
                >
                  {(editedLocation || supermarketData.location) && (
                    <MarkerF position={editedLocation || supermarketData.location} />
                  )}
                </GoogleMap>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full p-2 bg-[#5b2333] text-white rounded-md hover:bg-[#4a1c29]"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </form>
          ) : (
            // VIEW MODE - NO FORM
            <div className="space-y-4">
              {["supermarket_name", "phone", "username", "email"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                  <p className="text-gray-900">{supermarketData[field] || "N/A"}</p>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">{address || "Location not set"}</p>
              </div>

              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={editedLocation || supermarketData.location || { lat: 0, lng: 0 }}
                  zoom={editedLocation || supermarketData.location ? 15 : 2}
                >
                  {(editedLocation || supermarketData.location) && (
                    <MarkerF position={editedLocation || supermarketData.location} />
                  )}
                </GoogleMap>
              )}

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupermarketProfile;