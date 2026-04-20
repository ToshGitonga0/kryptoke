import { apiClient } from "./client";

export const marketsApi = {
  listAssets: async () => {
    const { data } = await apiClient.get("/markets/assets");
    return data;
  },

  getAsset: async (symbol: string) => {
    const { data } = await apiClient.get(`/markets/assets/${symbol}`);
    return data;
  },

  getPriceHistory: async (symbol: string, limit = 90) => {
    const { data } = await apiClient.get(`/markets/assets/${symbol}/history`, {
      params: { limit },
    });
    return data;
  },

  getRecentTrades: async (symbol: string, limit = 25) => {
    const { data } = await apiClient.get(`/markets/assets/${symbol}/trades`, {
      params: { limit },
    });
    return data;
  },
};