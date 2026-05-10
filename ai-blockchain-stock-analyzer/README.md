# 🏗️ Project Structure

```bash
├── src/
│   ├── components/                    # UI Modules & Core Interface
│   │   ├── ApiDocs/                   # API Developer Documentation Portal
│   │   ├── LandingPage.tsx            # Public Landing & Authentication Entry
│   │   ├── LedgerPage.tsx             # Blockchain-style Immutable Ledger View
│   │   ├── ProfilePage.tsx            # User Identity & Security Settings
│   │   ├── StockChat.tsx              # Gemini AI Neural Chat Interface
│   │   ├── MarketDashboard.tsx        # Real-time Market Overview Dashboard
│   │   ├── AssetCard.tsx              # Market Asset Visualization Cards
│   │   ├── AnalysisPanel.tsx          # Neural Analysis Result Panel
│   │   ├── TrendGraph.tsx             # Technical Trend Visualization Graphs
│   │   ├── MobileNavigation.tsx       # Glassmorphic Mobile Navigation System
│   │   ├── Sidebar.tsx                # Desktop Sidebar Navigation
│   │   ├── Header.tsx                 # Adaptive Top Navigation Header
│   │   └── ThreeBackground.tsx        # High-Fidelity 3D Neural Visual Engine
│   │
│   ├── context/                       # Global State Management
│   │   ├── AuthContext.tsx            # Firebase Authentication Provider
│   │   ├── ThemeContext.tsx           # Dark / Light Theme State
│   │   └── MarketContext.tsx          # Global Market Data State
│   │
│   ├── hooks/                         # Custom React Hooks
│   │   ├── useAuth.ts                 # Authentication Hook
│   │   ├── useMarketData.ts           # Market Data Fetching Logic
│   │   ├── useLedger.ts               # Ledger Interaction Logic
│   │   └── useResponsive.ts           # Responsive Breakpoint Detection
│   │
│   ├── lib/                           # Shared Infrastructure & Utilities
│   │   ├── firebase.ts                # Firebase Initialization
│   │   ├── gemini.ts                  # Gemini API Integration Layer
│   │   ├── marketEngine.ts            # Neural Market Analysis Engine
│   │   ├── confidenceEngine.ts        # AI Confidence Scoring Algorithms
│   │   ├── ledgerEngine.ts            # Blockchain-style Ledger Logic
│   │   ├── security.ts                # Validation & Security Utilities
│   │   └── utils.ts                   # Shared Tailwind / Utility Helpers
│   │
│   ├── services/                      # External Service Layer
│   │   ├── stockApi.ts                # Stock Market API Integration
│   │   ├── cryptoApi.ts               # Cryptocurrency API Integration
│   │   ├── sentimentApi.ts            # Market Sentiment Processing
│   │   └── analyticsService.ts        # AI Analysis Orchestration
│   │
│   ├── styles/                        # Styling Infrastructure
│   │   ├── globals.css                # Global Styles
│   │   ├── themes.css                 # Variable-driven Theme System
│   │   └── animations.css             # Motion & Transition Styles
│   │
│   ├── types/                         # TypeScript Definitions
│   │   ├── market.ts                  # Market Data Types
│   │   ├── ledger.ts                  # Ledger Record Types
│   │   ├── analysis.ts                # AI Analysis Types
│   │   └── user.ts                    # User Model Types
│   │
│   ├── App.tsx                        # Main Application Shell & Routing
│   ├── index.css                      # Tailwind CSS Entry
│   └── main.tsx                       # React Client Entry Point
│
├── public/                            # Static Public Assets
│   ├── icons/                         # Application Icons
│   ├── models/                        # 3D Neural Models
│   ├── textures/                      # Visual Texture Assets
│   └── manifest.json                  # PWA Manifest
│
├── firebase-blueprint.json            # Firestore Architecture Blueprint
├── firestore.rules                    # Zero-Trust Security Rules
├── firestore.indexes.json             # Firestore Query Indexes
├── tailwind.config.js                 # Tailwind Configuration
├── tsconfig.json                      # TypeScript Configuration
├── vite.config.ts                     # Vite Build Configuration
├── package.json                       # Dependency Manifest
├── .env.example                       # Environment Variable Template
└── README.md                          # Project Documentation
```
