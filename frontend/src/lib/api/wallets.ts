import { apiClient } from "./client";
import type { TransactionPublic, WalletPublic } from "@/types";

interface WalletsPublic      { wallets: WalletPublic[];          }
interface TransactionsPublic { transactions: TransactionPublic[]; total: number; }

export const walletsApi = {
  getWallets: async (): Promise<WalletsPublic> => {
    const { data } = await apiClient.get<WalletsPublic>("/wallets");
    return data;
  },

  deposit: async (currency: string, amount: string, reference?: string): Promise<WalletPublic> => {
    const { data } = await apiClient.post<WalletPublic>("/wallets/deposit", { currency, amount, reference });
    return data;
  },

  withdraw: async (currency: string, amount: string, phone_number: string): Promise<WalletPublic> => {
    const { data } = await apiClient.post<WalletPublic>("/wallets/withdraw", { currency, amount, phone_number });
    return data;
  },

  getTransactions: async (skip = 0, limit = 50): Promise<TransactionsPublic> => {
    const { data } = await apiClient.get<TransactionsPublic>(`/wallets/transactions?skip=${skip}&limit=${limit}`);
    return data;
  },
};
