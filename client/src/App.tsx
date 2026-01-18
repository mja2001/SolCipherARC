import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { WalletProvider } from "@/lib/wallet-context";
import { Header } from "@/components/header";

import Landing from "@/pages/landing";
import Marketplace from "@/pages/marketplace";
import UploadPage from "@/pages/upload";
import AgentPage from "@/pages/agent";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/agent" component={AgentPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <WalletProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Header />
              <main>
                <Router />
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
