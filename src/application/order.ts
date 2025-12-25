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
            .populate({
                path: "items.productId",
                select: "name price images colorId",
                populate: {
                    path: "colorId",
                    select: "name hex",
                },
            })
            .populate("addressId");

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

const getSalesDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const now = new Date();
        // Last 7 days
        const last7Days = new Date();
        last7Days.setDate(now.getDate() - 7);

        // Last 30 days
        const last30Days = new Date();
        last30Days.setDate(now.getDate() - 30);

        // Fetch orders for 30 days (this also covers last 7 days)
        const orders = await Order.find({
            createdAt: { $gte: last30Days },
        }).populate({
            path: "items.productId",
            select: "price",
        });

        let totalSales = 0;
        let totalOrders = orders.length;

        const dailyOrders7: Record<string, number> = {};
        const dailyOrders30: Record<string, number> = {};

        orders.forEach((order) => {
            let orderTotal = 0;
            order.items.forEach((item: any) => {
                const price = item.productId?.price ?? 0;
                orderTotal += price * item.quantity;
            });

            totalSales += orderTotal;
            totalOrders += 1;

            const dateKey = order.createdAt.toISOString().split("T")[0];
            // Add to 30-day data
            dailyOrders30[dateKey] = (dailyOrders30[dateKey] || 0) + 1;
            if (order.createdAt >= last7Days) {
                dailyOrders7[dateKey] = (dailyOrders7[dateKey] || 0) + 1;
            }
        });

        const avgOrderValue = totalOrders === 0 ? 0 : totalSales / totalOrders;

        res.status(200).json({
            totalSales, totalOrders, avgOrderValue, dailyOrders: dailyOrders7, dailyOrders30,
        });

    } catch (error) {
        next(error);
    }
};


export { createOrder, getOrder, getUserOrders, getAllOrders, getSalesDashboard };