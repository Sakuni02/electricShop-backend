import express from "express";
import {
    createProduct,
    getAllProducts,
    deleteProductById,
    getProductById,
    updateProductById,
} from "../application/product";

const productRouter = express.Router();

productRouter.route("/").get(getAllProducts).post(createProduct);

productRouter
    .route("/:id")
    .get(getProductById)
    .put(updateProductById)
    .delete(deleteProductById);

export default productRouter;