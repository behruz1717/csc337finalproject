const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Budget",
    required: true,
  },
  username: { type: String, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String },
});

module.exports = mongoose.model("Expense", ExpenseSchema);
