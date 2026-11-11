import fs from "node:fs";
import path from "node:path";
import { UserRole } from "@/lib/constants/roles";

export interface DBUser {
  id: string;
  email: string;
  password?: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  profile?: {
    organizationName?: string;
    donorType?: string;
    registrationNumber?: string;
    serviceAreas?: string[];
    capacityMealsPerDay?: number;
    transportMethod?: string;
    address?: string;
    bfsaCertNumber?: string;
    studentId?: string;
  };
}

export interface DBDocuments {
  users: DBUser[];
  donations: Array<{
    id: string;
    title: string;
    donorId: string;
    donorName: string;
    category: string;
    quantity: number;
    unit: string;
    status: string;
    expiryDate: string;
    location: string;
    createdAt: string;
  }>;
  claims: Array<{
    id: string;
    donationId: string;
    ngoId: string;
    ngoName: string;
    volunteerId?: string;
    status: string;
    claimedAt: string;
  }>;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const SEED_USERS: DBUser[] = [
  {
    id: "usr_donor_001",
    email: "donor@sharebite.demo",
    password: "Demo1234",
    displayName: "UIU Central Cafeteria",
    role: UserRole.DONOR,
    phone: "01711000001",
    createdAt: new Date().toISOString(),
    profile: {
      organizationName: "United International University Cafeteria",
      donorType: "CAFETERIA",
      address: "United City, Madani Avenue, Badda, Dhaka 1212",
      bfsaCertNumber: "BFSA-2026-UIU-09",
    },
  },
  {
    id: "usr_ngo_001",
    email: "ngo@sharebite.demo",
    password: "Demo1234",
    displayName: "Hope & Mastul Foundation",
    role: UserRole.NGO,
    phone: "01711000002",
    createdAt: new Date().toISOString(),
    profile: {
      organizationName: "Mastul Foundation (Madani Branch)",
      registrationNumber: "NGO-AB-2024-912",
      capacityMealsPerDay: 250,
      serviceAreas: ["Madani Avenue", "Badda", "Natun Bazar", "Vatara"],
      address: "Road 14, Block C, Badda, Dhaka",
    },
  },
  {
    id: "usr_volunteer_001",
    email: "volunteer@sharebite.demo",
    password: "Demo1234",
    displayName: "Mahamud Hasan (Rider)",
    role: UserRole.VOLUNTEER,
    phone: "01711000003",
    createdAt: new Date().toISOString(),
    profile: {
      transportMethod: "BICYCLE",
      serviceAreas: ["UIU Campus", "Madani Avenue", "100 Feet Road"],
      studentId: "0112330182",
    },
  },
];

function ensureDbFile(): DBDocuments {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DBDocuments = {
      users: SEED_USERS,
      donations: [],
      claims: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
    return initialDb;
  }

  try {
    const content = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(content) as DBDocuments;
    if (!parsed.users || !Array.isArray(parsed.users)) {
      parsed.users = SEED_USERS;
    }
    // Ensure seed users exist in DB
    for (const seed of SEED_USERS) {
      if (!parsed.users.some((u) => u.email.toLowerCase() === seed.email.toLowerCase())) {
        parsed.users.push(seed);
      }
    }
    return parsed;
  } catch {
    const freshDb: DBDocuments = {
      users: SEED_USERS,
      donations: [],
      claims: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(freshDb, null, 2), "utf8");
    return freshDb;
  }
}

function saveDb(data: DBDocuments) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to DB file:", err);
  }
}

export const db = {
  users: {
    findMany(filterRole?: UserRole): DBUser[] {
      const dbData = ensureDbFile();
      if (!filterRole) return dbData.users;
      return dbData.users.filter((u) => u.role === filterRole);
    },

    findByEmail(email: string): DBUser | undefined {
      const dbData = ensureDbFile();
      const cleanEmail = email.trim().toLowerCase();
      return dbData.users.find((u) => u.email.toLowerCase() === cleanEmail);
    },

    findById(id: string): DBUser | undefined {
      const dbData = ensureDbFile();
      return dbData.users.find((u) => u.id === id);
    },

    create(input: {
      email: string;
      password?: string;
      displayName: string;
      role: UserRole;
      phone?: string;
      profile?: DBUser["profile"];
    }): DBUser {
      const dbData = ensureDbFile();
      const cleanEmail = input.email.trim().toLowerCase();

      const existing = dbData.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        throw new Error("এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।");
      }

      const rolePrefix = input.role.toLowerCase();
      const newUser: DBUser = {
        id: `usr_${rolePrefix}_${Date.now().toString(36)}`,
        email: cleanEmail,
        password: input.password || "Demo1234",
        displayName: input.displayName.trim(),
        role: input.role,
        phone: input.phone?.trim(),
        createdAt: new Date().toISOString(),
        profile: input.profile,
      };

      dbData.users.push(newUser);
      saveDb(dbData);
      return newUser;
    },
  },

  donations: {
    findMany() {
      const dbData = ensureDbFile();
      return dbData.donations || [];
    },
    create(donation: DBDocuments["donations"][number]) {
      const dbData = ensureDbFile();
      if (!dbData.donations) dbData.donations = [];
      dbData.donations.unshift(donation);
      saveDb(dbData);
      return donation;
    },
  },

  claims: {
    findMany() {
      const dbData = ensureDbFile();
      return dbData.claims || [];
    },
    create(claim: DBDocuments["claims"][number]) {
      const dbData = ensureDbFile();
      if (!dbData.claims) dbData.claims = [];
      dbData.claims.unshift(claim);
      saveDb(dbData);
      return claim;
    },
  },
};
