import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../navbar/Navbar";
import Footer from "./footer";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user ? user.email : null;

  useEffect(() => {
    if (!userEmail) {
      setError("User email not found. Please log in.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:8005/orders/${userEmail}`)
      .then((response) => {
        setOrders(response.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setOrders([]);
          setError("No orders found.");
        } else {
          setError("Failed to fetch orders. Please try again later.");
        }
        setLoading(false);
      });
  }, [userEmail]);

  if (loading) return <p className="text-center mt-8">Loading orders...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;

  const handleDownloadInvoice = async (orderId) => {
    try {
      // Verify invoice exists
      await axios.head(`http://localhost:8005/invoices/${orderId}.pdf`);
      
      // Trigger download in new tab
      window.open(
        `http://localhost:8005/invoices/${orderId}.pdf`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      if (error.response?.status === 404) {
        alert("Invoice still processing. Please try again in 30 seconds.");
      } else {
        alert("Download failed. Contact support.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">You have not placed any orders yet.</p>
            <a href="/home" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Continue Shopping
            </a>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className="border bg-white border-gray-300 rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex justify-between flex-wrap text-sm text-gray-700 mb-4">
                <div>
                  <p className="font-semibold">Order placed</p>
                  <p>{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold">Total</p>
                  <p>₹{order.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-semibold">Ship to</p>
                  <p>{order.customerEmail}</p>
                </div>
                <div>
                  <p className="font-semibold">Order #</p>
                  <p>{order.orderId}</p>
                </div>
                <div>
                  <p className="font-semibold">Status</p>
                  <p>{order.paymentStatus}</p>
                </div>
              </div>

              <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    handleDownloadInvoice(order.orderId);
  }}
  className={`text-blue-600 hover:underline ${
    order.paymentStatus !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''
  }`}
>
  {order.paymentStatus === 'completed' ? 'Download Invoice' : 'Processing...'}
</a>

              <div className="border-t pt-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4 mb-4">
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">{item.description}</p>
                      <p className="text-gray-600">₹{item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-4 mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Track package</button>
                <button className="px-4 bg-white py-2 border rounded hover:bg-gray-300">Return or replace items</button>
                <button className="px-4 py-2 bg-white border rounded hover:bg-gray-300">Ask Product Question</button>
                <button className="px-4 py-2 bg-white border rounded hover:bg-gray-300">Leave seller feedback</button>
                <button className="px-4 py-2 bg-white border rounded hover:bg-gray-300">Leave delivery feedback</button>
              </div>
            </div>
          ))
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
