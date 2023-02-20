// import express
import express from 'express';

// import function dari UserControllers.js
import { getRead, getReadWithPagination, postCreate, putUpdate, getReadForUpdate, deleteDelete } from '../controllers/CrudController.js';

// buat routernya dari users apa saja lalu kemudian export
var router = express.Router();

router.get('/', getRead);
router.get('/pagination', getReadWithPagination);
router.post('/', postCreate);
router.put('/:id', putUpdate); // kalau kita mau melewatkan params id maka kasih id
router.get('/:id', getReadForUpdate);
router.delete('/:id', deleteDelete);

export default router;
