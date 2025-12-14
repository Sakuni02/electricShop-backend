import { Request, Response } from "express";
import util from "util";
import Order from "../infrastructure/db/entities/Order";
import stripe from "../infrastructure/stripe";
import Product from "../infrastructure/db/entities/Product";
import Cart from "../infrastructure/db/entities/Cart";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

interface Product {
    _id: string;
    stock: number;
    stripePriceId: string;
    name: string;
}

async function fulfillCheckout(sessionId: string) {
    console.log("Fulfilling Checkout Session", sessionId);

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
    });
    console.log("Payment status:", checkoutSession.payment_status);

    if (checkoutSession.payment_status !== "paid") return;

    const order = await Order.findById(checkoutSession.metadata?.orderId).populate("items.productId");
    if (!order) throw new Error("Order not found");

    console.log("Order found:", order._id);

    if (order.paymentStatus !== "PENDING") return;

    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId._id, { $inc: { stock: -item.quantity } });
        console.log(`Reduced stock of ${item.productId._id} by ${item.quantity}`);
    }

    await Order.findByIdAndUpdate(order._id, { paymentStatus: "PAID", orderStatus: "FULFILLED" });
    console.log("Order updated to PAID & FULFILLED");

    const cartUpdate = await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });
    console.log("Cart cleared:", cartUpdate);
}


export const handleWebhook = async (req: Request, res: Response) => {
    console.log("Webhook received"); // <-- test this
    const payload = req.body;
    const sig = req.headers["stripe-signature"] as string;

    try {
        const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        console.log("Event type:", event.type); // <-- test this

        if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
        ) {
            await fulfillCheckout(event.data.object.id);
        }

        res.status(200).send();
    } catch (err) {
        // @ts-ignore
        console.error(err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
    const orderId = req.body.orderId;
    console.log("body", req.body);
    const order = await Order.findById(orderId).populate<{
        items: { productId: Product; quantity: number }[];
    }>("items.productId");

    if (!order) {
        throw new Error("Order not found");
    }
    const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: order.items.map((item) => ({
            price: item.productId.stripePriceId,
            quantity: item.quantity,
        })),
        mode: "payment",
        return_url: `${FRONTEND_URL}/shop/complete?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
            orderId: req.body.orderId,
        },
    });

    res.send({ clientSecret: session.client_secret });
};


export const retrieveSessionStatus = async (req: Request, res: Response) => {
    const checkoutSession = await stripe.checkout.sessions.retrieve(
        req.query.session_id as string
    );

    const order = await Order.findById(checkoutSession.metadata?.orderId).populate("items.productId");
    if (!order) {
        throw new Error("Order not found");
    }

    const purchasedProducts = order.items.map(item => ({
        name: item.productId.name,
        price: item.productId.price,
        image: item.productId.images?.[0] || "",
        quantity: item.quantity
    }))

    const subtotal = purchasedProducts.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    const shipping = 0;
    const total = subtotal + shipping;

    res.status(200).json({
        orderId: order._id,
        status: checkoutSession.status,
        customer_email: checkoutSession.customer_details?.email,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        purchasedProducts,
        totals: { subtotal, shipping, total }
    });
};