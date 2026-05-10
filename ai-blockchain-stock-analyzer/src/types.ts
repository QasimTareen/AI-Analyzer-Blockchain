export interface Prediction {
  id: string;
  symbol: string;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number;
  price: number;
  timestamp: string;
  hash: string;
  reasoning: string;
  indicators: {
    rsi: number;
    macd: string;
    sentiment: number;
    movingAverages: {
      sma50: number;
      sma200: number;
    };
    volatility: string;
    bollingerBands: {
      upper: number;
      lower: number;
    };
  };
  history?: {
    time: string;
    price: number;
  }[];
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  volume: string;
  isCrypto?: boolean;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  isVerified: boolean;
  createdAt: any;
  updatedAt?: any;
}

export interface LedgerRecord {
  id: string;
  stockName: string;
  analysisDate: string;
  predictionResult: 'BUY' | 'SELL' | 'NEUTRAL';
  chartSnapshot?: string;
  pdfURL?: string;
  createdAt: any;
  confidence: number;
  price: number;
  reasoning: string;
}
