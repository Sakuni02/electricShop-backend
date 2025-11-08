import { Response, Request, NextFunction } from "express";
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
import Color from "../infrastructure/db/entities/Color";

const getAllColors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const colors = await Color.find();
        res.json(colors);
    } catch (error) {
        next(error)
    }
};

const createColor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newColor = req.body;
        if (!newColor.name) {
            throw new ValidationError("Color name is required");
        }
        await Color.create(newColor);
        res.status(201).json(newColor);
    } catch (error) {
        next(error);
    }
};

const getColorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const color = await Color.findById(req.params.id);
        if (!color) {
            throw new NotFoundError("Color not found");
        }

        res.json(color);
    } catch (error) {
        next(error);
    }
};

const deleteColor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const color = await Color.findByIdAndDelete(req.params.id);
        if (!color) {
            throw new NotFoundError("Color not found");
        }
        res.status(200).json({ message: "Color delete successfully" });
    } catch (error) {
        next(error);
    }
};

const updateColorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const color = await Color.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        if (!color) {
            throw new NotFoundError("Color Not found");
        }
        res.status(200).json(color);
    } catch (error) {
        next(error);
    }
};

export {
    getAllColors,
    createColor,
    getColorById,
    deleteColor,
    updateColorById,
};