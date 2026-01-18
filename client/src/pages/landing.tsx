import { Link } from "wouter";
import { 
  Shield, 
  Lock, 
  Zap, 
  Bot, 
  DollarSign, 
  ArrowRight,
  CheckCircle2,
  Globe,
  FileText,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/lib/wallet-context";

const features = [
  {
    icon: Lock,
    title: "Zero-Knowledge Privacy",
    description: "Client-side AES-256-GCM encryption ensures only you can access your documents. We never see your data.",
  },
  {
    icon: Zap,
    title: "x402 Micropayments",
    description: "Pay-per-download with instant USDC settlements on Arc Network. No subscriptions, no minimums.",
  },
  {
    icon: Bot,
    title: "AI-Powered Discovery",
    description: "Gemini AI agents autonomously search, evaluate, and purchase documents on your behalf.",
  },
  {
    icon: DollarSign,
    title: "95% Creator Revenue",
    description: "Keep 95% of every sale with instant payouts. No 30-day waits, no hidden fees.",
  },
];

const stats = [
  { value: "500+", label: "Documents" },
  { value: "$50K+", label: "Volume" },
  { value: "95%", label: "To Creators" },
  { value: "<1s", label: "Settlement" },
];

const useCases = [
  { icon: FileText, title: "Research Papers", desc: "Academic and scientific research" },
  { icon: Shield, title: "Legal Templates", desc: "Contracts and agreements" },
  { icon: TrendingUp, title: "Market Reports", desc: "Business intelligence" },
  { icon: Globe, title: "Training Data", desc: "AI and ML datasets" },
];

export default function Landing() {
  const { connect, isConnected, isConnecting } = useWallet();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 gap-2">
              <Zap className="h-3 w-3" />
              Powered by Arc Network & Gemini AI
            </Badge>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Privacy-First{" "}
              <span className="gradient-text">Encrypted</span>
              <br />
              Document Marketplace
            </h1>
            
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Upload encrypted documents, set your price, and let AI agents discover and purchase them 
              with USDC micropayments. Zero-knowledge security meets agentic commerce.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button size="lg" className="gap-2 min-w-[200px]" data-testid="button-browse-marketplace">
                  <Shield className="h-5 w-5" />
                  Browse Marketplace
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              {!isConnected && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 min-w-[200px]"
                  onClick={connect}
                  disabled={isConnecting}
                  data-testid="button-start-selling"
                >
                  <DollarSign className="h-5 w-5" />
                  {isConnecting ? "Connecting..." : "Start Selling"}
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat, i) => (
                <Card key={i} className="text-center glass">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why SolCipher_ARC?</h2>
          <p className="text-muted-foreground">
            The first privacy-first marketplace where AI agents autonomously discover and purchase 
            encrypted documents using USDC micropayments on Arc.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Card key={i} className="hover-elevate transition-all duration-300">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Three simple steps to privacy-preserving document commerce
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Upload & Encrypt",
                  desc: "Documents are encrypted client-side with AES-256-GCM before uploading to IPFS. Only wallet owners can decrypt."
                },
                {
                  step: "02", 
                  title: "Set Your Price",
                  desc: "List your encrypted document on the marketplace. Set any price from $0.01 to $100 in USDC."
                },
                {
                  step: "03",
                  title: "Instant Earnings",
                  desc: "When someone buys, you receive 95% instantly via Arc Network. No delays, no middlemen."
                }
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="mb-4 text-5xl font-bold text-primary/20">{item.step}</div>
                  <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                  {i < 2 && (
                    <ArrowRight className="absolute -right-4 top-8 hidden h-6 w-6 text-muted-foreground/30 md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Agent Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 gap-2">
                <Bot className="h-3 w-3" />
                Powered by Gemini AI
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                Autonomous AI Agents
              </h2>
              <p className="text-muted-foreground mb-6">
                Let AI agents browse, evaluate, and purchase documents on your behalf. 
                Set your budget, criteria, and watch as your agent builds your research library.
              </p>
              <ul className="space-y-3">
                {[
                  "Natural language search queries",
                  "Autonomous purchase decisions",
                  "Budget management & controls",
                  "Real-time activity monitoring"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/agent">
                <Button className="mt-6 gap-2" data-testid="button-try-agent">
                  <Bot className="h-4 w-4" />
                  Try AI Agent
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <Card className="p-6 glass">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    AI
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    Found 12 documents matching "cybersecurity research 2025". 
                    Top match: "Zero-Day Vulnerability Report Q4" - $2.50 USDC, 4.8 rating.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    You
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3 text-sm">
                    Purchase the top 3 documents under $5 each
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    AI
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    Purchasing 3 documents for $7.25 USDC total...
                    <div className="mt-2 flex items-center gap-2 text-green-500">
                      <CheckCircle2 className="h-4 w-4" />
                      Complete! Documents ready for download.
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Can You Sell?</h2>
            <p className="text-muted-foreground">
              From research papers to training datasets, monetize any digital document
            </p>
          </div>

          <div className="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((useCase, i) => (
              <Card key={i} className="text-center hover-elevate">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <useCase.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="mx-auto max-w-4xl animated-gradient p-px">
          <div className="rounded-lg bg-card p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join the future of privacy-first document commerce. Connect your wallet 
              and start selling or let AI agents discover documents for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button size="lg" className="gap-2 min-w-[180px]" data-testid="button-explore-now">
                  <Store className="h-5 w-5" />
                  Explore Now
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="lg" variant="outline" className="gap-2 min-w-[180px]" data-testid="button-upload-doc">
                  <Upload className="h-5 w-5" />
                  Upload Document
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold">SolCipher_ARC</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Built for Agentic Commerce on Arc Hackathon. Powered by Circle, Arc Network, and Gemini AI.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>x402 Protocol</span>
              <span>USDC Payments</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Import icons used in CTA
import { Store, Upload } from "lucide-react";
