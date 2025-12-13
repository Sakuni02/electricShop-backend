import Product from "../infrastructure/db/entities/Product";
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
import stripe from "../infrastructure/stripe";
import { Request, Response, NextFunction } from "express";
import { CreateProductDTO } from "../domain/dto/product";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import S3 from "../infrastructure/s3";
import Category from "../infrastructure/db/entities/Category";

const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryId = req.query.categoryId;
        if (categoryId) {
            const products = await Product.find({ categoryId }).populate("reviews", "name rating");
            res.json(products);
        } else {
            const products = await Product.find().populate("reviews", "name rating");;
            res.json(products);
        }
    } catch (error) {
        next(error);
    }
};

const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = req.body;

        const result = CreateProductDTO.safeParse(req.body);
        if (!result.success) {
            throw new ValidationError(result.error.message);
        }

        //create product in stripe
        const stripeProduct = await stripe.products.create({
            name: data.name,
            description: data.description || "",
            default_price_data: {
                currency: "usd",
                unit_amount: data.price * 100,
            },
            images: data.images,
        });

        // Save product to MongoDB with stripePriceId auto-filled
        const savedProduct = await Product.create({
            ...result.data,
            stripePriceId: stripeProduct.default_price,
        });

        res.status(201).json(savedProduct);
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findById(req.params.id).populate("reviews").populate("colorId");
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
};

const updateProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

const deleteProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            throw new NotFoundError("Product not found");
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }
};


const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileTypes } = req.body; // Expect an array: ["image/png", "image/jpeg"]

        if (!Array.isArray(fileTypes) || fileTypes.length === 0) {
            return res.status(400).json({ message: "fileTypes must be a non-empty array" });
        }

        const uploads = await Promise.all(
            fileTypes.map(async (fileType) => {
                const id = randomUUID();

                const url = await getSignedUrl(
                    S3,
                    new PutObjectCommand({
                        Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
                        Key: id,
                        ContentType: fileType,
                    }),
                    { expiresIn: 60 }
                );

                return {
                    url,
                    publicURL: `${process.env.CLOUDFLARE_PUBLIC_DOMAIN}/${id}`,
                };
            })
        );

        res.status(200).json({ uploads });
    } catch (error) {
        next(error);
    }
};


const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { colorId, minPrice, maxPrice } = req.query;

        const category = await Category.findOne({ slug });

        if (!category) {
            throw new NotFoundError("Category not found");
        }

        const filter: any = {
            categoryId: category._id,
        };

        // Color filter
        if (colorId) {
            filter.colorId = colorId;
        }

        // Price range filter
        if (maxPrice) {
            filter.price = filter.price || {};
            filter.price.$lte = Number(maxPrice);
        }


        const products = await Product.find(filter)
            .populate("categoryId", "name slug")
            .populate("colorId", "name slug hex");

        res.status(200).json(products);

    } catch (error) {
        next(error);
    }
};

const getProductsForSearchQuery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search } = req.query;
        const results = await Product.aggregate([
            {
                $search: {
                    index: "default",
                    autocomplete: {
                        path: "name",
                        query: search,
                        tokenOrder: "any",
                        fuzzy: {
                            maxEdits: 1,
                            prefixLength: 2,
                            maxExpansions: 256,
                        },
                    },
                    highlight: {
                        path: "name",
                    },
                },
            },
        ]);
        res.json(results);
    } catch (error) {
        next(error);
    }
};



export {
    createProduct,
    deleteProductById,
    getAllProducts,
    getProductById,
    updateProductById,
    uploadProductImage,
    getProductsByCategory,
    getProductsForSearchQuery
};