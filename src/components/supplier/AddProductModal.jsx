import React, { useState } from "react";
import axios from "axios";

const AddProductModal = ({ onClose, onProductAdded }) => {
  const [productData, setProductData] = useState({
    product_name: "",
    sku: "",
    barcode: "",
    category: "",
    company: "",
    cost_price: "",
    purchase_price: "",
    sales_price: "",
    mrp_price: "",
    discount: "",
    expiry_date: "",
    hsn_no: "",
    stock: "",
    unit: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const newProduct = {
        product_name: productData.product_name.trim(),
        sku: productData.sku.trim(),
        barcode: productData.barcode.trim(),
        category: productData.category.trim(),
        company: productData.company.trim(),
        cost_price: parseFloat(productData.cost_price) || 0,
        purchase_price: parseFloat(productData.purchase_price) || 0,
        sales_price: parseFloat(productData.sales_price) || 0,
        mrp_price: parseFloat(productData.mrp_price) || 0,
        discount: parseFloat(productData.discount) || 0,
        expiry_date: productData.expiry_date || null,
        hsn_no: productData.hsn_no.trim(),
        stock: parseInt(productData.stock) || 0,
        unit: productData.unit.trim(),
      };

      const response = await axios.post(
        "https://swiftora-be.onrender.com/api/products/add",
        newProduct,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Product added:", response.data);

      onProductAdded();
      onClose();
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
      setErrorMessage("Failed to add product. Please check your input.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold text-[#5b2333] mb-4">Add New Product</h2>

        {errorMessage && (
          <p className="text-red-600 text-sm mb-2">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "product_name", label: "Product Name" },
            { name: "sku", label: "SKU" },
            { name: "barcode", label: "Barcode" },
            { name: "category", label: "Category" },
            { name: "company", label: "Company" },
            { name: "cost_price", label: "Cost Price", type: "number" },
            { name: "purchase_price", label: "Purchase Price", type: "number" },
            { name: "sales_price", label: "Sales Price", type: "number" },
            { name: "mrp_price", label: "MRP Price", type: "number" },
            { name: "discount", label: "Discount (%)", type: "number" },
            { name: "expiry_date", label: "Expiry Date", type: "date" },
            { name: "hsn_no", label: "HSN No" },
            { name: "stock", label: "Stock", type: "number" },
            { name: "unit", label: "Unit" },
          ].map(({ name, label, type = "text" }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type={type}
                name={name}
                value={productData[name]}
                onChange={handleChange}
                className="w-full border p-2 rounded-md focus:ring-[#5b2333] focus:border-[#5b2333]"
                required
              />
            </div>
          ))}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#5b2333] text-white rounded-md hover:bg-[#4a1c29]"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
