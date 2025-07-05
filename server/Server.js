import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Customer from './models/Customer.js';
import User from "./models/User.js";
import invoiceRoute from './routes/invoice.js';
import path from "path";
import { fileURLToPath } from "url";
import chatbotRoute from "./routes/chatbot.js";


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Invoices Statics
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));
app.use("/", invoiceRoute);

app.use("/", chatbotRoute);

// Set up Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store uploaded files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Add a timestamp to avoid name conflicts
  },
});

const upload = multer({ storage: storage });

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Replace with your email service provider if needed
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
});

// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// JWT Authentication Middleware
const authMiddleware = (req, res, next) => {
  const tokenHeader = req.header("Authorization");


  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid or missing token" });
  }

  // Extract token from "Bearer <token>"
  const tokenParts = tokenHeader.split(" ");
  if (tokenParts.length !== 2) {
    return res.status(401).json({ message: "Token format incorrect" });
  }

  const token = tokenParts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


app.post("/save-address", async (req, res) => {
  const { email, addressLine1, addressLine2, city, state, pincode } = req.body;

  if (!email || !addressLine1 || !city || !state || !pincode) {
    return res.status(400).json({ message: "All required fields must be filled." });
  }

  try {
    // Update or insert user address in the database
    const user = await Customer.findOneAndUpdate(
      { email },
      {
        address: {
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
        },
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: "Address saved successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

app.put("/update-address", async (req, res) => {
  const { email, addressLine1, addressLine2, city, state, pincode } = req.body;

  try {
    // Update the address in the database
    const updatedUser = await Customer.findOneAndUpdate(
      { email },
      {
        address: {
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Address updated successfully", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating address" });
  }
});

app.get("/get-address/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await Customer.findOne({ email });
    if (!user || !user.address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ address: user.address });
  } catch (error) {
    res.status(500).json({ message: "Error fetching address" });
  }
});
// Get cart for logged-in user
app.get("/cart", authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.user.id });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer.cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart" });
  }
}); 

// Add item to cart
app.post("/cart/add", authMiddleware, async (req, res) => {
  const { productId, name, price, quantity, description, imageUrl } = req.body;

  try {
    // Validate request body
    if (!productId || !name || !price || !quantity || !description || !imageUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    let customer = await Customer.findOne({ _id: req.user.id });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Initialize cart if it doesn't exist
    if (!customer.cart) {
      customer.cart = { items: [] };
    } else if (!customer.cart.items) {
      customer.cart.items = [];
    }

    // Check if the item already exists in the cart
    const existingItem = customer.cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      customer.cart.items.push({ productId, name, price, quantity, description, imageUrl });
    }

    // Save the updated customer
    await customer.save().catch((err) => {
      throw err;
    });

    res.json(customer.cart);
  } catch (error) {
    res.status(500).json({ message: "Error adding item to cart" });
  }
});


// Update quantity
app.put("/cart/update/:productId", async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify token and extract user email
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userEmail = decoded.email;


    // Find customer by email
    const customer = await Customer.findOne({ email: userEmail });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (!customer.cart || !customer.cart.items) {
      return res.status(404).json({ message: "Cart not found" });
    }
    // Find the item in the cart
    const itemIndex = customer.cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update the item's quantity
    customer.cart.items[itemIndex].quantity = quantity;

    // Save the updated customer document
    await customer.save();


    // Return the updated cart
    res.status(200).json(customer.cart);
  } catch (error) {
    res.status(500).json({ message: "Error updating cart quantity" });
  }
});


// Remove item from cart
app.delete("/cart/remove/:productId", authMiddleware, async (req, res) => {
  try {
    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    let customer = await Customer.findOne({ _id: req.user.id });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Validate cart structure
    if (!customer.cart || !Array.isArray(customer.cart.items)) {
      return res.status(400).json({ message: "Invalid cart structure" });
    }
    // Filter out the item to remove
    customer.cart.items = customer.cart.items.filter((item) => {
      if (!item || !item.productId) {
        return false; // Skip invalid items
      }
      return item.productId.toString() !== req.params.productId;
    });

    // Save the updated customer
    await customer.save().catch((err) => {
      throw err;
    });

    res.json(customer.cart);
  } catch (error) {
    res.status(500).json({ message: "Error removing item from cart" });
  }
});

// Clear cart after checkout
app.delete("/cart/clear", authMiddleware, async (req, res) => {
  try {
    let customer = await Customer.findOne({ _id: req.user.id });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    customer.cart.items = [];
    await customer.save();

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart" });
  }
});

// Define Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // Store image path or URL
});

const Product = mongoose.model('Product', ProductSchema);

// Route to fetch all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

const shoeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
});

const Shoe = mongoose.model('Shoe', shoeSchema);
app.get('/shoes', async (req, res) => {
  try {
    const products = await Shoe.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});
// User Registration API

const generateCustomerId = (email) => {
  const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
  const uniqueSuffix = Date.now().toString();
  return `${sanitizedEmail}_${uniqueSuffix}`;
};
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
 // Generate a unique customer_id
 const customer_id = generateCustomerId(email);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Customer({
      name,
      email,
      password: hashedPassword,
      customer_id,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", customer_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Send OTP route
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const otp = generateOTP(); // Generate a 6-digit OTP
  const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  try {
    // Save OTP and expiry in the database (or in-memory store for simplicity)
    await User.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { upsert: true, new: true }
    );

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Verification',
      html: `
        <h1>OTP for Email Verification</h1>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });
    res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});
// Verify OTP route
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // ✅ Case-insensitive email search
    const user = await User.findOne({ email: { $regex: new RegExp("^" + email + "$", "i") } });


    if (!user) {
      return res.status(400).json({ message: "User not found. Please request OTP again." });
    }


    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // ✅ Clear OTP after successful verification
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ message: "OTP verified successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await Customer.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);

    // Send user data along with the token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        customer_id: user.customer_id,
      },
    });
  } catch (error) {
    console.error("🔴 Login API Error:", error); // ✅ Log the actual error
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});


// MongoDB connection
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Start server
const PORT = process.env.PORT || 8007;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});