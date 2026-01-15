import prisma from '../config/prisma';
import { UserType, AustriaState } from '@prisma/client';

export const findUserProfileById = async (userId: number, role: string) => {
  let includeOptions: any = {
    profileImages: true // always include images at the User level
  };

  if (role === UserType.OWNER) {
    includeOptions.petOwner = true;
  } else if (role === UserType.SITTER) {
    includeOptions.petSitter = {
      include: {
        bookings: {
          where: {
            status: 'COMPLETED',
            review: { isNot: null }
          },
          include: {
            review: true,
            owner: {
              include: { user: { select: { username: true } } }
            }
          },
          orderBy: { requestDate: 'desc' }
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
  const sitters = await prisma.user.findMany({
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
      petSitter: {
        include: {
          certificationRequests: {
            where: { status: 'APPROVED' },
            take: 1
          }
        }
      },
      profileImages: true
    }
  });

  return sitters;
};

export const findPublicSitterProfile = async (sitterId: number) => {
  return prisma.user.findFirst({
    where: {
      userId: sitterId,
      userType: UserType.SITTER
    },
    select: {
      userId: true,
      username: true,
      email: true, // Maybe safe to show? Or keep hidden? Let's show it for contact if needed, or remove if strict privacy.
      state: true,
      profileImages: true,
      petSitter: {
        include: {
          certificationRequests: {
            where: { status: 'APPROVED' },
            take: 1
          },
          bookings: {
            where: { status: 'COMPLETED', review: { isNot: null } },
            include: {
              review: true,
              owner: {
                include: { user: { select: { username: true } } }
              }
            },
            orderBy: { requestDate: 'desc' }
          }
        }
      }
    }
  });
};
