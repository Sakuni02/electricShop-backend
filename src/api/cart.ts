import express from "express";
import isAuthenticated from "./middleware/authentication-middleware";
import {
    getCart,
    addToCart,
    updateQuantity,
    removeItem,
} from "../application/cart";

export const cartRouter = express.Router();

cartRouter.get("/", isAuthenticated, getCart);
cartRouter.post("/add", isAuthenticated, addToCart);
cartRouter.put("/quantity", isAuthenticated, updateQuantity);
cartRouter.delete("/remove", isAuthenticated, removeItem);

