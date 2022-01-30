import { Router } from "express";
import passport from "passport";

const router = Router();

router.get("/", passport.authenticate("discord"));

router.get("/login", passport.authenticate("discord"), (_req, res) => {
  return res.redirect(`${process.env.DASHBOARD_URL}/dashboard`);
});

export default router;
