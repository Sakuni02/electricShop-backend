import { Request, Response, NextFunction } from "express";
import Address from "../infrastructure/db/entities/Address";
import Order from "../infrastructure/db/entities/Order";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import { getAuth } from "@clerk/express";
import { email } from "zod";
import { users } from "@clerk/clerk-sdk-node";
import { Types } from "mongoose";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const { userId } = getAuth(req);

        const address = await Address.create(data.shippingAddress);
        const order = await Order.create({
            addressId: address._id,
            items: data.orderItems,
            userId: userId,
        });

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

const getOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError("Order Not found");
        }

        if (order.userId !== userId) {
            throw new UnauthorizedError("Unauthorized")
        }
        res.status(200).json(order);

    } catch (error) {
        next(error);
    }
};

const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        const orders = await Order.find({ userId }).populate("addressId");

        if (!orders || orders.length === 0) {
            throw new NotFoundError("No orders found for this user");
        }

        res.status(200).json(orders);

    } catch (error) {
        next(error);

    }
};

interface AddressDoc {
    _id: Types.ObjectId;
    line_1: string;
    line_2?: string;
    city: string;
    phone: string;
}

// const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const orders = await Order.find().populate("addressId")
//             .populate("items.productId");
//         const ordersWithUser = await Promise.all(
//             orders.map(async (order) => {
//                 let userInfo = { fullName: "N/A", email: "N/A" };
//                 try {
//                     const user = await users.getUser(order.userId);
//                     userInfo = {
//                         fullName: `${user.firstName} ${user.lastName || ""}`,
//                         email: user.emailAddresses[0].emailAddress,
//                     };
//                 } catch (err) {
//                     console.log(`Clerk user ${order.userId} not found`);

//                 }

//                 const addressInfo = order.addressId ? {
//                     line_1: order.addressId.line_1,
//                     line_2: order.addressId.line_2 || "",
//                     city: order.addressId.city,
//                     phone: order.addressId.phone,
//                 } : null

//                 return {
//                     ...order.toObject(), user: userInfo,
//                     address: addressInfo,
//                 };

//             })
//         );
//         res.status(200).json(ordersWithUser);
//     } catch (err) {
//         console.log(err);
//     }
// };

const getAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const orders = await Order.find()
            .populate("addressId")
            .populate("items.productId");

        const ordersWithUser = await Promise.all(
            orders.map(async (order) => {
                // ---- Clerk user ----
                let userInfo = { fullName: "N/A", email: "N/A" };

                try {
                    const user = await users.getUser(order.userId);
                    userInfo = {
                        fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
                        email: user.emailAddresses[0]?.emailAddress ?? "N/A",
                    };
                } catch {
                    console.log(`Clerk user ${order.userId} not found`);
                }

                // ---- Address (SAFE populate handling) ----
                let addressInfo: {
                    line_1: string;
                    line_2: string;
                    city: string;
                    phone: string;
                } | null = null;

                if (
                    order.addressId &&
                    !(order.addressId instanceof Types.ObjectId)
                ) {
                    const address = order.addressId as AddressDoc;

                    addressInfo = {
                        line_1: address.line_1,
                        line_2: address.line_2 ?? "",
                        city: address.city,
                        phone: address.phone,
                    };
                }

                return {
                    ...order.toObject(),
                    user: userInfo,
                    address: addressInfo,
                };
            })
        );

        res.status(200).json(ordersWithUser);
    } catch (err) {
        next(err);
    }
};


export { createOrder, getOrder, getUserOrders, getAllOrders };