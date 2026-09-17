import { FoodRequestWizard } from "@/features/requests/request-wizard";

export const metadata = { title: "Create Food Request | ShareBite BD", description: "Create a verified NGO food request with preferences, quantity, timing, location, and review." };

export default function NGONewRequestPage() {
  return <FoodRequestWizard />;
}
