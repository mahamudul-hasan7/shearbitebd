import type { RegistrationData, RegistrationErrors, RegistrationRole } from "@/features/auth/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BANGLADESH_PHONE_PATTERN = /^(?:\+?880|0)1[3-9]\d{8}$/;

export function validateEmail(value: string) {
  const email = value.trim();
  if (!email) return "আপনার ইমেইল ঠিকানা লিখুন।";
  if (!EMAIL_PATTERN.test(email)) return "সঠিক ইমেইল ঠিকানা দিন (যেমন: name@example.com)।";
  return undefined;
}

export function validateBangladeshPhone(value: string) {
  const phone = value.replace(/[\s-]/g, "");
  if (!phone) return "আপনার সচল মোবাইল নম্বর লিখুন।";
  if (!BANGLADESH_PHONE_PATTERN.test(phone)) return "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678 বা +8801712345678)।";
  return undefined;
}

export function validatePassword(value: string) {
  if (!value) return "পাসওয়ার্ড দিন।";
  if (value.length < 8) return "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "পাসওয়ার্ডে কমপক্ষে একটি বর্ণ ও একটি সংখ্যা থাকতে হবে।";
  return undefined;
}

export function validateLogin(values: { email: string; password: string }) {
  return {
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };
}

function required(value: string, message: string) {
  return value.trim() ? undefined : message;
}

export function validateRegistrationStep({
  step,
  role,
  data,
  termsAccepted,
  documentName,
}: {
  step: number;
  role: RegistrationRole;
  data: RegistrationData;
  termsAccepted: boolean;
  documentName: string;
}): RegistrationErrors {
  const errors: RegistrationErrors = {};

  if (step === 1) {
    errors.fullName = required(
      data.fullName,
      role === "ngo" ? "দায়িত্বপ্রাপ্ত কর্মকর্তার নাম লিখুন।" : "আপনার পুরো নাম লিখুন।"
    );
    errors.email = validateEmail(data.email);
    errors.phone = validateBangladeshPhone(data.phone);
    errors.password = validatePassword(data.password);
    errors.confirmPassword = required(data.confirmPassword, "পাসওয়ার্ডটি পুনরায় নিশ্চিত করুন।");
    if (!errors.confirmPassword && data.password !== data.confirmPassword) {
      errors.confirmPassword = "দুটি পাসওয়ার্ড মিলছে না।";
    }
  }

  if (step === 2 && role === "donor") {
    errors.donorType = required(data.donorType, "দাতার ধরন নির্বাচন করুন।");
    errors.address = required(data.address, "খাবার পিকআপের প্রাথমিক ঠিকানা দিন।");
  }

  if (step === 2 && role === "ngo") {
    errors.organizationName = required(data.organizationName, "সংস্থার প্রাতিষ্ঠানিক নাম লিখুন।");
    errors.registrationNumber = required(data.registrationNumber, "সরকারি নিবন্ধন বা লাইসেন্স নম্বর দিন।");
    errors.beneficiaryType = required(data.beneficiaryType, "প্রধান সুবিধাভোগী শ্রেণি নির্বাচন করুন।");
    errors.city = required(data.city, "কার্যনির্বাহী শহর বা জেলার নাম লিখুন।");
    errors.address = required(data.address, "সংস্থার কেন্দ্রীয় কার্যালয়ের ঠিকানা লিখুন।");
    errors.notes = required(data.notes, "সংস্থার খাদ্য বণ্টন সক্ষমতা ও সংক্ষিপ্ত বিবরণ লিখুন।");
  }

  if (step === 2 && role === "volunteer") {
    errors.city = required(data.city, "আপনার শহর বা জেলার নাম লিখুন।");
    errors.transport = required(data.transport, "পরিবহন মাধ্যম নির্বাচন করুন।");
    errors.availability = required(data.availability, "সক্রিয় থাকার সময় নির্বাচন করুন।");
    errors.address = required(data.address, "পছন্দনীয় সেবাদান এলাকা লিখুন।");
  }

  if (step === 3) {
    if (!termsAccepted) {
      errors.terms = "খাদ্য সুরক্ষা ও সত্যতা স্বীকারোক্তি শর্তাবলী গ্রহণ করতে হবে।";
    }
    if ((role === "ngo" || role === "volunteer") && !documentName) {
      errors.document =
        role === "ngo"
          ? "সংস্থার সরকারি নিবন্ধন কপি বা সনদ আপলোড করুন।"
          : "জাতীয় পরিচয়পত্র বা স্টুডেন্ট আইডি আপলোড করুন।";
    }
  }

  return Object.fromEntries(Object.entries(errors).filter(([, message]) => Boolean(message))) as RegistrationErrors;
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}
