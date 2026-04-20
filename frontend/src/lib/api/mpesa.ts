import { apiClient } from "./client";

export interface MpesaStatusResponse {
    checkout_request_id: string;
    status: "pending" | "completed" | "failed";
    message: string;
    mpesa_receipt?: string;
    amount?: string;
}

export const mpesaApi = {
    stkPush: async (amount: number, phone_number: string): Promise<MpesaStatusResponse> => {
        const { data } = await apiClient.post("/mpesa/stk-push", { amount, phone_number });
        return data;
    },

    withdraw: async (amount: number, phone_number: string): Promise<MpesaStatusResponse> => {
        const { data } = await apiClient.post("/mpesa/withdraw", { amount, phone_number });
        return data;
    },

    getStatus: async (checkout_request_id: string): Promise<MpesaStatusResponse> => {
        const { data } = await apiClient.get(`/mpesa/status/${checkout_request_id}`);
        return data;
    },
};