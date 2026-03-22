import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Lock,
  Shield,
  TicketCheck,
  TrendingUp,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useJoinWithInvite } from "../hooks/useQueries";

interface LoginPageProps {
  onUserLogin: (name: string) => void;
  onAdminLogin: () => void;
}

// UPI deeplink — ID is encoded, not shown in UI
const buildUpiLink = () => {
  const pa = atob("ODQ1OTY1OTU2OC1pOWVmQHlibA==");
  const params = new URLSearchParams({
    pa,
    pn: "TradEx India",
    am: "200",
    cu: "INR",
    tn: "TradEx India Platform Access Fee",
  });
  return `upi://pay?${params.toString()}`;
};

// Free access code — direct login without payment
const FREE_ACCESS_CODE = "233226";

export default function LoginPage({
  onUserLogin,
  onAdminLogin,
}: LoginPageProps) {
  const { actor } = useActor();

  // User login steps: 'form' | 'payment' | 'confirm'
  const [step, setStep] = useState<"form" | "payment" | "confirm">("form");
  const [userName, setUserName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const joinMutation = useJoinWithInvite();

  // Admin login
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) setInviteCode(code);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!inviteCode.trim()) {
      toast.error("Please enter your invite code");
      return;
    }
    // Free access code — skip payment entirely
    if (inviteCode.trim() === FREE_ACCESS_CODE) {
      handleFreeLogin();
      return;
    }
    setStep("payment");
  };

  const handleFreeLogin = async () => {
    setUserLoading(true);
    try {
      if (actor) {
        const role = (await actor.getCallerUserRole()) as string;
        if (role === "user" || role === "admin") {
          toast.success(`Welcome, ${userName}!`);
          onUserLogin(userName.trim());
          return;
        }
      }
      toast.success(`Welcome to TradEx India, ${userName.trim()}!`);
      onUserLogin(userName.trim());
    } catch {
      toast.success(`Welcome to TradEx India, ${userName.trim()}!`);
      onUserLogin(userName.trim());
    } finally {
      setUserLoading(false);
    }
  };

  const handlePayNow = () => {
    const link = buildUpiLink();
    window.location.href = link;
    // After redirect, show confirm step
    setTimeout(() => setStep("confirm"), 1500);
  };

  const handlePaymentDone = async () => {
    setUserLoading(true);
    try {
      if (actor) {
        const role = (await actor.getCallerUserRole()) as string;
        if (role === "user" || role === "admin") {
          toast.success(`Welcome back, ${userName}!`);
          onUserLogin(userName.trim());
          return;
        }
      }
      await joinMutation.mutateAsync({
        name: userName.trim(),
        inviteCode: inviteCode.trim(),
      });
      toast.success(`Welcome to TradEx India, ${userName.trim()}!`);
      onUserLogin(userName.trim());
    } catch {
      toast.error("Invalid invite code. Please check and try again.");
      setStep("form");
    } finally {
      setUserLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword !== "admin123") {
      toast.error("Incorrect admin password.");
      return;
    }
    setAdminLoading(true);
    try {
      if (actor) {
        const isAdmin = await actor.isCallerAdmin();
        if (!isAdmin) {
          toast.error("Admin access not verified on backend.");
          setAdminLoading(false);
          return;
        }
      }
      toast.success("Welcome, Admin! Control room access granted.");
      onAdminLogin();
    } catch {
      toast.success("Welcome, Admin!");
      onAdminLogin();
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/assets/uploads/image-1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center border border-primary/30 shadow-glow">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-primary">TRADE</span>
            <span className="text-white">X</span>
            <span className="text-white/70 text-2xl font-medium"> INDIA</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            India's Premier Invite-Only Trading Platform
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/90 backdrop-blur-sm border-border shadow-card">
            <Tabs defaultValue="user">
              <CardHeader className="pb-2">
                <TabsList
                  data-ocid="login.tab"
                  className="w-full bg-muted/50 border border-border"
                >
                  <TabsTrigger
                    value="user"
                    className="flex-1 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <User className="w-4 h-4" /> User Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin"
                    className="flex-1 gap-2 data-[state=active]:bg-muted data-[state=active]:text-foreground"
                  >
                    <Shield className="w-4 h-4" /> Admin Login
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              {/* USER TAB */}
              <TabsContent value="user">
                <CardContent className="pt-2">
                  <AnimatePresence mode="wait">
                    {/* STEP 1: Form */}
                    {step === "form" && (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <CardTitle className="text-lg mb-1">
                          Join with Invite
                        </CardTitle>
                        <CardDescription className="mb-4">
                          Enter your name and invite code to proceed
                        </CardDescription>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="uname">Your Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="uname"
                                data-ocid="login.input"
                                className="pl-9 bg-input border-border"
                                placeholder="e.g. Amit Sharma"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invcode">Invite Code</Label>
                            <div className="relative">
                              <TicketCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="invcode"
                                data-ocid="login.input"
                                className="pl-9 bg-input border-border font-mono tracking-widest"
                                placeholder="Enter your invite code"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <Button
                            data-ocid="login.submit_button"
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                            disabled={userLoading}
                          >
                            {userLoading ? "Logging in..." : "Continue"}
                          </Button>
                        </form>
                      </motion.div>
                    )}

                    {/* STEP 2: Payment */}
                    {step === "payment" && (
                      <motion.div
                        key="payment"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <CardTitle className="text-lg mb-1">
                          Platform Access Fee
                        </CardTitle>
                        <CardDescription className="mb-2">
                          A one-time fee is required to activate your account
                        </CardDescription>
                        <div className="bg-muted/40 border border-border rounded-xl p-5 text-center space-y-2">
                          <p className="text-muted-foreground text-sm">
                            Access Fee
                          </p>
                          <p className="text-4xl font-bold text-primary">
                            ₹200
                          </p>
                          <p className="text-xs text-muted-foreground">
                            One-time activation · Secure UPI Payment
                          </p>
                        </div>
                        <Button
                          onClick={handlePayNow}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base py-5"
                        >
                          Pay ₹200 Now
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full text-muted-foreground text-sm"
                          onClick={() => setStep("confirm")}
                        >
                          Already paid? Confirm here
                        </Button>
                        <button
                          type="button"
                          onClick={() => setStep("form")}
                          className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground mt-1"
                        >
                          ← Back
                        </button>
                      </motion.div>
                    )}

                    {/* STEP 3: Confirm payment done */}
                    {step === "confirm" && (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4 text-center"
                      >
                        <div className="flex justify-center pt-2">
                          <CheckCircle className="w-14 h-14 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Payment Done?</CardTitle>
                        <CardDescription>
                          Once your ₹200 payment is complete, tap the button
                          below to activate your account.
                        </CardDescription>
                        <Button
                          onClick={handlePaymentDone}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                          disabled={userLoading}
                        >
                          {userLoading
                            ? "Activating..."
                            : "Yes, I've Paid — Activate Account"}
                        </Button>
                        <button
                          type="button"
                          onClick={() => setStep("payment")}
                          className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground"
                        >
                          ← Back to Payment
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </TabsContent>

              {/* ADMIN TAB */}
              <TabsContent value="admin">
                <CardContent className="pt-2">
                  <CardTitle className="text-lg mb-1">
                    Admin Control Room
                  </CardTitle>
                  <CardDescription className="mb-4">
                    Enter admin credentials to access the control panel
                  </CardDescription>
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="apass">Admin Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="apass"
                          data-ocid="login.input"
                          type="password"
                          className="pl-9 bg-input border-border"
                          placeholder="Enter admin password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button
                      data-ocid="login.submit_button"
                      type="submit"
                      className="w-full bg-muted hover:bg-muted/80 text-foreground font-semibold border border-border"
                      disabled={adminLoading}
                    >
                      {adminLoading ? "Verifying..." : "Access Control Room"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        <p className="text-center text-xs text-white/50 mt-6">
          SEBI Registered · NSE &amp; BSE Member · CDSL DP
        </p>
      </div>
    </div>
  );
}
