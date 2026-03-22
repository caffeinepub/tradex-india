import { Badge } from "@/components/ui/badge";
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
import { ClipboardList } from "lucide-react";
import { motion } from "motion/react";
import { useTransactionHistory } from "../hooks/useQueries";

export default function OrdersPage() {
  const { data: transactions, isLoading } = useTransactionHistory();

  const formatDate = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold mb-1">Orders</h1>
        <p className="text-muted-foreground text-sm">
          Your complete transaction history
        </p>
      </motion.div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3 flex flex-row items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <CardTitle className="text-base">Transaction History</CardTitle>
          {transactions && (
            <Badge variant="secondary" className="ml-auto">
              {transactions.length} orders
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="orders.table">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Stock</TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Qty
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Price
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Total
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  Date &amp; Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((k) => (
                  <TableRow key={k} className="border-border">
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : transactions && transactions.length > 0 ? (
                transactions.map((tx, i) => (
                  <TableRow
                    key={`${tx.stock.symbol}-${String(tx.timestamp)}`}
                    data-ocid={`orders.row.${i + 1}`}
                    className="border-border hover:bg-muted/20"
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold ${
                          tx.transactionType.toLowerCase() === "buy"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}
                      >
                        {tx.transactionType.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-primary text-sm">
                        {tx.stock.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.stock.name}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {Number(tx.quantity)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ₹{tx.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      ₹
                      {(tx.price * Number(tx.quantity)).toLocaleString(
                        "en-IN",
                        { maximumFractionDigits: 0 },
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(tx.timestamp)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center"
                    data-ocid="orders.empty_state"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ClipboardList className="w-8 h-8 opacity-40" />
                      <p className="text-sm">
                        No orders yet. Start trading to see your history.
                      </p>
                    </div>
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
