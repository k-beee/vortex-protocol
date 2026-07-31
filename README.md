# VORTEX PROTOCOL

> **Decentralized Multi-Venue Prediction Engine Powered by GenLayer Consensus on Studionet**

[![GenLayer Studionet](https://img.shields.io/badge/GenLayer-Studionet-7c3aed?style=for-the-badge&logo=ethereum)](https://docs.genlayer.com)
[![Contract Deployed](https://img.shields.io/badge/Studionet_Contract-0x9c939da7CC0B508c7Ae3BCC39980a0462e16c452-10b981?style=for-the-badge)](https://github.com/k-beee/vortex-protocol)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployment_Ready-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=for-the-badge)](LICENSE)

Vortex Protocol is a high-assurance prediction engine engineered on GenLayer Studionet. It enables users to stake GEN on directional price movements across top crypto assets (**BTC, ETH, SOL, BNB, AVAX**). Rather than relying on a single oracle or centralized operator, Vortex settles outcomes through an Intelligent Contract deployed on GenLayer Studionet (`0x9c939da7CC0B508c7Ae3BCC39980a0462e16c452`) that fetches completed candle data directly across five independent spot exchanges and enforces a strict 3-of-5 validator consensus.

---

## 📍 Deployed Contract Information

- **Network:** Genlayer Studio Network (Chain ID: `61999` / `0xF22F`)
- **Intelligent Contract Address:** `0x9c939da7CC0B508c7Ae3BCC39980a0462e16c452`
- **Contract Admin:** `0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74`
- **Source Code:** [`contract/VortexEngine.py`](contract/VortexEngine.py)

---

## ⚡ System Architecture & Execution Flow

Below is the end-to-end consensus and settlement pipeline governing Vortex Protocol on GenLayer Studionet:

```mermaid
flowchart TD
    subgraph Client_Layer ["Client & Wallet Execution"]
        U1["User Wallet"] -->|Submit Signed Bet| F["Vortex Cyber-Terminal UI"]
        F -->|Read State & Signed Writes| C1["VortexEngine Intelligent Contract (0x9c93...)"]
    end

    subgraph Automation_Layer ["Automated Scheduling"]
        W["Cloudflare Settlement Worker"] -->|Poll Due Markets & Trigger Settlement| C1
    end

    subgraph Consensus_Layer ["GenLayer Equivalence Consensus Engine"]
        C1 -->|Request Consensus Resolution| G1["GenLayer Leader Node"]
        G1 -->|gl.nondet.web.get| E1["Binance Spot API"]
        G1 -->|gl.nondet.web.get| E2["Bybit Spot v5 API"]
        G1 -->|gl.nondet.web.get| E3["Gate.io v4 API"]
        G1 -->|gl.nondet.web.get| E4["MEXC Spot v3 API"]
        G1 -->|gl.nondet.web.get| E5["Bitget Spot v3 API"]

        E1 & E2 & E3 & E4 & E5 -->|Historical Candle Data| V1["Validator Nodes (Independent Refetch)"]
        
        V1 -->|Validate Timestamp Alignment & 3-of-5 Directional Quorum| Q{"Consensus Reached?"}
    end

    subgraph Settlement_Layer ["Pari-Mutuel Disbursal State"]
        Q -->|Yes: >= 3 Matching Votes| S1["STATE: SETTLED (BULL or BEAR)"]
        Q -->|No: < 3 Votes or Outage| S2["STATE: INCONCLUSIVE (100% Refundable)"]
        
        S1 -->|Claim Pari-Mutuel Winnings| W1["Winning Participants Claim GEN"]
        S2 -->|Claim Full Stake Refund| W2["All Participants Refund 100% GEN"]
    end

    style Client_Layer fill:#f7f5fc,stroke:#ddd8f0,stroke-width:1px
    style Consensus_Layer fill:#f3e8ff,stroke:#7c3aed,stroke-width:2px
    style Settlement_Layer fill:#ffffff,stroke:#000000,stroke-width:2px
```

---

## 🌐 Deploying to Vercel

Vortex Protocol is pre-configured for 1-click Vercel deployment via `vercel.json`:

### Option 1: Vercel Dashboard (Recommended)
1. Import repository [`https://github.com/k-beee/vortex-protocol`](https://github.com/k-beee/vortex-protocol) into your Vercel Account.
2. Set **Root Directory** to `frontend` (or leave as root directory; `vercel.json` handles both).
3. Click **Deploy**. Vercel will automatically build Vite and host your app live!

### Option 2: Vercel CLI
```bash
npx vercel
```

---

## 🚀 Running Locally

### Frontend Cyber-Terminal
```bash
cd frontend
npm install
npm run dev
```

### Settlement Worker
```bash
cd cron
npm install
npm run build
```

---

## 📜 License & Credits

Distributed under the **MIT License**. Built by **k_bee** for GenLayer Studionet.
