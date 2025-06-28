import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  customer_id: { type: String, unique: true },
  otp: { type: String },
  otpExpiry: { type: Number },
  address: {
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String }
  },
  cart: {
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
        description: String,
        imageUrl: String,
      },
    ],
    totalAmount: { type: Number, default: 0 }, // Default to 0, not required
    date: { type: Date, default: Date.now },
  },
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
