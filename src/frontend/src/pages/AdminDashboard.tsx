import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownCircle,
  BarChart2,
  Check,
  ChevronRight,
  Copy,
  Link2,
  Loader2,
  LogOut,
  PlusCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Ticket,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { AdminSection } from "../App";
import {
  useAddStock,
  useAdminWalletBalance,
  useAllRSVPs,
  useAllStocks,
  useGenerateInviteCode,
  useInitializeMarket,
  useInviteCodes,
  useTopUpAdminWallet,
  useTotalTradeVolume,
  useTotalUserCount,
  useWithdrawAdminWallet,
} from "../hooks/useQueries";

const CUSTOM_CODES_KEY = "tradex_custom_invite_codes";

export interface CustomInviteCode {
  code: string;
  userName: string;
  note: string;
  created: string;
  used: boolean;
}

export function getCustomInviteCodes(): CustomInviteCode[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_CODES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCustomInviteCodes(codes: CustomInviteCode[]) {
  localStorage.setItem(CUSTOM_CODES_KEY, JSON.stringify(codes));
}

export function markCustomCodeUsed(code: string) {
  const codes = getCustomInviteCodes();
  const updated = codes.map((c) =>
    c.code === code ? { ...c, used: true } : c,
  );
  saveCustomInviteCodes(updated);
}

interface AdminDashboardProps {
  currentSection: AdminSection;
  onSectionChange: (s: AdminSection) => void;
  onLogout: () => void;
}

const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  {
    id: "invites",
    label: "Invite Codes",
    icon: <Ticket className="w-4 h-4" />,
  },
  { id: "users", label: "Users / RSVPs", icon: <Users className="w-4 h-4" /> },
  { id: "market", label: "Market", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "wallet", label: "Admin Wallet", icon: <Wallet className="w-4 h-4" /> },
  { id: "stats", label: "Stats", icon: <BarChart2 className="w-4 h-4" /> },
];

