import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { findUserProfileById } from '../services/user.service';
import { searchPetSitters, addFavoriteService, removeFavoriteService, getFavoritesService, getFavoriteIdsService } from '../services/user.service';
import { $Enums, AustriaState} from '@prisma/client';
import prisma from '../config/prisma';
import multer from 'multer';

const upload = multer({dest: 'uploads/'});

export const uploadProfileImage = [
    upload.single('image'),
    async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user) return res.status(401).json({message: 'Unauthorized'});
            if (!req.file) return res.status(400).json({message: 'No file uploaded'});

            const imageUrl = `/uploads/${req.file.filename}`;

            const image = await prisma.profileImage.create({
                data: {
                    userId: req.user.userId,
                    imageUrl,
                },
            });

            res.json({message: 'Image uploaded', image});
        } catch (err) {
            console.error(err);
            res.status(500).json({message: 'Failed to upload image'});
        }
    }
];

export const updateAboutText = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({message: 'Unauthorized'});
        const {aboutText} = req.body;

        if (req.user.role === "SITTER") {
            await prisma.petSitter.update({
                where: {userId: req.user.userId},
                data: {aboutText}
            });
        } else if (req.user.role === "OWNER") {
            await prisma.petOwner.update({
                where: {userId: req.user.userId},
                data: {aboutText}
            });
        } else {
            return res.status(403).json({message: 'Admins cannot have About Me'});
        }

        res.json({message: 'About me updated'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Failed to update about me'});
    }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId || !role) {
            return res.status(401).json({message: 'Nicht authentifiziert'});
        }

        // 1. Die Logik an den Service abgeben
        const profileData = await findUserProfileById(userId, role);

        if (profileData) {
            // 2. Passwort entfernen
            const {passwordHash, ...safeProfile} = profileData;
            return res.json(safeProfile);
        }

        res.status(404).json({message: 'Profil nicht gefunden'});

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Fehler beim Laden des Profils'});
    }
};

export const getPetSitters = async (req: { query: { state: any; petType: any; }; }, res: { json: (arg0: ({ petSitter: { userId: number; aboutText: string | null; averageRating: number; updatedAt: Date; petTypes: string[]; } | null; profileImages: { imageUrl: string; imageId: number; userId: number; }[]; } & { userId: number; updatedAt: Date; email: string; passwordHash: string; username: string; state: $Enums.AustriaState; userType: $Enums.UserType; registrationDate: Date; })[]) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: string; }): void; new(): any; }; }; }) => {
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

export const getSitterProfile = async (req: any, res: any) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

        const sitter = await findUserProfileById(id, 'SITTER');

        if (!sitter) {
            return res.status(404).json({ message: "Sitter not found" });
        }

        // Passwort-Hash entfernen
        const { passwordHash, ...safeSitter } = sitter;

        res.json(safeSitter);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Favorite Controller

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'OWNER') {
            return res.status(403).json({ message: 'Only Pet Owners can manage favorites' });
        }

        const sitterId = parseInt(req.params.sitterId);
        const ownerId = req.user.userId;
        const { action } = req.body; // 'add' oder 'remove'

        if (action === 'add') {
            await addFavoriteService(ownerId, sitterId);
            res.json({ message: 'Added to favorites' });
        } else {
            await removeFavoriteService(ownerId, sitterId);
            res.json({ message: 'Removed from favorites' });
        }
    } catch (err) {
        // Prisma Fehler P2002 = Unique constraint failed (bereits favorisiert)
        // Prisma Fehler P2025 = Record not found (bereits gelöscht)
        console.error(err);
        res.status(400).json({ message: 'Could not update favorite status' });
    }
};

export const getMyFavorites = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'OWNER') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const favorites = await getFavoritesService(req.user.userId);
        res.json(favorites);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch favorites' });
    }
};

// Um beim Laden der Suche zu wissen, welche Herzen rot sein sollen
export const getMyFavoriteIds = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'OWNER') {
            return res.json([]); // Leeres Array für Nicht-Owner
        }
        const ids = await getFavoriteIdsService(req.user.userId);
        res.json(ids);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching favorite IDs' });
    }
};