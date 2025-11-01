import express from "express";
import isAuthenticated from "./middleware/authentication-middleware";

import {
    createCategory,
    deleteCategoryById,
    getAllCategories,
    getCategoryById,
    updateCategoryById,
} from "../application/category";

const categoryRouter = express.Router();

categoryRouter.route("/").get(getAllCategories).post(isAuthenticated, createCategory);

categoryRouter
    .route("/:id")
    .get(getCategoryById)
    .put(updateCategoryById)
    .delete(deleteCategoryById);

export default categoryRouter;