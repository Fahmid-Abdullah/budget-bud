import express from 'express';
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { userModel } from "../models/userModel.js";
import { expenseModel } from '../models/expenseModel.js';
dotenv.config();

const router = express.Router();

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        jwt.verify(authHeader, process.env.SECRET_WEB_TOKEN, (err) => {
            if (err) {
                return res.sendStatus(403);
            }
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Register
router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const user = await userModel.findOne( { email } );
    
    if (user) return res.status(400).json( { message: "Email Address Already in Use." } );

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel( { firstName, lastName, email, password: hashedPassword } );
    await newUser.save();
    res.json( { message: "User Registered Successfully." } );
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne( { email } );

    if (!user) {
        return res
            .status(400)
            .json( { message: "Username and/or Password Incorrect." } );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res
            .status(400)
            .json( { message: "Username and/or Password Incorrect." } );
    }

    const token = jwt.sign( { id: user._id }, process.env.SECRET_WEB_TOKEN );
    res.json( { token, userID: user._id } );
});

// Profile
router.get("/profile/:userID", async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userID);

        // Check if user exists
        if (user) {
            // Create JSON response using parentheses
            res.json({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            });
        } else {
            res.status(404).json({ error: 'User Not found.' });
        }
    } catch (err) {
        res.status(500).json( err );
    }
});

// Get Budget
router.get("/balance/:userID", verifyToken, async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userID);
        
        if (user) {
            res.json({ balance: user.balance }); // Assuming the user model has a 'balance' field
        } else {
            res.status(404).json({ error: 'User Not found.' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Budget
router.put("/balance/:userID", verifyToken, async (req, res) => {
    try {
        const { balance } = req.body;
        const user = await userModel.findById(req.params.userID);
        if (user) {
            user.balance = balance;
            await user.save();
            res.json({ message: 'Budget updated successfully' });
        } else {
            res.status(404).json({ error: 'User Not found.' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post("/saveexpense/:userID", async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found. Please provide a valid user ID.' });
        }

        const expenseToSave = req.body.expense;  // Assuming the request body contains { expense: 'Groceries' }
        

        // Check if the expense is already in the array
        const isExpenseAlreadySaved = user.savedExpenses.includes(expenseToSave);

        if (!isExpenseAlreadySaved) {
            // Push the expense name into user.savedExpenses
            user.savedExpenses.push(expenseToSave);
            await user.save();
            return res.json({ message: 'Expense saved successfully' });
        } else {
            return res.json({ message: 'Expense already exists in saved expenses' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving Expense' });
    }
});

router.get("/getsaved/:userID", async (req, res) => {
    try {
        // Logic to get an array of saved expenses
        const user = await userModel.findById(req.params.userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found. Please provide a valid user ID.' });
        }

        res.json( { savedExpenses: user.savedExpenses } );
    } catch (err) {
        res.status(500).json("Error getting saved expenses.");
    }
})

export { router as userRouter };

