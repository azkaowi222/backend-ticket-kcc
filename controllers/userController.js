import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Endpoint untuk melihat profil user
export const getProfile = async (req, res) => {
  try {
    // req.user sudah diisi secara otomatis oleh middleware 'protect'
    res.status(200).json({
      message: "Data profil berhasil diambil",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};



export const editUser = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    if (!username && !email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Username, email atau nomer tidak boleh kosong",
      });
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    if (username) {
      user.username = username;
    }

    if (email) {
      user.email = email;
    }

    if (phone) {
      user.phone = phone;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    await user.save();
    return res.status(200).json({
      success: true,
      message: "User berhasil diperbarui",
      user: userResponse,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};
