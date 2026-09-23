import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { people } from "@/db/schema";

export const dynamic = "force-dynamic";

/** GET /api/people — list everyone, oldest first. */
export async function GET() {
  const rows = await db
    .select()
    .from(people)
    .orderBy(asc(people.createdAt), asc(people.id));

  return NextResponse.json(rows);
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

  try {
    const [row] = await db.insert(people).values({ name }).returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "This person already exists." },
      { status: 409 },
    );
  }
}
