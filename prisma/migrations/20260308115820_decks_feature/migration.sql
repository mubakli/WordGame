/*
  Warnings:

  - Added the required column `deckId` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "english" TEXT NOT NULL,
    "turkish" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Word_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Word" ("createdAt", "english", "id", "turkish") SELECT "createdAt", "english", "id", "turkish" FROM "Word";
DROP TABLE "Word";
ALTER TABLE "new_Word" RENAME TO "Word";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
