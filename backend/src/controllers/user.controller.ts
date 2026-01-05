import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { findUserProfileById } from '../services/user.service';

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