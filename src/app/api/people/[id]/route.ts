import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { people } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/people/[id]
 * Body: { action: "plus" | "minus" }
 * plus  → repsLeft += 3, plus3 history +1
 * minus → repsLeft = max(0, repsLeft - 3), minus3 history +1
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const personId = Number(id);

  if (!Number.isInteger(personId)) {
    return NextResponse.json({ error: "Invalid person id." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | { action?: unknown }
    | null;

  const action = body?.action;

  if (action !== "plus" && action !== "minus") {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const [person] = await db
    .select()
    .from(people)
    .where(eq(people.id, personId))
    .limit(1);

  if (!person) {
    return NextResponse.json({ error: "Person not found." }, { status: 404 });
  }

  const repsLeft =
    action === "plus" ? person.repsLeft + 3 : Math.max(0, person.repsLeft - 3);

  const [updated] = await db
    .update(people)
    .set({
      repsLeft,
      plus3: person.plus3 + (action === "plus" ? 1 : 0),
      minus3: person.minus3 + (action === "minus" ? 1 : 0),
    })
    .where(eq(people.id, personId))
    .returning();

  return NextResponse.json(updated);
}
