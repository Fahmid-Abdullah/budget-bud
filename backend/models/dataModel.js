import mongoose from "mongoose";

const DataSchema = new mongoose.Schema({
    balanceLeft: { type: Number, required: true, default: 0 },
    balanceUsed: { type: Number, required: true, default: 0 },
    month: { type: String, required: true },
    year: { type: String, required: true },
    expenses: [ { type: mongoose.Schema.Types.ObjectId, ref: "expenses", required: true } ],  // Update the reference to "expenses"
    userOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export const dataModel = mongoose.model("data", DataSchema);
