import { createSlice } from "@reduxjs/toolkit";
import { fetchCart } from "./CartSlice"; // Import clearCart action

const initialState = {
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = {
        id: action.payload.user._id,
        name: action.payload.user.name,
        email: action.payload.user.email,
      };
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(state.user));
    
      // Dispatch fetchCart after login
      return async (dispatch) => {
        dispatch(fetchCart());
      };
    },
    logout: (state) => {
      const email = state.user?.email; // Get email of logged-out user
      state.token = null;
      state.user = null;
    
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    
      if (email) {
        // Remove only this user's cart from local storage
        localStorage.removeItem(`cart_${email}`);
      }
    
      // Redirect to login page
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
