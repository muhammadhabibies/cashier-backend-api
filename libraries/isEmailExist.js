import User from '../models/User.js'

const isEmailExist = async (email) => {
    const user = await User.findOne({ email: email });
    if (!user) { return false }
    return true
}

const isEmailExistWithUserId = async (id, email) => {
    const user = await User.findOne({ email: email, _id: { $ne: id } }); // ne ini adalah not equal. Jadi kalau email tidak sesuai dengan idnya maka baru tampilkan pesan error, tapi kalau id dan email sesuai maka tidak usah menampilkan pesan error email exist karena memang email ini sudah milik dia, jadi kita skip aja hal ini dan tidak menampilkan pesan error email exist lagi (ini itu untuk update user di file UserController.js)
    if (!user) { return false }
    return true
}

// kalau cuma ada satu function, jadi langsung saja export default 
// export default isEmailExist;

export { isEmailExist, isEmailExistWithUserId };