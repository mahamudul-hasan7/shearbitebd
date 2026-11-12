import { NextResponse } from "next/server";
import { db } from "@/lib/db/database";
import type { AvailableDispatch } from "@/features/volunteer-dashboard/volunteer-types";

const FALLBACK_DISPATCHES: AvailableDispatch[] = [
  {
    id: "dsp-live-01",
    donorName: "UIU সেন্ট্রাল ক্যাফেটেরিয়া",
    donorArea: "ইউনাইটেড সিটি, মাদানী এভিনিউ, বাড্ডা, ঢাকা-১২১২",
    donorPhone: "+8801712345678",
    donorContact: "আসিফ ইকবাল (ক্যাফেটেরিয়া ইনচার্জ)",
    ngoName: "মাস্তুল মাদানী শেল্টার ও এতিমখানা",
    ngoArea: "মাদানী এভিনিউ, ইউআইইউ গেট ২ সংলগ্ন, বাড্ডা",
    ngoPhone: "+8801812345678",
    ngoContact: "তারিকুল ইসলাম (শেল্টার কোঅর্ডিনেটর)",
    foodType: "স্পেশাল চিকেন বিরিয়ানি ও ডিম ভুনা",
    quantity: "৮৫টি হট-বক্স",
    servings: 110,
    expiresInMins: 35,
    urgency: "critical",
    distanceKm: 2.4,
    storageCondition: "থার্মাল ইনসুলেটেড কার্টন (>৬০°সে)",
    dietary: "১০০% হালাল",
    specialNote: "ক্যাফেটেরিয়ার পেছনের সার্ভিস গেটে বাইক রেখে কিচেন ডেস্ক থেকে সংগ্রহ করুন।",
    pickupOtp: "7429",
    dropoffOtp: "9814",
  },
  {
    id: "dsp-live-02",
    donorName: "Sultan's Dine - Gulshan 2",
    donorArea: "Road 103, Gulshan-2, Dhaka",
    donorPhone: "+8801811223344",
    donorContact: "তানজিম কবির (ম্যানেজার)",
    ngoName: "Bidyanondo Foundation Shelter",
    ngoArea: "Mirpur-12 Food Center, Dhaka",
    ngoPhone: "+8801911887766",
    ngoContact: "সাদিয়া ইসলাম",
    foodType: "কাচ্চি বিরিয়ানি ও বোরহানি (সিল্ড ফয়েল)",
    quantity: "৬৫টি কন্টেইনার",
    servings: 85,
    expiresInMins: 42,
    urgency: "critical",
    distanceKm: 5.2,
    storageCondition: "গরম অবস্থায় সংরক্ষিত",
    dietary: "১০০% হালাল",
    specialNote: "রেস্তোরাঁর রিসিভিং গেটে গার্ডকে ডিজিটাল পাস দেখান।",
    pickupOtp: "3419",
    dropoffOtp: "5520",
  },
  {
    id: "dsp-live-03",
    donorName: "Radisson Blu Water Garden",
    donorArea: "Airport Road, Dhaka Cantonment",
    donorPhone: "+8801722334455",
    donorContact: "শেফ মাহফুজ",
    ngoName: "JAAGO Foundation Shelter",
    ngoArea: "Korail Bosti Educational Camp, Banani",
    ngoPhone: "+8801733445566",
    ngoContact: "রাকিব হাসান",
    foodType: "কন্টিনেন্টাল ব্যুফে ট্রে ও প্রিমিয়াম বেকারি",
    quantity: "১১০ প্যাকেট",
    servings: 140,
    expiresInMins: 75,
    urgency: "high",
    distanceKm: 4.8,
    storageCondition: "রুম টেম্পারেচার / কোল্ড চেইন",
    dietary: "হালাল ও বেকারি",
    specialNote: "সিকিউরিটিতে ডিজিটাল ভলান্টিয়ার আইডি প্রদর্শন আবশ্যক।",
    pickupOtp: "8821",
    dropoffOtp: "1204",
  },
];

