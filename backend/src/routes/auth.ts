import { Router } from "express";
import passport from "passport";

const router = Router();

const url = process.env.DASHBOARD_URL.split(" ")[0];

router.get("/", passport.authenticate("discord"));

router.get("/login", passport.authenticate("discord"), (_req, res) => {
  return res.redirect(`${url}/dashboard`);
});

export default router;
