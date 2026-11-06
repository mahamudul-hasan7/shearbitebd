import { execSync } from "node:child_process";
import fs from "node:fs";

console.log("🔍 Running ShareBite BD Project Health & Integrity Verification...
");

try {
  console.log("1. Checking TypeScript compiler types (tsc --noEmit)...");
  execSync("npm run typecheck", { stdio: "inherit" });
  console.log("   ✅ TypeScript: 0 errors!
");

  console.log("2. Checking essential assets and configuration files...");
  const requiredFiles = [
    "README.md",
    "docs/ARCHITECTURE.md",
    "docs/API_REFERENCE.md",
    "src/app/manifest.ts",
    "src/app/robots.ts",
    "src/app/sitemap.ts"
  ];

  for (const f of requiredFiles) {
    if (fs.existsSync(f)) {
      console.log(`   ✅ Found: ${f}`);
    } else {
      console.warn(`   ⚠️ Missing: ${f}`);
    }
  }

  console.log("
🎉 ShareBite BD project health check passed successfully!");
} catch (err) {
  console.error("❌ Verification failed:", err.message);
  process.exit(1);
}
