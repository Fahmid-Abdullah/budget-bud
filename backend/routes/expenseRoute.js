import express from 'express';
import { expenseModel } from "../models/expenseModel.js";
import { userModel } from "../models/userModel.js";
import { dataModel } from "../models/dataModel.js";
import { verifyToken } from './userRoute.js';

const router = express.Router();

router.post("/getexpenses/:userID", async (req, res) => {
    try {
        const month = req.body.month;
        const year = req.body.year;

        // Find the user
        const user = await userModel.findById(req.params.userID);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find data for the specified month and year
        const foundExpenses = await dataModel.findOne({ month, year, userOwner: user._id });

        if (foundExpenses) {
            // If data exists, retrieve the associated expenses
            const expensesData = await expenseModel.find({ _id: { $in: foundExpenses.expenses } });
            res.json(expensesData);
        } else {
            res.json([]); // No expenses found for the specified criteria
        }
    } catch (err) {
        console.error("Error fetching expenses:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/newexpense", verifyToken,  async (req, res) => {
    try {
        // Find the user
        const user = await userModel.findById(req.body.userID);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Create an expense instance
        const expense = new expenseModel({
            title: req.body.title,
            cost: req.body.cost,
            userOwner: user._id,
            month: req.body.month,
            year: req.body.year,
        });

        // Save the expense
        const savedExpense = await expense.save();

        // Find data for the specified month and year
        const foundData = await dataModel.findOne({ month: expense.month, year: expense.year, userOwner: user._id });

        if (foundData) {
            // If data exists, add the new expense to it
            foundData.expenses.push(savedExpense._id);
            await foundData.save();
        } else {
            // If data doesn't exist, create a new Data element and add the expense
            const newData = await dataModel.create({
                month: expense.month,
                year: expense.year,
                expenses: [savedExpense._id],
                userOwner: user._id,
            });

            user.data.push(newData._id);
            await user.save();
        }

        res.status(201).json({ message: "Expense added successfully" });
    } catch (err) {
        console.error("Error adding expense:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/removeexpense/:userID/:expenseID", verifyToken, async (req, res) => {
    try {
        // Find the user
        const user = await userModel.findById(req.params.userID);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find the expense
        const expense = await expenseModel.findById(req.params.expenseID);

        // Check if the expense exists
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }

        // Find data for the specified month and year
        const foundData = await dataModel.findOne({
            month: expense.month,
            year: expense.year,
            userOwner: user._id
        });

        if (foundData) {
            // If data exists, remove the expense ID from it
            foundData.expenses = foundData.expenses.filter(id => id.toString() !== expense._id.toString());
            await foundData.save();
        }

        // Now, remove the expense document itself
        await expenseModel.deleteOne({ _id: req.params.expenseID });

        res.json({ message: "Expense removed successfully" });
    } catch (err) {
        console.error("Error removing expense:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


export { router as expenseRouter };
