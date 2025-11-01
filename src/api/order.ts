import express from "express";
import { createOrder, getOrder, getUserOrders } from "../application/order";


export const orderRouter = express.Router();
orderRouter.route("/").post(createOrder);
orderRouter.route("/:id").get(getOrder);

//getUserOrders
orderRouter.route("/").get(getUserOrders);
