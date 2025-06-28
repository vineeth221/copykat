import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get("order_id");
    const status = queryParams.get("status");

    if (status === "success" && orderId) {
      // Fetch order details from the backend
      axios
        .get(`http://localhost:8005/order/${orderId}`)
        .then((response) => {
          setOrder(response.data);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch order details. Please try again later.");
          setLoading(false);
        });
    } else {
      setError("Invalid payment status or order ID.");
      setLoading(false);
    }
  }, [location]);

  if (loading) {
    return <p className="text-center mt-8">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-8">{error}</p>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
        <p className="text-gray-700 mb-4">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <div className="mb-4">
          <p className="font-semibold">Order ID:</p>
          <p>{order.orderId}</p>
        </div>
        <div className="mb-4">
          <p className="font-semibold">Total Amount:</p>
          <p>₹{order.totalAmount.toFixed(2)}</p>
        </div>
        <button
          onClick={() => navigate("/my-orders")}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View My Orders
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;