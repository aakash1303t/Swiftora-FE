import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CurrentInventory = ({ inventoryItems, refreshInventory, allowActions = true, fullCount }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingItem(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const payload = {
        product_name: editingItem.name,
        stock: parseInt(editingItem.stock),
      };

      await axios.put(`http://localhost:5000/api/products/update/${editingItem.sku}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Success", "Product updated successfully!", "success");
      closeEditModal();
      if (refreshInventory) refreshInventory();
    } catch (err) {
      console.error("Error updating product:", err);
      Swal.fire("Error", "Failed to update product", "error");
    }
  };

const handleDelete = async (sku) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This product will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#5b2333",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Delete it!",
  });

  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      await axios.delete(`http://localhost:5000/api/products/delete/${sku}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Deleted!", "Product deleted successfully.", "success");
      if (refreshInventory) refreshInventory();
    } catch (err) {
      console.error("Error deleting product:", err);
      Swal.fire("Error", "Failed to delete product", "error");
    }
  }
};



  return (
    <section className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#5b2333]">Inventory</h2>
        {!allowActions && (
          <a href="/inventory" className="text-[#5b2333] font-semibold hover:underline text-sm">
            View More →
          </a>
        )}
      </div>
      <p className="text-sm text-gray-700 mt-2">
        {fullCount !== undefined ? fullCount : inventoryItems.length} items in stock
      </p>

      <div className="mt-4">
        {inventoryItems.map((item, index) => (
          <div key={item.product_id || index} className="flex justify-between items-center py-3 border-b">
            <div>
              <h3 className="text-lg font-semibold text-black">{item.name}</h3>
              <p className="text-sm text-gray-600">
                SKU: {item.sku} • Last Updated: {item.lastUpdated}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-bold text-black">{item.stock} units</p>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  item.status === "In Stock"
                    ? "bg-green-200 text-green-800"
                    : item.status === "Low Stock"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-200 text-red-800"
                }`}>
                  {item.status}
                </span>
              </div>

              {allowActions && (
                <>
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.sku)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditOpen && allowActions && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-lg font-semibold text-[#5b2333] mb-4">Edit Product</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingItem?.name || ""}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={editingItem?.stock ?? ""}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5b2333] text-white rounded-md hover:bg-[#4a1c29]"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default CurrentInventory;
