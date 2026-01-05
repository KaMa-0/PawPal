import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
    try {
        // 1. Daten aus dem Body der Anfrage holen
        const userData = req.body;

        // 2. Den registerUser-Service aufrufen
        const result = await registerUser(userData);

        // 3. Erfolgreiche Registrierung rückmelden (201 = Created)
        res.status(201).json(result);

    } catch (error: any) {
        console.error("Registration Error:", error);

        // 400 = Bad Request
        res.status(400).json({
            message: error.message || 'Registration failed'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const loginData = req.body;

        // Service aufrufen
        const result = await loginUser(loginData);

        // Erfolg: 200 OK
        res.status(200).json(result);

    } catch (error: any) {
        // 401 = Unauthorized (Zugriff verweigert)
        res.status(401).json({
            message: error.message || 'Login fehlgeschlagen'
        });
    }
};