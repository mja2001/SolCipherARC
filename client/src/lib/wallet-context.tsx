import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiRequest } from "./queryClient";

type WalletContextType = {
  address: string | null;
  userId: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEY = "solcipher_wallet";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState("0.00");

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { address, userId, balance } = JSON.parse(stored);
        setAddress(address);
        setUserId(userId);
        setBalance(balance);
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Simulate wallet connection - in production, integrate Circle Programmable Wallets
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockAddress = "0x" + Array(40).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      
      // Register/get user in backend
      const user = await apiRequest("POST", "/api/users/wallet", {
        walletAddress: mockAddress,
        displayName: "User_" + mockAddress.slice(2, 8),
      });
      
      const userBalance = (Math.random() * 1000 + 100).toFixed(2);
      
      setAddress(mockAddress);
      setUserId(user.id);
      setBalance(userBalance);
      
      // Persist session
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        address: mockAddress,
        userId: user.id,
        balance: userBalance,
      }));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setUserId(null);
    setBalance("0.00");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        userId,
        isConnected: !!address,
        isConnecting,
        balance,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
