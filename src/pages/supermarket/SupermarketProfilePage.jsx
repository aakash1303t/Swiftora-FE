import React from 'react'
import SuperMarketSidebar from '../../components/supermarket/SuperMarketSidebar';
import { LoadScript } from "@react-google-maps/api";
import SupermarketProfile from '../../components/supermarket/SupermarketProfile';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAP_LIBRARIES = ["places"];
const SupermarketProfilePage = () => {
  return (
    <div className="flex min-h-screen bg-[#f7f4f3]">
      {/* Sidebar */}
      <SuperMarketSidebar /> 

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 transition-all duration-300">
        <h1 className="text-2xl md:text-3xl mb-4 font-semibold text-[#5b2333]">Supermarket Profile</h1>
        {/* Dashboard Sections */}
        <div className="space-y-6 md:space-y-8">
            <LoadScript googleMapsApiKey={API_KEY} libraries={MAP_LIBRARIES}>
                <SupermarketProfile/>
            </LoadScript>
        </div>
      </div>
    </div>
  )
}

export default SupermarketProfilePage