import { NextResponse } from "next/server";
import { db } from "@/lib/db/database";
import { findDemoAccount } from "@/features/auth/demo-accounts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const identifier = (email || "").trim();
    if (!identifier) {
      return NextResponse.json({ error: "ইমেইল বা মোবাইল নম্বর প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    // 1. Look up in real database (supports email, phone, handle, or prefix)
    let user = db.users.findByEmailOrPhone
      ? db.users.findByEmailOrPhone(identifier)
      : db.users.findByEmail(identifier);

    // 2. Fallback check for static demo accounts
    if (!user) {
      const demo = findDemoAccount(identifier);
      if (demo) {
        user = {
          id: `usr_${demo.role.toLowerCase()}_demo`,
          email: demo.email,
          password: demo.password,
          displayName: demo.displayName,
          role: demo.role,
          phone: "01711000001",
          createdAt: new Date().toISOString(),
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "এই ইমেইল বা নম্বরে কোনো নিবন্ধিত অ্যাকাউন্ট পাওয়া যায়নি। ডেমো অ্যাকাউন্ট: donor@sharebite.demo" },
        { status: 404 }
      );
    }

    // Flexible password check for demo convenience (Demo1234 or demo1234 or exact)
    const submittedPass = (password || "").trim();
    const isDemoPass = submittedPass.toLowerCase() === "demo1234";
    const isMatch = !user.password || user.password === submittedPass || isDemoPass;

    if (!isMatch) {
      return NextResponse.json(
        { error: "প্রদত্ত পাসওয়ার্ডটি সঠিক নয়। ডেমো পাসওয়ার্ড: Demo1234" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "সফলভাবে লগইন হয়েছে।",
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        phone: user.phone,
        profile: user.profile,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "লগইন করতে সমস্যা হয়েছে।";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
