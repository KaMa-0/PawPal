import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { UserType } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { RegisterData, LoginData, AuthResponse } from '../types/auth.types';
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail } from './email.service';
import crypto from 'crypto';

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

// Forgot Password - Generate Reset Token
export const forgotPassword = async (email: string): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new Error('User with this email not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save hashed token to database
    await prisma.user.update({
        where: { userId: user.userId },
        data: {
            resetToken: resetTokenHash,
            resetTokenExpires,
        },
    });

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);
};

// Reset Password - Verify Token and Update Password
export const resetPassword = async (resetToken: string, newPassword: string): Promise<AuthResponse> => {
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await prisma.user.findFirst({
        where: {
            resetToken: resetTokenHash,
            resetTokenExpires: { gt: new Date() },
        },
    });

    if (!user) {
        throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    const updatedUser = await prisma.user.update({
        where: { userId: user.userId },
        data: {
            passwordHash,
            resetToken: null,
            resetTokenExpires: null,
        },
    });

    // Send success email
    await sendPasswordResetSuccessEmail(updatedUser.email);

    // Generate new token
    const token = generateToken(updatedUser.userId, updatedUser.email, updatedUser.userType);

    return {
        user: {
            id: updatedUser.userId,
            email: updatedUser.email,
            username: updatedUser.username,
            role: updatedUser.userType
        },
        token
    };
};
