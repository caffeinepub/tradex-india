import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, TrendingUp } from "lucide-react";
import type { UserPage } from "../App";

interface NavbarProps {
  userName: string;
  currentPage: UserPage;
  onNavigate: (page: UserPage) => void;
  onLogout: () => void;
}

const navLinks: { id: UserPage; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "markets", label: "Markets" },
  { id: "portfolio", label: "Portfolio" },
  { id: "orders", label: "Orders" },
];

export default function Navbar({
  userName,
  currentPage,
  onNavigate,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm tracking-tight">
            <span className="text-primary">TRADE</span>X
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.id}
              data-ocid={`nav.${link.id}.link`}
              onClick={() => onNavigate(link.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                currentPage === link.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-ocid="nav.user.dropdown_menu"
              variant="ghost"
              size="sm"
              className="gap-2 h-8 px-2"
            >
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm max-w-[100px] truncate">{userName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem
              data-ocid="nav.logout.button"
              onClick={onLogout}
              className="gap-2 text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
