import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/services/dashboard.service"

const DASHBOARD_KEY = ["dashboard-counts"]

export const useDashboardCounts = () =>
  useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: async () => ({
      userCount: await dashboardService.getUserCount(),
      productCount: await dashboardService.getProductCount(),
    }),
  })
