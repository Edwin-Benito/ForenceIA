-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "documentId" TEXT,
    "verificationData" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "result" TEXT,
    "notes" TEXT
);
