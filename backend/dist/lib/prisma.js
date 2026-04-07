import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../prisma/dev.db');
const databaseUrl = process.env.DATABASE_URL || dbPath;
console.log("-----------------------------------------");
console.log("🛡️ INITIALIZING PRISMA CLIENT:");
console.log("📍 DATABASE_URL:", databaseUrl);
// Para SQLite con better-sqlite3
const adapter = new PrismaBetterSqlite3({
    url: databaseUrl
});
export const prisma = new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn']
});
console.log("✅ Prisma Client initialized successfully");
console.log("-----------------------------------------");
//# sourceMappingURL=prisma.js.map