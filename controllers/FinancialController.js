// import database model
import Report from '../models/Financial.js';

import { isTitleExist, isTitleExistWithTitleId } from '../libraries/isTitleExist.js';

const index = async (req, res) => {
    try {
        // ini kalo tanpa plugin pagination
        // const users = await user.find();

        // dengan plugin pagination
        let find = {
            title: { $regex: `${req.query.search}`, $options: 'i' } // ini untuk search bar di pages user management
            // title: { $regex: `^${req.query.search}`, $options: 'i' } // ini ditambahin ^ kalau mau pencariannya dari awal harus benar, jadi gak akan ketemu dengan nama tengah kalo pake simbol ^ ini tuh
        }
        let options = {
            page: req.query.page || 1, // kalau gak ada query, default akan menampilkan di pagination page 1
            limit: req.query.limit || 10, // limit data yang akan ditampilkan di tiap page
        }
        const reports = await Report.paginate(find, options);

        if (!reports) { throw { code: 404, message: "REPORT_NOT_FOUND" } }

        return res.status(200).json({
            status: true,
            total: reports.length,
            reports
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
        if (!req.body.price) { throw { code: 428, message: "Price is required" } }

        // pengecekan apakah title sudah pernah didaftarkan dalam database atau belum
        const title = await isTitleExist(req.body.title);
        if (title) { throw { code: 409, message: "TITLE_EXIST" } }

        const newReport = new Report({
            title: req.body.title,
            price: req.body.price,
        });
        const report = await newReport.save();

        if (!report) { throw { code: 500, message: "CREATE_REPORT_FAILED" } }

        return res.status(200).json({
            status: true,
            message: 'CREATE_REPORT_SUCCESS',
            report
        });
    } catch (err) {
        return res.status(err.code || 500).json({
            status: false,
            message: err.message
        });
    }
}

const show = async (req, res) => {
    try {
        // nanti kan kita mau mengirim id, kita cek apakah id tidak dikirim oleh user, maka kita kasih pesan error id required
        if (!req.params.id) { throw { code: 428, message: "ID is required" } }

        // lakukan query berdasarkan id yang dikirim melalui parameter (params)
        const report = await Report.findById(req.params.id);

        // throw kalau datanya tidak ditemukan
        if (!report) { throw { code: 404, message: "REPORT_NOT_FOUND" } }

        return res.status(200).json({
            status: true,
            report
        });
    } catch (err) {
        return res.status(err.code || 500).json({
            status: false,
            message: err.message
        })
    }
}

const update = async (req, res) => {
    try {
        if (!req.params.id) { throw { code: 428, message: "ID is required" } }
        if (!req.body.title) { throw { code: 428, message: "Title is required" } }
        if (!req.body.price) { throw { code: 428, message: "Price is required" } }

        // pengecekan apakah title sudah pernah didaftarkan atau belum (TAPI DENGAN ID YANG SESUAI KARENA INI UPDATE)
        const title = await isTitleExistWithTitleId(req.params.id, req.body.title);
        if (title) { throw { code: 409, message: "TITLE_EXIST" } }

        let fields = {}
        fields.title = req.body.title
        fields.price = req.body.price

        // update report
        const report = await Report.findByIdAndUpdate(req.params.id, fields, { new: true }); // params ini untuk mengambil id dari url, kalau untuk title dan body kita simpen di body karena kita melewatkannya melalui form

        if (!report) { throw { code: 500, message: "UPDATE_REPORT_FAILED" } }

        return res.status(200).json({
            status: true,
            message: 'UPDATE_REPORT_SUCCESS',
            report
        });
    } catch (err) {
        return res.status(err.code || 500).json({
            status: false,
            message: err.message
        });
    }
}

const destroy = async (req, res) => {
    try {
        if (!req.params.id) { throw { code: 428, message: "ID is required" } }

        // delete report
        const report = await Report.findByIdAndDelete(req.params.id);

        if (!report) { throw { code: 500, message: "DELETE_REPORT_FAILED" } }

        return res.status(200).json({
            status: true,
            message: 'DELETE_REPORT_SUCCESS',
            report
        });
    } catch (err) {
        return res.status(err.code || 500).json({
            status: false,
            message: err.message
        });
    }
}

export { index, store, update, show, destroy };