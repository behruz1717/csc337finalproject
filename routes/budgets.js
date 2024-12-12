const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// Create a new budget
router.post("/", async (req, res) => {
  const { username, name, goalAmount } = req.body;

  if (!username || !name || !goalAmount) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newBudget = new Budget({ username, name, goalAmount });
    await newBudget.save();
    res
      .status(201)
      .json({ message: "Budget created successfully.", budget: newBudget });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Update a budget
router.put("/:id", async (req, res) => {
  const { name, goalAmount, archived } = req.body;

  // Validate inputs for name and goalAmount when provided
  if (!archived && (!name || !goalAmount)) {
    return res
      .status(400)
      .json({ message: "Name and goal amount are required." });
  }

  try {
    // Construct update object dynamically
    const updateData = {};
    if (name) updateData.name = name;
    if (goalAmount !== undefined) updateData.goalAmount = goalAmount;
    if (archived !== undefined) updateData.archived = archived;

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedBudget) {
      return res.status(404).json({ message: "Budget not found." });
    }

    res.status(200).json({
      message: "Budget updated successfully.",
      budget: updatedBudget,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Delete a budget
router.delete("/:id", async (req, res) => {
  try {
    const deletedBudget = await Budget.findByIdAndDelete(req.params.id);

    if (!deletedBudget) {
      return res.status(404).json({ message: "Budget not found." });
    }

    // Remove associated expenses
    await Expense.deleteMany({ budgetId: req.params.id });

    res.status(200).json({ message: "Budget deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

router.get("/getArchived", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    const archivedBudgets = await Budget.find({ username, archived: true });
    res.status(200).json({
      message: "Archived budgets fetched successfully.",
      budgets: archivedBudgets,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id).lean();
    if (!budget) {
      return res.status(404).json({ message: "Budget not found." });
    }

    const expenses = await Expense.find({ budgetId: budget._id }).lean();
    budget.expenses = expenses;

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
