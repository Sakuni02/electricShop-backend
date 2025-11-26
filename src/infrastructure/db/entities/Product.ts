import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },

    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true,
    },

    colorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
        required: true,
    },

    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    images: {
        type: [String],
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },

    description: {
        type: String,
        required: false,
    },

    specifications: [
        {
            key: { type: String, required: true },
            value: { type: String, required: true },
        },
    ],

    reviews: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Review",
        default: [],
    },
}, { timestamps: true });


const Product = mongoose.model("Product", productSchema);

export default Product;