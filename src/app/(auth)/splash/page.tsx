import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function SplashPage() {
  redirect(ROUTES.auth.login);
}
