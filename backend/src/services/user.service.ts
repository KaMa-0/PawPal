import prisma from '../config/prisma';
import { UserType, AustriaState } from '@prisma/client';

export const findUserProfileById = async (userId: number, role: string) => {
    let profileData;

    if (role === UserType.OWNER) {
        profileData = await prisma.user.findUnique({
            where: { userId },
            include: { petOwner: true }
        });
    } else if (role === UserType.SITTER) {
        profileData = await prisma.user.findUnique({
            where: { userId },
            include: { petSitter: true }
        });
    } else if (role === UserType.ADMIN) {
        profileData = await prisma.user.findUnique({
            where: { userId },
            include: { admin: true }
        });
    }

    return profileData;
};

export const updateAboutTextService = async (userId: number, role: string, aboutText: string) => {
  if (role === "SITTER") {
    return prisma.petSitter.update({ where: { userId }, data: { aboutText } });
  } else if (role === "OWNER") {
    return prisma.petOwner.update({ where: { userId }, data: { aboutText } });
  }
};


export const searchPetSitters = async (
  state?: AustriaState,
  petType?: string
) => {
  return prisma.user.findMany({
    where: {
      userType: UserType.SITTER,
      ...(state && { state }),
      petSitter: {
        ...(petType && {
          petTypes: {
            has: petType
          }
        })
      }
    },
    include: {
      petSitter: true,
      profileImages: true
    }
  });
};
