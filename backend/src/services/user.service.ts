import prisma from '../config/prisma';
import { UserType, AustriaState } from '@prisma/client';

export const findUserProfileById = async (userId: number, role: string) => {
  let includeOptions: any = {
    profileImages: true // Bilder werden immer geladen
  };

  if (role === UserType.OWNER) {
    includeOptions.petOwner = true;
  } else if (role === UserType.SITTER) {
    // Fetch Reviews from Database
    includeOptions.petSitter = {
      include: {
        bookings: {
          where: {
            review: {
              isNot: null
            }
          },
          include: {
            review: true,
            owner: {
              include: {
                user: true
              }
            }
          }
        }
      }
    };
  } else if (role === UserType.ADMIN) {
    includeOptions.admin = true;
  }

  const profileData = await prisma.user.findUnique({
    where: { userId },
    include: includeOptions
  });

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
