import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // Cek apakah header authorization ada dan dimulai dengan 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Pisahkan kata 'Bearer' dan ambil tokennya saja (index ke-1)
      token = req.headers.authorization.split(" ")[1];

      // Verifikasi token menggunakan secret key dari .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Cari user berdasarkan ID yang ada di dalam token
      // .select('-password') berarti kita tidak ikut mengambil field password dari database
      req.user = await User.findById(decoded.id).select("-password");

      // Lanjut ke fungsi controller se lanjutnya
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        message: "Tidak ada otorisasi, token tidak valid atau kadaluarsa",
      });
    }
  }

  // Jika tidak ada token sama sekali
  if (!token) {
    return res
      .status(401)
      .json({ message: "Tidak ada otorisasi, token tidak ditemukan" });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select("-password");
  } catch (err) {
    // Token tidak valid, anggap sebagai guest
  }

  next();
};

export const isAdmin = async (req, res, next) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(403).json({
        message: "Tidak ada akses untuk resource ini",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalaha pada server",
      error: error,
    });
  }
};
