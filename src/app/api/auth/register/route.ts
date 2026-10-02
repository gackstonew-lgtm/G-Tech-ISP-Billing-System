import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, password, organizationName } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Full name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const orgName = organizationName?.trim() || `${fullName}'s ISP`;
    const orgSlug = `${slugify(orgName)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const supabaseAdmin = createSupabaseServiceClient();

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        organization_name: orgName,
      },
    });

    if (authError || !authData.user) {
      // If user already exists, return friendly error
      if (authError?.message?.includes("already") || authError?.code === "email_exists") {
        return NextResponse.json(
          { success: false, error: "An account with this email address already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: authError?.message || "Failed to create user account." },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Create organization in DB
    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: orgName,
        slug: orgSlug,
        email,
        phone: "+254700000000",
        currency: "KES",
        timezone: "Africa/Nairobi",
        billing_cycle_type: "ANNIVERSARY",
        grace_period_days: 2,
        is_active: true,
      })
      .select()
      .single();

    if (orgError || !org) {
      console.error("[Register API] Organization creation failed:", orgError);
      return NextResponse.json(
        { success: false, error: "Failed to initialize organization data." },
        { status: 500 }
      );
    }

    // 3. Create user profile in DB
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        organization_id: org.id,
        full_name: fullName,
        role: "isp_owner",
        is_active: true,
      });

    if (profileError) {
      console.error("[Register API] Profile creation failed:", profileError);
      return NextResponse.json(
        { success: false, error: "Failed to create user profile." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account and organization registered successfully.",
        user: {
          id: userId,
          email,
          fullName,
          organizationId: org.id,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Register API] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
