import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { stdio: "inherit", encoding: "utf8" });
}

const batches = {
  2: [
    {
      files: ["src/app/(auth)/splash/page.tsx"],
      msg: "feat(auth-pages): polish splash onboarding screen and animations"
    },
    {
      files: ["src/app/(auth)/role-selection/page.tsx"],
      msg: "feat(auth-pages): implement responsive role selection portal page"
    },
    {
      files: ["src/app/(auth)/login/page.tsx"],
      msg: "feat(auth-pages): enhance login portal page layout and validation"
    }
  ],
  3: [
    {
      files: ["next-env.d.ts"],
      msg: "chore: update next-env type definitions and build config"
    },
    {
      files: ["src/app/page.tsx"],
      msg: "feat(home): modernize public landing page with rich feature sections"
    }
  ]
};

const dayArg = process.argv[2] ? parseInt(process.argv[2], 10) : 2;

if (!batches[dayArg]) {
  console.error(`❌ Invalid Day: ${dayArg}. Available days: 2, 3`);
  process.exit(1);
}

console.log(`\n🚀 Executing Push Campaign for Day ${dayArg}...\n`);

const steps = batches[dayArg];
for (const step of steps) {
  try {
    run(`git add ${step.files.join(" ")}`);
    run(`git commit -m "${step.msg}"`);
  } catch (err) {
    console.warn(`⚠️ Skipped or already committed: ${step.files.join(", ")}`);
  }
}

console.log("\n📦 Pushing commits to GitHub...");
run("git push origin segmented/16-commits");
console.log(`\n✅ Day ${dayArg} successfully committed and pushed to GitHub!\n`);
