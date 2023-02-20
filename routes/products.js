// import express
import express from 'express';

// import function dari ProductController.js
import { index, store } from '../controllers/ProductController.js';

// import middlewares
import jwtAuth from '../middlewares/jwtAuth.js';
import role from '../middlewares/role.js';

// buat routernya dari product apa saja lalu kemudian export
var router = express.Router();

// router.get('/', [jwtAuth(), role(['admin', 'cashier'])], index);
router.get('/', index);
router.post('/', store);

export default router;