import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRight,
  BarChart2,
  Loader2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import {
  useAllStocks,
  useBuyStock,
  useMarketIndices,
  useSellStock,
  useUserBalance,
  useUserPortfolio,
  useUserWithdraw,
} from "../hooks/useQueries";

type Page = "dashboard" | "markets" | "portfolio" | "orders";

interface Props {
  userName: string;
  onNavigate: (page: Page) => void;
}

const heroChartData = Array.from({ length: 30 }, (_, i) => ({
  t: i,
  nifty: 22000 + Math.sin(i * 0.3) * 300 + i * 20 + Math.random() * 100,
  sensex: 72000 + Math.sin(i * 0.25) * 800 + i * 60 + Math.random() * 200,
}));

export default function DashboardPage({ userName, onNavigate }: Props) {
  const { data: stocks, isLoading: stocksLoading } = useAllStocks();
  const { data: indices, isLoading: indicesLoading } = useMarketIndices();
  const { data: portfolio, isLoading: portfolioLoading } = useUserPortfolio();
  const { data: balance } = useUserBalance();
  const buyMutation = useBuyStock();
  const sellMutation = useSellStock();

  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [tradeSymbol, setTradeSymbol] = useState("");
  const [tradeQty, setTradeQty] = useState("1");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpi, setWithdrawUpi] = useState("");
  const withdrawMutation = useUserWithdraw();

  const selectedStock = stocks?.find((s) => s.symbol === tradeSymbol);
  const totalValue = selectedStock ? selectedStock.price * Number(tradeQty) : 0;

  const handleTrade = async () => {
    if (!tradeSymbol) {
      toast.error("Please select a stock");
      return;
    }
    const qty = BigInt(Math.max(1, Number.parseInt(tradeQty) || 1));
    try {
      if (tradeMode === "buy") {
        await buyMutation.mutateAsync({ symbol: tradeSymbol, quantity: qty });
        toast.success(`Bought ${qty} shares of ${tradeSymbol}`);
      } else {
        await sellMutation.mutateAsync({ symbol: tradeSymbol, quantity: qty });
        toast.success(`Sold ${qty} shares of ${tradeSymbol}`);
      }
    } catch {
      toast.error("Trade failed. Please try again.");
    }
  };

  const portfolioValue =
    portfolio?.reduce(
      (sum, e) => sum + e.stock.price * Number(e.quantity),
      0,
    ) ?? 0;
  const portfolioCost =
    portfolio?.reduce((sum, e) => sum + e.buyPrice * Number(e.quantity), 0) ??
    0;
  const portfolioPnL = portfolioValue - portfolioCost;
  const isTrading = buyMutation.isPending || sellMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-card border-border overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold mb-1">
                  Welcome Back, {userName}! 👋
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Here’s what’s happening in the markets today.
                </p>
                <div className="flex flex-wrap gap-4">
                  {indicesLoading
                    ? [1, 2].map((k) => (
                        <Skeleton key={k} className="h-16 w-40" />
                      ))
                    : (
                        indices ?? [
                          {
                            name: "Nifty 50",
                            value: 22350.75,
                            dailyChangePercent: 0.82,
                          },
                          {
                            name: "Sensex",
                            value: 73945.12,
                            dailyChangePercent: 0.91,
                          },
                        ]
                      ).map((idx) => (
                        <div
                          key={idx.name}
                          className="bg-muted/30 rounded-xl px-4 py-3 border border-border min-w-[140px]"
                        >
                          <p className="text-xs text-muted-foreground mb-1">
                            {idx.name}
                          </p>
                          <p className="text-lg font-bold font-mono">
                            {idx.value.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <p
                            className={`text-xs font-semibold flex items-center gap-1 ${
                              idx.dailyChangePercent >= 0
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {idx.dailyChangePercent >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {idx.dailyChangePercent >= 0 ? "+" : ""}
                            {idx.dailyChangePercent.toFixed(2)}%
                          </p>
                        </div>
                      ))}
                  {balance !== undefined && (
                    <div className="bg-accent/10 rounded-xl px-4 py-3 border border-accent/20 min-w-[140px]">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> Balance
                      </p>
                      <p className="text-lg font-bold font-mono text-accent">
                        ₹{balance.toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full md:w-72 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={heroChartData}>
                    <Line
                      type="monotone"
                      dataKey="nifty"
                      stroke="oklch(0.55 0.18 254)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="sensex"
                      stroke="oklch(0.72 0.19 75)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.17 0.035 256)",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                      labelStyle={{ display: "none" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Market Watch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card
            className="bg-card border-border h-full"
            data-ocid="market_watch.card"
          >
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" /> Market Watch
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary h-7"
                onClick={() => onNavigate("markets")}
              >
                View All <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {stocksLoading
                ? [1, 2, 3, 4, 5].map((k) => (
                    <Skeleton key={k} className="h-10 w-full" />
                  ))
                : (stocks ?? []).slice(0, 8).map((stock, i) => (
                    <div
                      key={stock.symbol}
                      data-ocid={`market_watch.item.${i + 1}`}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-semibold">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {stock.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-medium">
                          ₹
                          {stock.price.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            stock.dailyChangePercent >= 0
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {stock.dailyChangePercent >= 0 ? "+" : ""}
                          {stock.dailyChangePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="space-y-4"
        >
          <Card
            className="bg-card border-border"
            data-ocid="portfolio_overview.card"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">My Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {portfolioLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Value
                    </span>
                    <span className="text-lg font-bold font-mono">
                      ₹
                      {portfolioValue.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total P&amp;L
                    </span>
                    <span
                      className={`text-sm font-semibold font-mono ${
                        portfolioPnL >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {portfolioPnL >= 0 ? "+" : ""}₹
                      {portfolioPnL.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Holdings
                    </span>
                    <span className="text-sm font-medium">
                      {portfolio?.length ?? 0} stocks
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border" data-ocid="holdings.card">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Your Holdings</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary h-7"
                onClick={() => onNavigate("portfolio")}
              >
                View All <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {portfolioLoading ? (
                [1, 2, 3].map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))
              ) : portfolio && portfolio.length > 0 ? (
                portfolio.slice(0, 4).map((entry, i) => {
                  const pnl =
                    (entry.stock.price - entry.buyPrice) *
                    Number(entry.quantity);
                  return (
                    <div
                      key={entry.stock.symbol}
                      data-ocid={`holdings.item.${i + 1}`}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {entry.stock.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Number(entry.quantity)} shares @ ₹
                          {entry.buyPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono">
                          ₹
                          {(
                            entry.stock.price * Number(entry.quantity)
                          ).toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                        <p
                          className={`text-xs font-semibold ${pnl >= 0 ? "text-success" : "text-destructive"}`}
                        >
                          {pnl >= 0 ? "+" : ""}₹
                          {pnl.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  data-ocid="holdings.empty_state"
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  No holdings yet. Start trading!
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Trade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <Card className="bg-card border-border" data-ocid="quick_trade.card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buy/Sell toggle */}
              <div className="grid grid-cols-2 gap-1 bg-muted/30 rounded-lg p-1">
                <button
                  type="button"
                  data-ocid="quick_trade.buy.toggle"
                  onClick={() => setTradeMode("buy")}
                  className={`py-2 rounded-md text-sm font-semibold transition-colors ${
                    tradeMode === "buy"
                      ? "bg-success text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  data-ocid="quick_trade.sell.toggle"
                  onClick={() => setTradeMode("sell")}
                  className={`py-2 rounded-md text-sm font-semibold transition-colors ${
                    tradeMode === "sell"
                      ? "bg-destructive text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  SELL
                </button>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="trade-stock"
                  className="text-xs text-muted-foreground"
                >
                  Stock
                </Label>
                <Select value={tradeSymbol} onValueChange={setTradeSymbol}>
                  <SelectTrigger
                    id="trade-stock"
                    data-ocid="quick_trade.select"
                    className="bg-input border-border"
                  >
                    <SelectValue placeholder="Select stock" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {(stocks ?? []).map((s) => (
                      <SelectItem key={s.symbol} value={s.symbol}>
                        {s.symbol} — ₹{s.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="trade-qty"
                  className="text-xs text-muted-foreground"
                >
                  Quantity
                </Label>
                <Input
                  id="trade-qty"
                  data-ocid="quick_trade.input"
                  type="number"
                  min="1"
                  value={tradeQty}
                  onChange={(e) => setTradeQty(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              {selectedStock && (
                <div className="space-y-2 text-sm bg-muted/20 rounded-lg p-3 border border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-mono">
                      ₹{selectedStock.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-mono font-semibold">
                      ₹
                      {totalValue.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}

              <Button
                data-ocid="quick_trade.submit_button"
                className={`w-full font-semibold ${
                  tradeMode === "buy"
                    ? "bg-success hover:bg-success/90 text-white"
                    : "bg-destructive hover:bg-destructive/90 text-white"
                }`}
                onClick={handleTrade}
                disabled={isTrading || !tradeSymbol}
              >
                {isTrading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {tradeMode === "buy" ? "Place Buy Order" : "Place Sell Order"}
              </Button>
            </CardContent>
          </Card>

          {/* Withdraw Funds */}
          <Card
            className="bg-card border-border"
            data-ocid="user.withdraw.card"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" /> Withdraw Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const val = Number.parseFloat(withdrawAmount);
                  if (!val || val < 300) {
                    toast.error("Minimum withdrawal is ₹300");
                    return;
                  }
                  if (!withdrawUpi.trim()) {
                    toast.error("Please enter your UPI ID");
                    return;
                  }
                  try {
                    await withdrawMutation.mutateAsync({
                      amount: val,
                      upiId: withdrawUpi.trim(),
                    });
                    toast.success(
                      `Withdrawal request of ₹${val.toLocaleString("en-IN")} submitted. Amount will be sent to your UPI ID within 24 hours.`,
                    );
                    setWithdrawAmount("");
                    setWithdrawUpi("");
                  } catch {
                    toast.error("Withdrawal request failed. Please try again.");
                  }
                }}
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount (₹) — Min ₹300</Label>
                  <Input
                    data-ocid="user.withdraw.input"
                    className="bg-input border-border font-mono"
                    type="number"
                    min="300"
                    step="0.01"
                    placeholder="Min ₹300"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">UPI ID</Label>
                  <Input
                    data-ocid="user.withdraw.upi_input"
                    className="bg-input border-border"
                    type="text"
                    placeholder="Enter your UPI ID (e.g. name@upi)"
                    value={withdrawUpi}
                    onChange={(e) => setWithdrawUpi(e.target.value)}
                    required
                  />
                </div>
                <Button
                  data-ocid="user.withdraw.submit_button"
                  type="submit"
                  className="w-full bg-primary text-primary-foreground"
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Request Withdrawal
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Top Gainers */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Gainers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(stocks ?? [])
                .filter((s) => s.dailyChangePercent > 0)
                .slice(0, 4)
                .map((s, i) => (
                  <div
                    key={s.symbol}
                    data-ocid={`top_gainers.item.${i + 1}`}
                    className="flex items-center justify-between py-1"
                  >
                    <div>
                      <p className="text-sm font-semibold">{s.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{s.price.toFixed(2)}
                      </p>
                    </div>
                    <Badge className="bg-success/20 text-success border-success/30 font-mono text-xs">
                      +{s.dailyChangePercent.toFixed(2)}%
                    </Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
