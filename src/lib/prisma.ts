import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Some PostgreSQL connection strings contain malformed percent-escapes
 * (e.g. Supabase passwords with literal "%cj"). Standard URI decoding
 * throws on those, so decode only valid %XX sequences and keep the rest.
 */
function decodeLenient(value: string): string {
  return value.replace(/%[0-9a-fA-F]{2}/g, (m) => String.fromCharCode(parseInt(m.slice(1), 16)));
}

/**
 * Build a pg PoolConfig from a postgres:// URL instead of passing the URL
 * straight to pg. This avoids two problems:
 * 1. pg treats `sslmode=require` as verify-full, which fails against
 *    Supabase's certificate chain.
 * 2. pg-connection-string may leave or mis-decode percent-escapes in passwords.
 */
function buildPgPoolConfig(url: string): PoolConfig {
  const parsed = new URL(url);
  const sslMode = parsed.searchParams.get("sslmode");
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeLenient(parsed.username),
    password: decodeLenient(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    ssl: sslMode === "disable" ? false : { rejectUnauthorized: false },
  };
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  if (url.startsWith("file:")) {
    const dbPath = url.replace("file:", "");
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  if (url.startsWith("postgresql://")) {
    const adapter = new PrismaPg(buildPgPoolConfig(url));
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  throw new Error(`Unsupported DATABASE_URL format: ${url}`);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
