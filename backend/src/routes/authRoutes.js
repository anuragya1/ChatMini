import express from "express";
import * as authController from "../controllers/AuthController.js";
import { validateRegister, validateLogin } from "../middlewares/Validation.js";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/register",registerLimiter, validateRegister, authController.register);
router.post("/login", loginLimiter,validateLogin, authController.login);
export default router;
 