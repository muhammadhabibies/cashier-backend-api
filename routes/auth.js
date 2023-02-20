// import express
import express from 'express';

// import function dari AuthController.js
import { register, login, refreshToken, checkEmail } from '../controllers/AuthController.js';

// buat routernya dari auth apa saja lalu kemudian export
var router = express.Router();

router.post('/register', register); //auth/register
router.post('/login', login); //auth/login
router.post('/refresh-token', refreshToken); //auth/refresh-token
router.post('/check-email', checkEmail); //auth/check-email // untuk front-end, notifikasi form register

export default router;
