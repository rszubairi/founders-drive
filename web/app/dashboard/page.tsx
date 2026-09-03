import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const metadata = { title: "Founder dashboard — Founders Drive" };

export default async function DashboardPage() {
  const token = (await cookies()).get("fd_founder")?.value;
  if (!token) redirect("/founder/login?next=/dashboard");
  return <DashboardClient token={token} />;
}
