import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, ensureDatabaseSchema } from "@/db";
import { settings } from "@/db/schema";
import { isThemeId } from "@/lib/themes";

const THEME_KEY = "theme";

export const dynamic = "force-dynamic";

/** GET /api/theme — the theme saved server-side (synced across devices). */
export async function GET() {
  await ensureDatabaseSchema();

  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, THEME_KEY))
    .limit(1);

  return NextResponse.json({ theme: row?.value ?? null });
}

/** PUT /api/theme — persist the selected theme. */
export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { theme?: unknown }
    | null;

  if (!isThemeId(body?.theme)) {
    return NextResponse.json({ error: "Unknown theme." }, { status: 400 });
  }

  const theme = body.theme;

  await ensureDatabaseSchema();

  await db
    .insert(settings)
    .values({ key: THEME_KEY, value: theme })
    .onConflictDoUpdate({ target: settings.key, set: { value: theme } });

  return NextResponse.json({ theme });
}
