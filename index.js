const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db/index.js");
const authRoutes = require("./routes/auth.js");
const dashboardRoutes = require("./routes/dashboard.js");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://authintegration-6m0cb28l6-hassanrashid15s-projects.vercel.app',
    'https://auth-integration.vercel.app',
    'https://authintegration-nojo0ui6n-hassanrashid15s-projects.vercel.app',
    'https://authintegration.vercel.app',
    'https://*.vercel.app',
    'https://*.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to database
connectDB();

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
