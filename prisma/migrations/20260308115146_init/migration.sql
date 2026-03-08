-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "english" TEXT NOT NULL,
    "turkish" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
