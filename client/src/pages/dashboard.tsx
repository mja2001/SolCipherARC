import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  BarChart3,
  ExternalLink,
  Bot
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWallet } from "@/lib/wallet-context";
import type { Document, Purchase, SellerStats } from "@shared/schema";
import { Link } from "wouter";

function StatCard({ 
  title, 
  value, 
  change, 
  changeType,
  icon: Icon,
  isLoading 
}: { 
  title: string; 
  value: string; 
  change?: string;
  changeType?: "up" | "down";
  icon: React.ElementType;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className={`text-xs flex items-center gap-1 ${
                changeType === "up" ? "text-green-500" : "text-red-500"
              }`}>
                {changeType === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {change} from last month
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TransactionRow({ 
  purchase,
  isSeller
}: { 
  purchase: Purchase & { document?: Document };
  isSeller: boolean;
}) {
  const amount = isSeller 
    ? `+$${Number(purchase.sellerRevenueUsdc).toFixed(2)}`
    : `-$${Number(purchase.amountUsdc).toFixed(2)}`;

  const txHashShort = purchase.txHash ? `${purchase.txHash.slice(0, 8)}...${purchase.txHash.slice(-6)}` : "";
  
  return (
    <div className="py-3 border-b last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
            isSeller ? "bg-green-500/10" : "bg-primary/10"
          }`}>
            {purchase.purchasedByAgent ? (
              <Bot className="h-4 w-4 text-primary" />
            ) : isSeller ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium line-clamp-1">
              {purchase.document?.title || "Document Purchase"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{new Date(purchase.createdAt).toLocaleDateString()}</span>
              {purchase.purchasedByAgent && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  AI Agent
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-mono font-medium ${isSeller ? "text-green-500" : ""}`}>
            {amount}
          </p>
          <Badge 
            variant={purchase.status === "completed" ? "secondary" : "outline"}
            className={`text-[10px] ${purchase.status === "completed" ? "bg-green-500/10 text-green-500" : ""}`}
          >
            {purchase.status === "completed" ? "Settled" : purchase.status}
          </Badge>
        </div>
      </div>
      {/* Transaction details */}
      <div className="mt-2 ml-12 flex flex-wrap items-center gap-2 text-xs">
        <a 
          href={`https://explorer.arc.money/tx/${purchase.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline font-mono"
          data-testid={`link-tx-${purchase.id}`}
        >
          <ExternalLink className="h-3 w-3" />
          {txHashShort}
        </a>
        <span className="text-muted-foreground">on Arc Network</span>
        {purchase.x402PaymentId && (
          <Badge variant="outline" className="text-[10px] font-mono">
            x402
          </Badge>
        )}
      </div>
    </div>
  );
}

function DocumentRow({ document }: { document: Document }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium line-clamp-1">{document.title}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">{document.category}</Badge>
            <span>{document.downloads} downloads</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono font-medium">${Number(document.priceUsdc).toFixed(2)}</p>
        {Number(document.rating) > 0 && (
          <div className="flex items-center gap-1 text-xs text-yellow-500 justify-end">
            <Star className="h-3 w-3 fill-current" />
            <span>{Number(document.rating).toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isConnected, connect, address, userId } = useWallet();

  const { data: stats, isLoading: statsLoading } = useQuery<SellerStats>({
    queryKey: ["/api/seller/stats"],
    queryFn: async () => {
      const res = await fetch(`/api/seller/stats?sellerId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: myDocuments, isLoading: docsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents/my", userId],
    queryFn: async () => {
      const res = await fetch(`/api/documents/my/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: transactions, isLoading: txLoading } = useQuery<(Purchase & { document?: Document })[]>({
    queryKey: ["/api/purchases", userId],
    queryFn: async () => {
      const res = await fetch(`/api/purchases?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch purchases");
      return res.json();
    },
    enabled: !!userId,
  });

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to view your seller dashboard, earnings, and transaction history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connect} className="gap-2" data-testid="button-connect-dashboard">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Track your earnings, documents, and sales performance
          </p>
        </div>
        <Link href="/upload">
          <Button className="gap-2" data-testid="button-new-upload">
            <FileText className="h-4 w-4" />
            Upload New Document
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={stats ? `$${Number(stats.totalRevenue).toFixed(2)}` : "$0.00"}
          change="+12.5%"
          changeType="up"
          icon={DollarSign}
          isLoading={statsLoading}
        />
        <StatCard
          title="Documents Listed"
          value={stats?.documentsListed?.toString() || "0"}
          icon={FileText}
          isLoading={statsLoading}
        />
        <StatCard
          title="Total Sales"
          value={stats?.totalSales?.toString() || "0"}
          change="+8.2%"
          changeType="up"
          icon={TrendingUp}
          isLoading={statsLoading}
        />
        <StatCard
          title="Average Rating"
          value={stats ? Number(stats.avgRating).toFixed(1) : "0.0"}
          icon={Star}
          isLoading={statsLoading}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>Your latest sales and purchases</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All
              <ExternalLink className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <ScrollArea className="h-[300px]">
                {transactions.slice(0, 10).map((tx) => (
                  <TransactionRow 
                    key={tx.id} 
                    purchase={tx} 
                    isSeller={tx.sellerId === userId}
                  />
                ))}
              </ScrollArea>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Download className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">My Documents</CardTitle>
              <CardDescription>Documents you've listed for sale</CardDescription>
            </div>
            <Link href="/upload">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Add New
                <FileText className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : myDocuments && myDocuments.length > 0 ? (
              <ScrollArea className="h-[300px]">
                {myDocuments.map((doc) => (
                  <DocumentRow key={doc.id} document={doc} />
                ))}
              </ScrollArea>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No documents listed yet</p>
                <Link href="/upload">
                  <Button variant="link" className="mt-2">
                    Upload your first document
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Arc Network Info */}
      <Card className="mt-6 bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Powered by Arc Network</h3>
                <p className="text-sm text-muted-foreground">
                  All transactions settle instantly on Arc with USDC. Sub-second finality, predictable fees.
                </p>
              </div>
            </div>
            <Button variant="outline" className="gap-2 shrink-0" data-testid="button-view-arc">
              <ExternalLink className="h-4 w-4" />
              View on Arc Explorer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
