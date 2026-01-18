# SolCipher_ARC

## Overview
SolCipher_ARC is a privacy-first encrypted document marketplace with autonomous AI agents, x402 micropayments, and USDC settlements on Arc Network. Built for the "Agentic Commerce on Arc" hackathon.

## Project Goals
- Enable privacy-preserving document commerce with client-side encryption
- Implement x402 micropayments for pay-per-download access
- Autonomous Gemini AI agents for document discovery and purchase
- 95% creator revenue with instant USDC settlement

## Current State
MVP implementation complete with:
- Landing page with hero section and feature highlights
- Document marketplace with search, filter, and purchase flow
- Document upload with encryption preview
- AI Agent interface with Gemini integration
- Seller dashboard with earnings tracking
- Simulated wallet connection (Circle Wallet integration ready)

## Tech Stack
**Frontend:**
- React + TypeScript
- Tailwind CSS + Shadcn UI
- TanStack Query for data fetching
- Wouter for routing

**Backend:**
- Express.js + TypeScript
- In-memory storage (production: PostgreSQL)
- Gemini AI via Replit AI Integrations

**Blockchain (Simulated for Demo):**
- Arc Network (EVM-compatible L1)
- USDC for payments and gas
- x402 payment protocol

## Key Features

### 1. Zero-Knowledge Encryption
- Client-side AES-256-GCM encryption
- Wallet-derived encryption keys
- IPFS storage for encrypted files

### 2. x402 Micropayments
- HTTP 402 Payment Required standard
- Pay-per-download ($0.01 - $100)
- Instant USDC settlement

### 3. AI Research Agent
- Gemini 2.5 Flash for document analysis
- Autonomous search and evaluation
- Budget-controlled purchases

### 4. Creator Economics
- 95% revenue to creators
- 5% platform fee
- Instant payouts on Arc

## Project Structure
```
client/
  src/
    components/     # Reusable UI components
    pages/          # Page components
    lib/            # Utilities and contexts
server/
  routes.ts         # API endpoints
  storage.ts        # Data storage
  replit_integrations/  # AI integrations
shared/
  schema.ts         # Data models and types
```

## API Endpoints
- `GET /api/documents` - List all documents
- `POST /api/documents` - Create document
- `POST /api/purchases` - Purchase document (x402 flow)
- `POST /api/agent/query` - AI agent search
- `GET /api/seller/stats` - Seller dashboard stats

## User Preferences
- Dark mode default
- Professional crypto/blockchain theme
- Blue (#3B82F6) and purple (#8B5CF6) accent colors

## Hackathon Tracks
1. **Best Gateway-Based Micropayments** (Primary)
2. **Best use of Gemini** (Bonus - Stackable)

## Recent Changes
- Initial MVP implementation
- Gemini AI integration for agent functionality
- Complete frontend with all pages
- Backend API with document and purchase management
- Fixed purchase flow with proper wallet userId wiring
- Enhanced AI Agent with session activity stats and improved processing indicators
- Added transaction visibility with block explorer links and x402 payment badges
- Improved upload encryption visualization with algorithm/IV display
- Fixed duplicate key warnings in message components
