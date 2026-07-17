import DashboardClient from "@/components/dashboard/dashboardClient";
import Header from "@/components/header/header";
import { getServerUserId } from "@/lib/auth/getUserId";
import { getDashboardStats } from "@/lib/stats/getDashboardStats";

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