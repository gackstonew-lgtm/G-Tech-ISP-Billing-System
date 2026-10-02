import { NextRequest, NextResponse } from "next/server";
import { SEED_PLANS } from "@/lib/db/mock-db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let data = SEED_PLANS;
  if (type) {
    data = data.filter((p) => p.serviceType === type);
  }

  return NextResponse.json({
    success: true,
    count: data.length,
    data,
  });
}
