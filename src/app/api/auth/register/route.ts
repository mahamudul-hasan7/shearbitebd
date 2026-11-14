import { NextResponse } from "next/server";
import type { DBUser } from "@/lib/db/database";
import { createAccount } from "@/lib/db/accounts";
import { Prisma } from "@prisma/client";
import { UserRole } from "@/lib/constants/roles";
import { authenticatedResponse, readObjectBody } from "@/lib/auth/server";
import { validateBangladeshPhone, validateEmail, validatePassword } from "@/features/auth/validation";

export async function POST(request: Request) {
  const body = await readObjectBody(request);
  if (!body) return NextResponse.json({ error: "সঠিক তথ্য পাঠান।" }, { status: 400 });
  const { email, password, fullName, organizationName, phone, role, details } = body;
  if (typeof email !== "string" || typeof password !== "string" || typeof fullName !== "string" || typeof phone !== "string" || typeof role !== "string") {
    return NextResponse.json({ error: "নাম, ইমেইল, মোবাইল নম্বর, পাসওয়ার্ড ও ভূমিকা প্রয়োজন।" }, { status: 400 });
  }
  const resolvedRole = role.toUpperCase() as UserRole;
  const validationError = validateEmail(email) || validateBangladeshPhone(phone) || validatePassword(password);
  if (validationError || !fullName.trim() || fullName.length > 120 || email.length > 254 || password.length > 256 || ![UserRole.DONOR, UserRole.NGO, UserRole.VOLUNTEER].includes(resolvedRole) || body.termsAccepted !== true || (organizationName !== undefined && typeof organizationName !== "string")) {
    return NextResponse.json({ error: validationError || "নাম, ভূমিকা ও শর্তাবলি গ্রহণের তথ্য সঠিকভাবে দিন।" }, { status: 400 });
  }
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return NextResponse.json({ error: "প্রয়োজনীয় প্রোফাইল তথ্য দিন।" }, { status: 400 });
  }
  const rawDetails = details as Record<string, unknown>;
  const profile: NonNullable<DBUser["profile"]> = {};
  for (const key of ["address", "donorType", "registrationNumber", "transportMethod", "bfsaCertNumber", "studentId", "city", "beneficiaryType", "availability", "notes"] as const) {
    if (rawDetails[key] !== undefined) {
      if (typeof rawDetails[key] !== "string" || rawDetails[key].length > 500) {
        return NextResponse.json({ error: "প্রোফাইল তথ্য সঠিক নয়।" }, { status: 400 });
      }
      profile[key] = rawDetails[key].trim();
    }
  }
  profile.organizationName = typeof organizationName === "string" ? organizationName.trim() : fullName.trim();
  if (!profile.address || (resolvedRole === UserRole.NGO && (!profile.registrationNumber || !profile.organizationName))) {
    return NextResponse.json({ error: "ঠিকানা এবং সংস্থার প্রয়োজনীয় নিবন্ধন তথ্য দিন।" }, { status: 400 });
  }
  try {
    const user = await createAccount({ email, password, displayName: resolvedRole === UserRole.NGO ? profile.organizationName : fullName.trim(), phone, role: resolvedRole, profile });
    return await authenticatedResponse(user, true, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "এই ইমেইল বা মোবাইল নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা হয়েছে।" }, { status: 409 });
    }
    return NextResponse.json({ error: "অ্যাকাউন্ট তৈরি করা যায়নি। পরে চেষ্টা করুন।" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "User listing is available only through the administrator endpoint." }, { status: 403 });
}