export default function AdminDashboard({
  currentSection,
  onSectionChange,
  onLogout,
}: AdminDashboardProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/30">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">TradEx Admin</p>
              <p className="text-xs text-muted-foreground">Control Room</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`admin.${item.id}.tab`}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentSection === item.id
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {currentSection === item.id && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Button
            data-ocid="admin.logout.button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <ScrollArea className="h-screen">
          <div className="p-8">
            {currentSection === "invites" && <InviteCodesSection />}
            {currentSection === "users" && <UsersSection />}
            {currentSection === "market" && <MarketSection />}
            {currentSection === "wallet" && <WalletSection />}
            {currentSection === "stats" && <StatsSection />}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

function InviteCodesSection() {
  const { data: codes, isLoading } = useInviteCodes();
  const generate = useGenerateInviteCode();
  const [copied, setCopied] = useState<string | null>(null);

  // Custom code state
  const [customCode, setCustomCode] = useState("");
  const [customUserName, setCustomUserName] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [customCodes, setCustomCodes] =
    useState<CustomInviteCode[]>(getCustomInviteCodes);

  const refreshCustomCodes = () => setCustomCodes(getCustomInviteCodes());

  const handleCreateCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = customCode.trim();
    const userName = customUserName.trim();
    if (!code) {
      toast.error("Code value टाका");
      return;
    }
    if (!userName) {
      toast.error("User चे नाव टाका");
      return;
    }
    const existing = getCustomInviteCodes();
    if (existing.some((c) => c.code === code)) {
      toast.error("हा code आधीच exist करतो");
      return;
    }
    const newCode: CustomInviteCode = {
      code,
      userName,
      note: customNote.trim(),
      created: new Date().toLocaleDateString("en-IN"),
      used: false,
    };
    saveCustomInviteCodes([...existing, newCode]);
    refreshCustomCodes();
    setCustomCode("");
    setCustomUserName("");
    setCustomNote("");
    toast.success(`✅ Invite code "${code}" created for ${userName}!`);
  };

  const deleteCustomCode = (code: string) => {
    const updated = getCustomInviteCodes().filter((c) => c.code !== code);
    saveCustomInviteCodes(updated);
    refreshCustomCodes();
    toast.success("Code deleted");
  };

  const copyLink = (code: string) => {
    const url = `${window.location.origin}?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  const totalCustom = customCodes.length;
  const usedCustom = customCodes.filter((c) => c.used).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invite Codes</h2>
          <p className="text-muted-foreground text-sm">
            Manage and generate invite codes for new users
          </p>
        </div>
        <Button
          data-ocid="admin.invites.primary_button"
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="gap-2 bg-primary text-primary-foreground"
        >
          {generate.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PlusCircle className="w-4 h-4" />
          )}
          Auto Generate
        </Button>
      </div>

      {/* --- CUSTOM INVITE CODE CREATOR --- */}
      <Card className="bg-card border-primary/30 border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-primary">
            <UserPlus className="w-4 h-4" />
            नवीन User साठी Custom Invite Code बनवा
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCustomCode} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">User चे नाव *</Label>
                <Input
                  data-ocid="admin.invites.custom_username"
                  className="bg-input border-border"
                  placeholder="e.g. Rahul Sharma"
                  value={customUserName}
                  onChange={(e) => setCustomUserName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Invite Code Value *</Label>
                <Input
                  data-ocid="admin.invites.custom_code"
                  className="bg-input border-border font-mono tracking-widest"
                  placeholder="e.g. RAHUL2024"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Note (optional)</Label>
              <Input
                data-ocid="admin.invites.custom_note"
                className="bg-input border-border"
                placeholder="e.g. Referred by Tushar"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>
            <Button
              data-ocid="admin.invites.create_custom_button"
              type="submit"
              className="w-full bg-primary text-primary-foreground"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Custom Invite Code
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Custom Codes Table */}
      {customCodes.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Custom Invite Codes ({totalCustom} total · {usedCustom} used ·{" "}
              {totalCustom - usedCustom} available)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>User</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customCodes.map((c, i) => (
                  <TableRow
                    key={c.code}
                    data-ocid={`admin.invites.custom.${i + 1}`}
                    className="border-border"
                  >
                    <TableCell className="font-medium">{c.userName}</TableCell>
                    <TableCell>
                      <code className="font-mono text-sm bg-muted/40 px-2 py-0.5 rounded text-primary">
                        {c.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.note || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.used ? "destructive" : "outline"}
                        className={c.used ? "" : "border-primary text-primary"}
                      >
                        {c.used ? "Used" : "Available"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {c.created}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 gap-1 text-xs"
                          onClick={() => copyCode(c.code)}
                        >
                          <Copy className="w-3 h-3" /> Code
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 gap-1 text-xs text-primary"
                          onClick={() => copyLink(c.code)}
                        >
                          {copied === c.code ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Link2 className="w-3 h-3" />
                          )}{" "}
                          Link
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-destructive hover:text-destructive"
                          onClick={() => deleteCustomCode(c.code)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Auto-generated codes */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Auto-Generated Codes
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Codes</p>
              <p className="text-2xl font-bold">{codes?.length ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Used</p>
              <p className="text-2xl font-bold text-destructive">
                {codes?.filter((c) => c.used).length ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Available</p>
              <p className="text-2xl font-bold text-primary">
                {codes?.filter((c) => !c.used).length ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              All Auto-Generated Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div
                className="p-4 space-y-2"
                data-ocid="admin.invites.loading_state"
              >
                {[1, 2, 3].map((k) => (
                  <Skeleton key={k} className="h-12 w-full" />
                ))}
              </div>
            ) : !codes?.length ? (
              <div
                className="p-8 text-center text-muted-foreground"
                data-ocid="admin.invites.empty_state"
              >
                <Ticket className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No codes yet. Click "Auto Generate" to create one.
              </div>
            ) : (
              <Table data-ocid="admin.invites.table">
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((c, i) => (
                    <TableRow
                      key={c.code}
                      data-ocid={`admin.invites.item.${i + 1}`}
                      className="border-border"
                    >
                      <TableCell>
                        <code className="font-mono text-sm bg-muted/40 px-2 py-0.5 rounded text-primary">
                          {c.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={c.used ? "destructive" : "outline"}
                          className={
                            c.used ? "" : "border-primary text-primary"
                          }
                        >
                          {c.used ? "Used" : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(
                          Number(c.created / BigInt(1_000_000)),
                        ).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 gap-1 text-xs"
                            onClick={() => copyCode(c.code)}
                            data-ocid="admin.invites.secondary_button"
                          >
                            <Copy className="w-3 h-3" /> Code
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 gap-1 text-xs text-primary"
                            onClick={() => copyLink(c.code)}
                            data-ocid="admin.invites.secondary_button"
                          >
                            {copied === c.code ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Link2 className="w-3 h-3" />
                            )}{" "}
                            Link
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function UsersSection() {
  const { data: rsvps, isLoading } = useAllRSVPs();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Users / RSVPs</h2>
        <p className="text-muted-foreground text-sm">
          All users who joined via invite codes
        </p>
      </div>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Registered Users ({rsvps?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="p-4 space-y-2"
              data-ocid="admin.users.loading_state"
            >
              {[1, 2, 3, 4].map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : !rsvps?.length ? (
            <div
              className="p-8 text-center text-muted-foreground"
              data-ocid="admin.users.empty_state"
            >
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No users have joined yet.
            </div>
          ) : (
            <Table data-ocid="admin.users.table">
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Invite Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rsvps.map((r, i) => (
                  <TableRow
                    key={r.inviteCode}
                    data-ocid={`admin.users.item.${i + 1}`}
                    className="border-border"
                  >
                    <TableCell className="text-muted-foreground text-xs">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>
                      <code className="font-mono text-xs bg-muted/40 px-2 py-0.5 rounded">
                        {r.inviteCode}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-primary text-primary text-xs"
                      >
                        {r.attending ? "Active" : "Registered"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(
                        Number(r.timestamp / BigInt(1_000_000)),
                      ).toLocaleDateString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MarketSection() {
  const { data: stocks, isLoading } = useAllStocks();
  const initMutation = useInitializeMarket();
  const addMutation = useAddStock();
  const [form, setForm] = useState({
    symbol: "",
    name: "",
    price: "",
    change: "",
  });

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symbol || !form.name || !form.price) {
      toast.error("Fill all required fields");
      return;
    }
    try {
      await addMutation.mutateAsync({
        symbol: form.symbol.toUpperCase(),
        name: form.name,
        price: Number.parseFloat(form.price),
        dailyChangePercent: Number.parseFloat(form.change) || 0,
      });
      toast.success(`${form.symbol.toUpperCase()} added to market!`);
      setForm({ symbol: "", name: "", price: "", change: "" });
    } catch {
      toast.error("Failed to add stock.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Market Management</h2>
          <p className="text-muted-foreground text-sm">
            Initialize market and manage stocks
          </p>
        </div>
        <Button
          data-ocid="admin.market.primary_button"
          variant="outline"
          className="gap-2 border-primary text-primary hover:bg-primary/10"
          onClick={() => initMutation.mutate()}
          disabled={initMutation.isPending}
        >
          {initMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Initialize Market
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary" />
              Add New Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStock} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Symbol *</Label>
                  <Input
                    data-ocid="admin.market.input"
                    className="bg-input border-border font-mono"
                    placeholder="e.g. RELIANCE"
                    value={form.symbol}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, symbol: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Price (₹) *</Label>
                  <Input
                    data-ocid="admin.market.input"
                    className="bg-input border-border"
                    type="number"
                    placeholder="e.g. 2850.00"
                    value={form.price}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, price: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Company Name *</Label>
                <Input
                  data-ocid="admin.market.input"
                  className="bg-input border-border"
                  placeholder="e.g. Reliance Industries Ltd."
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Daily Change % (optional)</Label>
                <Input
                  data-ocid="admin.market.input"
                  className="bg-input border-border"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1.25"
                  value={form.change}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, change: e.target.value }))
                  }
                />
              </div>
              <Button
                data-ocid="admin.market.submit_button"
                type="submit"
                className="w-full bg-primary text-primary-foreground"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Add Stock
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              Listed Stocks ({stocks?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div
                className="p-4 space-y-2"
                data-ocid="admin.market.loading_state"
              >
                {[1, 2, 3].map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))}
              </div>
            ) : !stocks?.length ? (
              <div
                className="p-6 text-center text-muted-foreground"
                data-ocid="admin.market.empty_state"
              >
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No stocks listed. Click "Initialize Market" to add default
                stocks.
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="divide-y divide-border">
                  {stocks.map((s, i) => (
                    <div
                      key={s.symbol}
                      data-ocid={`admin.market.item.${i + 1}`}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div>
                        <p className="font-mono font-semibold text-sm">
                          {s.symbol}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">
                          ₹{s.price.toLocaleString("en-IN")}
                        </p>
                        <p
                          className={`text-xs font-medium ${s.dailyChangePercent >= 0 ? "text-primary" : "text-destructive"}`}
                        >
                          {s.dailyChangePercent >= 0 ? "+" : ""}
                          {s.dailyChangePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function WalletSection() {
  const { data: balance, isLoading } = useAdminWalletBalance();
  const topUpMutation = useTopUpAdminWallet();
  const withdrawMutation = useWithdrawAdminWallet();
  const [amount, setAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number.parseFloat(amount);
    if (!val || val < 100) {
      toast.error("Minimum top-up amount is ₹100");
      return;
    }
    try {
      await topUpMutation.mutateAsync(val);
      toast.success(
        `Admin wallet topped up with ₹${val.toLocaleString("en-IN")}`,
      );
      setAmount("");
    } catch {
      toast.error("Top-up failed.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Admin Wallet</h2>
        <p className="text-muted-foreground text-sm">
          Manage platform funds and top up admin wallet
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative bg-card border-border overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Admin Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton
                className="h-12 w-48"
                data-ocid="admin.wallet.loading_state"
              />
            ) : (
              <p className="text-4xl font-bold font-mono text-primary">
                ₹
                {(balance ?? 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Available for platform operations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary" /> Top Up Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTopUp} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Amount (₹) — Min ₹100</Label>
                <Input
                  data-ocid="admin.wallet.input"
                  className="bg-input border-border font-mono"
                  type="number"
                  min="100"
                  step="0.01"
                  placeholder="Minimum ₹100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                {[100, 500, 1000].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs border-border"
                    onClick={() => setAmount(String(preset))}
                  >
                    ₹{preset.toLocaleString("en-IN")}
                  </Button>
                ))}
              </div>
              <Button
                data-ocid="admin.wallet.submit_button"
                type="submit"
                className="w-full bg-primary text-primary-foreground"
                disabled={topUpMutation.isPending}
              >
                {topUpMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Top Up Admin Wallet
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4 text-destructive" /> Withdraw
              from Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const val = Number.parseFloat(withdrawAmount);
                if (!val || val < 10) {
                  toast.error("Minimum withdrawal is ₹10");
                  return;
                }
                try {
                  await withdrawMutation.mutateAsync(val);
                  toast.success(
                    `Withdrawal of ₹${val.toLocaleString("en-IN")} requested successfully`,
                  );
                  setWithdrawAmount("");
                } catch {
                  toast.error("Withdrawal failed.");
                }
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <Label className="text-xs">Amount (₹) — Min ₹10</Label>
                <Input
                  data-ocid="admin.wallet.withdraw_input"
                  className="bg-input border-border font-mono"
                  type="number"
                  min="10"
                  step="0.01"
                  placeholder="Minimum ₹10"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                {[10, 50, 200].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs border-border"
                    onClick={() => setWithdrawAmount(String(preset))}
                  >
                    ₹{preset.toLocaleString("en-IN")}
                  </Button>
                ))}
              </div>
              <Button
                data-ocid="admin.wallet.withdraw_button"
                type="submit"
                variant="destructive"
                className="w-full"
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Withdraw from Wallet
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function StatsSection() {
  const { data: userCount, isLoading: ucLoading } = useTotalUserCount();
  const { data: tradeVolume, isLoading: tvLoading } = useTotalTradeVolume();
  const { data: stocks } = useAllStocks();
  const { data: codes } = useInviteCodes();

  const stats = [
    {
      label: "Total Users",
      value: ucLoading ? null : String(userCount ?? 0),
      icon: <Users className="w-5 h-5" />,
      color: "text-primary",
    },
    {
      label: "Total Trade Volume",
      value: tvLoading
        ? null
        : `₹${Number(tradeVolume ?? 0).toLocaleString("en-IN")}`,
      icon: <BarChart2 className="w-5 h-5" />,
      color: "text-warning",
    },
    {
      label: "Listed Stocks",
      value: String(stocks?.length ?? 0),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-primary",
    },
    {
      label: "Invite Codes Issued",
      value: String(codes?.length ?? 0),
      icon: <Ticket className="w-5 h-5" />,
      color: "text-muted-foreground",
    },
    {
      label: "Codes Used",
      value: String(codes?.filter((c) => c.used).length ?? 0),
      icon: <Check className="w-5 h-5" />,
      color: "text-destructive",
    },
    {
      label: "Codes Available",
      value: String(codes?.filter((c) => !c.used).length ?? 0),
      icon: <Ticket className="w-5 h-5" />,
      color: "text-primary",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Platform Statistics</h2>
        <p className="text-muted-foreground text-sm">
          Overview of TradEx India platform metrics
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            data-ocid={`admin.stats.card.${i + 1}`}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-5">
                <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
                {stat.value === null ? (
                  <Skeleton className="h-8 w-24 mb-1" />
                ) : (
                  <p
                    className={`text-2xl font-bold font-mono mb-1 ${stat.color}`}
                  >
                    {stat.value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <Separator className="bg-border" />
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Platform Health
          </p>
          <p className="text-sm text-primary font-medium">
            ✓ All systems operational
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            TradEx India — Powered by Internet Computer
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
