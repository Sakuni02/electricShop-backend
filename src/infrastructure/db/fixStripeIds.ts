import "dotenv/config";
import mongoose from "mongoose";
import stripe from "../stripe";
import Product from "./entities/Product";

const MONGO_URL = process.env.MONGODB_URL as string;

async function run() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");

    const products = await Product.find({ stripePriceId: { $exists: false } });

    if (products.length === 0) {
        console.log("All products already have stripePriceId");
        process.exit(0);
    }

    for (const product of products) {
        console.log(`Processing: ${product.name}`);

        // create stripe product + price
        const stripeProduct = await stripe.products.create({
            name: product.name,
            description: product.description || "",
            default_price_data: {
                currency: "usd",
                unit_amount: product.price * 100,
            },
            images: product.images,
        });

        // update MongoDB
        product.stripePriceId = stripeProduct.default_price as string;
        await product.save();

        console.log(`Updated ${product.name} → ${stripeProduct.default_price}`);
    }

    console.log("All missing stripePriceId fields have been updated.");
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
