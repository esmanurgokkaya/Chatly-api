import express from "express";
import { signup, login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", (req, res) => {
  res.send("logout route");
});

export default router;
