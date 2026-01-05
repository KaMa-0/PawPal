import prisma from '../config/prisma';
import { UserType } from '@prisma/client';

export const findUserProfileById = async (userId: number, role: string) => {
    let profileData;

    if (role === 'OWNER') {
        profileData = await prisma.user.findUnique({
            where: { userId },
            include: { petOwner: true }
        });
    } else if (role === 'SITTER') {
        profileData = await prisma.user.findUnique({
            where: { userId },
            include: { petSitter: true }
        });
    } else if (role === 'ADMIN') {
        profileData = await prisma.user.findUnique({
            where: { userId },
            include: { admin: true }
        });
    }

    return profileData;
};