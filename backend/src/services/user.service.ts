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

// Favorite Services

// Favorit hinzufügen
export const addFavoriteService = async (ownerUserId: number, sitterUserId: number) => {
  return prisma.favorite.create({
    data: {
      ownerId: ownerUserId,
      sitterId: sitterUserId
    }
  });
};

// Favorit entfernen
export const removeFavoriteService = async (ownerUserId: number, sitterUserId: number) => {
  return prisma.favorite.delete({
    where: {
      ownerId_sitterId: {
        ownerId: ownerUserId,
        sitterId: sitterUserId
      }
    }
  });
};

// Alle Favoriten eines Owners holen (inklusive Sitter Details)
export const getFavoritesService = async (ownerUserId: number) => {
  const favorites = await prisma.favorite.findMany({
    where: { ownerId: ownerUserId },
    include: {
      sitter: {
        include: {
          user: {
            include: {
              profileImages: true // Bilder für die Anzeige laden
            }
          }
        }
      }
    }
  });

  // Daten umformen, damit sie im Frontend leichter zu nutzen sind
  return favorites.map(f => ({
    userId: f.sitter.userId,
    username: f.sitter.user.username,
    state: f.sitter.user.state,
    petSitter: {
      aboutText: f.sitter.aboutText,
      averageRating: f.sitter.averageRating,
      petTypes: f.sitter.petTypes
    },
    profileImage: f.sitter.user.profileImages[0]?.imageUrl || null
  }));
};

// Checken, ob ein spezifischer Sitter favorisiert ist (Hilfsfunktion)
export const getFavoriteIdsService = async (ownerUserId: number) => {
  const favorites = await prisma.favorite.findMany({
    where: { ownerId: ownerUserId },
    select: { sitterId: true }
  });
  return favorites.map(f => f.sitterId);
};

export const updateSitterAverageRating = async (sitterId: number) => {
  // 1. Durchschnitt aller Reviews dieses Sitters berechnen
  const aggregate = await prisma.review.aggregate({
    where: {
      booking: {
        sitterId: sitterId
      }
    },
    _avg: {
      rating: true
    }
  });

  const newAverage = aggregate._avg.rating || 0;

  // 2. Den neuen Wert im PetSitter speichern
  await prisma.petSitter.update({
    where: { userId: sitterId },
    data: { averageRating: newAverage }
  });

  return newAverage;
};