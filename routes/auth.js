import express from "express";
import {
  register,
  login,
  refreshToken,
  checkEmail,
} from "../controllers/AuthController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/check-email", checkEmail); // untuk notifikasi form register

export default router;
