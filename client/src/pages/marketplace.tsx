import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  SortDesc,
  FileText,
  Download,
  Star,
  Clock,
  DollarSign,
  ShoppingCart,
  Loader2,
  FileSearch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/lib/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { DOCUMENT_CATEGORIES, type DocumentWithSeller } from "@shared/schema";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function DocumentCard({ 
  document, 
  onPurchase 
}: { 
  document: DocumentWithSeller;
  onPurchase: (doc: DocumentWithSeller) => void;
}) {
  const { isConnected } = useWallet();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await onPurchase(document);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Card className="flex flex-col hover-elevate transition-all duration-300" data-testid={`card-document-${document.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="shrink-0">
            {document.category}
          </Badge>
          <Badge variant="outline" className="font-mono shrink-0">
            ${Number(document.priceUsdc).toFixed(2)}
          </Badge>
        </div>
        <CardTitle className="text-lg line-clamp-2 mt-2">{document.title}</CardTitle>
        <CardDescription className="line-clamp-2">{document.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            <span>{document.fileType}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            <span>{formatFileSize(document.fileSize)}</span>
          </div>
          {Number(document.rating) > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              <span>{Number(document.rating).toFixed(1)} ({document.ratingCount})</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>by {document.seller?.displayName || formatAddress(document.seller?.walletAddress || "")}</span>
          <span className="opacity-50">|</span>
          <span>{document.downloads} downloads</span>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button 
          className="w-full gap-2" 
          onClick={handlePurchase}
          disabled={!isConnected || isPurchasing}
          data-testid={`button-purchase-${document.id}`}
        >
          {isPurchasing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          {isPurchasing ? "Processing..." : isConnected ? "Purchase" : "Connect Wallet"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function DocumentSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-full mt-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3 w-40 mt-3" />
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="col-span-full py-16 text-center">
      <FileSearch className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No Documents Found</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {searchQuery 
          ? `No documents match "${searchQuery}". Try adjusting your search or filters.`
          : "The marketplace is empty. Be the first to upload an encrypted document!"}
      </p>
    </div>
  );
}

export default function Marketplace() {
  const { toast } = useToast();
  const { isConnected, connect, userId } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<string>("all");

  const { data: documents, isLoading } = useQuery<DocumentWithSeller[]>({
    queryKey: ["/api/documents"],
  });

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    
    let filtered = [...documents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (category !== "all") {
      filtered = filtered.filter((doc) => doc.category === category);
    }

    // Price range filter
    if (priceRange !== "all") {
      filtered = filtered.filter((doc) => {
        const price = Number(doc.priceUsdc);
        switch (priceRange) {
          case "free": return price === 0;
          case "under1": return price > 0 && price < 1;
          case "1to5": return price >= 1 && price <= 5;
          case "5to20": return price > 5 && price <= 20;
          case "over20": return price > 20;
          default: return true;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "price-low":
        filtered.sort((a, b) => Number(a.priceUsdc) - Number(b.priceUsdc));
        break;
      case "price-high":
        filtered.sort((a, b) => Number(b.priceUsdc) - Number(a.priceUsdc));
        break;
      case "popular":
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case "rating":
        filtered.sort((a, b) => Number(b.rating) - Number(a.rating));
        break;
    }

    return filtered;
  }, [documents, searchQuery, category, sortBy, priceRange]);

  const handlePurchase = async (document: DocumentWithSeller) => {
    if (!isConnected) {
      await connect();
      return;
    }

    try {
      // x402 payment flow with Arc Network
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          buyerId: userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Purchase failed");
      }

      const result = await response.json();
      
      toast({
        title: "Purchase Successful!",
        description: `You now have access to "${document.title}". Transaction: ${result.purchase.txHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Marketplace</h1>
        <p className="text-muted-foreground">
          Browse and purchase encrypted documents with USDC micropayments
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px]" data-testid="select-category">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-[130px]" data-testid="select-price">
              <DollarSign className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Price</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="under1">Under $1</SelectItem>
              <SelectItem value="1to5">$1 - $5</SelectItem>
              <SelectItem value="5to20">$5 - $20</SelectItem>
              <SelectItem value="over20">Over $20</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]" data-testid="select-sort">
              <SortDesc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && documents && (
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredDocuments.length} of {documents.length} documents
        </div>
      )}

      {/* Document Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <DocumentSkeleton key={i} />)
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <DocumentCard 
              key={doc.id} 
              document={doc} 
              onPurchase={handlePurchase} 
            />
          ))
        ) : (
          <EmptyState searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
}
