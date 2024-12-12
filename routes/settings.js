const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// Update Username
router.put("/update-username", async (req, res) => {
  const { currentUsername, newUsername } = req.body;

  if (!currentUsername || !newUsername) {
    return res
      .status(400)
      .json({ message: "Current and new usernames are required." });
  }

  try {
    // Update the user's username
    const updatedUser = await User.findOneAndUpdate(
      { username: currentUsername },
      { username: newUsername },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update related data in the Budget and Expense collections
    await Budget.updateMany(
      { username: currentUsername },
      { username: newUsername }
    );
    await Expense.updateMany(
      { username: currentUsername },
      { username: newUsername }
    );

    res
      .status(200)
      .json({ message: "Username updated successfully.", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Delete Account
router.delete("/delete-account", async (req, res) => {
  const { currentUsername } = req.body;

  if (!currentUsername) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    // Delete related budgets and expenses
    await Budget.deleteMany({ username: currentUsername });
    await Expense.deleteMany({ username: currentUsername });

    // Delete the user
    const deletedUser = await User.findOneAndDelete({
      username: currentUsername,
    });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

module.exports = router;
