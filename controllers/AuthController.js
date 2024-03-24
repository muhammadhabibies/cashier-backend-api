import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import { isEmailExist } from "../libraries/isEmailExist.js";

const env = dotenv.config().parsed;

// untuk memperbaharui access token
const generateAccessToken = async (payload) => {
  return jsonwebtoken.sign(
    payload,
    // buat secretnya.

    // Secret ini untuk pencocokan ketika nanti diverifikasi di dalam sistem kita. Kalau secretnya tidak cocok, maka nanti kita akan kasih tahu ke user kalau jsonwebtokennya tidak cocok.

    // Kenapa kita butuh secret ini? Karena mungkin saja ada user yang ingin membuat jsonwebtokennya diluar dari sistem kita. Misalnya dia buat data jwtnya di website jwt.io kemudian dia masukkan ke sistem kita, apalagi kalo sistemnya dalam bentuk web, dia tinggal inspect element, kemudian dia masukkin ke dalam settingan yang kita berikan, dan dia bisa aja login sebagai admin atau apapun.

    // Oleh karena itu nanti untuk proses verifikasinya kita membutuhkan secret ini. Jadi secret ini jangan sampai ketahuan oleh siapapun.
    env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: env.JWT_ACCESS_TOKEN_LIFE } // lalu expirenya berapa lama
  );
};

// untuk merefresh access token lagi (entah dalam 15 menit / 1 jam bebas agar yang mau coba menggenerate tokennya sulit, karena di ganti setelah waktu yang ditentukan ini)
const generateRefreshToken = async (payload) => {
  return jsonwebtoken.sign(payload, env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: env.JWT_REFRESH_TOKEN_LIFE,
  });
};

// checkEmail function ini untuk front-end, notifikasi form register
const checkEmail = async (req, res) => {
  try {
    // cek apakah email sudah terdaftar
    const emailExist = await isEmailExist(req.body.email);
    if (emailExist) throw { code: 409, message: "EMAIL_EXIST" };

    res.status(200).json({
      status: true,
      message: "EMAIL_NOT_EXIST",
    });
  } catch (err) {
    res.status(err.code).json({
      status: false,
      message: err.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const { fullname, email, password, retype_password } = req.body;

    if (!fullname) throw { code: 428, message: "FULLNAME_REQUIRED" };
    if (!email) throw { code: 428, message: "EMAIL_REQUIRED" };
    if (!password) throw { code: 428, message: "PASSWORD_REQUIRED" };

    if (password !== retype_password) {
      throw { code: 428, message: "PASSWORD_NOT_MATCH" };
    }

    // cek apakah email terdaftar
    const emailExist = await isEmailExist(email);
    if (emailExist) throw { code: 409, message: "EMAIL_EXIST" };

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hash,
    });
    const user = await newUser.save();
    if (!user) throw { code: 500, message: "USER_REGISTER_FAILED" };

    return res.status(200).json({
      status: true,
      message: "USER_REGISTER_SUCCESS",
      user,
    });
  } catch (err) {
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) throw { code: 428, message: "EMAIL_REQUIRED" };
    if (!password) throw { code: 428, message: "PASSWORD_REQUIRED" };

    // apakah email valid?
    const user = await User.findOne({ email: email });
    if (!user) throw { code: 403, message: "EMAIL_NOT_FOUND" };

    // apakah password valid?
    const isMatch = await bcrypt.compareSync(password, user.password);
    if (!isMatch) throw { code: 403, message: "INVALID_PASSWORD" };

    // maka login berhasil, ambil id dan role dari user untuk membuat payload jwt lalu generate token dengan payload tersebut
    const payload = { id: user._id, role: user.role };
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    return res.status(200).json({
      status: true,
      message: "LOGIN_SUCCESS",
      fullname: user.fullname,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    if (!req.body.refreshToken) {
      throw { code: 428, message: "REFRESH_TOKEN_REQUIRED" };
    }

    // verifikasi token
    const verified = await jsonwebtoken.verify(
      req.body.refreshToken,
      env.JWT_REFRESH_TOKEN_SECRET
    );

    // kalau berhasil, kita generate token lagi, yang baru tapi ini
    const payload = { id: verified.id, role: verified.role };
    const accessToken = await generateAccessToken(payload); // nah disini bikin token barunya
    const refreshToken = await generateRefreshToken(payload);

    return res.status(200).json({
      status: true,
      message: "REFRESH_TOKEN_SUCCESS",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err.message == "jwt expired") {
      err.message = "REFRESH_TOKEN_EXPIRED";
    } else {
      err.message = "REFRESH_TOKEN_INVALID";
    }

    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

export { register, login, refreshToken, checkEmail };
