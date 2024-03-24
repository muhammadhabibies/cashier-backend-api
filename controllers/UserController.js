import bcrypt from "bcrypt";
import User from "../models/User.js";
import {
  isEmailExist,
  isEmailExistWithUserId,
} from "../libraries/isEmailExist.js";

const index = async (req, res) => {
  try {
    // tanpa plugin pagination
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

    if (!users) throw { code: 404, message: "USER_NOT_FOUND" };

    return res.status(200).json({
      status: true,
      total: users.length,
      users,
    });
  } catch (err) {
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

const store = async (req, res) => {
  try {
    const { fullname, email, password, role, retype_password } = req.body;
    if (!fullname) throw { code: 428, message: "FULLNAME_REQUIRED" };
    if (!email) throw { code: 428, message: "EMAIL_REQUIRED" };
    if (!password) throw { code: 428, message: "PASSWORD_REQUIRED" };
    if (!role) throw { code: 428, message: "ROLE_REQUIRED" };

    // cek password & retype_password sama ga
    if (password !== retype_password) {
      throw { code: 428, message: "PASSWORD_NOT_MATCH" };
    }

    // cek email sudah terdaftar
    const emailExist = await isEmailExist(email);
    if (emailExist) throw { code: 409, message: "EMAIL_EXIST" };

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname: fullname,
      email: email,
      role: role,
      password: hash,
    });
    const user = await newUser.save();
    if (!user) throw { code: 500, message: "REGISTER_USER_FAILED" };

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

const show = async (req, res) => {
  try {
    if (!req.params.id) throw { code: 428, message: "ID_REQUIRED" };

    const user = await User.findById(req.params.id);
    if (!user) throw { code: 404, message: "USER_NOT_FOUND" };

    return res.status(200).json({
      status: true,
      user,
    });
  } catch (err) {
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { fullname, email, role, retype_password } = req.body;
    if (!req.params.id) throw { code: 428, message: "ID_REQUIRED" };
    if (!fullname) throw { code: 428, message: "FULLNAME_REQUIRED" };
    if (!email) throw { code: 428, message: "EMAIL_REQUIRED" };
    if (!role) throw { code: 428, message: "ROLE_REQUIRED" };

    // cek password & retype_password sama ga
    if (password !== retype_password) {
      throw { code: 428, message: "PASSWORD_NOT_MATCH" };
    }

    // cek email sudah terdaftar, tapi dengan id yang sesuai karena ini update
    const emailExist = await isEmailExistWithUserId(req.params.id, email);
    if (emailExist) throw { code: 409, message: "EMAIL_EXIST" };

    const updatedData = { fullname, email, role };

    // password optional, kalau ada baru akan di-update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      updatedData.password = hash;
    }

    // id ambil dari url
    const user = await User.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });
    if (!user) throw { code: 500, message: "USER_UPDATE_FAILED" };

    return res.status(200).json({
      status: true,
      message: "USER_UPDATED",
      user,
    });
  } catch (err) {
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

const destroy = async (req, res) => {
  try {
    if (!req.params.id) throw { code: 428, message: "ID_REQUIRED" };

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw { code: 500, message: "USER_DELETE_FAILED" };

    return res.status(200).json({
      status: true,
      message: "USER_DELETED",
      user,
    });
  } catch (err) {
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

export { index, store, update, show, destroy };
