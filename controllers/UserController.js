import User from "../models/User.js";

import bcrypt from "bcrypt";
import {
  isEmailExist,
  isEmailExistWithUserId,
} from "../libraries/isEmailExist.js";

const index = async (req, res) => {
  try {
    // ini kalo tanpa plugin pagination
    // const users = await User.find();

    // dengan plugin pagination
    let find = {
      fullname: { $regex: `${req.query.search}`, $options: "i" }, // ini untuk search bar di pages user management
      // fullname: { $regex: `^${req.query.search}`, $options: 'i' } // ini ditambahin ^ kalau mau pencariannya dari awal harus benar, jadi gak akan ketemu dengan nama tengah kalo pake simbol ^ ini tuh
    };
    let options = {
      page: req.query.page || 1, // kalau gak ada query, default akan menampilkan di pagination page 1
      limit: req.query.limit || 10, // limit data yang akan ditampilkan di tiap page
    };
    const users = await User.paginate(find, options);

    if (!users) {
      throw { code: 404, message: "USER_NOT_FOUND" };
    }

    return res.status(200).json({
      status: true,
      total: users.length,
      users,
    });
  } catch (err) {
    // if (!err.code) { err.code = 500 }
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

const store = async (req, res) => {
  try {
    if (!req.body.fullname) {
      throw { code: 428, message: "Fullname is required" };
    }
    if (!req.body.email) {
      throw { code: 428, message: "Email is required" };
    }
    if (!req.body.password) {
      throw { code: 428, message: "Password is required" };
    }
    if (!req.body.role) {
      throw { code: 428, message: "Role is required" };
    }

    // pengecekan apakah password match atau tidak ketika diulang kedua kalinya
    if (req.body.password !== req.body.retype_password) {
      throw { code: 428, message: "PASSWORD_NOT_MATCH" };
    }

    // pengecekan apakah email sudah pernah didaftarkan atau belum
    const email = await isEmailExist(req.body.email);
    if (email) {
      throw { code: 409, message: "EMAIL_EXIST" };
    }

    // bcrypt
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      fullname: req.body.fullname,
      email: req.body.email,
      role: req.body.role,
      password: hash,
    });
    const user = await newUser.save();

    if (!user) {
      throw { code: 500, message: "USER_REGISTER_FAILED" };
    }

    return res.status(200).json({
      status: true,
      message: "USER_REGISTER_SUCCESS",
      user,
    });
  } catch (err) {
    // kalau gak ada error code berarti error codenya 500 agar server tidak mati dan kita tidak tahu errornya apa
    // if (!err.code) { err.code = 500 } // disingkat menjadi || 500 aja
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

const show = async (req, res) => {
  try {
    // nanti kan kita mau mengirim id, kita cek apakah id tidak dikirim oleh user, maka kita kasih pesan error id required
    if (!req.params.id) {
      throw { code: 428, message: "ID is required" };
    }

    // lakukan query berdasarkan id yang dikirim melalui parameter (params)
    const user = await User.findById(req.params.id);

    // throw kalau datanya tidak ditemukan
    if (!user) {
      throw { code: 404, message: "USER_NOT_FOUND" };
    }

    return res.status(200).json({
      status: true,
      user,
    });
  } catch (err) {
    // if (!err.code) { err.code = 500 }
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

const update = async (req, res) => {
  try {
    if (!req.params.id) {
      throw { code: 428, message: "ID is required" };
    }
    if (!req.body.fullname) {
      throw { code: 428, message: "Fullname is required" };
    }
    if (!req.body.email) {
      throw { code: 428, message: "Email is required" };
    }
    if (!req.body.role) {
      throw { code: 428, message: "Role is required" };
    }

    // pengecekan apakah password match atau tidak ketika diulang kedua kalinya
    if (req.body.password !== req.body.retype_password) {
      throw { code: 428, message: "PASSWORD_NOT_MATCH" };
    }

    // pengecekan apakah email sudah pernah didaftarkan atau belum (TAPI DENGAN ID YANG SESUAI KARENA INI UPDATE)
    const email = await isEmailExistWithUserId(req.params.id, req.body.email);
    if (email) {
      throw { code: 409, message: "EMAIL_EXIST" };
    }

    let fields = {};
    fields.fullname = req.body.fullname;
    fields.email = req.body.email;
    fields.role = req.body.role;

    // password ini optional, kalau kosong tidak diupdate, kalau diisi baru akan diupdate passwordnya
    if (req.body.password) {
      // update password bcrypt
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(req.body.password, salt);
      fields.password = hash;
    }

    // update user
    const user = await User.findByIdAndUpdate(req.params.id, fields, {
      new: true,
    }); // params ini untuk mengambil id dari url, kalau untuk fullname, email, role kita simpen di body karena kita melewatkannya melalui form

    if (!user) {
      throw { code: 500, message: "USER_UPDATE_FAILED" };
    }

    return res.status(200).json({
      status: true,
      message: "USER_UPDATE_SUCCESS",
      user,
    });
  } catch (err) {
    // kalau gak ada error code berarti error codenya 500 agar server tidak mati dan kita tidak tahu errornya apa
    // if (!err.code) { err.code = 500 } // dipersingkat aja menjadi || 500
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

const destroy = async (req, res) => {
  try {
    if (!req.params.id) {
      throw { code: 428, message: "ID is required" };
    }

    // delete user
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw { code: 500, message: "USER_DELETE_FAILED" };
    }

    return res.status(200).json({
      status: true,
      message: "USER_DELETE_SUCCESS",
      user,
    });
  } catch (err) {
    // kalau gak ada error code berarti error codenya 500 agar server tidak mati dan kita tidak tahu errornya apa
    // if (!err.code) { err.code = 500 } // dipersingkat aja menjadi || 500
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

export { index, store, update, show, destroy };
