import Product from "../infrastructure/db/entities/Product";
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";

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
            const products = await Product.find({ categoryId });
            res.json(products);
        } else {
            const products = await Product.find();
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
        const result = CreateProductDTO.safeParse(req.body);
        if (!result.success) {
            throw new ValidationError(result.error.message);
        }

        await Product.create(result.data);
        res.status(201).send();
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


// const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const body = req.body;
//         const { fileType } = body;

//         const id = randomUUID();

//         const url = await getSignedUrl(
//             S3,
//             new PutObjectCommand({
//                 Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
//                 Key: id,
//                 ContentType: fileType,
//             }),
//             {
//                 expiresIn: 60,
//             }
//         );

//         res.status(200)
//             .json({
//                 url,
//                 publicURL: `${process.env.CLOUDFLARE_PUBLIC_DOMAIN}/${id}`,
//             });

//     } catch (error) {
//         next(error);
//     }
// };


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

        const category = await Category.findOne({ slug });

        if (!category) {
            throw new NotFoundError("Category not found");
        }

        const products = await Product.find({ categoryId: category._id })
            .populate("categoryId", "name slug");

        res.status(200).json(products);

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

};