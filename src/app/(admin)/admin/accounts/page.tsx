import { AdminListView } from "@/features/admin/admin-lists";
export const metadata = { title: "Admin accounts" };
export default function Page() {
  return <AdminListView kind="accounts" />;
}
