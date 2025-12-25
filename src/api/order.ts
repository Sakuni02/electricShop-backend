import express from "express";
import { createOrder, getAllOrders, getOrder, getSalesDashboard, getUserOrders } from "../application/order";
import isAuthenticated from "./middleware/authentication-middleware";


export const orderRouter = express.Router();
// admin route first
orderRouter.route("/admin").get(getAllOrders);

// user route second
orderRouter.route("/").get(getUserOrders);

// create order
orderRouter.route("/").post(isAuthenticated, createOrder);

// get single order
orderRouter.route("/:id").get(getOrder);

orderRouter.get("/admin/sales", getSalesDashboard);

