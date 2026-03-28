import { purgeExpiredPosts } from "@/lib/purge";
import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function authOk(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${secret}`;
  if (!auth || auth.length !== expected.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(auth), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return NextResponse.json({ skipped: true, reason: "not production" });
  }

  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  if (!authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { deleted } = await purgeExpiredPosts();
    return NextResponse.json({ ok: true, deleted });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Purge failed" },
      { status: 500 }
    );
  }
}
