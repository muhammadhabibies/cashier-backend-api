import Category from "../models/Category.js";

const index = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" });
    if (!categories) throw { code: 500, message: "GET_CATEGORIES_FAILED" };

    return res.status(200).json({
      status: true,
      total: categories.length,
      categories,
    });
  } catch (err) {
    return res.status(err.code).json({
      status: false,
      message: err.message,
    });
  }
};

const store = async (req, res) => {
  try {
    if (!req.body.title) throw { code: 428, message: "TITLE_REQUIRED" };

    const newCategory = new Category({
      title: req.body.title,
    });
    const category = await newCategory.save();
    if (!category) throw { code: 500, message: "STORE_CATEGORY_FAILED" };

    return res.status(200).json({
      status: true,
      category,
    });
  } catch (err) {
    return res.status(err.code).json({
      status: false,
      message: err.message,
    });
  }
};

export { index, store };
