import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const index = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" });
    if (!products) throw { code: 500, message: "GET_PRODUCTS_FAILED" };

    return res.status(200).json({
      status: true,
      total: products.length,
      products,
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
    const { title, thumbnail, price, categoryId } = req.body;
    if (!title) throw { code: 428, message: "TITLE_REQUIRED" };
    if (!thumbnail) throw { code: 428, message: "THUMBNAIL_REQUIRED" };
    if (!price) throw { code: 428, message: "PRICE_REQUIRED" };
    if (!categoryId) throw { code: 428, message: "CATEGORY_ID_REQUIRED" };

    // cek apakah title sudah ada
    const productExist = await Product.findOne({ title });
    if (productExist) throw { code: 428, message: "PRODUCT_EXIST" };

    // cek apakah categoryId memang objectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw { code: 500, message: "INVALID_CATEGORY_ID" };
    }

    // cek apakah categoryId terdaftar
    const categoryExist = await Category.findOne({ _id: categoryId });
    if (!categoryExist) throw { code: 428, message: "CATEGORY_IS_NOT_EXIST" };

    const newProduct = new Product({
      title,
      thumbnail,
      price,
      categoryId,
    });
    const product = await newProduct.save();
    if (!product) throw { code: 500, message: "FAILED_STORE_PRODUCT" };

    return res.status(200).json({
      status: true,
      product,
    });
  } catch (err) {
    return res.status(err.code || 500).json({
      status: false,
      message: err.message,
    });
  }
};

export { index, store };
