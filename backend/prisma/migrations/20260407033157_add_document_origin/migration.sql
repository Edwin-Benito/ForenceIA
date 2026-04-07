-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Audit" (
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
    "documentOrigin" TEXT NOT NULL DEFAULT 'OFICIAL',
    "engineVersion" TEXT NOT NULL
);
INSERT INTO "new_Audit" ("createdAt", "curp", "documentId", "engineVersion", "faceConfidence", "fullName", "id", "isDigitallyAltered", "isSpecimen", "verdictMessage", "verdictStatus") SELECT "createdAt", "curp", "documentId", "engineVersion", "faceConfidence", "fullName", "id", "isDigitallyAltered", "isSpecimen", "verdictMessage", "verdictStatus" FROM "Audit";
DROP TABLE "Audit";
ALTER TABLE "new_Audit" RENAME TO "Audit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
