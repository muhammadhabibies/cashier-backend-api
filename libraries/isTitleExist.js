import Report from '../models/Financial.js'

const isTitleExist = async (title) => {
    const report = await Report.findOne({ title: title });
    if (!report) { return false }
    return true
}

const isTitleExistWithTitleId = async (id, title) => {
    const report = await Report.findOne({ title: title, _id: { $ne: id } }); // ne ini adalah not equal. Jadi kalau title tidak sesuai dengan idnya maka baru tampilkan pesan error, tapi kalau id dan title sesuai maka tidak usah menampilkan pesan error email exist karena memang email ini sudah milik title itu sendiri, jadi kita skip aja hal ini dan tidak menampilkan pesan error email exist lagi (ini itu untuk update user di file FinancialController.js)
    if (!report) { return false }
    return true
}

// kalau cuma ada satu function, jadi langsung saja export default 
// export default isEmailExist;

// kalau lebih dari satu function seperti ini penulisannya
// export { isEmailExist, isEmailExistWithUserId };

export { isTitleExist, isTitleExistWithTitleId };