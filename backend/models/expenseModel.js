import mongoose from "mongoose";

const ExpenseSchema = mongoose.Schema({
    title: { type: String, required: true },
    cost: { type: Number, required: true },
    userOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true }, // Add month field
    year: { type: String, required: true }, // Add year field
});

export const expenseModel = mongoose.model("expenses", ExpenseSchema);