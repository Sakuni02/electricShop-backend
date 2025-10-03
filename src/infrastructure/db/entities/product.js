import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        name: {
            type: String,
            require: true,
        },

        price: {
            type: Number,
            require: true,
        },

        image: {
            type: String,
            require: true,
        },

        reviews: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Review",
            default: [],
        },

    });

const Product = mongoose.model("Product", productSchema);
export default Product;