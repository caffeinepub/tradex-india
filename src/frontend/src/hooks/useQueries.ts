import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  InviteCode,
  MarketIndex,
  PortfolioEntry,
  RSVP,
  Stock,
  Transaction,
} from "../backend";
import { useActor } from "./useActor";

export function useAllStocks() {
  const { actor, isFetching } = useActor();
  return useQuery<Stock[]>({
    queryKey: ["stocks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStocks();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useMarketIndices() {
  const { actor, isFetching } = useActor();
  return useQuery<MarketIndex[]>({
    queryKey: ["marketIndices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMarketIndices();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useUserPortfolio() {
  const { actor, isFetching } = useActor();
  return useQuery<PortfolioEntry[]>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserPortfolio();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactionHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserTransactionHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getUserBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBuyStock() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      symbol,
      quantity,
    }: { symbol: string; quantity: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.buyStock(symbol, quantity);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      qc.invalidateQueries({ queryKey: ["balance"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useSellStock() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      symbol,
      quantity,
    }: { symbol: string; quantity: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sellStock(symbol, quantity);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      qc.invalidateQueries({ queryKey: ["balance"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

// ---------- Admin queries ----------

export function useInviteCodes() {
  const { actor, isFetching } = useActor();
  return useQuery<InviteCode[]>({
    queryKey: ["inviteCodes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllRSVPs() {
  const { actor, isFetching } = useActor();
  return useQuery<RSVP[]>({
    queryKey: ["rsvps"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRSVPs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateInviteCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.generateInviteCode();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inviteCodes"] });
    },
  });
}

export function useAdminWalletBalance() {
  // Not in current backend contract -- return a placeholder
  return useQuery<number>({
    queryKey: ["adminWallet"],
    queryFn: async () => 0,
    enabled: false,
  });
}

export function useTopUpAdminWallet() {
  return useMutation({
    mutationFn: async (_amount: number) => {
      // Simulated top-up
      await new Promise((r) => setTimeout(r, 800));
    },
  });
}

export function useWithdrawAdminWallet() {
  return useMutation({
    mutationFn: async (_amount: number) => {
      // Simulated withdrawal request
      await new Promise((r) => setTimeout(r, 800));
    },
  });
}

export function useUserWithdraw() {
  return useMutation({
    mutationFn: async (_params: { amount: number; upiId: string }) => {
      // Simulated user withdrawal request
      await new Promise((r) => setTimeout(r, 900));
    },
  });
}

export function useAddStock() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stock: Stock) => {
      if (!actor) throw new Error("Not connected");
      return actor.addStock(stock);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}

export function useInitializeMarket() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.initialize();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stocks"] });
      qc.invalidateQueries({ queryKey: ["marketIndices"] });
    },
  });
}

export function useTotalUserCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalUserCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalUserCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalTradeVolume() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalTradeVolume"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalTradeVolume();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useJoinWithInvite() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      inviteCode,
    }: { name: string; inviteCode: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitRSVP(name, true, inviteCode);
    },
  });
}
