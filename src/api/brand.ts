import express from "express";
import { createBrand, getAllBrands, getBrandById, updateBrandById } from "../application/brand";
import { deleteCategoryById } from "../application/category";

const brandRouter = express.Router();

brandRouter
    .route("/")
    .get(getAllBrands)
    .post(createBrand);

brandRouter
    .route("/:id")
    .get(getBrandById)
    .put(updateBrandById)
    .delete(deleteCategoryById);

export default brandRouter;