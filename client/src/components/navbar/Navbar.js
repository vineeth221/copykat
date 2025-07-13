import React, { useState, useContext, useEffect } from "react";
import { Disclosure } from "@headlessui/react";
import { FiSearch, FiShoppingCart, FiChevronDown, FiMapPin, FiShoppingBag, FiTruck, FiLogOut } from "react-icons/fi";
import { FaLocationArrow } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AuthContext } from "../../redux/AuthContext";
import { removeFromCart } from "../../redux/CartSlice";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";
import neomart from './erasebg-transformed.png';

const navigation = [{ name: "watches", href: "/watches" }];

export default function Navbar(props) {
  const { user, setUser, logout } = useContext(AuthContext);
  const [location, setLocation] = useState("Fetching location...");
  const [searchQuery, setSearchQuery] = useState("");
  const [hover, setHover] = useState(false);
  const cartItems = useSelector((state) => state.cart.items);
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const dispatch = useDispatch();
  const currentLocation = useLocation();
  const isCheckoutPage = currentLocation.pathname === "/checkout";

  // Extract city from location string
  const cityOnly = location.split(',')[0];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, [setUser]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const { city } = response.data;
            setLocation(city || "Unknown City");
          } catch (error) {
            setLocation("Unable to fetch location");
          }
        },
        () => {
          setLocation("Location access denied");
        }
      );
    } else {
      setLocation("Geolocation not supported");
    }
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user");
    window.location.href = "/home";
    dispatch(removeFromCart());
  };

  return (
    <>
      <Disclosure as="nav" className={`fixed w-full transition-all duration-500 ease-in-out nav-top ${isCheckoutPage ? "bg-orange-500" : ""}`}>
        {({ open }) => (
          <>
            <div className="nav-set">
              {/* Desktop/Tab Layout */}
              <div className="hidden md:flex items-center justify-between">
                <div className="nav-set flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                  <Link to="/home">
                    <div className="flex-shrink-0 flex items-center">
                      <img className="hidden lg:block custom-img" src={neomart} alt="Workflow" />
                      <span className="srm">Zap ShopX</span>
                    </div>
                  </Link>

                  {!isCheckoutPage && (
                    <>
                      <div id="nav-global-location-slot" className="text-gray-600 flex items-center space-x-4">
                        <div className="flex p-2 flex-1 items-center" style={{ margin: "0 20px" }}>
                          <FaLocationArrow className="mr-2 text-orange-500" size={20} />
                          <div className="flex flex-col">
                            <a role="button" className="nav-a nav-a-2">
                              <div id="glow-ingress-block" className="text-left text-gray-800">
                                <span className="nav-line-1">Delivering to</span>
                              </div>
                            </a>
                            <a role="button" className="nav-a nav-a-2">
                              <div id="glow-ingress-block" className="text-left text-gray-800">
                                <span className="nav-line-2">{location}</span>
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start justify-center relative">
                        <div className="flex items-center relative search-bar border border-gray-300 rounded-lg overflow-hidden">
                          <input
                            type="text"
                            placeholder="What are you looking for?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-2 focus:outline-none"
                            style={{ margin: "0 20px" }}
                          />
                          <button className="text-white bg-[#ff6b00] search-btn px-4 py-2 font-semibold">
                            Search
                          </button>
                        </div>
                      </div>

                      <div className="som flex items-center space-x-6 sm:space-x-8 ml-auto">
                        {user ? (
                          <div
                            className="relative group"
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                          >
                            <button className="flex items-center px-4 py-2 text-black border border-orange-500 group-hover:text-white group-hover:bg-orange-500 rounded-md transition">
                              Hi, {user.name} Welcome
                              <FiChevronDown className="ml-2" />
                            </button>
                            <AnimatePresence>
                              {hover && (
                                <motion.div
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 8 }}
                                  className="absolute right-0 top-[calc(100%_+_10px)] border-orange-500 bg-[#f9f6f2] w-52 backdrop-blur-lg rounded-lg border shadow-lg p-3"
                                >
                                  <div className="space-y-1 border-orange-500">
                                    <Link to="/my-address" className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-black/10 rounded-md">
                                      <FiMapPin className="mr-2 text-black" /> My Address
                                    </Link>
                                    <Link to="/my-orders" className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-black/10 rounded-md">
                                      <FiShoppingBag className="mr-2 text-black" /> My Orders
                                    </Link>
                                    <Link to="/tracking" className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-black/10 rounded-md">
                                      <FiTruck className="mr-2 text-black" /> Tracking
                                    </Link>
                                    <button
                                      onClick={handleLogout}
                                      className="flex items-center px-4 py-2 text-sm text-black hover:bg-black/10 w-full text-left rounded-md"
                                    >
                                      <FiLogOut className="mr-2 text-black" /> Logout
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link to="/login" className="flex flex-col text-gray-600">
                            <div>Hello, sign in</div>
                            <span>Account & Lists</span>
                          </Link>
                        )}
                        <Link to="/cart" className="flex items-center relative text-gray-800">
                          <FiShoppingCart size={24} />
                          {cartItemsCount > 0 && (
                            <span className="absolute top-[-14px] right-[31px] text-orange-500 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                              {cartItemsCount}
                            </span>
                          )}
                          <span className="ml-2 hidden sm:inline">Cart</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden flex flex-col w-full py-2">
                {/* Top Row - Logo */}
                <div className="flex items-center justify-center w-full px-2">
                  <Link to="/home" className="flex items-center">
                    <img className="custom-img h-10" src={neomart} alt="Zap ShopX" />
                    <span className="srm ml-2 text-xl">Zap ShopX</span>
                  </Link>
                </div>

                {/* Bottom Row - Search and Location */}
                {!isCheckoutPage && (
                  <div className="flex flex-col w-full px-2 mt-2">
                    <div className="flex items-center w-full">
                      <input
                        type="text"
                        placeholder="What are you looking for?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition-all duration-200 text-base placeholder-gray-500"
                      />
                    </div>
                    <div className="flex items-center mt-2">
                      <FaLocationArrow className="text-orange-500 mr-1" size={16} />
                      <span className="text-base font-medium">{cityOnly}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Disclosure>
      <div className="set-height" />
    </>
  );
}

const Bridge = () => (
  <div className="absolute -top-[24px] left-0 right-0 h-[24px]" />
);

const Nub = () => {
  return (
    <motion.span
      style={{
        clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)",
      }}
      className="absolute left-1/2 bg-[#fbeedf] border-orange-300 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl border shadow"
    />
  );
};