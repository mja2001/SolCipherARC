# SolCipher ARC

**Privacy-First Encrypted Document Marketplace with AI-Powered Commerce**

A decentralized marketplace for encrypted documents featuring x402 micropayments, autonomous Gemini AI agents, and instant USDC settlement on Arc Network.

## Overview

SolCipher ARC revolutionizes digital document commerce by combining privacy-preserving encryption with autonomous AI purchasing agents. Documents are encrypted client-side before upload, ensuring only paying buyers can access content.

## Key Features

### Zero-Knowledge Encryption
- **Client-side AES-256-GCM encryption** with wallet-derived keys
- **PBKDF2 key derivation** for secure key generation
- **IPFS storage** for decentralized encrypted file hosting
- Only buyers with valid payment can decrypt documents

### x402 Micropayments
- **HTTP 402 Payment Required** protocol integration
- Flexible pricing from **$0.01 to $100** per document
- **Instant USDC settlement** on Arc Network
- Sub-second transaction finality

### AI Research Agent
- **Gemini 2.5 Flash** powered document discovery
- Autonomous search, evaluation, and purchase
- **Budget-controlled** spending limits
- Intelligent content relevance scoring

### Creator Economics
- **95% revenue** goes directly to creators
- **5% platform fee** for sustainability
- **Instant payouts** via Arc Network
- No intermediaries or delays

## Tech Stack

**Frontend:**
- React + TypeScript
- Tailwind CSS + Shadcn UI
- TanStack Query
- Wouter routing

**Backend:**
- Express.js + TypeScript
- RESTful API design
- In-memory storage (PostgreSQL ready)

**AI Integration:**
- Google Gemini 2.5 Flash
- Replit AI Integrations

**Blockchain:**
- Arc Network (EVM-compatible L1)
- USDC native token
- Circle Wallet integration

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | List all documents |
| POST | `/api/documents` | Upload new document |
| POST | `/api/purchases` | Purchase document (x402) |
| POST | `/api/agent/query` | AI agent search |
| POST | `/api/agent/purchase` | AI agent purchase |
| GET | `/api/seller/stats` | Seller dashboard stats |

## Project Structure

```
client/
  src/
    components/     # Reusable UI components
    pages/          # Page components
    lib/            # Utilities and contexts
server/
  routes.ts         # API endpoints
  storage.ts        # Data storage layer
  replit_integrations/  # AI integrations
shared/
  schema.ts         # Shared types and schemas
```

## Hackathon Tracks

This project was built for the **"Agentic Commerce on Arc"** hackathon:

1. **Best Gateway-Based Micropayments Integration** - x402 protocol with USDC micropayments
2. **Best Trustless AI Agent** - Autonomous Gemini-powered purchasing agent
3. **Best Autonomous Commerce Application** - Complete AI-driven marketplace

## Architecture Highlights

### Payment Flow
1. Buyer initiates purchase
2. Server returns HTTP 402 with payment requirements
3. Wallet signs USDC transaction
4. Arc Network settles payment
5. Decryption key released to buyer

### AI Agent Flow
1. User sets research query and budget
2. Agent searches document marketplace
3. Evaluates relevance and pricing
4. Executes purchases within budget
5. Returns acquired documents

## Security

- All encryption happens client-side
- Private keys never leave the user's device
- Zero-knowledge architecture
- Wallet-based authentication

## License

MIT License

## Acknowledgments

- Built on Arc Network
- Powered by Google Gemini AI
- Circle USDC integration
- Replit development platform
