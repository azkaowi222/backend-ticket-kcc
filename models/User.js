import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username wajib diisi"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "email";
      },
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: false,
      default: null,
      lowercase: true,
    },
    is_email_verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    email_otp: {
      type: Number,
      required: function () {
        return this.provider !== "google";
      },
    },
    email_otp_expired: {
      type: Date,
      required: function () {
        return this.provider !== "google";
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ["email", "google"],
      default: "email",
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
