import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
export declare const prisma: PrismaClient<{
    adapter: PrismaBetterSqlite3;
    log: ("query" | "warn" | "error")[];
}, "query" | "warn" | "error", import("@prisma/client/runtime/client").DefaultArgs>;
//# sourceMappingURL=prisma.d.ts.map