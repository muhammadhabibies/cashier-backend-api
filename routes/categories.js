import express from "express";
import { index, store } from "../controllers/CategoryController.js";
import jwtAuth from "../middlewares/jwtAuth.js";
import role from "../middlewares/role.js";

const router = express.Router();

// router.get('/', [jwtAuth(), role(['admin', 'cashier'])], index); // hanya admin dan cashier yang bisa mengakses data categoriesnya
router.get("/", index);
// router.post('/', jwtAuth(), store);
router.post("/", store);

export default router;
