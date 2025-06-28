// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './CartSlice';  // Add cartSlice here
import productReducer from './productSlice';  // productSlice for products
import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,      // Add cart reducer
    products: productReducer,  // Add products reducer
    auth: authReducer,
  },
});

export default store;
