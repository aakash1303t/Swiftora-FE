import React from 'react'
import Sidebar from "../../components/supplier/Sidebar";
import { LoadScript } from "@react-google-maps/api";
import SupplierProfile from '../../components/supplier/SupplierProfile'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_LIBRARIES = ["places"];
const SupplierProfilePage = () => {
  return (
    <div className="flex min-h-screen bg-[#f7f4f3]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 transition-all duration-300">
        <h1 className="text-2xl md:text-3xl mb-4 font-semibold text-[#5b2333]">Supplier Profile</h1>
        {/* Dashboard Sections */}
        <div className="space-y-6 md:space-y-8">
            <LoadScript googleMapsApiKey={API_KEY} libraries={MAP_LIBRARIES}>
                <SupplierProfile />
            </LoadScript>
        </div>
      </div>
    </div>
  )
}

export default SupplierProfilePage