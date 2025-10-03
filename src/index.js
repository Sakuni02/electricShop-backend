import "dotenv/config";
import express from "express";
import productRouter from "./api/product.js";
import categoryRouter from "./api/category.js";
import { connectDB } from "./infrastructure/db/index.js";
import reviewRouter from "./api/review.js";
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware.js";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/review", reviewRouter)

app.use(globalErrorHandlingMiddleware);

connectDB();

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



