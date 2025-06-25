const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");

// Dummy dashboard data for demonstration
router.get("/", authMiddleware, async (req, res) => {
  // You can fetch real stats from your DB here
  res.json({
    stats: {
      totalLogins: 5,
      lastLogin: new Date().toISOString(),
      profileCompleteness: 80,
    },
    recentActivity: [
      // Example activity
      { id: "1", action: "Logged in", timestamp: new Date().toISOString() },
      {
        id: "2",
        action: "Updated profile",
        timestamp: new Date().toISOString(),
      },
    ],
  });
});

module.exports = router;
