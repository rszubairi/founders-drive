import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import VcDashboardClient from "./VcDashboardClient";

export const metadata = { title: "Investor dashboard — Founders Drive" };

export default async function VcDashboardPage() {
  const token = (await cookies()).get("fd_vc")?.value;
  if (!token) redirect("/vc/login?next=/vc/dashboard");
  return <VcDashboardClient token={token} />;
}
