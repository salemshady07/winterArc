import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, ensureDatabaseSchema } from "@/db";
import { people } from "@/db/schema";

export const dynamic = "force-dynamic";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

/** GET /api/people — list everyone, oldest first. */
export async function GET() {
  try {
    await ensureDatabaseSchema();

    const rows = await db
      .select()
      .from(people)
      .orderBy(asc(people.createdAt), asc(people.id));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to load people:", error);
    return NextResponse.json(
      { error: "The database is temporarily unavailable." },
      { status: 500 },
    );
  }
}

/** POST /api/people — add a new person. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { name?: unknown }
    | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (name.length < 2) {
    return NextResponse.json(
      { error: "Please enter at least 2 characters." },
      { status: 400 },
    );
  }

  if (name.length > 25) {
    return NextResponse.json(
      { error: "Name must be 25 characters or fewer." },
      { status: 400 },
    );
  }

  try {
    await ensureDatabaseSchema();

    const existing = await db.select().from(people);
    const duplicate = existing.some(
      (person) => person.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "This person already exists." },
        { status: 409 },
      );
    }

    const [row] = await db.insert(people).values({ name }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "This person already exists." },
        { status: 409 },
      );
    }

    console.error("Failed to create person:", error);
    return NextResponse.json(
      { error: "Could not save this person. Please try again." },
      { status: 500 },
    );
  }
}
