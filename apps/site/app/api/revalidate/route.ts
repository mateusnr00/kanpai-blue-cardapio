import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET não configurado no site" },
      { status: 500 }
    );
  }
  if (secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { tags?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "json inválido" }, { status: 400 });
  }

  const tagsToRevalidate = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string" && t.length > 0)
    : [];

  if (tagsToRevalidate.length === 0) {
    return NextResponse.json({ error: "tags vazias" }, { status: 400 });
  }

  for (const tag of tagsToRevalidate) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidated: tagsToRevalidate });
}
