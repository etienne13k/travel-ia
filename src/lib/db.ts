/* eslint-disable @typescript-eslint/no-require-imports */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pool: any = null;

function parseDbUrl(url: string) {
  // new URL() rejects postgresql:// scheme when password has special chars;
  // swap scheme to http for parsing only, then restore individual params.
  try {
    const u = new URL(url.replace(/^postgres(ql)?:\/\//, "http://"));
    return {
      host: u.hostname,
      port: parseInt(u.port) || 5432,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ""),
      ssl: { rejectUnauthorized: false },
    };
  } catch {
    return { connectionString: url, ssl: { rejectUnauthorized: false } };
  }
}

export function getPool() {
  if (!pool) {
    const { Pool } = require("pg");
    pool = new Pool(parseDbUrl(process.env.DATABASE_URL ?? ""));
  }
  return pool;
}
