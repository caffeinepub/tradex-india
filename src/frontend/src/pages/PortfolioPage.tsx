import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { motion } from "motion/react";
import {
  Cell,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useUserPortfolio } from "../hooks/useQueries";

const COLORS = [
  "oklch(0.55 0.18 254)",
  "oklch(0.72 0.19 75)",
  "oklch(0.66 0.20 145)",
  "oklch(0.58 0.22 25)",
  "oklch(0.67 0.16 251)",
];

export default function PortfolioPage() {
  const { data: portfolio, isLoading } = useUserPortfolio();

  const totalValue =
    portfolio?.reduce(
      (sum, e) => sum + e.stock.price * Number(e.quantity),
      0,
    ) ?? 0;
  const totalCost =
    portfolio?.reduce((sum, e) => sum + e.buyPrice * Number(e.quantity), 0) ??
    0;
  const totalPnL = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const pieData =
    portfolio?.map((e) => ({
      name: e.stock.symbol,
      value: e.stock.price * Number(e.quantity),
    })) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold mb-1">Portfolio</h1>
        <p className="text-muted-foreground text-sm">
          Your holdings and P&L summary
        </p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Portfolio Value",
            value: `₹${totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
            icon: PieChart,
            color: "text-primary",
          },
          {
            label: "Total Invested",
            value: `₹${totalCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
            icon: Wallet,
            color: "text-accent",
          },
          {
            label: "Total P&L",
            value: `${totalPnL >= 0 ? "+" : ""}₹${totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
            icon: totalPnL >= 0 ? TrendingUp : TrendingDown,
            color: totalPnL >= 0 ? "text-success" : "text-destructive",
          },
          {
            label: "Returns",
            value: `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`,
            icon: totalPnL >= 0 ? TrendingUp : TrendingDown,
            color: pnlPct >= 0 ? "text-success" : "text-destructive",
          },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <item.icon className={`w-3 h-3 ${item.color}`} />
                  {item.label}
                </p>
                <p className={`text-lg font-bold font-mono ${item.color}`}>
                  {item.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Holdings table */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Holdings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table data-ocid="portfolio.table">
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Stock
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Qty
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Buy Price
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      CMP
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      P&amp;L
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [1, 2, 3].map((k) => (
                      <TableRow key={k} className="border-border">
                        <TableCell colSpan={5}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : portfolio && portfolio.length > 0 ? (
                    portfolio.map((entry, i) => {
                      const pnl =
                        (entry.stock.price - entry.buyPrice) *
                        Number(entry.quantity);
                      const pct =
                        ((entry.stock.price - entry.buyPrice) /
                          entry.buyPrice) *
                        100;
                      return (
                        <TableRow
                          key={entry.stock.symbol}
                          data-ocid={`portfolio.row.${i + 1}`}
                          className="border-border hover:bg-muted/20"
                        >
                          <TableCell>
                            <p className="font-semibold text-primary">
                              {entry.stock.symbol}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.stock.name}
                            </p>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {Number(entry.quantity)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            ₹{entry.buyPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            ₹{entry.stock.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <p
                              className={`font-mono text-sm font-semibold ${pnl >= 0 ? "text-success" : "text-destructive"}`}
                            >
                              {pnl >= 0 ? "+" : ""}₹
                              {pnl.toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </p>
                            <p
                              className={`text-xs ${pct >= 0 ? "text-success" : "text-destructive"}`}
                            >
                              {pct >= 0 ? "+" : ""}
                              {pct.toFixed(2)}%
                            </p>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                        data-ocid="portfolio.empty_state"
                      >
                        No holdings yet. Buy some stocks to get started!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Pie chart */}
        <div>
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {pieData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={
                              COLORS[
                                pieData.findIndex(
                                  (d) => d.name === entry.name,
                                ) % COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.17 0.035 256)",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [
                          `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                          "",
                        ]}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {pieData.map((item, i) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: COLORS[i % COLORS.length] }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-mono text-muted-foreground">
                          {totalValue > 0
                            ? ((item.value / totalValue) * 100).toFixed(1)
                            : "0"}
                          %
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm"
                  data-ocid="allocation.empty_state"
                >
                  <PieChart className="w-8 h-8 mb-2 opacity-40" />
                  No holdings to display
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
