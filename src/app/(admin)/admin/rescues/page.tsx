import { AdminListView } from "@/features/admin/admin-lists";
export const metadata = { title: "Admin rescues" };
export default function Page() {
  return <AdminListView kind="rescues" />;
}
