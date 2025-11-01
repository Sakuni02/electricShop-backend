import { Request, Response, NextFunction } from "express";
import UnauthorizedError from "../../domain/errors/unauthorized-error";

const isAuthenticated = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const isUserLoggedIn = false;
    if (!isUserLoggedIn) {
        throw new UnauthorizedError("Unauthorized");
    } else {
        next();
    }
};

export default isAuthenticated;