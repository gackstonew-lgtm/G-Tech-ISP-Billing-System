import { NextRequest, NextResponse } from "next/server";
import { MpesaService } from "@/lib/payments/mpesa";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const result = MpesaService.parseCallback(payload);

    if (result.success) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted and Reconciled Successfully",
      });
    }

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Transaction Failed/Cancelled acknowledged",
    });
  } catch (err: unknown) {
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Error processed",
    });
  }
}
