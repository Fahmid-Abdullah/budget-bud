import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Routes
import { userRouter } from "./routes/userRoute.js";
import { expenseRouter } from "./routes/expenseRoute.js";
import { subscriptionRouter } from "./routes/subscriptionRoute.js";
import { dataRouter } from "./routes/dataRoute.js";

// Generating API
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Endpoints
app.use("/auth", userRouter);
app.use("/data", dataRouter);
app.use("/expenses", expenseRouter);
app.use("/subscriptions", subscriptionRouter);

// MongoDB Database
mongoose.connect(process.env.MONGODB_URL);

// Server on PORT 3001
app.listen(3001, () => {
    console.log("Server Intiated Successfully.")
});