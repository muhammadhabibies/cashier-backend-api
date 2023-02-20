import Product from '../models/Product.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

const index = async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' });

        if (!products) { throw { code: 500, message: "Get products failed" } }

        return res.status(200).json({
            status: true,
            total: products.length,
            products
        });
    } catch (err) {
        return res.status(err.code || 500).json({
            status: false,
            message: err.message
        })
    }
}

const store = async (req, res) => {
    try {
        if (!req.body.title) { throw { code: 428, message: "Title is required" } }
        if (!req.body.thumbnail) { throw { code: 428, message: "Thumbnail is required" } }
        if (!req.body.price) { throw { code: 428, message: "Price is required" } }
        if (!req.body.categoryId) { throw { code: 428, message: "CategoryId is required" } }

        // pengecekan apabila title sudah pernah dibuat apa belum, kalau sudah pernah dibuat maka throw
        const productExist = await Product.findOne({ title: req.body.title });
        if (productExist) { throw { code: 428, message: "Product is exist" } }

        // pengecekan apabila yang diinputkan di categoryId itu memang objectId atau bukan
        if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) { throw { code: 500, message: "CATEGORYID_INVALID" } }

        // pengecekan apabila categoryId memang ada atau tidak, kalau tidak throw
        const categoryExist = await Category.findOne({ _id: req.body.categoryId });
        if (!categoryExist) { throw { code: 428, message: "CATEGORY_IS_NOT_EXIST" } }

        const newProduct = new Product({
            title: req.body.title,
            thumbnail: req.body.thumbnail,
            price: req.body.price,
            categoryId: req.body.categoryId,
        });
        const product = await newProduct.save();

        if (!product) { throw { code: 500, message: "Store product failed" } }

        return res.status(200).json({
            status: true,
            product
        });
    } catch (err) {
        // if (!err.code) { err.code = 500 } // diganti jadi lebih simple dengan || 500 aja mungkin
        return res.status(err.code || 500).json({
            status: false,
            message: err.message
        });
    }
}

export { index, store };