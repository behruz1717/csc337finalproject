const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// Add a new expense
router.post("/", async (req, res) => {
  const { username, budgetId, amount, category, description } = req.body;

  if (!username || !budgetId || !amount || !category) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newExpense = new Expense({
      budgetId,
      username,
      amount,
      category,
      description,
    });

    await newExpense.save();
    res
      .status(201)
      .json({ message: "Expense added successfully.", expense: newExpense });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Update an expense
router.put("/:id", async (req, res) => {
  const { amount, category, description } = req.body;

  // Validate required fields
  if (!amount || !category) {
    return res
      .status(400)
      .json({ message: "Amount and category are required." });
  }

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { amount, category, description },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    res.status(200).json({
      message: "Expense updated successfully.",
      expense: updatedExpense,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Delete an expense
router.delete("/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    res.status(200).json({ message: "Expense deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
