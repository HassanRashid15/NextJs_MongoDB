const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const { getDashboardData } = require("../controllers/authController");

// Real dashboard data from database
router.get("/", authMiddleware, getDashboardData);

module.exports = router;
