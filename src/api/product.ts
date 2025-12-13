import express from "express";
import {
    getAllProducts,
    createProduct,
    getProductById,
    updateProductById,
    deleteProductById,
    uploadProductImage,
    getProductsByCategory,
    getProductsForSearchQuery,
} from "../application/product";
import isAuthenticated from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";

const productRouter = express.Router();

// Search endpoint
productRouter.get("/search", getProductsForSearchQuery);

productRouter
    .route("/")
    .get(getAllProducts)
    .post(isAuthenticated, isAdmin, createProduct);

productRouter
    .route("/:id")
    .get(getProductById)
    .put(updateProductById)
    .delete(deleteProductById);

productRouter
    .route("/images")
    .post(uploadProductImage);


productRouter.route("/shop/:slug").get(getProductsByCategory);


export default productRouter;