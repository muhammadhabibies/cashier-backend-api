import express from "express";
import {
  index,
  store,
  update,
  show,
  destroy,
} from "../controllers/UserController.js";

const router = express.Router();

router.get("/", index);
router.post("/", store);
router.put("/:id", update); // kalau mau melewatkan params id maka kasih id
router.get("/:id", show);
router.delete("/:id", destroy);

export default router;
