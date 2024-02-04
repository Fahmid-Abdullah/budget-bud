import express from 'express';
import { subscriptionModel } from "../models/subscriptionModel.js";
import { userModel } from '../models/userModel.js';
import { verifyToken } from './userRoute.js';

const router = express.Router();

router.post("/newsubscription", verifyToken, async (req, res) => {
        try {
            // Find the user by ID
            const user = await userModel.findById(req.body.userID);

            // Check if the user exists
            if (!user) {
                return res.status(404).json({ error: "User not found. Please provide a valid user ID." });
            }

            const subscription = new subscriptionModel({
                title: req.body.title,
                cost: req.body.cost,
                monthAdded: monthNameToNumber(req.body.monthAdded),
                yearAdded: parseInt(req.body.yearAdded),
                userOwner: user._id,
            });

            // Save Subscription
            const saveSubscription = await subscription.save();

            // Send a success response with the saved subscription details
            res.status(201).json({ message: "Subscription added successfully", subscription: saveSubscription });
        } catch (err) {
            console.error("Error adding subscription:", err);
            res.status(500).json({ error: "Internal server error. Please try again later." });
        }
    }
);

router.put("/removesubscription/:userID", verifyToken, async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userID);

        if (user) {
            const { title, monthRemoved, yearRemoved } = req.body;
            const monthRemovedInt = monthNameToNumber(monthRemoved);
            const yearRemovedInt = parseInt(yearRemoved);

            // Find the subscription for the specified user and title
            const subscription = await subscriptionModel.findOne({
                userOwner: user._id,
                title: title
            });

            if (subscription) {
                // Update subscription details
                subscription.monthRemoved = monthRemovedInt;
                subscription.yearRemoved = yearRemovedInt;

                await subscription.save();
                res.json({ message: 'Subscription Ended Successfully.' });
            } else {
                console.log("TEST: " + title);
                res.status(404).json({ error: `Subscription not found for the user with title: ${title}.` });
            }
        } else {
            res.status(404).json({ error: 'User not found. Please provide a valid user ID.' });
        }
    } catch (err) {
        console.error("Error updating subscription:", err);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
});

router.post("/userSubscriptions/:userID", async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found. Please provide a valid user ID.' });
        }

        const month = req.body.month;
        const year = req.body.year;

        const targetMonth = monthNameToNumber(month);
        const targetYear = parseInt(year);

        const activeSubscriptions = await subscriptionModel.find({
            userOwner: user._id,
            monthAdded: { $lte: targetMonth },
            yearAdded: { $lte: targetYear },
            $or: [{
                 $and: [{ monthRemoved: null },
                        { yearRemoved: null }
                    ] },
                { 
                $and: [{ monthRemoved: { $gt: targetMonth } },
                       { yearRemoved: { $gte: targetYear } }
                ] }
            ]
        });

        res.json( activeSubscriptions );
    } catch (err) {
        console.error("Error fetching user subscriptions:", err);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
});

// Helper to convert month to int
function monthNameToNumber(monthName) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthNumber = months.indexOf(monthName);

    // Adding 1 to convert 0-based index to 1-based month numbers
    return monthNumber !== -1 ? monthNumber + 1 : NaN;
}

export { router as subscriptionRouter };