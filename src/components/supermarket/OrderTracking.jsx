import React, { useState, useEffect } from "react";
import axios from "axios";

const OrderTracking = () => {
  const [supermarketId, setSupermarketId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get supermarket_id from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem("supermarket_id");
    console.log("supermarket_id from localStorage:", storedId);

    if (storedId) {
      setSupermarketId(storedId);
    } else {
      setError("Supermarket ID not found in localStorage");
      setLoading(false);
    }
  }, []);

  // Fetch orders after supermarketId is set
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `https://swiftora-be.onrender.com/api/orders/supermarket/${supermarketId}`
        );
        console.log("Orders fetched:", response.data.orders);
        setOrders(response.data.orders);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    if (supermarketId) {
      fetchOrders();
    }
  }, [supermarketId]);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="mt-8  p-4 shadow-sm bg-white w-[100%] mx-auto">
       <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Track Your Orders </h1>
        <p className="text-sm text-gray-500 mt-1">
           Here is the list of all orders placed by your supermarket.
        </p>
      </div>

      <div className="border-t-2 border-gray-400 pt-6 mt-4" />

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2">No</th>
              <th className="border border-gray-300 px-3 py-2">Order ID</th>
              <th className="border border-gray-300 px-3 py-2">Product Name</th>
              <th className="border border-gray-300 px-3 py-2">SKU</th>
              <th className="border border-gray-300 px-3 py-2">Supplier</th>
              <th className="border border-gray-300 px-3 py-2">Contact</th>
              <th className="border border-gray-300 px-3 py-2">Quantity</th>
              <th className="border border-gray-300 px-3 py-2">Order Date</th>
              <th className="border border-gray-300 px-3 py-2">Delivery</th>
              {/* <th className="border border-gray-300 px-3 py-2">Status</th> */}
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order.id || `${order.product_id}-${order.supplier_id}-${index}`}
                className="text-center border border-gray-300"
              >
                <td className="border border-gray-300 px-3 py-2">{index + 1}</td> 
                <td className="border border-gray-300 px-3 py-2">{order.order_id}</td>
                <td className="border border-gray-300 px-3 py-2">
                  {order.products?.product_name || "N/A"}
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  {order.products?.sku || "N/A"}
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  {order.suppliers?.name || "N/A"}
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  {order.suppliers?.contact || "N/A"}
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  {order.order_quantity}
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  {new Date(order.order_date).toLocaleString()}
                </td>

                <td className="border border-gray-300 px-3 py-2">
                  {order.order_status === "pending" && "Awaiting order acceptance"}
                  {order.order_status === "accepted" && "Awaiting shipment"}
                  {order.order_status === "shipped" && "Out for delivery"}
                  {order.order_status === "delivered" &&
                    (order.delivery_date
                      ? new Date(order.delivery_date).toLocaleString()
                      : "Delivered")}
                </td>



                {/* <td className="border border-gray-300 px-3 py-2 capitalize">
                  {order.order_status}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderTracking;
