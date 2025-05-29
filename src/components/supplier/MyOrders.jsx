import React, { useEffect, useState } from "react";
import axios from "axios";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders with token:", token);
      const res = await axios.get("https://swiftora-be.onrender.com/api/orders/getorder", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Orders API response:", res.data);

      const data = res.data.orders || res.data || [];
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating status for order ${orderId} to "${newStatus}"`);
      await axios.put(
        `https://swiftora-be.onrender.com/api/orders/update/${orderId}`,
        { order_status: newStatus }, // ✅ Use snake_case to match Supabase schema
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchOrders(); // refresh data
    } catch (err) {
      console.error("Error updating order status:", err.response?.data || err.message);
    }
  };


  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📦 Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Order #</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const orderId = order.orderNumber || order.order_id;
              const sku = order.sku;
              const quantity = order.orderQuantity || order.order_quantity;
              const status = order.orderStatus || order.order_status;

              return (
                <tr key={orderId} className="border-t">
                  <td className="px-4 py-2">{orderId}</td>
                  <td className="px-4 py-2">{sku}</td>
                  <td className="px-4 py-2">{quantity}</td>
                  <td className="px-4 py-2 capitalize">{status}</td>
                  <td className="px-4 py-2">
                    {status === "pending" && (
                      <button
                        onClick={() => updateOrderStatus(orderId, "accepted")}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Accept
                      </button>
                    )}

                    {status === "accepted" && (
                      <button
                        onClick={() => updateOrderStatus(orderId, "shipped")}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Ship
                      </button>
                    )}

                    {status === "shipped" && (
                      <button
                        onClick={() => updateOrderStatus(orderId, "delivered")}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Deliver
                      </button>
                    )}

                    {status === "delivered" && (
                      <span className="text-green-600 font-semibold">Delivered</span>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyOrders;
