import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerEmail: { type: String, required: true },
    customer_id: { type: String},
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
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing' }, // Add payment status
  paymentData: { type: Object }, // Store payment details (optional)
  date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;