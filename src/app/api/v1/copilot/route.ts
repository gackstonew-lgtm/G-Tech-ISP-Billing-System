import { NextResponse } from "next/server";
import { runCopilotQuery } from "@/lib/ai/copilot";
import { buildSeedCopilotSnapshot } from "@/lib/db/os-2027-seed";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Enter a question or operational command." },
        { status: 400 }
      );
    }

    const snapshot = buildSeedCopilotSnapshot();
    const result = runCopilotQuery(prompt, snapshot);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "AI Copilot could not process the request." },
      { status: 500 }
    );
  }
}
