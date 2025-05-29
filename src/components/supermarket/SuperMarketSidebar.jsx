import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  FaHome, FaStore, FaWarehouse, FaClipboardList, 
  FaBox, FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes, FaShippingFast 
} from "react-icons/fa";
import logo from "../../assets/logo1.png"; // Ensure path is correct

const SuperMarketSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return ( 
    <>
      {/* Mobile Hamburger Menu Button (Moved to Right) */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 bg-[#87475a] text-white p-2 rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:relative top-0 left-0 h-screen w-64 bg-[#5b2333] text-white flex flex-col shadow-lg transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo and Name */}
        <div className="flex items-center py-4 px-6 border-b border-white gap-3">
          <img src={logo} alt="Swiftora Logo" className="w-10 h-10 rounded-full" />
          <h1 className="text-lg font-semibold">Swiftora</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col flex-1 mt-4">
          {[ 
            { to: "/supermarket-dashboard", icon: <FaHome className="text-xl" />, label: "Dashboard" },
            { to: "/supermarket-profile", icon: <FaUser className="text-xl" />, label: "MyProfile" },
            { to: "/find-suppliers", icon: <FaStore className="text-xl" />, label: "Find Suppliers" },
            { to: "/my-suppliers", icon: <FaClipboardList className="text-xl" />, label: "My Suppliers" },
            { to: "/my-order", icon: <FaBox className="text-xl" />, label: "Orders" },
            { to: "/track-orders", icon: <FaShippingFast className="text-xl" />, label: "Track Orders" },
          ].map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-3 px-6 py-3 text-lg transition-all duration-300 hover:bg-[#87475a]"
              onClick={() => setIsOpen(false)} // Close on click (Mobile UX fix)
            >
              {icon} {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-auto">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-6 py-3 text-lg transition-all duration-300 hover:bg-[#87475a]"
          >
            <FaSignOutAlt className="text-xl" /> Logout
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default SuperMarketSidebar;
