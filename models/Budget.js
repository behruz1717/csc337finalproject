const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
  username: { type: String, ref: "User", required: true },
  name: { type: String, required: true },
  goalAmount: { type: Number, required: true },
  archived: { type: Boolean, default: false }, // Add the archived field
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Budget", BudgetSchema);
