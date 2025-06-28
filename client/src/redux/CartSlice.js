import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { logout } from "./authSlice"; // Import logout action

// Get token function
const getAuthToken = (getState) => {
  const state = getState();
  const token = state?.auth?.token || localStorage.getItem("token");

  return token;
};

// Save cart to local storage
export const saveCartToLocalStorage = (cartItems) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.email) {
    localStorage.setItem(`cart_${user.email}`, JSON.stringify(cartItems));
  } else {
    localStorage.setItem("cart_guest", JSON.stringify(cartItems));
  }
};

// Load cart from local storage
export const loadCartFromLocalStorage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.email) {
    const cartCleared = localStorage.getItem(`cartCleared_${user.email}`);
    if (cartCleared === "true") {
      return []; // Return empty cart if cleared
    }
    const storedCart = JSON.parse(localStorage.getItem(`cart_${user.email}`)) || [];
    return storedCart;
  } else {
    return JSON.parse(localStorage.getItem("cart_guest")) || [];
  }
};

// Fetch Cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { getState, rejectWithValue, dispatch }) => {
    const token = getAuthToken(getState);
    if (!token) {
      return rejectWithValue("No token provided");
    }

    try {
      const response = await axios.get("http://localhost:8005/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      saveCartToLocalStorage(response.data.items); // Save to local storage
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logout());
      }
      return rejectWithValue(error.response?.data?.message || "Error fetching cart");
    }
  }
);

