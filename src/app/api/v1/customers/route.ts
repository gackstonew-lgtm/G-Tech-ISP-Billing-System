import { NextRequest, NextResponse } from "next/server";
import { SEED_CUSTOMERS } from "@/lib/db/mock-db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let data = SEED_CUSTOMERS;
  if (status && status !== "ALL") {
    data = data.filter((c) => c.status === status);
  }

  return NextResponse.json({
    success: true,
    count: data.length,
    data,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phoneNumber, email, physicalAddress, siteId } = body;

    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Full name and phone number are required." },
        { status: 400 }
      );
    }

    const newCustomer = {
      id: `cust-${Date.now()}`,
      organizationId: "org-gtech-kenya-01",
      accountNumber: `GT-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName,
      phoneNumber,
      email,
      physicalAddress,
      siteId: siteId || "site-01",
      status: "ACTIVE",
      balanceDue: 0,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Customer provisioned successfully into FreeRADIUS & MikroTik",
      data: newCustomer,
    }, { status: 201 });
  } catch (err: unknown) {
    const e = err as Error;
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
