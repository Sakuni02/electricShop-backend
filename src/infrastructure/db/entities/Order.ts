import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        require: true,
    },
    quantity: {
        trpe: Number,
        require: true,
    }
});

const OrderSchema = new mongoose.Schema({
    userId: { type: String, require: true },

    items: {
        type: [ItemSchema],
        require: true
    },

    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        require: true,
    },
    orderStatus: {
        type: String,
        enum: ["PENDING", "SHIPPED", "FULFILLED", "CANCELLED"],
        default: "PENDING",
        require: true,
    },

    paymentMethod: {
        type: String,
        enum: ["COD", "CREDIT_CARD"],
        default: "CREDIT_CARD",
        require: true,
    },

    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "REFUNDED"],
        default: "PENDING",
        require: true,
    },

});

const Order = mongoose.model("Order", OrderSchema);

export default Order;