const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// Dashboard API
router.get("/", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    // Fetch budgets excluding archived ones
    const budgets = await Budget.find({ username, archived: false });

    // Fetch and include expenses for each budget
    const budgetsWithExpenses = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await Expense.find({ budgetId: budget._id });

        return {
          budgetId: budget._id,
          name: budget.name,
          goalAmount: budget.goalAmount,
          totalExpenses: expenses.reduce(
            (total, expense) => total + expense.amount,
            0
          ),
          expenses: expenses.map((expense) => ({
            id: expense._id,
            amount: expense.amount,
            category: expense.category,
            description: expense.description,
            date: expense.date,
          })),
        };
      })
    );

    res.status(200).json({
      message: "Dashboard data fetched successfully.",
      budgets: budgetsWithExpenses,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
