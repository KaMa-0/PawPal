import { AustriaState, UserType } from '@prisma/client';
import { Request } from 'express';

// Daten für die Registrierung
export interface RegisterData {
    email: string;
    password: string;
    username: string;
    state: AustriaState;
    userType: UserType;
    petTypes: string[];
}

// Daten für den Login
export interface LoginData {
    email: string;
    password: string;
}

// Antwort vom Server (bei Register & Login)
export interface AuthResponse {
    user: {
        id: number;
        email: string;
        username: string;
        role: UserType;
    };
    token: string;
}

// Erweiterter Request für geschützte Routen
export interface AuthRequest extends Request {
    user?: {
        userId: number;
        email: string;
        role: string;
    };
}