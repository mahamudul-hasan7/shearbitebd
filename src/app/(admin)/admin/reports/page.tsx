import { AdminListView } from "@/features/admin/admin-lists";
export const metadata = { title: "Admin reports" };
export default function Page() {
  return <AdminListView kind="reports" />;
}
