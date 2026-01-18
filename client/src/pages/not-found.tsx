import { Link } from "wouter";
import { FileQuestion, Home, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2" data-testid="button-go-home">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline" className="gap-2" data-testid="button-browse-market">
              <Store className="h-4 w-4" />
              Browse Marketplace
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
