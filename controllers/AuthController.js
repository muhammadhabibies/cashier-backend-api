// import model User
import User from '../models/User.js'

import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'
import { isEmailExist } from '../libraries/isEmailExist.js'

// import dotenv
import dotenv from 'dotenv'
const env = dotenv.config().parsed;

// fungsi untuk memperbaharui access token
const generateAccessToken = async (payload) => {
    return jsonwebtoken.sign(
        payload,
        // buat secretnya. Secret ini untuk pencocokan ketika nanti diverifikasi di dalam sistem kita. Kalau secretnya tidak cocok, maka nanti kita akan kasih tahu ke user kalau jsonwebtokennya tidak cocok. Kenapa kita butuh secret ini? Karena mungkin saja ada user yang ingin membuat jsonwebtokennya diluar dari sistem kita. Misalnya dia buat data jwtnya di website jwt.io kemudian dia masukkan ke sistem kita, apalagi kalo sistemnya dalam bentuk web, dia tinggal inspect element, kemudian dia masukkin ke dalam settingan yang kita berikan, dan dia bisa aja login sebagai admin atau apapun. Oleh karena itu nanti untuk proses verifikasinya kita membutuhkan secret ini. Jadi secret ini jangan sampai ketahuan oleh siapapun.
        env.JWT_ACCESS_TOKEN_SECRET,
        // selanjutnya expirenya berapa lama
        { expiresIn: env.JWT_ACCESS_TOKEN_LIFE }
    );
}

// fungsi untuk merefresh access token lagi (entah dalam 15 menit / 1 jam bebas agar hacker menggenerate tokennya sulit, kita ganti setelah waktu yang kita tentukan ini)
const generateRefreshToken = async (payload) => {
    return jsonwebtoken.sign(
        payload,
        env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: env.JWT_REFRESH_TOKEN_LIFE }
    );
}

// checkEmail function ini untuk front-end, notifikasi form register
const checkEmail = async (req, res) => {
    try {
        // pengecekan apakah email sudah pernah didaftarkan atau belum di database
        const email = await isEmailExist(req.body.email);

        // kalau belum terdaftar
        if (email) { throw { code: 409, message: "EMAIL_EXIST" } }

        // kalau datanya tidak ketemu
        res.status(200).json({
            status: true,
            message: 'EMAIL_NOT_EXIST'
        });
    } catch (err) {
        res.status(err.code).json({
            status: false,
            message: err.message,
        });
    }
}

const register = async (req, res) => {
    try {
        if (!req.body.fullname) { throw { code: 428, message: "Fullname is required" } }
        if (!req.body.email) { throw { code: 428, message: "Email is required" } }
        if (!req.body.password) { throw { code: 428, message: "Password is required" } }

        // pengecekan apakah password match atau tidak ketika diulang kedua kalinya
        if (req.body.password !== req.body.retype_password) {
            throw { code: 428, message: "PASSWORD_NOT_MATCH" }
        }

        // pengecekan apakah email sudah pernah didaftarkan atau belum
        const email = await isEmailExist(req.body.email);
        if (email) { throw { code: 409, message: "EMAIL_EXIST" } }

        // bcrypt
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            fullname: req.body.fullname,
            email: req.body.email,
            password: hash,
        });
        const user = await newUser.save();

        if (!user) { throw { code: 500, message: "USER_REGISTER_FAILED" } }

        return res.status(200).json({
            status: true,
            message: 'USER_REGISTER_SUCCESS',
            user
        });
    } catch (err) {
        // kalau gak ada error code berarti error codenya 500 agar server tidak mati dan kita tidak tahu errornya apa
        if (!err.code) { err.code = 500 }
        return res.status(err.code).json({
            status: false,
            message: err.message
        });
    }
}

const login = async (req, res) => {
    try {
        if (!req.body.email) { throw { code: 428, message: "Email is required" } }
        if (!req.body.password) { throw { code: 428, message: "Password is required" } }

        // apakah email yang diinputkan ada di database? Jika email tidak ada, maka user not found
        const user = await User.findOne({ email: req.body.email });
        if (!user) { throw { code: 403, message: "EMAIL_NOT_FOUND" } }

        // kalau email ada, maka kita akses field password dari email tersebut dan samakan dengan yang diinputkan
        // kemudian dicek apakah password match atau tidak dengan password dari database
        const isMatch = await bcrypt.compareSync(req.body.password, user.password);
        if (!isMatch) { throw { code: 403, message: "PASSWORD_IS_NOT_CORRECT" } }

        // setelah pengecekan email dan password berhasil, kita akan mengakses data user dan rolenya
        // buat payload untuk jwt
        const payload = { id: user._id, role: user.role };
        // kalau sudah berhasil login, generate token
        const accessToken = await generateAccessToken(payload)
        const refreshToken = await generateRefreshToken(payload)

        return res.status(200).json({
            status: true,
            message: 'LOGIN_SUCCESS',
            fullname: user.fullname, // dari database
            accessToken,
            refreshToken
        });
    } catch (err) {
        // kalau gak ada error code berarti error codenya 500 agar server tidak mati dan kita tidak tahu errornya apa
        if (!err.code) { err.code = 500 }
        return res.status(err.code).json({
            status: false,
            message: err.message
        });
    }
}

const refreshToken = async (req, res) => {
    try {
        if (!req.body.refreshToken) { throw { code: 428, message: "REFRESH_TOKEN_REQUIRED" } }

        // verifikasi token
        const verify = await jsonwebtoken.verify(req.body.refreshToken, env.JWT_REFRESH_TOKEN_SECRET);

        // kalau berhasil, kita generate token lagi yang baru tapi ini
        let payload = { id: verify.id, role: verify.role };
        const accessToken = await generateAccessToken(payload) // disini lah bikin token barunya
        const refreshToken = await generateRefreshToken(payload)

        return res.status(200).json({
            status: true,
            message: 'REFRESH_TOKEN_SUCCESS',
            // fullname: User.fullname, // dari database
            accessToken,
            refreshToken
        });
    } catch (err) {
        if (err.message == 'jwt expired') {
            err.message = 'REFRESH_TOKEN_EXPIRED'
        } else {
            err.message = 'REFRESH_TOKEN_INVALID'
        }

        return res.status(err.code).json({
            status: false,
            message: err.message
        });
    }
}

export { register, login, refreshToken, checkEmail }