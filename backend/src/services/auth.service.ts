import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { UserType } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { RegisterData, LoginData, AuthResponse } from '../types/auth.types';

const SALT_ROUNDS = 10;

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
    const { email, password, username, state, userType, petTypes } = data;

    // 1. Email Check
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email already exists');

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Transaktion
    const result = await prisma.$transaction(async (tx) => {

        // A. User erstellen
        const newUser = await tx.user.create({
            data: {
                email,
                passwordHash,
                username,
                state,
                userType,
            },
        });

        // B. Spezifischen Eintrag je nach Rolle erstellen
        if (userType === UserType.OWNER) {
            await tx.petOwner.create({
                data: {
                    userId: newUser.userId,
                    petTypes: petTypes || [], // Fallback auf leeres Array, falls undefined
                },
            });
        } else if (userType === UserType.SITTER) {
            await tx.petSitter.create({
                data: {
                    userId: newUser.userId,
                    petTypes: petTypes || [],
                },
            });
        } else if (userType === UserType.ADMIN) {
            await tx.admin.create({
                data: {
                    userId: newUser.userId,
                },
            });
        }

        return newUser;
    });

    // 4. Token generieren
    const token = generateToken(result.userId, result.email, result.userType);

    return {
        user: {
            id: result.userId,
            email: result.email,
            username: result.username,
            role: result.userType
        },
        token
    };
};

export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
    const { email, password } = data;

    // 1. User in der Datenbank suchen
    const user = await prisma.user.findUnique({ where: { email } });

    // Wenn User nicht gefunden wird -> Fehler
    if (!user) {
        throw new Error('Email oder Passwort falsch');
    }

    // 2. Passwort prüfen (Vergleich: Eingegebenes PW vs. Hash in DB)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new Error('Email oder Passwort falsch');
    }

    // 3. Token generieren
    const token = generateToken(user.userId, user.email, user.userType);

    return {
        user: {
            id: user.userId,
            email: user.email,
            username: user.username,
            role: user.userType
        },
        token
    };
};