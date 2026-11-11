import { NextResponse } from "next/server";
import { db } from "@/lib/db/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: "ইমেইল প্রদান করা আবশ্যক।" }, { status: 400 });
    }

    const user = db.users.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "এই ইমেইলে কোনো নিবন্ধিত অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন।" },
        { status: 404 }
      );
    }

    if (password && user.password && user.password !== password) {
      return NextResponse.json(
        { error: "প্রদত্ত পাসওয়ার্ডটি সঠিক নয়।" },
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
