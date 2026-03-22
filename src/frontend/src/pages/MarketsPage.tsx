import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAllStocks, useMarketIndices } from "../hooks/useQueries";

export default function MarketsPage() {
  const { data: stocks, isLoading } = useAllStocks();
  const { data: indices } = useMarketIndices();
  const [search, setSearch] = useState("");

  const filtered = (stocks ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.symbol.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold mb-1">Markets</h1>
        <p className="text-muted-foreground text-sm">
          Live stock prices from NSE & BSE
        </p>
      </motion.div>

      {/* Index cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(
          indices ?? [
            { name: "Nifty 50", value: 22350.75, dailyChangePercent: 0.82 },
            { name: "Sensex", value: 73945.12, dailyChangePercent: 0.91 },
            { name: "Nifty Bank", value: 48213.5, dailyChangePercent: -0.34 },
            { name: "Nifty IT", value: 37892.25, dailyChangePercent: 1.24 },
          ]
        ).map((idx, i) => (
          <motion.div
            key={idx.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="bg-card border-border"
              data-ocid={`market.index.${i + 1}`}
            >
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{idx.name}</p>
                <p className="text-lg font-bold font-mono">
                  {idx.value.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p
                  className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${
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
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stocks table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <CardTitle className="text-base">All Stocks</CardTitle>
          <div className="relative sm:ml-auto w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              data-ocid="markets.search_input"
              className="pl-8 h-8 bg-input border-border text-sm"
              placeholder="Search stocks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="markets.table">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Symbol</TableHead>
                <TableHead className="text-muted-foreground">Company</TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Price (₹)
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Day Change
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? [1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
                    <TableRow key={k} className="border-border">
                      <TableCell colSpan={4}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : filtered.map((stock, i) => (
                    <TableRow
                      key={stock.symbol}
                      data-ocid={`markets.row.${i + 1}`}
                      className="border-border hover:bg-muted/20 cursor-default"
                    >
                      <TableCell className="font-semibold text-primary">
                        {stock.symbol}
                      </TableCell>
                      <TableCell className="text-sm">{stock.name}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {stock.price.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs ${
                            stock.dailyChangePercent >= 0
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}
                        >
                          {stock.dailyChangePercent >= 0 ? "+" : ""}
                          {stock.dailyChangePercent.toFixed(2)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="markets.empty_state"
                  >
                    No stocks found matching "{search}"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
