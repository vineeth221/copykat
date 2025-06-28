const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/Order").default;
const Customer = require("../models/Customer").default;

// Create Order and Generate Invoice
router.post("/create-order", async (req, res) => {
  const { customerEmail, items, totalAmount } = req.body;
  let orderId;
  try {
    const customer = await Customer.findOne({ email: customerEmail });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const uniqueCustomerId = `${customer.customer_id || customer._id.toString()}_${Date.now()}`;
    orderId = `ORDER_${uuidv4()}`;

    // Call Cashfree API to create an order
    const cashfreeResponse = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: totalAmount,
        order_currency: "INR",
        order_note: "Test Order",
        customer_details: {
          customer_id: uniqueCustomerId,
          customer_name: customer.name,
          customer_email: customerEmail,
          customer_phone: "8919956147",
        },
        order_meta: {
          return_url: "http://localhost:8006/checkout?order_id={order_id}&order_status={order_status}",
        },        
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CSH_CLIENT,
          "x-client-secret": process.env.CSH_CLIENT_SCT,          
          "x-api-version": "2022-09-01",
        },
      }
    );
    const cashfreeOrderDetails = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      {
        headers: {
          "x-client-id": "TEST10499617d0e6c2a742053256e9c271699401",
          "x-client-secret": "cfsk_ma_test_4c05580bf180430390702b8199743cf5_261d24f6",
          "x-api-version": "2022-09-01",
        },
      }
    );    
    
    // ✅ Fix this line
    const paymentStatus = cashfreeOrderDetails.data.order_status;
    
    
    const { payment_session_id } = cashfreeResponse.data;

    if (!payment_session_id) {
      return res.status(500).json({ message: "Failed to get payment session ID" });
    }

    // Save the order to the database
    const rawStatus = cashfreeOrderDetails.data.order_status;

    const normalizedStatus =
      rawStatus === "PAID" ? "completed" :
      ["ACTIVE", "CREATED", "PENDING"].includes(rawStatus) ? "processing" :
      ["CANCELLED", "FAILED", "EXPIRED", "FLAGGED"].includes(rawStatus) ? "failed" :
      "processing"; // fallback
    
    const newOrder = new Order({
      orderId,
      customerEmail,
      customer_id: uniqueCustomerId,
      items,
      totalAmount,
      paymentSessionId: payment_session_id,
      paymentStatus: normalizedStatus
    });    

    await newOrder.save();

    // Do NOT generate invoice here - wait for payment confirmation
    res.status(200).json({ orderId, totalAmount, payment_session_id });
  } catch (error) {
    console.error("Error:", error);
    if (orderId) {
      await Order.deleteOne({ orderId }).catch(console.error);
    }
    res.status(500).json({ 
      message: "Order failed",
      error: error.message 
    });
  }
});

// Payment Webhook Handler
router.post("/payment-webhook", async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;
    
    if (!orderId || !orderStatus) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update payment status based on API response
    if (orderStatus === "PAID") {
      order.paymentStatus = "completed";
    } else if (["ACTIVE", "FLAGGED", "CANCELLED"].includes(orderStatus)) {
      order.paymentStatus = "failed";
    }

    await order.save();

    // Only generate invoice for successful payments
    if (order.paymentStatus === "completed") {
      const invoicePath = path.resolve(__dirname, "../invoices", `${orderId}.pdf`);
      await generateInvoicePDF(order, invoicePath);
    }

    res.status(200).json({ message: "Payment status updated" });
  } catch (error) {
    console.error("Error in payment webhook:", error);
    res.status(500).json({ message: "Failed to update payment status" });
  }
});

router.patch("/order/update-status/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;

  if (!["completed", "failed", "processing"].includes(paymentStatus)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { paymentStatus },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});


// Confirm Payment Endpoint (for frontend verification)
router.post("/confirm-payment", async (req, res) => {
  const { orderId, paymentData, paymentStatus } = req.body; // ✅ Destructure paymentStatus

  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Validate and update payment status
    if (["completed", "failed", "processing"].includes(paymentStatus)) {
      order.paymentStatus = paymentStatus;
    } else {
      order.paymentStatus = "processing"; // fallback
    }

    order.paymentData = paymentData;
    order.date = new Date();

    await order.save();

    console.log("Payment confirmed for order:", orderId);

    // Generate and save the invoice PDF
    const invoicePath = path.resolve(__dirname, "../invoices", `${orderId}.pdf`);
    await generateInvoicePDF(order, invoicePath);

    res.status(200).json({ message: "Payment confirmed successfully", order });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Failed to confirm payment", error: error.message });
  }
});


// Generate Invoice PDF
const generateInvoicePDF = async (order, filePath) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  const { orderId, customerEmail, items, totalAmount, date } = order;

  // Add Content to PDF
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  page.drawText(`Invoice for Order #${orderId}`, {
    x: 50,
    y: 350,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Customer Email: ${customerEmail}`, {
    x: 50,
    y: 320,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Date: ${new Date(date).toLocaleDateString()}`, {
    x: 50,
    y: 300,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });

  // Add Items Table
  let y = 270;
  items.forEach((item, index) => {
    page.drawText(`${index + 1}. ${item.name} - Rs.${item.price} x ${item.quantity}`, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 20;
  });

  // Add Total Amount
  page.drawText(`Total Amount: Rs.${order.totalAmount}`, {
    x: 50,
    y: y - 30,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });

  // Ensure Invoices Directory Exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);
};

// Invoice Retrieval
router.get("/invoices/:orderId", (req, res) => {
  const rawOrderId = req.params.orderId;
  const sanitizedId = rawOrderId.replace(/[^a-zA-Z0-9-]/g, '');
  const invoicePath = path.resolve(__dirname, "../invoices", `${sanitizedId}.pdf`);

  if (fs.existsSync(invoicePath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.sendFile(invoicePath);
  } else {
    res.status(404).json({
      error: "Invoice not ready yet",
      retry: `/invoices/${sanitizedId}.pdf`
    });
  }
});

// Fetch Orders by Customer Email
router.get("/orders/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const orders = await Order.find({ customerEmail: email });
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
});

// Fetch Order by Order ID
router.get("/order/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
});

// Clear Cart Endpoint
router.delete("/cart/clear/:email", async (req, res) => {
  const { email } = req.params;

  try {
    await Cart.deleteMany({ email });
    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

module.exports = router;