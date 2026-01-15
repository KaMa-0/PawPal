import { PrismaClient } from '@prisma/client';

// Erstellt eine einzige Prisma-Instanz für die ganze App (Singleton)
const prisma = new PrismaClient();

export default prisma;