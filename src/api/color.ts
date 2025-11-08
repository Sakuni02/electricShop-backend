import express from "express";
import { createColor, deleteColor, getAllColors, getColorById, updateColorById } from "../application/color";

const colorRouter = express.Router();

colorRouter
    .route("/")
    .get(getAllColors)
    .post(createColor);

colorRouter
    .route("/:id")
    .get(getColorById)
    .put(updateColorById)
    .delete(deleteColor);

export default colorRouter;