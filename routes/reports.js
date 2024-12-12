const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// Get Monthly Reports
router.get("/monthly", async (req, res) => {
  const { username, budgetId, category } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    const matchStage = { username }; // Match user
    if (budgetId) matchStage.budgetId = budgetId; // Optional filter by budget
    if (category) matchStage.category = category; // Optional filter by category

    const reports = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $month: "$date" }, // Group by month
          totalAmount: { $sum: "$amount" }, // Calculate total spending
          expenses: { $push: "$$ROOT" }, // Include all expenses in the group
        },
      },
      {
        $project: {
          month: "$_id",
          totalAmount: 1,
          expenses: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } }, // Sort by month
    ]);

    res
      .status(200)
      .json({ message: "Monthly reports fetched successfully.", reports });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
