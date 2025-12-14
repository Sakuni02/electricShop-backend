import "dotenv/config";
import express from "express";
import productRouter from "./api/product";
import categoryRouter from "./api/category";
import { connectDB } from "./infrastructure/db/index";
import reviewRouter from "./api/review";
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";
import cors from "cors";
import { orderRouter } from "./api/order";
import { clerkMiddleware } from '@clerk/express'
import brandRouter from "./api/brand";
import colorRouter from "./api/color";
import bodyParser from "body-parser";
import { handleWebhook } from "./application/payment";
import { paymentsRouter } from "./api/payment";
import { cartRouter } from "./api/cart";

const app = express();

app.post(
    "/api/stripe/webhook",
    bodyParser.raw({ type: "application/json" }),
    handleWebhook
);


app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(clerkMiddleware());


app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/review", reviewRouter);
app.use("/api/orders", orderRouter);
app.use("/api/brands", brandRouter);
app.use("/api/colors", colorRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/cart", cartRouter);

app.use(globalErrorHandlingMiddleware);

connectDB();

app.listen(8000, () => {
    console.log("Server running on port 8000");
});
