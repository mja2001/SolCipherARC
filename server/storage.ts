import { 
  type User, 
  type InsertUser, 
  type Document, 
  type InsertDocument,
  type Purchase,
  type InsertPurchase,
  type AgentSession,
  type InsertAgentSession,
  type AgentActivity,
  type InsertAgentActivity,
  type DocumentWithSeller,
  type SellerStats,
  type MarketplaceStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Documents
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentWithSeller(id: number): Promise<DocumentWithSeller | undefined>;
  getAllDocuments(): Promise<DocumentWithSeller[]>;
  getDocumentsBySeller(sellerId: string): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<void>;
  incrementDownloads(id: number): Promise<void>;

  // Purchases
  getPurchase(id: number): Promise<Purchase | undefined>;
  getPurchasesByBuyer(buyerId: string): Promise<(Purchase & { document?: Document })[]>;
  getPurchasesBySeller(sellerId: string): Promise<(Purchase & { document?: Document })[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  hasPurchased(buyerId: string, documentId: number): Promise<boolean>;

  // Agent Sessions
  getAgentSession(id: number): Promise<AgentSession | undefined>;
  getAgentSessionsByUser(userId: string): Promise<AgentSession[]>;
  createAgentSession(session: InsertAgentSession): Promise<AgentSession>;
  updateAgentSession(id: number, updates: Partial<AgentSession>): Promise<AgentSession | undefined>;

  // Agent Activities
  createAgentActivity(activity: InsertAgentActivity): Promise<AgentActivity>;
  getActivitiesBySession(sessionId: number): Promise<AgentActivity[]>;

  // Stats
  getSellerStats(sellerId: string): Promise<SellerStats>;
  getMarketplaceStats(): Promise<MarketplaceStats>;

  // Search
  searchDocuments(query: string, category?: string, maxPrice?: number): Promise<DocumentWithSeller[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private documents: Map<number, Document>;
  private purchases: Map<number, Purchase>;
  private agentSessions: Map<number, AgentSession>;
  private agentActivities: Map<number, AgentActivity>;
  private nextDocId: number;
  private nextPurchaseId: number;
  private nextSessionId: number;
  private nextActivityId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.purchases = new Map();
    this.agentSessions = new Map();
    this.agentActivities = new Map();
    this.nextDocId = 1;
    this.nextPurchaseId = 1;
    this.nextSessionId = 1;
    this.nextActivityId = 1;

    // Seed with sample data
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const sampleUsers = [
      { id: "user1", walletAddress: "0x1234567890abcdef1234567890abcdef12345678", displayName: "CryptoResearcher" },
      { id: "user2", walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12", displayName: "DataScientist" },
      { id: "user3", walletAddress: "0x9876543210fedcba9876543210fedcba98765432", displayName: "SecurityExpert" },
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, { ...user, createdAt: new Date() });
    });

    // Create sample documents
    const sampleDocs = [
      {
        sellerId: "user1",
        title: "Cybersecurity Trends Report 2025",
        description: "Comprehensive analysis of emerging cyber threats, zero-day vulnerabilities, and defense strategies for enterprise security teams.",
        category: "Research",
        priceUsdc: "2.50",
        fileSize: 2048576,
        fileType: "pdf",
        ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        encryptionIv: "a1b2c3d4e5f6g7h8i9j0k1l2",
        downloads: 45,
        rating: "4.8",
        ratingCount: 12,
        isActive: true,
      },
      {
        sellerId: "user2",
        title: "AI in Enterprise Security: 2025 Handbook",
        description: "How machine learning and AI are transforming threat detection, incident response, and security automation.",
        category: "Technical",
        priceUsdc: "3.00",
        fileSize: 3145728,
        fileType: "pdf",
        ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        encryptionIv: "m1n2o3p4q5r6s7t8u9v0w1x2",
        downloads: 32,
        rating: "4.5",
        ratingCount: 8,
        isActive: true,
      },
      {
        sellerId: "user3",
        title: "Zero-Day Vulnerability Analysis Framework",
        description: "Methodology and tools for identifying, analyzing, and responding to zero-day exploits in critical infrastructure.",
        category: "Research",
        priceUsdc: "4.50",
        fileSize: 1572864,
        fileType: "pdf",
        ipfsHash: "QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx",
        encryptionIv: "y1z2a3b4c5d6e7f8g9h0i1j2",
        downloads: 67,
        rating: "4.9",
        ratingCount: 23,
        isActive: true,
      },
      {
        sellerId: "user1",
        title: "Blockchain Smart Contract Audit Templates",
        description: "Professional audit templates and checklists for reviewing Solidity smart contracts. Includes common vulnerability patterns.",
        category: "Legal",
        priceUsdc: "5.00",
        fileSize: 524288,
        fileType: "docx",
        ipfsHash: "QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB",
        encryptionIv: "k1l2m3n4o5p6q7r8s9t0u1v2",
        downloads: 28,
        rating: "4.6",
        ratingCount: 15,
        isActive: true,
      },
      {
        sellerId: "user2",
        title: "Machine Learning Dataset: Network Traffic Patterns",
        description: "Labeled dataset of 1M+ network traffic samples for training anomaly detection models. Includes benign and malicious traffic.",
        category: "Data",
        priceUsdc: "15.00",
        fileSize: 52428800,
        fileType: "csv",
        ipfsHash: "QmVLDAhCY3X9P2uqMqv3ZN7nM8iLNQxD9GHLxY2AhQEJj5",
        encryptionIv: "w1x2y3z4a5b6c7d8e9f0g1h2",
        downloads: 12,
        rating: "4.7",
        ratingCount: 6,
        isActive: true,
      },
      {
        sellerId: "user3",
        title: "Incident Response Playbook",
        description: "Step-by-step playbooks for handling security incidents including ransomware, data breaches, and insider threats.",
        category: "Business",
        priceUsdc: "8.00",
        fileSize: 4194304,
        fileType: "pdf",
        ipfsHash: "QmRBkKi1PnthqaBaiZnXML6fH6PNqCFdpcBQGXd4KkP9Wa",
        encryptionIv: "i1j2k3l4m5n6o7p8q9r0s1t2",
        downloads: 54,
        rating: "4.8",
        ratingCount: 19,
        isActive: true,
      },
    ];

    sampleDocs.forEach((doc, index) => {
      const id = this.nextDocId++;
      this.documents.set(id, {
        id,
        ...doc,
        thumbnailUrl: null,
        createdAt: new Date(Date.now() - (index * 86400000)), // Stagger dates
      } as Document);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, displayName: insertUser.displayName || null, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Documents
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentWithSeller(id: number): Promise<DocumentWithSeller | undefined> {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    const seller = await this.getUser(doc.sellerId);
    if (!seller) return undefined;
    return {
      ...doc,
      seller: { id: seller.id, walletAddress: seller.walletAddress, displayName: seller.displayName },
    };
  }

  async getAllDocuments(): Promise<DocumentWithSeller[]> {
    const docs: DocumentWithSeller[] = [];
    for (const doc of this.documents.values()) {
      if (!doc.isActive) continue;
      const seller = await this.getUser(doc.sellerId);
      if (seller) {
        docs.push({
          ...doc,
          seller: { id: seller.id, walletAddress: seller.walletAddress, displayName: seller.displayName },
        });
      }
    }
    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getDocumentsBySeller(sellerId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter((doc) => doc.sellerId === sellerId);
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const id = this.nextDocId++;
    const newDoc: Document = {
      id,
      sellerId: doc.sellerId,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      priceUsdc: doc.priceUsdc,
      fileSize: doc.fileSize,
      fileType: doc.fileType,
      ipfsHash: doc.ipfsHash,
      encryptionIv: doc.encryptionIv,
      thumbnailUrl: doc.thumbnailUrl || null,
      downloads: 0,
      rating: "0",
      ratingCount: 0,
      isActive: doc.isActive ?? true,
      createdAt: new Date(),
    };
    this.documents.set(id, newDoc);
    return newDoc;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    const updated = { ...doc, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: number): Promise<void> {
    this.documents.delete(id);
  }

  async incrementDownloads(id: number): Promise<void> {
    const doc = this.documents.get(id);
    if (doc) {
      doc.downloads += 1;
      this.documents.set(id, doc);
    }
  }

  // Purchases
  async getPurchase(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async getPurchasesByBuyer(buyerId: string): Promise<(Purchase & { document?: Document })[]> {
    const purchases = Array.from(this.purchases.values())
      .filter((p) => p.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return purchases.map((p) => ({
      ...p,
      document: this.documents.get(p.documentId),
    }));
  }

  async getPurchasesBySeller(sellerId: string): Promise<(Purchase & { document?: Document })[]> {
    const purchases = Array.from(this.purchases.values())
      .filter((p) => p.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return purchases.map((p) => ({
      ...p,
      document: this.documents.get(p.documentId),
    }));
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const id = this.nextPurchaseId++;
    const newPurchase: Purchase = {
      id,
      ...purchase,
      status: purchase.status || "completed",
      purchasedByAgent: purchase.purchasedByAgent || false,
      createdAt: new Date(),
    };
    this.purchases.set(id, newPurchase);
    
    // Increment downloads
    await this.incrementDownloads(purchase.documentId);
    
    return newPurchase;
  }

  async hasPurchased(buyerId: string, documentId: number): Promise<boolean> {
    return Array.from(this.purchases.values()).some(
      (p) => p.buyerId === buyerId && p.documentId === documentId && p.status === "completed"
    );
  }

  // Agent Sessions
  async getAgentSession(id: number): Promise<AgentSession | undefined> {
    return this.agentSessions.get(id);
  }

  async getAgentSessionsByUser(userId: string): Promise<AgentSession[]> {
    return Array.from(this.agentSessions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAgentSession(session: InsertAgentSession): Promise<AgentSession> {
    const id = this.nextSessionId++;
    const newSession: AgentSession = {
      id,
      ...session,
      spentUsdc: "0",
      documentsFound: 0,
      documentsPurchased: 0,
      status: session.status || "active",
      createdAt: new Date(),
    };
    this.agentSessions.set(id, newSession);
    return newSession;
  }

  async updateAgentSession(id: number, updates: Partial<AgentSession>): Promise<AgentSession | undefined> {
    const session = this.agentSessions.get(id);
    if (!session) return undefined;
    const updated = { ...session, ...updates };
    this.agentSessions.set(id, updated);
    return updated;
  }

  // Agent Activities
  async createAgentActivity(activity: InsertAgentActivity): Promise<AgentActivity> {
    const id = this.nextActivityId++;
    const newActivity: AgentActivity = {
      id,
      ...activity,
      createdAt: new Date(),
    };
    this.agentActivities.set(id, newActivity);
    return newActivity;
  }

  async getActivitiesBySession(sessionId: number): Promise<AgentActivity[]> {
    return Array.from(this.agentActivities.values())
      .filter((a) => a.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Stats
  async getSellerStats(sellerId: string): Promise<SellerStats> {
    const sellerPurchases = Array.from(this.purchases.values()).filter(
      (p) => p.sellerId === sellerId && p.status === "completed"
    );
    
    const totalRevenue = sellerPurchases.reduce(
      (sum, p) => sum + Number(p.sellerRevenueUsdc), 
      0
    );
    
    const sellerDocs = Array.from(this.documents.values()).filter(
      (d) => d.sellerId === sellerId && d.isActive
    );
    
    const avgRating = sellerDocs.length > 0
      ? sellerDocs.reduce((sum, d) => sum + Number(d.rating), 0) / sellerDocs.length
      : 0;

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalSales: sellerPurchases.length,
      documentsListed: sellerDocs.length,
      avgRating: avgRating.toFixed(1),
    };
  }

  async getMarketplaceStats(): Promise<MarketplaceStats> {
    const allDocs = Array.from(this.documents.values()).filter((d) => d.isActive);
    const allPurchases = Array.from(this.purchases.values()).filter((p) => p.status === "completed");
    
    const totalVolume = allPurchases.reduce((sum, p) => sum + Number(p.amountUsdc), 0);
    const avgPrice = allDocs.length > 0
      ? allDocs.reduce((sum, d) => sum + Number(d.priceUsdc), 0) / allDocs.length
      : 0;

    return {
      totalDocuments: allDocs.length,
      totalSales: allPurchases.length,
      totalVolume: totalVolume.toFixed(2),
      avgPrice: avgPrice.toFixed(2),
    };
  }

  // Search
  async searchDocuments(query: string, category?: string, maxPrice?: number): Promise<DocumentWithSeller[]> {
    const allDocs = await this.getAllDocuments();
    const queryLower = query.toLowerCase();
    
    return allDocs.filter((doc) => {
      const matchesQuery = 
        doc.title.toLowerCase().includes(queryLower) ||
        doc.description.toLowerCase().includes(queryLower) ||
        doc.category.toLowerCase().includes(queryLower);
      
      const matchesCategory = !category || doc.category === category;
      const matchesPrice = !maxPrice || Number(doc.priceUsdc) <= maxPrice;
      
      return matchesQuery && matchesCategory && matchesPrice;
    });
  }
}

export const storage = new MemStorage();
