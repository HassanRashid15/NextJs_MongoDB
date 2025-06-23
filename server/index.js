const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db/index.js");
const authRoutes = require("./routes/auth.js");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Mount routers
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
