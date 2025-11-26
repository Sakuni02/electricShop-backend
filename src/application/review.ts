import { Request, Response, NextFunction } from "express";
import Product from "../infrastructure/db/entities/Product";
import Review from "../infrastructure/db/entities/Review"
const createReview = async (req: Request, res: Response, next: NextFunction) => {

    try {
        console.log("BODY DATA:", req.body);
        const data = req.body;
        const review = await Review.create({
            review: data.review,
            rating: data.rating,
            name: data.name,
        });

        const product = await Product.findById(data.productId);
        product.reviews.push(review._id);
        await product.save();

        res.status(201).send();
    } catch (error) {
        next(error);
    }

};

export { createReview };