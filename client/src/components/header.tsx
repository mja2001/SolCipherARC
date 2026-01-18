import { Link, useLocation } from "wouter";
import { Shield, Store, Upload, Bot, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { WalletButton } from "./wallet-button";
import { useWallet } from "@/lib/wallet-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/agent", label: "AI Agent", icon: Bot },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export function Header() {
  const [location] = useLocation();
  const { isConnected } = useWallet();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">SolCipher<span className="text-primary">_ARC</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn(
                  "gap-2",
                  location === item.href && "bg-secondary"
                )}
                data-testid={`link-${item.label.toLowerCase()}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
