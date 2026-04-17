import { apiClient } from "./client";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "trade" | "deposit" | "withdrawal" | "alert" | "system";
    is_read: boolean;
    created_at: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    unread_count: number;
}

export const notificationsApi = {
    list: async (skip = 0, limit = 30): Promise<NotificationsResponse> => {
        const { data } = await apiClient.get("/notifications", { params: { skip, limit } });
        return data;
    },

    markAllRead: async (): Promise<void> => {
        await apiClient.patch("/notifications/read-all");
    },

    markRead: async (id: string): Promise<Notification> => {
        const { data } = await apiClient.patch(`/notifications/${id}/read`);
        return data;
    },
};