import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, required: true, default: 50 },
    savedExpenses: [{ type: String }],
    data: [{ type: mongoose.Schema.Types.ObjectId, ref: "Data"}],
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subscription"}],
});

export const userModel = mongoose.model("users", UserSchema);