import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { findUserProfileById } from '../services/user.service';
import { searchPetSitters } from '../services/user.service';
import { AustriaState } from '@prisma/client';

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
