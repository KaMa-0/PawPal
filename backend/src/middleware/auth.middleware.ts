import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/auth.types';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Kein Token gefunden. Zugriff verweigert.' });
    }

    const secret = process.env.JWT_SECRET;

    // Check, ob Secret in .env definiert ist
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