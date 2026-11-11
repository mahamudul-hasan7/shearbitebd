import { NextResponse } from "next/server";
import { db } from "@/lib/db/database";
import { UserRole } from "@/lib/constants/roles";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, organizationName, phone, role, details } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "ইমেইল এবং ভূমিকার ধরন (Role) প্রদান করা বাধ্যতামূলক।" },
        { status: 400 }
      );
    }

    // Map role string to UserRole enum
    let resolvedRole: UserRole = UserRole.DONOR;
    const lowerRole = String(role).toLowerCase();
    if (lowerRole === "ngo") resolvedRole = UserRole.NGO;
    else if (lowerRole === "volunteer") resolvedRole = UserRole.VOLUNTEER;
    else resolvedRole = UserRole.DONOR;

    const displayName = (fullName || organizationName || (resolvedRole === UserRole.NGO ? "New NGO" : "ShareBite User")).trim();

    const existingUser = db.users.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "এই ইমেইলটি দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন।" },
        { status: 409 }
      );
    }

    const newUser = db.users.create({
      email,
      password: password || "Demo1234",
      displayName,
      role: resolvedRole,
      phone,
      profile: {
        organizationName: organizationName || displayName,
        ...details,
      },
    });

    return NextResponse.json({
      success: true,
      message: "অ্যাকাউন্ট সফলভাবে ডেটাবেজে নিবন্ধিত হয়েছে।",
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        phone: newUser.phone,
        profile: newUser.profile,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "রেজিস্ট্রেশন করতে সমস্যা হয়েছে।";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const users = db.users.findMany();
  return NextResponse.json({
    total: users.length,
    users: users.map(({ password, ...u }) => u),
  });
}
