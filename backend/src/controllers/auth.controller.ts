import { Request, Response } from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword, changePassword } from '../services/auth.service';

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

export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            });
        }

        await forgotPassword(email);

        res.status(200).json({
            message: 'Password reset email sent successfully'
        });

    } catch (error: any) {
        console.error("Forgot Password Error:", error);

        res.status(400).json({
            message: error.message || 'Failed to send password reset email'
        });
    }
};

export const resetUserPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                message: 'Token and new password are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long'
            });
        }

        const result = await resetPassword(token, newPassword);

        res.status(200).json({
            message: 'Password reset successfully',
            ...result
        });

    } catch (error: any) {
        console.error("Reset Password Error:", error);

        res.status(400).json({
            message: error.message || 'Failed to reset password'
        });
    }
};

export const changeUserPassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId; // Provided by auth middleware
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        await changePassword(userId, oldPassword, newPassword);

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to change password' });
    }
};
