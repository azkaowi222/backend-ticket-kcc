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
      required: [true, "Password wajib diisi"],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: false,
      default: null,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
