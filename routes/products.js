import express from "express";
import { index, store } from "../controllers/ProductController.js";
import jwtAuth from "../middlewares/jwtAuth.js";
import role from "../middlewares/role.js";

const router = express.Router();

// router.get('/', [jwtAuth(), role(['admin', 'cashier'])], index);
router.get("/", index);
router.post("/", store);

export default router;
