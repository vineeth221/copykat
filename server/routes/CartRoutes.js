const express = require("express");
const Cart = require("../models/Cart.js");
const router = express.Router();
const authMiddleware = require("./middleware/auth"); 

 // Ensure the user is authenticated

// Get cart for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// Add item to cart
router.post("/add", authMiddleware, async (req, res) => {
  const { productId, name, price, quantity, imageUrl } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, quantity, imageUrl });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cart" });
  }
});

// Update quantity
router.put("/update", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (cart) {
      const item = cart.items.find((item) => item.productId.toString() === productId);
      if (item) {
        item.quantity = quantity;
      }
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error updating cart" });
  }
});

// Remove item from cart
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (cart) {
      cart.items = cart.items.filter((item) => item.productId.toString() !== req.params.productId);
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error removing item from cart" });
  }
});

// Clear cart after checkout
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart" });
  }
});

module.exports = router;
