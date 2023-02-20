// import express
import express from 'express';

// import semua routes yang ada selain index.js ini
import categories from './categories.js';
import products from './products.js';
import auth from './auth.js';
import users from './users.js';
import financial from './financial.js';
import crud from './crud.js';

// buat routernya lalu kemudian export
var router = express.Router();

router.use('/categories', categories);
router.use('/products', products);
router.use('/auth', auth);
router.use('/users', users);
router.use('/financial', financial);
router.use('/crud', crud);

export default router;
