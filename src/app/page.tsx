import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "ShareBite BD",
  description: "A responsive surplus-food rescue and redistribution platform for Bangladesh.",
};

export default function HomePage() {
  redirect(ROUTES.auth.splash);
}
