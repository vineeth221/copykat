// App.js
import React,{useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../redux/AuthContext'; // Make sure AuthContext is imported properly
import Home from './landing/home';
import ProductDetails from './landing/ProductDetails';
import Cart from './landing/Cart';
import Login from './login/Login';
import Register from './login/Register';
import Checkout from './landing/Checkout';
import Listing from './landing/Listing';
import { useDispatch } from "react-redux";
import { fetchCart } from "../redux/CartSlice"
// import  OrderConfirmation  from "./landing/orderConfirmation";
import { useSelector } from "react-redux";
import MyOrders from './landing/MyOrders';
import PaymentSuccess from "./landing/PaymentSuccess";
import ShoeListing from "./landing/shoeListing"


const App = () => {

  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (auth.token) {
      dispatch(fetchCart());
    }
  }, [auth.token, dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());// Load cart when user logs in
    }
  }, [user, dispatch]);

  return (
    <AuthProvider> {/* Wrap your entire app with AuthProvider */}
      <Router>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/clothes" element={<Listing />} />
          <Route path="/shoes" element={<ShoeListing />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/order-confirmation" element={<OrderConfirmation />} /> */}
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
