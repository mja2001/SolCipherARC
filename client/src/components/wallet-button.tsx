import { Wallet, LogOut, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/lib/wallet-context";
import { Badge } from "@/components/ui/badge";

export function WalletButton() {
  const { address, isConnected, isConnecting, balance, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="gap-2"
        data-testid="button-connect-wallet"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-wallet-menu">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="font-mono text-sm">{formatAddress(address!)}</span>
          </div>
          <Badge variant="secondary" className="ml-1 font-mono">
            ${balance} USDC
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Connected to Arc Network</p>
          <p className="font-mono text-sm truncate">{address}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress} data-testid="menu-copy-address">
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem data-testid="menu-view-explorer">
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Arc Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-destructive" data-testid="menu-disconnect">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
