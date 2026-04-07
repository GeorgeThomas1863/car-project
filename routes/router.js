import express from "express";

import requireAuth from "../middleware/auth-config.js";
import { displayMain, display401, display404, display500 } from "../controllers/display-controller.js";
import { authController } from "../controllers/auth-controller.js";
import { mainSubmitController } from "../controllers/data-controller.js";

const router = express.Router();

router.post("/site-auth-route", authController);

// router.get("/check-admin-auth", requireAuth, checkAdminAuthController);
// router.get("/admin-auth-display", requireAdminAuth, adminAuthController);
// router.post("/admin-auth-submit", requireAuth, adminAuthController);

router.get("/401", display401);

// router.post("/upload", requireAuth, upload.single("resume"), uploadResumeController);
// router.get("/check-file", requireAuth, checkRouteController);
// router.delete("/delete-resume", requireAuth, deleteResumeController);

router.post("/main-submit", requireAuth, mainSubmitController);

router.get("/", requireAuth, displayMain);

router.use(display404);

router.use(display500);

export default router;
