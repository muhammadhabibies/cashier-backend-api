const role = (whoCanAccess) => {
    return function (req, res, next) {
        try {
            // req.jwt ini dari file jwtAuth.js, yang berhasil verifikasi beserta berhasil menyimpan datanya
            // console.log(req.jwt);
            if (whoCanAccess.includes(req.jwt.role)) {
                next();
            } else {
                throw { message: 'UNAUTHORIZED_ROLE' }
            }
        } catch (err) {
            return res.status(401).json({
                status: false,
                message: 'UNAUTHORIZED_ROLE'
            })
        }
    }
}

export default role;