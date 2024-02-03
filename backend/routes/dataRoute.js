import express from 'express';
import axios from 'axios'; // Import axios for making HTTP requests

const router = express.Router();
import { dataModel } from "../models/dataModel.js";
import { userModel } from '../models/userModel.js';

router.post("/getremaining/:userID", async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found. Please provide a valid user ID.' });
        }

        const { month, year } = req.body;

        const balanceUsed = await axios.post(`http://localhost:3001/data/getused/${user._id}`, {
            month,
            year,
        });

        // Calculate the remaining balance by subtracting total used from the user's budget
        const remainingBalance = user.balance - balanceUsed.data.totalUsed;

        res.json({ remainingBalance });
    } catch (err) {
        console.error("Error calculating remaining balance:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/getused/:userID", async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found. Please provide a valid user ID.' });
        }

        const { month, year } = req.body;

        // Fetch all expenses for the specified user, month, and year
        const expensesResponse = await axios.post(`http://localhost:3001/expenses/getexpenses/${user._id}`, {
            month,
            year,
        });

        const expenses = expensesResponse.data; // Assuming expenses is an array of objects

        // Fetch active subscriptions for the specified user, month, and year
        const subscriptionsResponse = await axios.post(`http://localhost:3001/subscriptions/userSubscriptions/${user._id}`, {
            month,
            year,
        });

        const subscriptions = subscriptionsResponse.data; // Assuming subscriptions is an array of objects

        // Calculate the total used by summing up expense costs and subscription costs
        const totalUsed = expenses.reduce((sum, expense) => sum + expense.cost, 0)
            + subscriptions.reduce((sum, subscription) => sum + subscription.cost, 0);

        res.json({ totalUsed });
    } catch (err) {
        console.error("Error calculating total used:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/getallremaining/:userID", async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found. Please provide a valid user ID.' });
        }

        const { year } = req.body;

        // Initialize an array to store the remaining balances for each month
        const allRemainingBalances = [];

        // Loop through each month and call the getused API
        for (let month = 1; month <= 12; month++) {
            const remainingBalance = await axios.post(`http://localhost:3001/data/getremaining/${user._id}`, {
                month: monthToString(month).toString(),
                year,
            });

            allRemainingBalances.push({
                month: monthToString(month), // Convert month number to string (e.g., "January")
                remainingBalance: remainingBalance.data.remainingBalance.toFixed(2),
            });
        }

        res.json({ allRemainingBalances });
    } catch (err) {
        console.error("Error calculating all remaining balances:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/getallused/:userID", async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found. Please provide a valid user ID.' });
        }

        const { year } = req.body;

        // Initialize an array to store the remaining balances for each month
        const allRemainingBalances = [];

        // Loop through each month and call the getused API
        for (let month = 1; month <= 12; month++) {
            const usedBalance = await axios.post(`http://localhost:3001/data/getused/${user._id}`, {
                month: monthToString(month).toString(),
                year,
            });

            allRemainingBalances.push({
                month: monthToString(month), // Convert month number to string (e.g., "January")
                usedBalance: usedBalance.data.totalUsed.toFixed(2),
            });
        }

        res.json({ allRemainingBalances });
    } catch (err) {
        console.error("Error calculating all remaining balances:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Function to convert month number to string
function monthToString(month) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1]; // Adjust index since months array is zero-based
}

export { router as dataRouter };
