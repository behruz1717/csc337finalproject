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
const PORT = 5000;

// Middleware
app.use(express.json());

// Serve static files from front_end directory
app.use(express.static(path.join(__dirname, "front_end")));

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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
