import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertPurchaseSchema, insertAgentSessionSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

// Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ===== USER ROUTES =====
  
  // Get or create user by wallet address
  app.post("/api/users/wallet", async (req, res) => {
    try {
      const { walletAddress, displayName } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }

      let user = await storage.getUserByWallet(walletAddress);
      
      if (!user) {
        user = await storage.createUser({ walletAddress, displayName });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error with user wallet:", error);
      res.status(500).json({ error: "Failed to process user" });
    }
  });

  // ===== DOCUMENT ROUTES =====
  
  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Get documents by seller
  app.get("/api/documents/my/:sellerId", async (req, res) => {
    try {
      const { sellerId } = req.params;
      const documents = await storage.getDocumentsBySeller(sellerId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching seller documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Get single document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentWithSeller(id);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  // Create document
  app.post("/api/documents", async (req, res) => {
    try {
      const parsed = insertDocumentSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid document data", details: parsed.error });
      }
      
      const document = await storage.createDocument(parsed.data);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  // Update document
  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.updateDocument(id, req.body);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDocument(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Search documents
  app.get("/api/documents/search", async (req, res) => {
    try {
      const { q, category, maxPrice } = req.query;
      const documents = await storage.searchDocuments(
        String(q || ""),
        category ? String(category) : undefined,
        maxPrice ? Number(maxPrice) : undefined
      );
      res.json(documents);
    } catch (error) {
      console.error("Error searching documents:", error);
      res.status(500).json({ error: "Failed to search documents" });
    }
  });

  // ===== PURCHASE ROUTES (x402 Payment Flow) =====
  
  // Create purchase (simulates x402 payment)
  app.post("/api/purchases", async (req, res) => {
    try {
      const { documentId, buyerId } = req.body;
      
      if (!documentId || !buyerId) {
        return res.status(400).json({ error: "Document ID and buyer ID are required" });
      }

      // Get document
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Check if already purchased
      const alreadyPurchased = await storage.hasPurchased(buyerId, documentId);
      if (alreadyPurchased) {
        return res.status(400).json({ error: "Document already purchased" });
      }

      // Calculate fees (95% to seller, 5% platform)
      const amount = Number(document.priceUsdc);
      const platformFee = amount * 0.05;
      const sellerRevenue = amount * 0.95;

      // Create purchase record (simulating x402 payment)
      const purchase = await storage.createPurchase({
        documentId,
        buyerId,
        sellerId: document.sellerId,
        amountUsdc: amount.toFixed(2),
        platformFeeUsdc: platformFee.toFixed(2),
        sellerRevenueUsdc: sellerRevenue.toFixed(2),
        txHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""),
        x402PaymentId: "x402_" + Date.now(),
        status: "completed",
        purchasedByAgent: req.body.purchasedByAgent || false,
      });

      res.status(201).json({
        purchase,
        message: "Payment successful via x402 protocol",
        ipfsHash: document.ipfsHash,
        encryptionIv: document.encryptionIv,
      });
    } catch (error) {
      console.error("Error processing purchase:", error);
      res.status(500).json({ error: "Failed to process purchase" });
    }
  });

  // Get purchases by buyer
  app.get("/api/purchases/buyer/:buyerId", async (req, res) => {
    try {
      const { buyerId } = req.params;
      const purchases = await storage.getPurchasesByBuyer(buyerId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  // Get purchases (for dashboard - combines buyer and seller)
  app.get("/api/purchases", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const buyerPurchases = await storage.getPurchasesByBuyer(String(userId));
      const sellerPurchases = await storage.getPurchasesBySeller(String(userId));
      
      // Combine and sort by date
      const allPurchases = [...buyerPurchases, ...sellerPurchases]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(allPurchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  // ===== SELLER STATS =====
  
  app.get("/api/seller/stats", async (req, res) => {
    try {
      const { sellerId } = req.query;
      if (!sellerId) {
        return res.status(400).json({ error: "Seller ID is required" });
      }
      
      const stats = await storage.getSellerStats(String(sellerId));
      res.json(stats);
    } catch (error) {
      console.error("Error fetching seller stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ===== MARKETPLACE STATS =====
  
  app.get("/api/marketplace/stats", async (req, res) => {
    try {
      const stats = await storage.getMarketplaceStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching marketplace stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ===== AI AGENT ROUTES =====
  
  // Agent query endpoint with Gemini Function Calling
  app.post("/api/agent/query", async (req, res) => {
    try {
      const { query, budget, maxPricePerDoc, category, userId } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      // Search for relevant documents
      const documents = await storage.searchDocuments(
        query,
        category || undefined,
        maxPricePerDoc || budget || undefined
      );

      // Use Gemini to analyze and rank documents
      const prompt = `You are an AI research agent helping users find and evaluate documents in a marketplace.

User Query: "${query}"
Budget: $${budget || "unlimited"} USDC
Max per document: $${maxPricePerDoc || "no limit"} USDC
${category ? `Category filter: ${category}` : ""}

Available documents:
${documents.slice(0, 10).map((doc, i) => 
  `${i + 1}. "${doc.title}" - $${doc.priceUsdc} USDC
   Category: ${doc.category}
   Rating: ${doc.rating}/5 (${doc.ratingCount} reviews)
   Downloads: ${doc.downloads}
   Description: ${doc.description.substring(0, 100)}...`
).join("\n\n")}

Analyze these documents and provide:
1. Top 3 recommendations based on relevance to the query
2. Why each document is relevant
3. Which ones are within budget
4. Your purchase recommendation

Be helpful and concise.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const agentResponse = response.text || "I found some relevant documents for your query.";

      res.json({
        query,
        documentsFound: documents.length,
        topDocuments: documents.slice(0, 5).map(doc => ({
          id: doc.id,
          title: doc.title,
          price: doc.priceUsdc,
          rating: doc.rating,
          category: doc.category,
        })),
        agentAnalysis: agentResponse,
        canPurchase: documents.filter(d => 
          (!maxPricePerDoc || Number(d.priceUsdc) <= maxPricePerDoc) &&
          (!budget || Number(d.priceUsdc) <= budget)
        ).length,
      });
    } catch (error) {
      console.error("Error in agent query:", error);
      res.status(500).json({ error: "Agent query failed" });
    }
  });

  // Agent autonomous purchase
  app.post("/api/agent/purchase", async (req, res) => {
    try {
      const { documentId, userId, sessionId } = req.body;
      
      if (!documentId || !userId) {
        return res.status(400).json({ error: "Document ID and user ID are required" });
      }

      // Get document
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Calculate fees
      const amount = Number(document.priceUsdc);
      const platformFee = amount * 0.05;
      const sellerRevenue = amount * 0.95;

      // Create purchase with agent flag
      const purchase = await storage.createPurchase({
        documentId,
        buyerId: userId,
        sellerId: document.sellerId,
        amountUsdc: amount.toFixed(2),
        platformFeeUsdc: platformFee.toFixed(2),
        sellerRevenueUsdc: sellerRevenue.toFixed(2),
        txHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""),
        x402PaymentId: "x402_agent_" + Date.now(),
        status: "completed",
        purchasedByAgent: true,
      });

      // Log agent activity if session exists
      if (sessionId) {
        await storage.createAgentActivity({
          sessionId,
          action: "purchase",
          details: `Purchased "${document.title}" for $${document.priceUsdc} USDC`,
          documentId,
        });
      }

      res.status(201).json({
        purchase,
        document: {
          title: document.title,
          ipfsHash: document.ipfsHash,
          encryptionIv: document.encryptionIv,
        },
        message: "AI Agent purchase successful via x402 protocol",
      });
    } catch (error) {
      console.error("Error in agent purchase:", error);
      res.status(500).json({ error: "Agent purchase failed" });
    }
  });

  // Create agent session
  app.post("/api/agent/sessions", async (req, res) => {
    try {
      const parsed = insertAgentSessionSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid session data", details: parsed.error });
      }
      
      const session = await storage.createAgentSession(parsed.data);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating agent session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Get agent sessions by user
  app.get("/api/agent/sessions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const sessions = await storage.getAgentSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching agent sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  return httpServer;
}
