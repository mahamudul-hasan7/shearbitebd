import { NextResponse } from "next/server";
import { findAccount } from "@/lib/db/accounts";
import { authenticatedResponse, readObjectBody } from "@/lib/auth/server";

export async function POST(request: Request) {
  const body = await readObjectBody(request);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string" || !body.email.trim() || !body.password || body.password.length > 256 || body.email.length > 254 || (body.remember !== undefined && typeof body.remember !== "boolean")) {
    return NextResponse.json({ error: "সঠিক ইমেইল, মোবাইল বা ইউজারনেম এবং পাসওয়ার্ড দিন।" }, { status: 400 });
  }
  try {
    const user = await findAccount(body.email);
    // Plaintext comparison is temporary, as requested for the university project.
    if (!user?.password || user.password !== body.password) {
      return NextResponse.json({ error: "ইমেইল/মোবাইল/ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।" }, { status: 401 });
    }
    return await authenticatedResponse(user, body.remember === true);
  } catch {
    return NextResponse.json({ error: "লগইন করা যায়নি। কিছুক্ষণ পরে চেষ্টা করুন।" }, { status: 500 });
  }
}
