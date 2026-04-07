-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "curp" TEXT,
    "faceConfidence" REAL NOT NULL,
    "isDigitallyAltered" BOOLEAN NOT NULL,
    "isSpecimen" BOOLEAN NOT NULL,
    "verdictStatus" TEXT NOT NULL,
    "verdictMessage" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL
);