export async function GET() {
  try {
    const claims = db.claims.findMany();
    const donations = db.donations.findMany();
    const users = db.users.findMany();

    const dispatches: AvailableDispatch[] = [];

    // 1. Live claims that are RESERVED and waiting for volunteer pickup
    for (const claim of claims) {
      if (claim.status === "RESERVED" || claim.status === "AVAILABLE") {
        const donation = donations.find((d) => d.id === claim.donationId);
        const donorUser = donation?.donorEmail
          ? users.find((u) => u.email.toLowerCase() === donation.donorEmail?.toLowerCase())
          : undefined;
        const ngoUser = claim.ngoEmail
          ? users.find((u) => u.email.toLowerCase() === claim.ngoEmail?.toLowerCase())
          : undefined;

        let diffMins = 55;
        if (donation?.safePickupDeadline) {
          const parsed = Date.parse(donation.safePickupDeadline);
          if (!isNaN(parsed)) {
            const calculated = Math.round((parsed - Date.now()) / 60000);
            diffMins = calculated > 5 ? calculated : 35;
          }
        }

        const urgency: "critical" | "high" | "normal" =
          diffMins <= 45 ? "critical" : diffMins <= 90 ? "high" : "normal";

        dispatches.push({
          id: claim.id,
          claimId: claim.id,
          donationId: donation?.id,
          isRealDb: true,
          donorName: donation?.donorName || donorUser?.displayName || "নিবন্ধিত ফুড ডোনার",
          donorArea: donation?.addressLine || donation?.approximateArea || donorUser?.profile?.address || "ঢাকা মেট্রো সিটি",
          donorPhone: donation?.contactPhone || donorUser?.phone || "+8801700000001",
          donorContact: donation?.contactPerson || donation?.donorName || "ইনচার্জ",
          ngoName: claim.ngoName || ngoUser?.displayName || "মাস্তুল ফাউন্ডেশন শেল্টার",
          ngoArea: ngoUser?.profile?.address || "রোড ১৪, ব্লক সি, বাড্ডা, ঢাকা",
          ngoPhone: ngoUser?.phone || "+8801812345678",
          ngoContact: ngoUser?.displayName || "শেল্টার রেসকিউ টিম",
          foodType: donation?.title || claim.donationTitle || "তাজা উদ্বৃত্ত খাবার ব্যাচ",
          quantity: donation ? `${donation.quantity} ${donation.quantityUnit || "প্যাকেট"}` : "৬০টি ফয়েল বক্স",
          servings: donation?.estimatedMeals || donation?.quantity || 75,
          expiresInMins: diffMins,
          urgency,
          distanceKm: 3.8,
          storageCondition: donation?.category === "COOKED_MEAL" ? "থার্মাল ইনসুলেটেড গরম খাবার" : "প্যাকেটজাত খাবার",
          dietary: "১০০% হালাল ও স্বাস্থ্যসম্মত",
          specialNote: donation?.specialInstructions || "সার্ভিস গেট দিয়ে প্রবেশ করে আইডি কার্ড প্রদর্শন করুন।",
          pickupOtp: claim.pickupOtp || "7429",
          dropoffOtp: claim.dropoffOtp || "9814",
        });
      }
    }

    // 2. Open donations that are AVAILABLE in database and ready for rescue
    for (const donation of donations) {
      if (donation.status === "AVAILABLE") {
        // Check if not already in dispatches via claim
        const alreadyIn = dispatches.some((d) => d.donationId === donation.id);
        if (!alreadyIn) {
          const donorUser = donation.donorEmail
            ? users.find((u) => u.email.toLowerCase() === donation.donorEmail?.toLowerCase())
            : undefined;

          let diffMins = 60;
          if (donation.safePickupDeadline) {
            const parsed = Date.parse(donation.safePickupDeadline);
            if (!isNaN(parsed)) {
              const calculated = Math.round((parsed - Date.now()) / 60000);
              diffMins = calculated > 5 ? calculated : 40;
            }
          }

          const urgency: "critical" | "high" | "normal" =
            diffMins <= 45 ? "critical" : diffMins <= 90 ? "high" : "normal";

          dispatches.push({
            id: donation.id,
            donationId: donation.id,
            isRealDb: true,
            donorName: donation.donorName || donorUser?.displayName || "স্বীকৃত খাদ্য দাতা",
            donorArea: donation.addressLine || donation.approximateArea || donorUser?.profile?.address || "বাড্ডা, ঢাকা",
            donorPhone: donation.contactPhone || donorUser?.phone || "+8801700000001",
            donorContact: donation.contactPerson || donation.donorName || "ডোনার ডেস্ক",
            ngoName: "মাস্তুল ফাউন্ডেশন শেল্টার ও এতিমখানা",
            ngoArea: "বাড়ি ১৪, রোড ৩২ পুরাতন, ধানমন্ডি, ঢাকা",
            ngoPhone: "+8801700000011",
            ngoContact: "ফারহানা রহমান (রেসকিউ কোঅর্ডিনেটর)",
            foodType: donation.title,
            quantity: `${donation.quantity} ${donation.quantityUnit || "প্যাকেট"}`,
            servings: donation.estimatedMeals || donation.quantity || 30,
            expiresInMins: diffMins,
            urgency,
            distanceKm: 2.8,
            storageCondition: donation.category === "COOKED_MEAL" ? "গরম অবস্থায় সংরক্ষিত" : "প্যাকেটজাত উদ্বৃত্ত খাবার",
            dietary: "১০০% হালাল",
            specialNote: donation.specialInstructions || "দ্রুততম সময়ে পিকআপ করে ইনসুলেটেড ব্যাগে পরিবহন করুন।",
            pickupOtp: "7429",
            dropoffOtp: "9814",
          });
        }
      }
    }

    // 3. If live items are few, supplement with active regional dispatches so feed is always rich
    for (const fb of FALLBACK_DISPATCHES) {
      if (!dispatches.some((d) => d.id === fb.id || d.foodType === fb.foodType)) {
        dispatches.push(fb);
      }
    }

    return NextResponse.json({
      success: true,
      count: dispatches.length,
      dispatches,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch dispatches";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dispatchId, claimId, donationId, volunteerId, volunteerName, volunteerPhone } = body;

    const vId = volunteerId || "VOL-BD-0181";
    const vName = volunteerName || "Rider Rakib";
    const now = new Date().toISOString();

    let resolvedClaim = claimId ? db.claims.findById(claimId) : undefined;

    if (!resolvedClaim && donationId) {
      const donation = db.donations.findById(donationId);
      if (donation) {
        resolvedClaim = db.claims.create({
          donationId: donation.id,
          donationTitle: donation.title,
          ngoId: "usr_ngo_001",
          ngoName: "মাস্তুল ফাউন্ডেশন শেল্টার ও এতিমখানা",
          ngoEmail: "ngo@sharebite.demo",
          matchScore: 99,
          status: "ASSIGNED",
          pickupOtp: "7429",
          dropoffOtp: "9814",
          volunteerId: vId,
          volunteerName: vName,
        });
      }
    }

    if (resolvedClaim) {
      db.claims.updateStatus(resolvedClaim.id, "ASSIGNED", {
        volunteerId: vId,
        volunteerName: vName,
        assignedAt: now,
      });

      if (resolvedClaim.donationId) {
        db.donations.updateStatus(resolvedClaim.donationId, "ASSIGNED");
      }
    } else if (dispatchId && !dispatchId.startsWith("dsp-live-")) {
      db.claims.updateStatus(dispatchId, "ASSIGNED", {
        volunteerId: vId,
        volunteerName: vName,
        assignedAt: now,
      });
    }

    // Send real notifications
    db.notifications.create({
      role: "DONOR",
      type: "DISPATCH",
      title: "ভলান্টিয়ার রাইডার বরাদ্দ হয়েছে! 🛵",
      message: `রাইডার ${vName} (${volunteerPhone || "01810394869"}) আপনার উদ্বৃত্ত খাদ্য সংগ্রহ করতে আসছেন।`,
      href: "/donor/donations",
    });

    db.notifications.create({
      role: "NGO",
      type: "DISPATCH",
      title: "খাদ্য রেসকিউ মিশন শুরু হয়েছে!",
      message: `ভলান্টিয়ার রাইডার ${vName} খাদ্য সংগ্রহের জন্য রওনা হয়েছেন। ট্রানজিট শেষে শেল্টারে পৌঁছাবেন।`,
      href: "/ngo/claims",
    });

    db.notifications.create({
      role: "VOLUNTEER",
      type: "DISPATCH",
      title: "মিশন বরাদ্দ সফল! 🎯",
      message: "আপনি নতুন খাদ্য উদ্ধার মিশন গ্রহণ করেছেন। পিকআপ লোকেশনে পৌঁছান এবং ওটিপি দিয়ে খাবার সংগ্রহ করুন।",
      href: "/volunteer/dashboard",
    });

    return NextResponse.json({
      success: true,
      message: "মিশন সফলভাবে বরাদ্দ ও ডাটাবেজে লক করা হয়েছে!",
      claimId: resolvedClaim?.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to accept dispatch";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
