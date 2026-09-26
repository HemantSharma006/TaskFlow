const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("dns");

const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const commentRoutes = require("./routes/commentRoutes");
const activityRoutes = require("./routes/activityRoutes");

// Use Google DNS for MongoDB Atlas SRV resolution
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Load environment variables
dotenv.config({ path: "./server.env" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// =========================
// API ROUTES
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activity", activityRoutes);

// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "TaskFlow API is running successfully 🚀",
  });
});

// =========================
// MONGODB CONNECTION
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:");
    console.error(error);
  });