import express from "express";
import {
  getDashboardAnalytics,
  getSalesReport,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardAnalytics);
router.get("/reports", protect, getSalesReport);
export default router;
