// import database model
import Crud from '../models/Crud.js';

import { isTitleExist, isTitleExistWithTitleId } from '../libraries/isTitleExist.js';

const getRead = async (req, res) => {
    try {
        // ini kalo tanpa plugin pagination
        const cruds = await Crud.find({ status: "active" });

        // dengan plugin pagination
        // let find = {
        //     dataString: { $regex: `${req.query.search}`, $options: 'i' } // ini untuk search bar di pages user management
        //     // title: { $regex: `^${req.query.search}`, $options: 'i' } // ini ditambahin ^ kalau mau pencariannya dari awal harus benar, jadi gak akan ketemu dengan nama tengah kalo pake simbol ^ ini tuh
        // }
        // let options = {
        //     page: req.query.page || 1, // kalau gak ada query, default akan menampilkan di pagination page 1
        //     limit: req.query.limit || 10, // limit data yang akan ditampilkan di tiap page
        // }
        // const cruds = await Crud.paginate(find, options);

        if (!cruds) { throw { code: 404, message: "REPORT_NOT_FOUND" } }

        return res.status(200).json({
            status: true,
            total: cruds.length,
            cruds
        });
    } catch (err) {
        return res.status(err.code || 500).json({
            status: false,
            message: err.message
        })
    }
}

const getReadWithPagination = async (req, res) => {
    try {
        // ini kalo tanpa plugin pagination
        // const cruds = await Crud.find({ status: "active" });

        // dengan plugin pagination
        let find = {
            dataString: { $regex: `${req.query.search}`, $options: 'i' } // ini untuk search bar di pages user management
            // title: { $regex: `^${req.query.search}`, $options: 'i' } // ini ditambahin ^ kalau mau pencariannya dari awal harus benar, jadi gak akan ketemu dengan nama tengah kalo pake simbol ^ ini tuh
        }
        let options = {
            page: req.query.page || 1, // kalau gak ada query, default akan menampilkan di pagination page 1
            limit: req.query.limit || 10, // limit data yang akan ditampilkan di tiap page
        }
        const cruds = await Crud.paginate(find, options);

        if (!cruds) { throw { code: 404, message: "REPORT_NOT_FOUND" } }

        return res.status(200).json({
            status: true,
            total: cruds.length,
            cruds
        });
    } catch (err) {
        return res.status(err.code || 500).json({
            status: false,
            message: err.message
        })
    }
}

const postCreate = async (req, res) => {
    try {
        if (!req.body.dataString) { throw { code: 428, message: "Title is required" } }
        if (!req.body.deadline) { throw { code: 428, message: "Price is required" } }
        if (!req.body.location) { throw { code: 428, message: "Price is required" } }

        // pengecekan apakah title sudah pernah didaftarkan dalam database atau belum
        const title = await isTitleExist(req.body.dataString);
        if (title) { throw { code: 409, message: "TITLE_EXIST" } }

        const newReport = new Crud({
            dataString: req.body.dataString,
            deadline: req.body.deadline,
            location: req.body.location,
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

const getReadForUpdate = async (req, res) => {
    try {
        // nanti kan kita mau mengirim id, kita cek apakah id tidak dikirim oleh user, maka kita kasih pesan error id required
        if (!req.params.id) { throw { code: 428, message: "ID is required" } }

        // lakukan query berdasarkan id yang dikirim melalui parameter (params)
        const crud = await Crud.findById(req.params.id);

        // throw kalau datanya tidak ditemukan
        if (!crud) { throw { code: 404, message: "REPORT_NOT_FOUND" } }

        return res.status(200).json({
            status: true,
            crud
        });
    } catch (err) {
        return res.status(err.code || 500).json({
            status: false,
            message: err.message
        })
    }
}

const putUpdate = async (req, res) => {
    try {
        if (!req.params.id) { throw { code: 428, message: "ID is required" } }
        if (!req.body.dataString) { throw { code: 428, message: "Title is required" } }
        if (!req.body.deadline) { throw { code: 428, message: "Price is required" } }
        if (!req.body.location) { throw { code: 428, message: "Price is required" } }

        // pengecekan apakah title sudah pernah didaftarkan atau belum (TAPI DENGAN ID YANG SESUAI KARENA INI UPDATE)
        const title = await isTitleExistWithTitleId(req.params.id, req.body.dataString);
        if (title) { throw { code: 409, message: "TITLE_EXIST" } }

        let fields = {}
        fields.dataString = req.body.dataString
        fields.deadline = req.body.deadline
        fields.location = req.body.location

        // update data
        const report = await Crud.findByIdAndUpdate(req.params.id, fields, { new: true }); // params ini untuk mengambil id dari url, kalau untuk title dan body kita simpen di body karena kita melewatkannya melalui form

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

const deleteDelete = async (req, res) => {
    try {
        if (!req.params.id) { throw { code: 428, message: "ID is required" } }

        // delete report
        const report = await Crud.findByIdAndDelete(req.params.id);

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

export { getRead, getReadWithPagination, postCreate, putUpdate, getReadForUpdate, deleteDelete };