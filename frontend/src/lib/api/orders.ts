import { apiClient } from "./client";
import type { OrderPublic, TradePublic } from "@/types";

interface OrdersPublic { orders: OrderPublic[]; total: number; }
interface TradesPublic { trades: TradePublic[]; total: number; }

export const ordersApi = {
  placeOrder: async (payload: {
    asset_id: string; side: "buy" | "sell";
    order_type: "market" | "limit"; quantity: string; price?: string;
  }): Promise<OrderPublic> => {
    const { data } = await apiClient.post<OrderPublic>("/orders", payload);
    return data;
  },

  listOrders: async (skip = 0, limit = 50): Promise<OrdersPublic> => {
    const { data } = await apiClient.get<OrdersPublic>(`/orders?skip=${skip}&limit=${limit}`);
    return data;
  },

  cancelOrder: async (id: string): Promise<OrderPublic> => {
    const { data } = await apiClient.delete<OrderPublic>(`/orders/${id}`);
    return data;
  },

  listTrades: async (skip = 0, limit = 50): Promise<TradesPublic> => {
    const { data } = await apiClient.get<TradesPublic>(`/orders/trades?skip=${skip}&limit=${limit}`);
    return data;
  },
};
