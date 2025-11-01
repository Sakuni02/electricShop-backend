import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    line_1: { type: String, require: true },
    line_2: { type: String },
    city: { type: String, require: true },
    phone: { type: String, require: true },
});

export default mongoose.model("Address", addressSchema);