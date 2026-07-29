"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getActivity } from "@/services/activity";
import { getProducts } from "@/services/catalog";
import { getWorkflows } from "@/services/config";
import { getCustomers } from "@/services/customers";
import { getOrders } from "@/services/orders";
import { getRepairs } from "@/services/repairs";
import { getSettings } from "@/services/settings";

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const [
        products,
        orders,
        repairs,
        customers,
        settings,
        activity,
        workflows,
      ] = await Promise.all([
        getProducts(),
        getOrders(),
        getRepairs(),
        getCustomers(),
        getSettings(),
        getActivity({ limit: 12 }),
        getWorkflows(),
      ]);

      const revenue = orders
        .filter(
          (order) =>
            !["refunded", "cancelled", "failed"].includes(order.paymentStatus),
        )
        .reduce((sum, order) => sum + order.total, 0);
      const lowStock = products.filter(
        (product) =>
          product.stockQty <=
          (product.minStockQty ?? settings.lowStockThreshold),
      );
      const activeOrders = orders.filter(
        (order) => !["delivered", "cancelled", "returned"].includes(order.status),
      );
      const completedSales = orders.filter((order) => order.status === "delivered").length;
      const featuredProducts = products.slice(0, 3);
      const latestOrders = [...orders]
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
        )
        .slice(0, 6);
      const latestRepairs = [...repairs]
        .sort(
          (left, right) =>
            new Date(
              right.receivedAt ?? right.createdAt ?? right.updatedAt,
            ).getTime() -
            new Date(
              left.receivedAt ?? left.createdAt ?? left.updatedAt,
            ).getTime(),
        )
        .slice(0, 6);
      const orderPipeline =
        workflows.orders?.statuses.map((status) => ({
          status,
          count: orders.filter((order) => order.status === status).length,
        })) ?? [];

      return {
        products,
        orders,
        repairs,
        customers,
        settings,
        activity,
        revenue,
        lowStock,
        activeOrdersCount: activeOrders.length,
        completedSalesCount: completedSales,
        featuredProducts,
        latestOrders,
        latestRepairs,
        orderPipeline,
      };
    },
  });
}
