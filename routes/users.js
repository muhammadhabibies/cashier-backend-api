// import express
import express from 'express';

// import function dari UserControllers.js
import { index, store, update, show, destroy } from '../controllers/UserController.js';

// buat routernya dari users apa saja lalu kemudian export
var router = express.Router();

router.get('/', index);
router.post('/', store);
router.put('/:id', update); // kalau kita mau melewatkan params id maka kasih id
router.get('/:id', show);
router.delete('/:id', destroy);

export default router;
