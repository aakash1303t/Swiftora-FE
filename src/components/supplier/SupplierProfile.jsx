import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_LIBRARIES = ["places"];
const mapContainerStyle = { width: "100%", height: "300px" };

const SupplierProfile = () => {
  const [userData, setUserData] = useState({
    userId: "",
    supplierId: "",
    username: "",
    email: "",
    role: "",
    name: "",
    contact: "",
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
    fetchUserProfile();
  }, []);

const fetchUserProfile = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Invalid token");

    const response = await axios.get(`https://swiftora-be.onrender.com/api/suppliers/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data) {
      const data = response.data;
      const location = data.location || null;

      setUserData({
        userId: data.user_id,
        supplierId: data.supplier_id,
        username: data.username,
        email: data.email,
        role: data.role,
        name: data.name,
        contact: data.contact,
        location,
      });

      setEditedLocation(location);
      if (location) reverseGeocode(location.lat, location.lng);
    }
  } catch (err) {
    console.error("Error fetching profile:", err);
    setError("Failed to load profile.");
  } finally {
    setLoading(false);
  }
};


  const handleMapClick = (e) => {
    if (isEditing) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const newLocation = { lat, lng };
      setEditedLocation(newLocation);
      reverseGeocode(lat, lng);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress("Address not found");
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };

  const handleAddressChange = async (e) => {
    setAddress(e.target.value);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(e.target.value)}&key=${API_KEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setEditedLocation({ lat, lng });
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  };

  const handleAccurateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setEditedLocation({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to fetch location.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Invalid token");

      if (!userData.supplierId) {
        setError("Supplier ID not found.");
        setLoading(false);
        return;
      }

      if (!editedLocation) {
        setError("Location not set. Please select a location.");
        setLoading(false);
        return;
      }

      await axios.put(
        `https://swiftora-be.onrender.com/api/suppliers/${userData.supplierId}`,
        {
          name: userData.name,
          contact: userData.contact,
          location: editedLocation,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Profile updated successfully!");
      setUserData((prev) => ({
        ...prev,
        location: editedLocation,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-semibold text-[#5b2333]">Supplier Profile</h2>

      {loading ? (
        <p className="text-gray-600">Loading profile...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {message && <div className="p-2 bg-green-100 text-green-700 rounded">{message}</div>}

          {["username", "email", "name", "contact"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
              {!isEditing ? (
                <p className="text-gray-900">{userData[field] || "N/A"}</p>
              ) : (
                <input type="text" name={field} value={userData[field]} onChange={handleChange} className="w-full p-2 border rounded-md" required />
              )}
            </div>
          ))}

<div>
  <label className="block text-sm font-medium text-gray-700">Location</label>
  {!isEditing ? (
    <p className="text-gray-900">{address || "Location not set"}</p>
  ) : (
    <input
      type="text"
      value={address}
      onChange={handleAddressChange}
      className="w-full p-2 border rounded-md"
      placeholder="Enter address"
    />
  )}
</div>

{isEditing && (
  <button
    type="button"
    onClick={handleAccurateLocation}
    className="mt-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
  >
    Use Current Location
  </button>
)}


          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={editedLocation || userData.location || { lat: 0, lng: 0 }}
              zoom={15}
              onClick={isEditing ? handleMapClick : undefined}
            >
              {(editedLocation || userData.location) && <MarkerF position={editedLocation || userData.location} />}
            </GoogleMap>
          )}

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="w-full p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
              Edit Profile
            </button>
          ) : (
            <button type="submit" onClick={handleSubmit} className="w-full p-2 bg-[#5b2333] text-white rounded-md hover:bg-[#4a1c29]">
              Update Profile
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplierProfile;
