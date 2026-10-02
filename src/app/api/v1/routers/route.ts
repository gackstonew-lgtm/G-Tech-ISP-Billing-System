import { NextRequest, NextResponse } from "next/server";
import { SEED_ROUTERS } from "@/lib/db/mock-db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    count: SEED_ROUTERS.length,
    data: SEED_ROUTERS,
  });
}
