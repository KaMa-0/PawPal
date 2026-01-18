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
          orderBy: { review: { createdAt: 'desc' } }
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
  petType?: string,
  minRating?: number,
  currentUserId?: number
) => {
  const sitters = await prisma.user.findMany({
    where: {
      userType: UserType.SITTER,
      ...(state && { state }),
      petSitter: {
        ...(minRating !== undefined && { averageRating: { gte: minRating } }),
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

  // If user is logged in, check which sitters are favorited
  if (currentUserId) {
    const favorites = await prisma.favorite.findMany({
      where: {
        ownerId: currentUserId,
        sitterId: { in: sitters.map(s => s.userId) }
      },
      select: { sitterId: true }
    });

    const favoritedIds = new Set(favorites.map(f => f.sitterId));

    return sitters.map(sitter => ({
      ...sitter,
      isFavorited: favoritedIds.has(sitter.userId)
    }));
  }

  return sitters.map(sitter => ({ ...sitter, isFavorited: false }));
};

export const findPublicSitterProfile = async (sitterId: number, currentUserId?: number) => {
  const sitter = await prisma.user.findFirst({
    where: {
      userId: sitterId,
      userType: UserType.SITTER
    },
    select: {
      userId: true,
      username: true,
      email: true,
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
            orderBy: { review: { createdAt: 'desc' } }
          }
        }
      }
    }
  });

  if (!sitter) return null;

  let isFavorited = false;
  if (currentUserId) {
    const fav = await prisma.favorite.findUnique({
      where: {
        ownerId_sitterId: {
          ownerId: currentUserId,
          sitterId: sitter.userId
        }
      }
    });
    isFavorited = !!fav;
  }

  return { ...sitter, isFavorited };
};

// Favorites Operations

export const addFavoriteSitter = async (ownerId: number, sitterId: number) => {
  // Check if sitter exists and is a sitter
  const sitter = await prisma.petSitter.findUnique({ where: { userId: sitterId } });
  if (!sitter) throw new Error("Sitter not found");

  // Create favorite 
  return prisma.favorite.create({
    data: {
      ownerId,
      sitterId
    }
  }).catch(err => {
    // Ignore unique constraint violation if already favorite
    if (err.code === 'P2002') return;
    throw err;
  });
};

export const removeFavoriteSitter = async (ownerId: number, sitterId: number) => {
  return prisma.favorite.delete({
    where: {
      ownerId_sitterId: {
        ownerId,
        sitterId
      }
    }
  }).catch(err => {
    if (err.code === 'P2025') return; // Record to delete does not exist.
    throw err;
  });
};

export const getOwnerFavorites = async (ownerId: number) => {
  const favorites = await prisma.favorite.findMany({
    where: { ownerId },
    include: {
      sitter: {
        include: {
          user: {
            include: {
              profileImages: true
            }
          },
          certificationRequests: {
            where: { status: 'APPROVED' },
            take: 1
          }
        }
      }
    }
  });

  // Transform structure to match Sitter Card needs
  return favorites.map(f => ({
    userId: f.sitterId,
    username: f.sitter.user.username,
    state: f.sitter.user.state,
    profileImages: f.sitter.user.profileImages,
    petSitter: {
      averageRating: f.sitter.averageRating,
      petTypes: f.sitter.petTypes,
      aboutText: f.sitter.aboutText,
      certificationRequests: f.sitter.certificationRequests
    },
    isFavorited: true
  }));
};
