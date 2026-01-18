import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { findUserProfileById, findPublicSitterProfile, addFavoriteSitter, removeFavoriteSitter, getOwnerFavorites } from '../services/user.service';
import { searchPetSitters } from '../services/user.service';
import { AustriaState } from '@prisma/client';
import prisma from '../config/prisma';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

export const uploadProfileImage = [
  upload.single('image'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      const imageUrl = `/uploads/${req.file.filename}`;
      const userId = req.user.userId;
      const isAvatar = req.body.isAvatar === 'true';

      if (isAvatar) {
        // If this is an avatar, unset previous avatars
        await prisma.profileImage.updateMany({
          where: { userId },
          data: { isAvatar: false }
        });
      }

      const image = await prisma.profileImage.create({
        data: {
          userId,
          imageUrl,
          isAvatar,
        },
      });

      res.json({ message: 'Image uploaded', image });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  }
];

export const setAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const imageId = parseInt(req.params.id);
    const userId = req.user.userId;

    // Verify image ownership
    const image = await prisma.profileImage.findUnique({ where: { imageId } });
    if (!image || image.userId !== userId) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Transaction to update all images
    await prisma.$transaction([
      prisma.profileImage.updateMany({
        where: { userId },
        data: { isAvatar: false }
      }),
      prisma.profileImage.update({
        where: { imageId },
        data: { isAvatar: true }
      })
    ]);

    res.json({ message: 'Avatar updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to set avatar' });
  }
};

export const deleteProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const imageId = parseInt(req.params.id);
    const userId = req.user.userId;

    const image = await prisma.profileImage.findUnique({ where: { imageId } });
    if (!image || image.userId !== userId) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await prisma.profileImage.delete({ where: { imageId } });

    // No auto-promotion logic. If avatar is deleted, user has no avatar.

    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete image' });
  }
};

export const updateAboutText = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { aboutText } = req.body;

    if (req.user.role === "SITTER") {
      await prisma.petSitter.update({
        where: { userId: req.user.userId },
        data: { aboutText }
      });
    } else if (req.user.role === "OWNER") {
      await prisma.petOwner.update({
        where: { userId: req.user.userId },
        data: { aboutText }
      });
    } else {
      return res.status(403).json({ message: 'Admins cannot have About Me' });
    }

    res.json({ message: 'About me updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update about me' });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || !role) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // 1. Die Logik an den Service abgeben
    const profileData = await findUserProfileById(userId, role);

    if (profileData) {
      // 2. Passwort entfernen
      const { passwordHash, ...safeProfile } = profileData;
      return res.json(safeProfile);
    }

    res.status(404).json({ message: 'Profile not found' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading profile' });
  }
};

export const getPetSitters = async (req: AuthRequest, res: Response) => {
  try {
    const { state, petType, minRating } = req.query;

    const sitters = await searchPetSitters(
      state as AustriaState | undefined,
      petType as string | undefined,
      minRating ? parseFloat(minRating as string) : undefined,
      req.user?.userId // Optional user ID for favorite check
    );

    res.json(sitters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch pet sitters' });
  }
};

export const getSitterProfile = async (req: AuthRequest, res: Response) => {
  try {
    const sitterId = parseInt(req.params.id);
    if (isNaN(sitterId)) {
      return res.status(400).json({ message: 'Invalid sitter ID' });
    }

    const sitter = await findPublicSitterProfile(sitterId, req.user?.userId);

    if (!sitter) {
      return res.status(404).json({ message: 'Sitter not found' });
    }

    res.json(sitter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch sitter profile' });
  }
};

// Favorites
export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'OWNER') return res.status(403).json({ message: 'Only Owners can add favorites' });
    const sitterId = parseInt(req.params.sitterId);

    await addFavoriteSitter(req.user.userId, sitterId);
    res.json({ message: 'Added to favorites' });
  } catch (err: any) {
    console.error(err);
    if (err.message === 'Sitter not found') return res.status(404).json({ message: 'Sitter not found' });
    res.status(500).json({ message: 'Failed to add favorite' });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'OWNER') return res.status(403).json({ message: 'Only Owners can remove favorites' });
    const sitterId = parseInt(req.params.sitterId);

    await removeFavoriteSitter(req.user.userId, sitterId);
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
};

export const getMyFavorites = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'OWNER') return res.status(403).json({ message: 'Only Owners have favorites' });

    const favorites = await getOwnerFavorites(req.user.userId);
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get favorites' });
  }
};
