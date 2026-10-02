import { NextRequest, NextResponse } from "next/server";
import { MpesaService } from "@/lib/payments/mpesa";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneNumber, amount, accountReference, transactionDesc } = body;

    if (!phoneNumber || !amount || !accountReference) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (phoneNumber, amount, accountReference)" },
        { status: 400 }
      );
    }

    const result = await MpesaService.initiateSTKPush({
      phoneNumber,
      amount,
      accountReference,
      transactionDesc: transactionDesc || `Internet Bill ${accountReference}`,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
