import { apiClient } from "./client";

export interface PriceAlert {
    id: string;
    asset_id: string;
    asset_symbol: string;
    target_price: string;
    direction: "above" | "below";
    note?: string;
    is_triggered: boolean;
    is_active: boolean;
    created_at: string;
    triggered_at?: string;
}

export interface AlertsResponse {
    alerts: PriceAlert[];
    total: number;
}

export const alertsApi = {
    list: async (): Promise<AlertsResponse> => {
        const { data } = await apiClient.get("/alerts");
        return data;
    },

    create: async (params: {
        asset_id: string;
        asset_symbol: string;
        target_price: number;
        direction: "above" | "below";
        note?: string;
    }): Promise<PriceAlert> => {
        const { data } = await apiClient.post("/alerts", params);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/alerts/${id}`);
    },
};