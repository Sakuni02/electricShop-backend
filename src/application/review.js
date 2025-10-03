import Product from "../infrastructure/db/entities/product.js";
import Review from "../infrastructure/db/entities/review.js"
const createReview = async (req, res) => {

    try {
        const data = req.body;
        const review = await Review.create({
            review: data.review,
            rating: data.rating,
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