import { apiClient } from "./client";

export const watchlistApi = {
    get: async (): Promise<{ items: string[] }> => {
        const { data } = await apiClient.get("/watchlist");
        return data;
    },

    add: async (symbol: string): Promise<void> => {
        await apiClient.post(`/watchlist/${symbol}`);
    },

    remove: async (symbol: string): Promise<void> => {
        await apiClient.delete(`/watchlist/${symbol}`);
    },
};