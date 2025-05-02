/*
  Warnings:

  - You are about to drop the column `data` on the `Report` table. All the data in the column will be lost.
  - Added the required column `category` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "data",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
