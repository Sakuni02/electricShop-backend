import { Request, Response, NextFunction } from "express";
import UnauthorizedError from "../../domain/errors/unauthorized-error";
import { getAuth } from "@clerk/express";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);
    if (!req?.auth) {
        throw new UnauthorizedError("Unauthorized");
    }

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).userId = userId;

    next();
};

export default isAuthenticated;