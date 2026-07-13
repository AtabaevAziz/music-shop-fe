"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getAppConfig } from "@/services/config";
import {
  getClientMe,
  getClientOrders,
  getClientProducts,
  getClientRepairs,
} from "@/services/client";

export function useClientHomeQuery() {
  return useQuery({
    queryKey: queryKeys.clientHome,
    queryFn: async () => {
      const [customer, orders, repairRequests, products, appConfig] =
        await Promise.all([
          getClientMe(),
          getClientOrders(),
          getClientRepairs(),
          getClientProducts(),
          getAppConfig(),
        ]);

      const activeOrders = orders.filter(
        (order) => !["completed", "cancelled"].includes(order.status),
      );
      const activeProducts = products.filter(
        (product) => product.status === "active",
      );
      const openRepairs = repairRequests.filter(
        (request) => !["completed", "cancelled"].includes(request.status),
      );
      const readyCount =
        orders.filter((order) => order.status === "ready_for_pickup").length +
        repairRequests.filter((request) => request.status === "ready").length;
      const spent = orders.reduce(
        (sum, order) =>
          sum +
          order.items.reduce(
            (itemsSum, item) => itemsSum + item.qty * item.unitPrice,
            0,
          ),
        0,
      );

      return {
        customer,
        orders,
        repairRequests,
        products,
        currency: appConfig.defaultCurrency,
        activeOrdersCount: activeOrders.length,
        openRepairsCount: openRepairs.length,
        readyCount,
        spent,
        featuredProducts: activeProducts.slice(0, 3),
        recentActivity: [...orders, ...repairRequests]
          .sort(
            (left, right) =>
              new Date(right.updatedAt).getTime() -
              new Date(left.updatedAt).getTime(),
          )
          .slice(0, 4),
      };
    },
  });
}
