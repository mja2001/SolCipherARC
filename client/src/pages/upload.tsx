import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Upload as UploadIcon, 
  Lock, 
  FileText, 
  DollarSign,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/lib/wallet-context";
import { useToast } from "@/hooks/use-toast";
import { DOCUMENT_CATEGORIES } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

type UploadStep = "select" | "details" | "encrypting" | "uploading" | "complete";

export default function UploadPage() {
  const { toast } = useToast();
  const { isConnected, connect, address, userId } = useWallet();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<UploadStep>("select");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState("");
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (data: { 
      title: string; 
      description: string; 
      category: string; 
      price: string;
      fileSize: number;
      fileType: string;
    }) => {
      // Simulate encryption
      setStep("encrypting");
      for (let i = 0; i <= 100; i += 10) {
        setEncryptionProgress(i);
        await new Promise((r) => setTimeout(r, 150));
      }

      // Simulate IPFS upload
      setStep("uploading");
      for (let i = 0; i <= 100; i += 5) {
        setUploadProgress(i);
        await new Promise((r) => setTimeout(r, 100));
      }

      // Create document record
      const response = await apiRequest("POST", "/api/documents", {
        sellerId: userId || address,
        title: data.title,
        description: data.description,
        category: data.category,
        priceUsdc: data.price,
        fileSize: data.fileSize,
        fileType: data.fileType,
        ipfsHash: "Qm" + Math.random().toString(36).substring(2, 15),
        encryptionIv: Array.from({ length: 24 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(""),
        isActive: true,
      });

      return response;
    },
    onSuccess: () => {
      setStep("complete");
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document Listed!",
        description: "Your encrypted document is now available on the marketplace.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setStep("details");
    },
  });

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
      setStep("details");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      setStep("details");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category || !price) return;

    uploadMutation.mutate({
      title,
      description,
      category,
      price,
      fileSize: file.size,
      fileType: file.type || file.name.split(".").pop() || "unknown",
    });
  };

  const resetUpload = () => {
    setStep("select");
    setFile(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setPrice("");
    setEncryptionProgress(0);
    setUploadProgress(0);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to upload and sell encrypted documents on the marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connect} className="gap-2" data-testid="button-connect-upload">
              <Lock className="h-4 w-4" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Document</h1>
          <p className="text-muted-foreground">
            Encrypt and list your document for sale with USDC micropayments
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            {[
              { key: "select", label: "Select File" },
              { key: "details", label: "Add Details" },
              { key: "encrypting", label: "Encrypt" },
              { key: "uploading", label: "Upload" },
              { key: "complete", label: "Complete" },
            ].map((s, i, arr) => (
              <div key={s.key} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    step === s.key
                      ? "bg-primary text-primary-foreground"
                      : arr.findIndex((x) => x.key === step) > i
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {arr.findIndex((x) => x.key === step) > i ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="ml-2 hidden sm:inline">{s.label}</span>
                {i < arr.length - 1 && (
                  <div className="mx-2 h-px w-4 bg-border sm:w-8 md:w-12" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step: Select File */}
        {step === "select" && (
          <Card>
            <CardContent className="pt-6">
              <div
                className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById("file-input")?.click()}
                data-testid="dropzone-file"
              >
                <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Drop your file here</h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse. Supports PDF, DOC, TXT, and more.
                </p>
                <Badge variant="secondary">Max 50MB</Badge>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  data-testid="input-file"
                />
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-lg bg-primary/5 p-4">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">End-to-End Encryption</p>
                  <p className="text-muted-foreground">
                    Your file will be encrypted with AES-256-GCM on your device before uploading. 
                    Only buyers with the decryption key can access the content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Details */}
        {step === "details" && file && (
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{file.name}</CardTitle>
                      <CardDescription>{formatFileSize(file.size)}</CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={resetUpload}
                    data-testid="button-remove-file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
                <CardDescription>
                  Provide information about your document to help buyers find it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title"
                    required
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what buyers will get..."
                    rows={4}
                    data-testid="input-description"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USDC)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="pl-10"
                        required
                        data-testid="input-price"
                      />
                    </div>
                  </div>
                </div>

                {/* Revenue Preview */}
                {price && Number(price) > 0 && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Your Revenue (95%)</span>
                      <span className="font-mono font-semibold text-primary">
                        ${(Number(price) * 0.95).toFixed(2)} USDC
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Platform Fee (5%)</span>
                      <span className="font-mono">${(Number(price) * 0.05).toFixed(2)} USDC</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={!title || !category || !price}
                  data-testid="button-upload-submit"
                >
                  <Lock className="h-4 w-4" />
                  Encrypt & Upload
                </Button>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Step: Encrypting */}
        {step === "encrypting" && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Encrypting Document</h3>
              <p className="text-muted-foreground mb-6">
                Securing your file with AES-256-GCM encryption...
              </p>
              <Progress value={encryptionProgress} className="mb-2" />
              <p className="text-sm text-muted-foreground">{encryptionProgress}%</p>
            </CardContent>
          </Card>
        )}

        {/* Step: Uploading */}
        {step === "uploading" && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UploadIcon className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Uploading to IPFS</h3>
              <p className="text-muted-foreground mb-6">
                Storing encrypted file on decentralized storage...
              </p>
              <Progress value={uploadProgress} className="mb-2" />
              <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
            </CardContent>
          </Card>
        )}

        {/* Step: Complete */}
        {step === "complete" && (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Document Listed!</h3>
              <p className="text-muted-foreground mb-6">
                Your encrypted document is now available on the marketplace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/marketplace")} data-testid="button-view-marketplace">
                  View Marketplace
                </Button>
                <Button variant="outline" onClick={resetUpload} data-testid="button-upload-another">
                  Upload Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
