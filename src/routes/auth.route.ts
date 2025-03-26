
import express from "express";
const router = express.Router();
import {
  register,
  login,
  logout,
  sessionHandler,
} from "../controllers/auth.controller";


router.post("/session", sessionHandler);
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

export default router;
