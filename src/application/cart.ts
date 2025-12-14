import { Request, Response, NextFunction } from "express";
import Cart from "../infrastructure/db/entities/Cart";
import { getAuth } from "@clerk/express";

const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);

        let cart = await Cart.findOne({ userId }).populate("items.product");

        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        res.json(cart);
    } catch (err) {
        next(err);
    }
};

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        const { productId } = req.body;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        const existingItem = cart.items.find((i: any) => i.product.toString() === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({ product: productId, quantity: 1 });
        }

        await cart.save();

        const populatedCart = await cart.populate("items.product");

        res.json(populatedCart);
    } catch (err) {
        next(err);
    }
};

const updateQuantity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({ userId });

        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const item = cart.items.find((i: any) => i.product.toString() === productId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        item.quantity = quantity;

        await cart.save();
        const populatedCart = await cart.populate("items.product");

        res.json(populatedCart);
    } catch (err) {
        next(err);
    }
};

// const removeItem = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { userId } = getAuth(req);
//         const { productId } = req.body;

//         const cart = await Cart.findOne({ userId });

//         if (!cart) return res.status(404).json({ message: "Cart not found" });

//         cart.items = cart.items.filter((i: any) => i.product.toString() !== productId);

//         await cart.save();
//         const populatedCart = await cart.populate("items.product");

//         res.json(populatedCart);
//     } catch (err) {
//         next(err);
//     }
// };


const removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);
        const { productId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items.pull({ product: productId });

        await cart.save();

        const populatedCart = await cart.populate("items.product");
        res.json(populatedCart);
    } catch (err) {
        next(err);
    }
};


export {
    getCart,
    addToCart,
    updateQuantity,
    removeItem,

};
