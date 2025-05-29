import React, { useEffect, useState } from "react";
import axios from "axios";

const MySupermarketOrders = () => {
  const [products, setProducts] = useState([]);
  const [supplierMap, setSupplierMap] = useState({});
  const [supplierAddressMap, setSupplierAddressMap] = useState({});
  const [error, setError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState("");
  const [expandedSuppliers, setExpandedSuppliers] = useState({});

  // Reverse geocode lat,lng to address using OpenStreetMap Nominatim
  const getAddressFromLatLng = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || "Address not found";
    } catch (error) {
      console.error("Reverse geocode error:", error);
      return "Address lookup failed";
    }
  };

  // Fetch orders for the supermarket on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      const supermarketId = localStorage.getItem("supermarket_id");
      if (!supermarketId) {
        setError("Supermarket ID not found.");
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `https://swiftora-be.onrender.com/api/orders/by-supermarket/${supermarketId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const rawData = response.data;

        if (
          rawData.products &&
          rawData.products.products &&
          rawData.products.supplierMap
        ) {
          setProducts(rawData.products.products);
          setSupplierMap(rawData.products.supplierMap);
          setError("");

          // Resolve addresses for suppliers asynchronously
          const addresses = {};
          await Promise.all(
            Object.entries(rawData.products.supplierMap).map(
              async ([supplierId, supplier]) => {
                if (
                  supplier.location &&
                  supplier.location.lat &&
                  supplier.location.lng
                ) {
                  const address = await getAddressFromLatLng(
                    supplier.location.lat,
                    supplier.location.lng
                  );
                  addresses[supplierId] = address;
                } else {
                  addresses[supplierId] = "Location not available";
                }
              }
            )
          );
          setSupplierAddressMap(addresses);
        } else {
          setProducts([]);
          setSupplierMap({});
          setError("Unexpected data format received.");
        }
      } catch (err) {
        console.error("❌ Error fetching products:", err.response?.data || err.message);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Set selected product for ordering
  const handleAccept = (productId) => {
    setSelectedProductId(productId);
  };

  // Submit order for a selected product
  const handleOrderSubmit = async (product) => {
    const supermarketId = localStorage.getItem("supermarket_id");
    const token = localStorage.getItem("token");

    if (!supermarketId) {
      alert("Supermarket ID not found. Please login again.");
      return;
    }

    if (!orderQuantity || isNaN(orderQuantity) || orderQuantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (orderQuantity > product.stock) {
      alert(`Quantity exceeds available stock (${product.stock}).`);
      return;
    }

    const orderPayload = {
      supermarket_id: supermarketId,
      product_id: product.product_id,
      supplier_id: product.supplier_id,
      sku: product.sku,
      order_quantity: parseInt(orderQuantity, 10),
    };

    console.log("Sending orderPayload:", orderPayload);

    try {
      await axios.post("https://swiftora-be.onrender.com/api/orders/placeorder", orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Order placed successfully!"); 
      setSelectedProductId(null);
      setOrderQuantity("");
      setQuantityError("");
    } catch (error) {
      console.error("❌ Order failed:", error.response?.data || error.message);
      alert("Failed to place order.");
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Group products by supplierId for display
  const groupedBySupplier = products.reduce((acc, product) => {
    if (!acc[product.supplier_id]) {
      acc[product.supplier_id] = [];
    }
    acc[product.supplier_id].push(product);
    return acc;
  }, {});

  // Toggle showing all products of a supplier
  const toggleExpand = (supplierId) => {
    setExpandedSuppliers((prev) => ({
      ...prev,
      [supplierId]: !prev[supplierId],
    }));
  };

  return (
    <div className="mt-8  p-4 shadow-sm bg-white w-[100%] mx-auto">
       <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Place Your Orders </h1>
        <p className="text-sm text-gray-500 mt-1">
           Place orders with your accepted suppliers here.
        </p>
      </div>

      <div className="border-t-2 border-gray-400 pt-6 mt-4" />

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        Object.entries(groupedBySupplier).map(([supplierId, supplierProducts]) => {
          const supplier = supplierMap[supplierId] || {};
          const supplierAddress = supplierAddressMap[supplierId] || "Loading address...";
          const showAll = expandedSuppliers[supplierId];
          const displayedProducts = showAll ? supplierProducts : [supplierProducts[0]];

          return (
            <div
              key={supplierId}
              className="mb-8  rounded p-4 shadow-sm bg-white w-[100%] mx-auto"
            >
              <div className="mb-4">
                <p className="text-lg font-semibold">{supplier.name || "Unknown Supplier"}</p>
                <p className="text-gray-600"><strong>Contact:</strong> {supplier.contact || "N/A"}</p>
                <p className="text-gray-600"><strong>Email:</strong> {supplier.email || "N/A"}</p>
                <p className="text-gray-600"><strong>Location:</strong> {supplierAddress}</p>
              </div>

              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Product Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Company</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">SKU</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Sales Price (₹)</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Stock</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Expiry Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map((product) => (
                    <React.Fragment key={product.product_id}>
                      <tr className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{product.product_name}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.company}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.sku}</td>
                        <td className="border border-gray-300 px-4 py-2">₹{product.sales_price}</td>
                        <td className="border border-gray-300 px-4 py-2">{product.stock}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {product.expiry_date
                            ? new Date(product.expiry_date).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded"
                            onClick={() => handleAccept(product.product_id)}
                          >
                            Order
                          </button>
                        </td>
                      </tr>

                      {selectedProductId === product.product_id && (
                        <tr>
                          <td colSpan="7" className="border-t border-gray-300 px-4 py-3 bg-gray-50">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-end">
                              <div className="flex flex-col">
                                <input
                                  type="number"
                                  value={orderQuantity}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setOrderQuantity(value);

                                    const intVal = parseInt(value, 10);
                                    if (intVal > product.stock) {
                                      setQuantityError(
                                        `❌ Stock is exhausted. Please enter ${product.stock} or less.`
                                      );
                                    } else if (intVal <= 0 || isNaN(intVal)) {
                                      setQuantityError("❌ Enter a valid quantity greater than 0.");
                                    } else {
                                      setQuantityError("");
                                    }
                                  }}
                                  placeholder={`Enter quantity (Max: ${product.stock})`}
                                  className="border rounded px-3 py-1 w-48"
                                />
                                {quantityError && (
                                  <p className="text-red-600 text-sm mt-1">{quantityError}</p>
                                )}
                              </div>

                              <button
                                onClick={() => handleOrderSubmit(product)}
                                disabled={!!quantityError || !orderQuantity}
                                className={`px-4 py-1 rounded text-white ${
                                  quantityError || !orderQuantity
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                                }`}
                              >
                                Submit
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedProductId(null);
                                  setOrderQuantity("");
                                  setQuantityError("");
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {/* Show toggle button if more than one product */}
              {supplierProducts.length > 1 && (
                <div className="text-right mt-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => toggleExpand(supplierId)}
                  >
                    {showAll ? "↑ Hide remaining products" : "↓ View remaining products"}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default MySupermarketOrders;
