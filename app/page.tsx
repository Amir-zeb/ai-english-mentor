import DashboardClient from "@/components/dashboard/dashboardClient";
import Header from "@/components/header/header";
import Loader from "@/components/loader/loader";
import { getServerUserId } from "@/lib/auth/getUserId";
import { getDashboardStats } from "@/lib/stats/getDashboardStats";
import { Suspense } from "react";

export default async function Home() {
  const userId = await getServerUserId()
  const stats = await getDashboardStats(userId as string)

  return (
    <>
      <Header />
      <DashboardClient stats={stats} />
    </>
  );
}