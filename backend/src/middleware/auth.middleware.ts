import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/auth.types';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Kein Token gefunden. Zugriff verweigert.' });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error("FATAL ERROR: JWT_SECRET ist nicht in der .env Datei definiert!");
        return res.status(500).json({ message: 'Server-Konfiguration fehlerhaft.' });
    }

    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token ungültig oder abgelaufen.' });
        }

        req.user = user as any;
        next();
    });
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if ((req as any).user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
};

export const authenticateToken = authenticate;

export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // No token, proceed without user
        return next();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return next();

    jwt.verify(token, secret, (err, user) => {
        if (!err && user) {
            req.user = user as any;
        }
        // If error (invalid token), we also just treat as guest
        next();
    });
};
