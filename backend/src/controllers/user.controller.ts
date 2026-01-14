import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { findUserProfileById } from '../services/user.service';
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

      const image = await prisma.profileImage.create({
        data: {
          userId: req.user.userId,
          imageUrl,
        },
      });

      res.json({ message: 'Image uploaded', image });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  }
];

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
            return res.status(401).json({ message: 'Nicht authentifiziert' });
        }

        // 1. Die Logik an den Service abgeben
        const profileData = await findUserProfileById(userId, role);

        if (profileData) {
            // 2. Passwort entfernen
            const { passwordHash, ...safeProfile } = profileData;
            return res.json(safeProfile);
        }

        res.status(404).json({ message: 'Profil nicht gefunden' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Fehler beim Laden des Profils' });
    }
};

export const getPetSitters = async (req, res) => {
  try {
    const { state, petType } = req.query;

    const sitters = await searchPetSitters(
      state as AustriaState | undefined,
      petType as string | undefined
    );

    res.json(sitters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch pet sitters' });
  }
};
