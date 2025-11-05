import { Request, Response, NextFunction } from "express";
import UnauthorizedError from "../../domain/errors/unauthorized-error";
import { getAuth } from "@clerk/express";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (!req?.auth) {
        throw new UnauthorizedError("Unauthorized");
    }

    next();
};

export default isAuthenticated;