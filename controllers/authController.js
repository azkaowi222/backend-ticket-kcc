import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import jwt from "jsonwebtoken";
import "dotenv/config";
import generateSecureOTP from "../utils/generateOtp.js";
import { sendVerificationEmail } from "../services/emailService.js";

initializeApp({
  credential: cert({
    projectId: process.env.PROJECT_ID,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.CLIENT_EMAIL,
  }),
});

// Endpoint Register
export const register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateSecureOTP();
    await sendVerificationEmail(email, otp);
    const otpExpiredAt = new Date(Date.now() + 5 * 60 * 1000);
    const newUser = new User({
      username: username ?? email.split("@")[0],
      email,
      password: hashedPassword,
      phone,
      email_otp: otp,
      email_otp_expired: otpExpiredAt,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ message: "Registrasi berhasil", userId: newUser._id });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Endpoint Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(200).json({ message: "Email atau password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

export const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({
        message: "Firebase ID token wajib dikirim.",
      });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userIsExist = await User.findOne({
      email: decodedToken.email,
    });

    let user;

    if (userIsExist) {
      userIsExist.email = decodedToken.email;
      userIsExist.username = decodedToken.name;
      userIsExist.phone = decodedToken.phone_number ?? null;
      userIsExist.provider = "google";
      await userIsExist.save();
    } else {
      user = await User.create({
        email: decodedToken.email,
        phone: decodedToken.phone_number ?? null,
        username: decodedToken.name ?? decodedToken.email.split("@")[0],
        provider: "google",
      });
    }

    const token = jwt.sign(
      {
        id: userIsExist ? userIsExist._id : user._id,
        email: decodedToken.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    return res.status(200).json({
      status: 200,
      message: "Berhasil login google",
      token,
      user: {
        id: decodedToken.user_id,
        username: decodedToken.name ?? decodedToken.email.split("@")[0],
        email: decodedToken.email,
        phone: user?.phone ?? userIsExist?.phone,
        role: "user",
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        status: 400,
        message: "Field email atau otp harus diisi",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "user tidak ditemukan",
      });
    }

    if (user.email_otp != otp) {
      return res.status(400).json({
        status: 400,
        message: "Otp tidak valid",
      });
    }

    const now = new Date();
    const isOtpExpired = now > user.email_otp_expired;

    if (isOtpExpired) {
      return res.status(400).json({
        status: 400,
        message: "Otp telah expired",
      });
    }
    user.is_email_verified = true;
    await user.save();
    return res.status(200).json({
      status: 200,
      message: "Email berhasil diverifikasi",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User tidak ditemukan",
      });
    }
    const otp = generateSecureOTP();
    await sendVerificationEmail(email, otp);
    user.email_otp = otp;
    user.email_otp_expired = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    return res.status(200).json({
      status: 200,
      message: "Otp berhasil dikirim ulang",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Karena kita menggunakan JWT via Header untuk aplikasi mobile (Flutter),
    // tidak ada session di database yang perlu dihapus.
    // Cukup kirimkan respons sukses ke client agar client menghapus tokennya.

    res.status(200).json({
      message: "Berhasil logout, silakan hapus token di perangkat Anda.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat logout", error: error.message });
  }
};
