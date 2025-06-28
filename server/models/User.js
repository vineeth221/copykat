import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
});

// ✅ Generate OTP and save to DB
userSchema.methods.generateOtp = async function () {
  this.otp = Math.floor(100000 + Math.random() * 900000);
  this.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await this.save();  // 🔥 Save OTP to DB
  return this.otp;
};

// ✅ Verify OTP and save changes
userSchema.methods.verifyOtp = async function (otp) {
  if (!this.otp) throw new Error("No OTP set.");
  if (this.otp !== otp) throw new Error("Invalid OTP.");
  if (this.otpExpiresAt < new Date()) throw new Error("OTP has expired.");

  this.otp = null;
  this.otpExpiresAt = null;
  await this.save();  // 🔥 Save cleared OTP to DB

  return true;
};

// User Model
const User = mongoose.model("User", userSchema);

export default User;
