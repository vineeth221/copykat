import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, incrementQuantity, decrementQuantity } from "../../redux/CartSlice";
import { Link } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import Header from "../landing/Header";
import { useEffect } from "react";
import { fetchCart } from "../../redux/CartSlice";

const Cart = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [deliveryCharges] = useState(40); // Delivery charge to be added if conditions met

  useEffect(() => {
    dispatch(fetchCart()); // Fetch cart when the component mounts
  }, [dispatch]);

  useEffect(() => {
    if (auth.token) {
      dispatch(fetchCart());
    }
  }, [auth.token, dispatch]);

  // Calculate the total price for all items considering quantity
  const calculateItemTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0; // Ensure price is a valid number
      const quantity = parseInt(item.quantity, 10) || 0; // Ensure quantity is a valid number
      return total + price * quantity;
    }, 0);
  };

  const calculateTotalPrice = () => {
    const itemTotal = calculateItemTotal();
    const additionalDeliveryCharge = itemTotal < 1000 ? deliveryCharges : 0; // Apply delivery charges if total < 1000
    return itemTotal + additionalDeliveryCharge;
  };

  const handleRemoveFromCart = (item) => {
    dispatch(removeFromCart(item.productId));
  };

  const handleIncrementQuantity = (item) => {
    dispatch(incrementQuantity(item.productId));
  };

  const handleDecrementQuantity = (item) => {
    if (item.quantity > 1) {
      dispatch(decrementQuantity(item.productId));
    } else {
      dispatch(removeFromCart(item.productId));
    }
  };

  return (
    <div style={{ backgroundColor: "#f1f3f6" }}>
      <Navbar />
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
        {cartItems.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-gray-600">Your cart is empty.</p>
            <Link
              to="/home"
              className="mt-4 inline-block bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Details Section - Takes more width */}
            <div className="col-span-2 bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-semibold">{cartItems.length} Items in Cart</h3>
                {/* <button className="text-blue-500 hover:text-blue-700">Deselect all items</button> */}
              </div>
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item, index) => (
                  <li key={index} className="py-6">
                    <div className="flex items-start">                      {/* Product Image */}
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="ml-6 flex-1">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-lg font-bold mt-2">₹{item.price}</p>
                        {/* Quantity Control */}
                        <div className="flex items-center space-x-4 mt-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleDecrementQuantity(item)}
                              className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition duration-300"
                            >
                              <span className="text-xl">-</span>
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center text-gray-700 border-l border-r border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrementQuantity(item)}
                              className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition duration-300"
                            >
                              <span className="text-xl">+</span>
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item)}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Scroll if more than 3 items */}
              {cartItems.length > 3 && (
                <div className="flex justify-center mt-4">
                  <span className="text-sm text-gray-500">Scroll to see more</span>
                </div>
              )}
            </div>

            {/* Price Details Section - Takes less width */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Price Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Price ({cartItems.length} items)</span>
                  <span>₹{calculateItemTotal()}</span>
                </div>
                {calculateItemTotal() < 1000 && (
                  <div className="flex justify-between text-lg">
                    <span>Delivery Charges</span>
                    <span className="text-red-500">₹{deliveryCharges} Added</span>
                  </div>
                )}
                {calculateItemTotal() >= 1000 && (
                  <div className="flex justify-between text-lg">
                    <span>Delivery Charges</span>
                    <span className="text-green-500">Free</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-xl border-t pt-4">
                  <span>Total Amount</span>
                  <span>₹{calculateTotalPrice()}</span>
                </div>
                <div className="mt-6">
                  <Link
                    to="/checkout"
                    className="w-full bg-[#ff6b00] text-white py-3 px-6 rounded-lg transition duration-300 text-center block"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
