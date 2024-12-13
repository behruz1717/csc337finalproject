const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const budgetRoutes = require("./routes/budgets");
const expenseRoutes = require("./routes/expenses");
const reportsRouter = require("./routes/reports");
const settingsRouter = require("./routes/settings");
const messagesRouter = require("./routes/messages");

const app = express();
const PORT = 80;
const HOST = "0.0.0.0"; //bind to all interfaces

// Middleware
app.use(express.json());

// Serve static files from front_end directory
app.use(express.static(path.join(__dirname, "front_end")));

// Redirect root URL to the landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "front_end/pages/landing.html"));
});

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/budgetingApp")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// API Routes
app.use("/api/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/budgets", budgetRoutes);

app.use("/api/expenses", expenseRoutes);

app.use("/api/reports", reportsRouter);

app.use("/api/settings", settingsRouter);

app.use("/api/messages", messagesRouter);

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
