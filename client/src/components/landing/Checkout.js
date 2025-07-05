import React, { useState, useContext, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../navbar/Navbar";
import { load } from "@cashfreepayments/cashfree-js";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../../redux/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { clearCart } from "../../redux/CartSlice";

const Checkout = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const [addressFetched, setAddressFetched] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [activeTab, setActiveTab] = useState(2);
  const { user, login } = useContext(AuthContext);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressSaved, setAddressSaved] = useState(
    JSON.parse(localStorage.getItem("addressSaved")) || false
  );
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);
  const [isTabOpen, setIsTabOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const deliveryCharges = 40;
  const location = useLocation();
  const modalTimerRef = useRef(null);
  const paymentProcessed = useRef(false);

  // Skip OTP verification if user is already logged in
  useEffect(() => {
    if (user) {
      setOtpVerified(true);
      fetchSavedAddress();
    }
  }, [user]);

  // Fetch saved address from the backend
  const fetchSavedAddress = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-address/${user.email}`);

      if (response.data.address) {
        const addr = response.data.address;
        setSavedAddress(addr);
        setAddressLine1(addr.addressLine1 || "");
        setAddressLine2(addr.addressLine2 || "");
        setCity(addr.city || "");
        setState(addr.state || "");
        setPincode(addr.pincode || "");
  
        const isFilled =
          [addr.addressLine1, addr.city, addr.state, addr.pincode].every(
            (field) => typeof field === "string" && field.trim() !== ""
          );
  
        if (isFilled) {
          setAddressSaved(true);
          setActiveTab(3);
          setIsTabOpen(false);
        } else {
          setAddressSaved(false);
          setActiveTab(2);
          setIsTabOpen(true);
        }
      } else {
        // No address in DB
        setAddressSaved(false);
        setActiveTab(2);
        setIsTabOpen(true);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddressSaved(false);
      setActiveTab(2);
      setIsTabOpen(true);
    } finally {
      setAddressFetched(true);
    }
  };
  

  const calculateItemTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  useEffect(() => {
    // Check if we've already processed payment status
    if (paymentProcessed.current) return;
    
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");
    const orderId = queryParams.get("order_id");

    if (status === "success" && orderId) {
      paymentProcessed.current = true;
      
      // Clear any existing timer
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }

      setOrderId(orderId);
      setShowSuccessModal(true);
      
      // Clear cart in Redux and localStorage
      dispatch(clearCart());
      
      // Set new timer to close modal and redirect
      modalTimerRef.current = setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/", { replace: true });
      }, 5000);
    } 
    else if (status === "failure") {
      paymentProcessed.current = true;
      setShowFailureModal(true);
      
      // Set timer to close failure modal
      modalTimerRef.current = setTimeout(() => {
        setShowFailureModal(false);
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, [location, dispatch, navigate]);

useEffect(() => {
  if (addressFetched) {
    if (!isAddressFilled()) {
      setActiveTab(2);
      setIsTabOpen(true);
    } else if (addressSaved) {
      setActiveTab(3);
    }
  }
}, [addressFetched, addressLine1, city, state, pincode, addressSaved]);


  const isAddressFilled = () => {
    return [addressLine1, city, state, pincode].every(
      (field) => typeof field === "string" && field.trim() !== ""
    );
  };
  
  

  const handleSaveAddress = async () => {
    if (!isAddressFilled()) return;
  
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/save-address`, {
        email: user.email,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
      });      
  
      setAddressSaved(true);
      setIsEditing(false);
      setIsTabOpen(false);
      setActiveTab(3); // Only open summary if all okay
      setSavedAddress({ addressLine1, addressLine2, city, state, pincode });
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };
  

  const handleUpdateAddress = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/update-address`, {
        email: user.email,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
      });
      

      setAddressSaved(true);
      setIsEditing(false);
      setIsTabOpen(false);
      setActiveTab(3);
      setSavedAddress({ addressLine1, addressLine2, city, state, pincode });
    } catch (error) {
      console.error("Error updating address:", error);
    }
  };

  const calculateTotalPrice = () => {
    const itemTotal = calculateItemTotal();
    const additionalDeliveryCharge = itemTotal < 1000 ? deliveryCharges : 0;
    return itemTotal + additionalDeliveryCharge;
  };

  const handleSendOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/send-otp`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );      
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8005/verify-otp",
        { email, otp },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.message === "OTP verified successfully.") {
        setOtpVerified(true);
        login({ email, name: "User" });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  const handleBuyNow = async () => {
    const totalAmount = calculateTotalPrice();
  
    try {
      const orderResponse = await axios.post("http://localhost:8005/create-order", {
        customerEmail: user?.email,
        items: cartItems,
        totalAmount,
      });
  
      const { orderId, payment_session_id } = orderResponse.data;
  
      if (!payment_session_id) {
        alert("Could not process payment. Try again.");
        return;
      }
      
      const cashfree = await load({ mode: "sandbox" });
  
      if (cashfree && typeof cashfree.checkout === "function") {
        cashfree.checkout({
          paymentSessionId: payment_session_id,
        });
      } else {
        alert("Payment method is not available. Please try again later.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to process payment. Please try again.");
    }
  };
  
  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: "#f1f3f6" }} className="py-8">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6">Checkout</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="rounded-lg lg:col-span-2">
              <div className="space-y-6">
                {!user && !otpVerified && (
                  <div className="bg-white p-6 shadow-md rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      Email Verification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2">Email Address</label>
                        <input
                          type="email"
                          className="w-full p-2 border rounded-lg"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {!otpSent && (
                          <button
                            type="button"
                            className="text-blue-500 mt-2"
                            onClick={handleSendOtp}
                          >
                            Send OTP
                          </button>
                        )}
                      </div>

                      {otpSent && !otpVerified && (
                        <div>
                          <label className="block mb-2">OTP</label>
                          <input
                            type="text"
                            className="w-full p-2 border rounded-lg"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                          />
                          <button
                            type="button"
                            className="text-blue-500 mt-2"
                            onClick={handleVerifyOtp}
                          >
                            Verify OTP
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(user || otpVerified) && (
                  <>
                    <div className="bg-[#ff6b00]">
                      <div className="flex justify-between items-center">
                        <button
                          className={`w-full text-left text-lg font-semibold py-3 px-6 transition-all duration-300 ease-in-out transform ${
                            activeTab === 2 && isTabOpen
                              ? "bg-[#ff6b00] text-white"
                              : addressSaved
                                ? "bg-[#ff6b00] text-white cursor-not-allowed"
                                : "bg-white text-black hover:bg-orange-100"
                          }`}
                          onClick={() => {
                            if (!addressSaved || isEditing) {
                              setIsTabOpen(!isTabOpen);
                              setActiveTab(2);
                            }
                          }}
                          disabled={addressSaved && !isEditing}
                        >
                          Delivery Details
                        </button>
                        {addressSaved && (
                          <button
                            className="text-white hover:text-white"
                            onClick={() => {
                              setActiveTab(2);
                              setIsEditing(true);
                              setIsTabOpen(true);
                            }}
                          >
                            <FaEdit size={20} />
                          </button>
                        )}
                      </div>

                      {isTabOpen && activeTab === 2 && (
                        <div className="space-y-6 bg-white p-6 shadow-md">
                          <div>
                            <label className="block mb-2">Address Line 1 *</label>
                            <input
                              type="text"
                              className="w-full p-2 border rounded-lg"
                              placeholder="Enter Address Line 1"
                              value={addressLine1}
                              onChange={(e) => setAddressLine1(e.target.value)}
                              disabled={!isEditing && addressSaved}
                            />
                          </div>

                          <div>
                            <label className="block mb-2">Address Line 2</label>
                            <input
                              type="text"
                              className="w-full p-2 border rounded-lg"
                              placeholder="Enter Address Line 2 (Optional)"
                              value={addressLine2}
                              onChange={(e) => setAddressLine2(e.target.value)}
                              disabled={!isEditing && addressSaved}
                            />
                          </div>

                          <div>
                            <label className="block mb-2">City *</label>
                            <input
                              type="text"
                              className="w-full p-2 border rounded-lg"
                              placeholder="Enter City"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              disabled={!isEditing && addressSaved}
                            />
                          </div>

                          <div>
                            <label className="block mb-2">State *</label>
                            <input
                              type="text"
                              className="w-full p-2 border rounded-lg"
                              placeholder="Enter State"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              disabled={!isEditing && addressSaved}
                            />
                          </div>

                          <div>
                            <label className="block mb-2">Pincode *</label>
                            <input
                              type="text"
                              className="w-full p-2 border rounded-lg"
                              placeholder="Enter Pincode"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              disabled={!isEditing && addressSaved}
                            />
                          </div>

                          <button
                            className="w-full bg-[#ff6b00] text-white py-3 mt-4 rounded-lg"
                            onClick={isEditing ? handleUpdateAddress : handleSaveAddress}
                          >
                            {isEditing ? "Update Address" : "Save Address & Continue to Summary"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                    <button
                        className={`w-full text-left text-lg font-semibold py-3 px-6 transition-all duration-300 ease-in-out transform ${
                          activeTab === 3
                            ? "bg-[#ff6b00] text-white shadow-md"
                            : "bg-white text-black hover:bg-[#ff6b00]"
                        } ${!addressSaved || !isAddressFilled() ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => {
                          if (addressSaved && isAddressFilled()) {
                            setActiveTab(3);
                          } else {
                            setActiveTab(2); // fallback to address tab
                            setIsTabOpen(true);
                          }
                        }}
                        disabled={!addressSaved || !isAddressFilled()}
                      >
                        Summary
                      </button>
                      {activeTab === 3 && (
                        <div className="bg-white p-6 shadow-md rounded-b-lg border border-gray-200">
                          {cartItems.length > 0 ? (
                            <>
                              {cartItems.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-4 mb-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                >
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-md border"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg">{item.name}</h4>
                                    <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                                    <div className="text-sm">
                                      <span className="font-medium">Quantity:</span> {item.quantity}
                                    </div>
                                    <div className="text-sm text-green-600 font-semibold">
                                      Price: ₹{item.price * item.quantity}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <div className="flex justify-between items-center border-t pt-4 mt-4">
                                <h3 className="font-bold text-xl">Total Price:</h3>
                                <p className="text-2xl text-green-600 font-bold">
                                  ₹{calculateTotalPrice()}
                                </p>
                              </div>
                            </>
                          ) : (
                            <p className="text-center text-gray-500">Your cart is empty.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white p-6 shadow-md rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Price Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Price ({cartItems.length} items)</span>
                  <span>₹{calculateItemTotal()}</span>
                </div>
                {calculateItemTotal() < 1000 && (
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="text-red-500">₹{deliveryCharges}</span>
                  </div>
                )}
                {calculateItemTotal() >= 1000 && (
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="text-green-500">Free</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>₹{calculateTotalPrice()}</span>
                </div>
                <button
                  className={`w-full bg-[#ff6b00] text-white py-3 mt-4 rounded-lg ${
                    !addressSaved ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!addressSaved}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg text-center max-w-md w-full">
            <div className="mb-4">
              <svg 
                className="w-16 h-16 text-green-500 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-2">Your order ID is: <span className="font-semibold">{orderId}</span></p>
            <button
              className="bg-[#ff6b00] text-white py-2 px-6 rounded-lg mt-4"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/", { replace: true });
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Failure Modal */}
      {showFailureModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg text-center max-w-md w-full">
            <div className="mb-4">
              <svg 
                className="w-16 h-16 text-red-500 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-4">Please try again or use a different payment method.</p>
            <button
              className="bg-[#ff6b00] text-white py-2 px-6 rounded-lg mt-4"
              onClick={() => setShowFailureModal(false)}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;