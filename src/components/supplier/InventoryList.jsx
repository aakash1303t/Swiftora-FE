import React from "react";

const InventoryList = ({ inventoryItems }) => {
  return (
    <section className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold text-[#5b2333]">Current Inventory</h2>
      <p className="text-sm text-gray-700 mt-2">
        {inventoryItems.length} items in stock, 1 low stock alert
      </p>

      {/* Inventory List */}
      <div className="mt-4">
        {inventoryItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-3 border-b">
            <div>
              <h3 className="text-lg font-semibold text-black">{item.name}</h3>
              <p className="text-sm text-gray-600">
                SKU: {item.sku} • Last Updated: {item.lastUpdated}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-black">{item.stock} units</p>
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  item.status === "In Stock"
                    ? "bg-green-200 text-green-800"
                    : item.status === "Low Stock"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InventoryList;
