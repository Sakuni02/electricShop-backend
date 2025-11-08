import { Response, Request, NextFunction } from "express";
import Brand from "../infrastructure/db/entities/Brand";
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";

const getAllBrands = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const brands = await Brand.find();
        res.json(brands);
    } catch (error) {
        next(error)
    }
};

const createBrand = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newBrand = req.body;
        if (!newBrand.name) {
            throw new ValidationError("Brand name is required");
        }
        await Brand.create(newBrand);
        res.status(201).json(newBrand);
    } catch (error) {
        next(error);
    }
};

const getBrandById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            throw new NotFoundError("Brand not found");
        }

        res.json(brand);
    } catch (error) {
        next(error);
    }
};

const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            throw new NotFoundError("Brand not found");
        }
        res.status(200).json({ message: "Brand delete successfully" });
    } catch (error) {
        next(error);
    }
};

const updateBrandById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        if (!brand) {
            throw new NotFoundError("Brand Not found");
        }
        res.status(200).json(brand);
    } catch (error) {
        next(error);
    }
};

export {
    getAllBrands,
    createBrand,
    getBrandById,
    deleteBrand,
    updateBrandById,
};