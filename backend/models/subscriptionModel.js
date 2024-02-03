import mongoose from "mongoose";

const SubscriptionSchema = mongoose.Schema({
    title: { type: String, required: true },
    cost: { type: Number, required: true },
    monthAdded: { type: Number, required: true },
    yearAdded: { type: Number, required: true },
    monthRemoved: { type: Number, default: null },
    yearRemoved: { type: Number, default: null },
    userOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
});

export const subscriptionModel = mongoose.model("subscriptions", SubscriptionSchema);