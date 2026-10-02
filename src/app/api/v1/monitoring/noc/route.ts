import { NextResponse } from "next/server";
import { getSeedNOCStats } from "@/lib/db/mock-db";

export async function GET() {
  const stats = getSeedNOCStats();
  return NextResponse.json({
    success: true,
    data: stats,
  });
}