// Add to Cart
export const addToCart = createAsyncThunk(
  "cart/add",
  async (product, { getState, rejectWithValue }) => {
    const token = getAuthToken(getState);

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart_guest")) || [];
      const existingItem = guestCart.find((item) => item.productId === product._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        guestCart.push({ ...product, productId: product._id, quantity: 1 });
      }
      localStorage.setItem("cart_guest", JSON.stringify(guestCart));
      return { productId: product._id, ...product, quantity: 1 };
    }

    try {
      const response = await axios.post(
        "http://localhost:8005/cart/add",
        {
          productId: product._id,
          description: product.description,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Remove from Cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { getState, rejectWithValue }) => {
    const token = getAuthToken(getState);
    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart_guest")) || [];
      const updatedCart = guestCart.filter((item) => item.productId !== productId);
      localStorage.setItem("cart_guest", JSON.stringify(updatedCart));
      return productId;
    }

    try {
      const response = await axios.delete(`http://localhost:8005/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error removing from cart");
    }
  }
);

// Update Cart Quantity
export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ productId, quantity }, { getState, rejectWithValue }) => {
    const token = getAuthToken(getState);

    if (!token) {
      const guestCart = JSON.parse(localStorage.getItem("cart_guest")) || [];
      const index = guestCart.findIndex((item) => item.productId === productId);
      if (index !== -1) {
        guestCart[index].quantity = quantity;
        localStorage.setItem("cart_guest", JSON.stringify(guestCart));
        return { productId, quantity };
      }
      return rejectWithValue("Item not found in guest cart");
    }

    try {
      const response = await axios.put(
        `http://localhost:8005/cart/update/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Error updating cart quantity");
    }
  }
);

// Increment Quantity
export const incrementQuantity = createAsyncThunk(
  "cart/incrementQuantity",
  async (productId, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const item = state.cart.items.find((item) => item.productId === productId);

    if (!item) {
      return rejectWithValue("Item not found in cart");
    }

    const newQuantity = item.quantity + 1;
    console.log(`✅ Incrementing: ${productId}, New Quantity: ${newQuantity}`);

    // Dispatch updateCartQuantity to sync with backend
    const result = await dispatch(updateCartQuantity({ productId, quantity: newQuantity }));

    console.log(`🔄 Update Cart Quantity Result:`, result);

    return { productId, quantity: newQuantity };
  }
);

// Decrement Quantity
export const decrementQuantity = createAsyncThunk(
  "cart/decrementQuantity",
  async (productId, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const item = state.cart.items.find((item) => item.productId === productId);

    if (!item) {
      return rejectWithValue("Item not found in cart");
    }

    const newQuantity = item.quantity - 1;
    console.log(`🔻 Decrementing: ${productId}, New Quantity: ${newQuantity}`);

    if (newQuantity < 1) {
      await dispatch(removeFromCart(productId));
      return { productId, quantity: 0 };
    }

    // Dispatch updateCartQuantity to sync with backend
    const result = await dispatch(updateCartQuantity({ productId, quantity: newQuantity }));
    return { productId, quantity: newQuantity };
  }
);

// Clear Cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { getState, rejectWithValue }) => {
    const token = getAuthToken(getState);
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      // Clear backend cart for authenticated users
      if (token) {
        await axios.delete("http://localhost:8005/cart/clear", {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Clear frontend cart storage
      if (user?.email) {
        localStorage.removeItem(`cart_${user.email}`);
        // Remove cart cleared flag if it exists
        localStorage.removeItem(`cartCleared_${user.email}`);
      } else {
        localStorage.removeItem("cart_guest");
      }

      return []; // Return empty array to reset Redux cart state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to clear cart");
    }
  }
);

// Cart Slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCartFromLocalStorage(),
    error: null,
    cartCleared: false, // Add a flag to track if the cart has been cleared
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        const user = JSON.parse(localStorage.getItem("user"));
        const cartCleared = localStorage.getItem(`cartCleared_${user?.email}`);

        if (cartCleared === "true") {
          console.log("🚫 Cart is cleared, not updating state");

          state.items = [];
          localStorage.removeItem(`cart_${user?.email}`);

          // Reset flag after clearing
          localStorage.setItem(`cartCleared_${user?.email}`, "false");
        } else {
          state.items = action.payload.items;
          saveCartToLocalStorage(action.payload.items);
        }
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const existingItem = state.items.find((item) => item.productId === action.payload.productId);
        if (existingItem) {
          existingItem.quantity += 1; // Increment quantity if item exists
        } else {
          state.items.push(action.payload); // Add new item to cart
        }
        state.cartCleared = false; // Reset the flag
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.email) {
          localStorage.setItem(`cartCleared_${user.email}`, "false");
        }
        saveCartToLocalStorage(state.items);
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        console.log("Removed Item:", action.payload); // Debug
        state.items = state.items.filter((item) => item.productId !== action.payload);
        saveCartToLocalStorage(state.items);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        console.error("Failed to remove item:", action.payload);
        state.error = action.payload;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        console.log("Updated Quantity:", action.payload); // Debug
        const index = state.items.findIndex((item) => item.productId === action.payload.productId);
        if (index !== -1) {
          state.items[index].quantity = action.payload.quantity;
          saveCartToLocalStorage(state.items);
        }
      })
      .addCase(incrementQuantity.fulfilled, (state, action) => {
        console.log("Incremented Quantity:", action.payload); // Debug
        const index = state.items.findIndex((item) => item.productId === action.payload.productId);
        if (index !== -1) {
          state.items[index].quantity = action.payload.quantity;
          saveCartToLocalStorage(state.items);
        }
      })
      .addCase(decrementQuantity.fulfilled, (state, action) => {
        console.log("Decremented Quantity:", action.payload); // Debug
        const index = state.items.findIndex((item) => item.productId === action.payload.productId);
        if (index !== -1) {
          state.items[index].quantity = action.payload.quantity;
          saveCartToLocalStorage(state.items);
        }
      })
      .addCase(clearCart.fulfilled, (state) => {
        console.log("Cleared Cart"); // Debug
        state.items = []; // Clear the cart items in Redux state
        state.cartCleared = true; // Set the flag to true
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.email) {
          localStorage.removeItem(`cart_${user.email}`); // Clear cart from localStorage
          localStorage.setItem(`cartCleared_${user.email}`, "true"); // Set the flag
        }
      })
  },
});

export default cartSlice.reducer;