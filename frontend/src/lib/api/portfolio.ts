import { apiClient } from "./client";
import type { PortfolioPublic } from "@/types";

export const portfolioApi = {
  getPortfolio: async (): Promise<PortfolioPublic> => {
    const { data } = await apiClient.get<PortfolioPublic>("/portfolio");
    return data;
  },
};
