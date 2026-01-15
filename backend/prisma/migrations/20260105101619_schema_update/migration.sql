/*
  Warnings:

  - You are about to drop the column `username` on the `PetOwner` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `PetSitter` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `OwnerPetType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PetType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SitterPetType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `state` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OwnerPetType" DROP CONSTRAINT "OwnerPetType_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "OwnerPetType" DROP CONSTRAINT "OwnerPetType_petTypeId_fkey";

-- DropForeignKey
ALTER TABLE "SitterPetType" DROP CONSTRAINT "SitterPetType_petTypeId_fkey";

-- DropForeignKey
ALTER TABLE "SitterPetType" DROP CONSTRAINT "SitterPetType_sitterId_fkey";

-- AlterTable
ALTER TABLE "PetOwner" DROP COLUMN "username",
ADD COLUMN     "petTypes" TEXT[];

-- AlterTable
ALTER TABLE "PetSitter" DROP COLUMN "username",
ADD COLUMN     "petTypes" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "location",
ADD COLUMN     "state" "AustriaState" NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- DropTable
DROP TABLE "OwnerPetType";

-- DropTable
DROP TABLE "PetType";

-- DropTable
DROP TABLE "SitterPetType";
