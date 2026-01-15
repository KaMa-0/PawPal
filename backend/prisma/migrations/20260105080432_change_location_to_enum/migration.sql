/*
  Warnings:

  - Changed the type of `location` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AustriaState" AS ENUM ('WIEN', 'NIEDEROESTERREICH', 'OBEROESTERREICH', 'SALZBURG', 'TIROL', 'VORARLBERG', 'KAERNTEN', 'STEIERMARK', 'BURGENLAND');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "location",
ADD COLUMN     "location" "AustriaState" NOT NULL;
