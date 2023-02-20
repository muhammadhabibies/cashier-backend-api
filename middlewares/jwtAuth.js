import jsonwebtoken from 'jsonwebtoken'

import dotenv from 'dotenv'
const env = dotenv.config().parsed;

const jwtAuth = () => {
    // untuk middleware ini kita me-return sebuah function
    // ditambahkan next supaya setelah middlewarenya dilewatin, proses verifikasinya cocok, kita akan membiarkan user untuk melanjutkan requestnya, kalau tidak cocok baru dikirim error.
    return function (req, res, next) {
        try {
            // kita lakukan pengecekan apakah di header ada authorization? Kalau tidak ada masuk ke else
            // jadi kita membaca headers dari request yang dibuat oleh user
            if (req.headers.authorization) {
                const token = req.headers.authorization.split(' ')[1];

                // dilakukan verifikasi, disini akan dicek token yang dikirim melalui header authorization, lalu kemudian akan digabungkan dengan JWT_ACCESS_TOKEN_SECRET yang telah kita buat di file .env, lalu dicek apakah sesuai atau tidak karena bisa saja user memanipulasi token
                const verify = jsonwebtoken.verify(token, env.JWT_ACCESS_TOKEN_SECRET);

                // simpan hasil verifikasinya
                // console.log(verify); // konsol ke terminal back-end
                req.jwt = verify;

                // kalau berhasil, user dapat melanjutkan requestnya, kalau tidak berhasil kita lempar throw
                next();
            } else {
                throw { message: 'TOKEN_REQUIRED' }
            }
        } catch (err) {
            // console.log(err) // cek di terminal back-end (outputnya => jwt malformed) (jwt malformed inilah yang akan kita manfaatkan)
            if (err.message == 'jwt expired') {
                err.message = 'ACCESS_TOKEN_EXPIRED'
            } else if (err.message == 'TOKEN_REQUIRED') {
                err.message = 'TOKEN_REQUIRED'
            }
            // daripada kita tulis dengan banyak opsi, kita else sajalah takutnya ada error message aneh dari jsonwebtoken lainnya yang tidak diharapkan
            // else if (err.message == 'jwt malformed' || err.message == 'jwt signature' || err.message == 'jwt invalid')
            else {
                err.message = 'TOKEN_INVALID'
            }

            // kodenya akan selalu 401 aja karena disini akan dianggap user belum login
            return res.status(401).json({
                status: false,
                message: err.message
            })
        }
    }
}

export default jwtAuth;