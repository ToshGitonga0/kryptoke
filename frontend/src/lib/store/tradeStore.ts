import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TradeState {
    lastSymbol: string;
    setLastSymbol: (s: string) => void;
}

export const useTradeStore = create<TradeState>()(
    persist(
        (set) => ({
            lastSymbol: "BTC",
            setLastSymbol: (s) => set({ lastSymbol: s }),
        }),
        { name: "kryptoke-trade" }
    )
);