import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Bot, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Search, 
  ShoppingCart,
  FileText,
  DollarSign,
  AlertCircle,
  Settings,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useWallet } from "@/lib/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { DOCUMENT_CATEGORIES } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type MessageRole = "user" | "agent" | "system";

type Message = {
  id: string;
  role: MessageRole;
  content: string;
  action?: "search" | "evaluate" | "purchase" | "complete";
  documents?: Array<{
    id: number;
    title: string;
    price: string;
    rating: string;
  }>;
  purchasedDoc?: {
    title: string;
    price: string;
  };
};

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isSystem && (
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            isUser
              ? "bg-accent text-accent-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {isUser ? "You" : <Bot className="h-4 w-4" />}
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? "bg-primary/10"
            : isSystem
            ? "bg-muted text-center w-full text-sm text-muted-foreground"
            : "bg-muted"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {message.action === "search" && message.documents && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Search className="h-3 w-3" />
              Found {message.documents.length} documents
            </div>
            <div className="space-y-1">
              {message.documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded bg-background/50 p-2 text-xs"
                >
                  <span className="truncate flex-1 mr-2">{doc.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="font-mono">
                      ${doc.price}
                    </Badge>
                    {Number(doc.rating) > 0 && (
                      <span className="text-yellow-500">{doc.rating}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {message.action === "purchase" && message.purchasedDoc && (
          <div className="mt-2 flex items-center gap-2 text-green-500 text-xs">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Purchased "{message.purchasedDoc.title}" for ${message.purchasedDoc.price} USDC
            </span>
          </div>
        )}

        {message.action === "complete" && (
          <div className="mt-2 flex items-center gap-2 text-primary text-xs">
            <Sparkles className="h-4 w-4" />
            <span>Task completed successfully</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentPage() {
  const { toast } = useToast();
  const { isConnected, connect, balance, userId } = useWallet();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      content:
        "Hello! I'm your AI research assistant. I can help you find, evaluate, and purchase encrypted documents from the marketplace. Tell me what you're looking for!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Agent settings
  const [budget, setBudget] = useState([10]);
  const [maxPerDoc, setMaxPerDoc] = useState([5]);
  const [category, setCategory] = useState<string>("all");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` }]);
  };

  const agentMutation = useMutation({
    mutationFn: async (query: string) => {
      // Call the AI agent endpoint
      const response = await apiRequest("POST", "/api/agent/query", {
        query,
        budget: budget[0],
        maxPricePerDoc: maxPerDoc[0],
        category: category === "all" ? null : category,
      });
      return response;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userQuery = input.trim();
    setInput("");
    addMessage({ role: "user", content: userQuery });
    setIsProcessing(true);

    try {
      // Search phase - call the AI agent API
      addMessage({
        role: "agent",
        content: `Searching the marketplace for documents matching "${userQuery}"...`,
      });

      const response = await apiRequest("POST", "/api/agent/query", {
        query: userQuery,
        budget: budget[0],
        maxPricePerDoc: maxPerDoc[0],
        category: category === "all" ? null : category,
      });

      // Show search results
      if (response.topDocuments && response.topDocuments.length > 0) {
        addMessage({
          role: "agent",
          content: `Found ${response.documentsFound} documents matching your query.`,
          action: "search",
          documents: response.topDocuments,
        });

        await new Promise((r) => setTimeout(r, 500));

        // Show AI analysis
        addMessage({
          role: "agent",
          content: response.agentAnalysis || "I've analyzed the search results based on your criteria.",
        });

        // If user query contains "buy" or "purchase", auto-buy the top document
        if (
          (userQuery.toLowerCase().includes("buy") ||
          userQuery.toLowerCase().includes("purchase")) &&
          response.topDocuments.length > 0
        ) {
          const topDoc = response.topDocuments[0];
          
          await new Promise((r) => setTimeout(r, 1000));

          addMessage({
            role: "agent",
            content: `Processing x402 payment for "${topDoc.title}" on Arc Network...`,
          });

          // Actually call the purchase API
          try {
            const purchaseResult = await apiRequest("POST", "/api/agent/purchase", {
              documentId: topDoc.id,
              userId: userId,
            });

            addMessage({
              role: "agent",
              content:
                `Payment successful! Transaction hash: ${purchaseResult.purchase.txHash.slice(0, 16)}...\nThe document has been decrypted and is ready for download.`,
              action: "purchase",
              purchasedDoc: {
                title: topDoc.title,
                price: topDoc.price,
              },
            });

            const remaining = (budget[0] - Number(topDoc.price)).toFixed(2);

            await new Promise((r) => setTimeout(r, 500));

            addMessage({
              role: "agent",
              content:
                `Task complete! I've purchased 1 document for $${topDoc.price} USDC via x402 protocol. You have $${remaining} remaining in your session budget. Would you like me to find more documents?`,
              action: "complete",
            });
          } catch (purchaseError: any) {
            addMessage({
              role: "agent",
              content: `Purchase failed: ${purchaseError.message || "Unknown error"}. The document may already be in your library.`,
            });
          }
        }
      } else {
        addMessage({
          role: "agent",
          content: "I couldn't find any documents matching your query. Try adjusting your search terms or filters.",
        });
      }
    } catch (error) {
      console.error("Agent error:", error);
      addMessage({
        role: "agent",
        content:
          "I encountered an error while processing your request. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to use the AI agent for autonomous document discovery and purchases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connect} className="gap-2" data-testid="button-connect-agent">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              AI Research Agent
            </h1>
            <p className="text-muted-foreground">
              Powered by Gemini AI with autonomous purchase capabilities
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            data-testid="button-agent-settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Chat Area */}
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Agent Active</span>
                </div>
                <Badge variant="secondary" className="font-mono">
                  Budget: ${budget[0].toFixed(2)} USDC
                </Badge>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isProcessing && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <div className="absolute inset-0 h-5 w-5 animate-ping opacity-20 rounded-full bg-primary" />
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Agent Processing</span>
                      <p className="text-xs text-muted-foreground">Analyzing marketplace and executing actions...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell the agent what documents to find..."
                  disabled={isProcessing}
                  data-testid="input-agent-query"
                />
                <Button type="submit" disabled={isProcessing || !input.trim()} data-testid="button-agent-send">
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>

          {/* Settings Panel */}
          <div className={`space-y-4 ${showSettings ? "" : "hidden lg:block"}`}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Session Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label>Total Budget</Label>
                    <span className="font-mono">${budget[0].toFixed(2)}</span>
                  </div>
                  <Slider
                    value={budget}
                    onValueChange={setBudget}
                    min={1}
                    max={100}
                    step={1}
                    data-testid="slider-budget"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label>Max Per Document</Label>
                    <span className="font-mono">${maxPerDoc[0].toFixed(2)}</span>
                  </div>
                  <Slider
                    value={maxPerDoc}
                    onValueChange={setMaxPerDoc}
                    min={0.5}
                    max={50}
                    step={0.5}
                    data-testid="slider-max-per-doc"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Search Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="select-agent-category">
                      <SelectValue placeholder="Any category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Category</SelectItem>
                      {DOCUMENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Commands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Find recent research papers",
                  "Search legal templates under $5",
                  "Buy top-rated business reports",
                ].map((cmd, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start text-left text-xs h-auto py-2"
                    onClick={() => setInput(cmd)}
                    data-testid={`button-quick-cmd-${i}`}
                  >
                    {cmd}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Session Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Documents Found</span>
                  <Badge variant="secondary">{messages.filter(m => m.action === "search").length * 3}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Purchases Made</span>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    {messages.filter(m => m.action === "purchase").length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Messages</span>
                  <Badge variant="secondary">{messages.length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Powered by Gemini AI</p>
                    <p className="text-xs text-muted-foreground">
                      Using Function Calling for autonomous marketplace interactions and x402 payments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
