"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getActivity } from "@/services/activity";
import { getWorkflows } from "@/services/config";
import { getOrders } from "@/services/orders";
import { getProducts } from "@/services/catalog";
import { getSettings } from "@/services/settings";

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const [products, orders, settings, activity, workflows] = await Promise.all([
        getProducts(),
        getOrders(),
        getSettings(),
        getActivity({ limit: 12 }),
        getWorkflows(),
      ]);

      const revenue = orders
        .filter((order) => order.paymentStatus !== "refunded")
        .reduce(
          (sum, order) =>
            sum +
            order.items.reduce(
              (itemsSum, item) => itemsSum + item.qty * item.unitPrice,
              0,
            ),
          0,
        );
      const lowStock = products.filter(
        (product) => product.stockQty <= settings.lowStockThreshold,
      );
      const activeOrders = orders.filter(
        (order) => !["completed", "cancelled"].includes(order.status),
      );
      const completedSales = orders.filter(
        (order) => order.status === "completed",
      ).length;
      const featuredProducts = products.slice(0, 3);
      const orderPipeline =
        workflows.orders?.statuses.map((status) => ({
          status,
          count: orders.filter((order) => order.status === status).length,
        })) ?? [];

      return {
        products,
        orders,
        settings,
        activity,
        revenue,
        lowStock,
        activeOrdersCount: activeOrders.length,
        completedSalesCount: completedSales,
        featuredProducts,
        orderPipeline,
      };
    },
  });
}
