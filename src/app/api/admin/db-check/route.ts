import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const info: Record<string, unknown> = {
    set: !!url,
    length: url.length,
    prefix: url.slice(0, 20).replace(/:[^@]+@/, ":***@"), // hide password
  };

  if (!url) return NextResponse.json({ ...info, error: "DATABASE_URL manquant" });

  let parsed = false;
  try { new URL(url); parsed = true; } catch (e) {
    info.parse_error = String(e);
  }
  info.valid_url_format = parsed;

  if (!parsed) return NextResponse.json(info);

  try {
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
    await pool.query("SELECT 1");
    await pool.end();
    info.connection = "OK";
  } catch (e) {
    info.connection_error = String(e);
  }

  return NextResponse.json(info);
}
