import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

// Check ob secret in .env existiert
if (!secret) {
    throw new Error("ERROR: JWT_SECRET ist nicht in den Umgebungsvariablen definiert!");
}

const JWT_SECRET = secret;

export const generateToken = (userId: number, email: string, role: string) => {
    return jwt.sign(
        { userId, email, role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};