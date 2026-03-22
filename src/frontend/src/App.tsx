import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { useActor } from "./hooks/useActor";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import MarketsPage from "./pages/MarketsPage";
import OrdersPage from "./pages/OrdersPage";
import PortfolioPage from "./pages/PortfolioPage";

const queryClient = new QueryClient();

export type UserPage = "dashboard" | "markets" | "portfolio" | "orders";
export type AdminSection = "invites" | "users" | "market" | "wallet" | "stats";
export type AppRole = "user" | "admin" | null;

function AppInner() {
  const [role, setRole] = useState<AppRole>(null);
  const [userName, setUserName] = useState("");
  const [currentPage, setCurrentPage] = useState<UserPage>("dashboard");
  const [adminSection, setAdminSection] = useState<AdminSection>("invites");
  const { actor } = useActor();

  const handleUserLogin = (name: string) => {
    setUserName(name);
    setRole("user");
  };

  const handleAdminLogin = () => {
    setRole("admin");
    setUserName("Admin");
    if (actor) actor.initialize().catch(() => {});
  };

  const handleLogout = () => {
    setRole(null);
    setUserName("");
    setCurrentPage("dashboard");
    setAdminSection("invites");
  };

  if (!role) {
    return (
      <LoginPage
        onUserLogin={handleUserLogin}
        onAdminLogin={handleAdminLogin}
      />
    );
  }

  if (role === "admin") {
    return (
      <AdminDashboard
        currentSection={adminSection}
        onSectionChange={setAdminSection}
        onLogout={handleLogout}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "markets":
        return <MarketsPage />;
      case "portfolio":
        return <PortfolioPage />;
      case "orders":
        return <OrdersPage />;
      default:
        return (
          <DashboardPage userName={userName} onNavigate={setCurrentPage} />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        userName={userName}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster />
    </QueryClientProvider>
  );
}
