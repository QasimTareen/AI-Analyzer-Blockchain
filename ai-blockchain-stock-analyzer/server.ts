import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import NodeCache from "node-cache";
import nodemailer from "nodemailer";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Assumes environment provided ADC
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
  });
}

const db_admin = admin.firestore();

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Initialize Cache: TTL of 5 minutes (300 seconds)
const analysisCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' })); // Support base64 image uploads

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User: Update Profile Pic (Base64)
  app.post("/api/user/profile-pic", async (req, res) => {
    const { userId, photoBase64 } = req.body;
    if (!userId || !photoBase64) return res.status(400).json({ error: "UserID and Image required" });

    try {
      await db_admin.collection('users').doc(userId).update({
        photoURL: photoBase64,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (err) {
      console.error("Profile Pic Update Error:", err);
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  });

  // Chat endpoint (DeepSeek)
   app.post("/api/chat", async (req, res) => {
     const { messages } = req.body;
     
     if (!messages || !Array.isArray(messages)) {
       return res.status(400).json({ error: "Messages array is required" });
     }
 
     if (!DEEPSEEK_API_KEY) {
       return res.status(500).json({ error: "DEEPSEEK_API_KEY is not configured on the server." });
     }
 
     const modelId = "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B";
 
     try {
       const systemContext = "You are the AI Stock Analyzer, a specialized financial assistant. Your expertise is in stock prices, market trends, and technical analysis. Provide high-density, technical market insights.";
       
       // Filter and validate messages before sending to model
       const validMessages = messages
         .filter(m => m.content && m.content.trim().length > 0)
         .map(m => ({
           role: (m.role === 'user' || m.role === 'assistant' || m.role === 'system') ? m.role : 'user',
           content: m.content.trim()
         }));

       const conversationHistory = validMessages.length > 0 && validMessages[0].role === 'assistant' 
         ? validMessages.slice(1) 
         : validMessages;

       // Using Hugging Face OpenAI-compatible endpoint for Serverless Inference API
       const response = await axios.post("https://api-inference.huggingface.co/v1/chat/completions", {
         model: modelId,
         messages: [
           { role: "system", content: systemContext },
           ...conversationHistory
         ],
         max_tokens: 1024,
         temperature: 0.7,
         stream: false
       }, {
         headers: {
           "Authorization": `Bearer ${DEEPSEEK_API_KEY.toString().trim()}`,
           "Content-Type": "application/json"
         },
         timeout: 60000 
       });
 
       const resultMessage = response.data.choices?.[0]?.message?.content || 
                           "ANALYSIS_ERROR: The model node returned no content.";
       
       res.json({ role: "assistant", content: resultMessage });
     } catch (error: any) {
       let errorData = error.response?.data || {};
       let errorMessage = error.message;

       if (typeof errorData === 'string' && errorData.includes('<!DOCTYPE html>')) {
         errorMessage = "INFRASTRUCTURE_ERROR: The API endpoint returned an HTML error. This typically means the model is not enabled for the serverless Inference API or the path is incorrect for this provider.";
       } else if (errorData.error) {
         errorMessage = typeof errorData.error === 'object' ? (errorData.error.message || JSON.stringify(errorData.error)) : errorData.error;
       }
       
       console.error("HF Inference API Error:", JSON.stringify(errorData, null, 2));
 
       let userFriendlyMessage = errorMessage;
       if (error.response?.status === 402 || (typeof errorMessage === 'string' && errorMessage.includes('quota'))) {
         userFriendlyMessage = "BILLING_REQUIRED: Your Inference credits are exhausted on Hugging Face.";
       } else if (error.response?.status === 401) {
         userFriendlyMessage = "AUTH_ERROR: Invalid Hugging Face Token provided.";
       } else if (error.response?.status === 503) {
         const waitTime = errorData.estimated_time || "a minute";
         userFriendlyMessage = `MODEL_LOADING: The DeepSeek model is currently being loaded into memory. Please retry in about ${Math.ceil(Number(waitTime))} seconds.`;
       } else if (error.response?.status === 404) {
         userFriendlyMessage = `MODEL_NOT_FOUND: The model '${modelId}' was not found or is restricted. Ensuring you have access on Hugging Face.`;
       }
 
       const status = error.response?.status || 500;
       res.status(status).json({ error: userFriendlyMessage });
     }
   });

  // Market Analysis Engine
  app.get("/api/analysis/:symbol", async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    
    // Check Cache first
    const cachedData = analysisCache.get(symbol);
    if (cachedData) {
      console.log(`[Cache Hit] Serving data for ${symbol}`);
      return res.json(cachedData);
    }

    console.log(`[Cache Miss] Fetching data for ${symbol}`);
    
    try {
      // 1. Prepare Promises for Parallel Execution
      // Finnhub: Real-time Price & Sentiment
      const quotePromise = axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`)
        .catch(err => { console.warn(`Finnhub Quote Warning (${symbol}):`, err.message); return { data: {} }; });
        
      const newsPromise = axios.get(`https://finnhub.io/api/v1/news-sentiment?symbol=${symbol}&token=${FINNHUB_KEY}`)
        .catch(err => { 
          if (err.response?.status === 403) {
            console.log(`[AUTH] Finnhub sentiment restricted for ${symbol} (Tier Limit). Using neutral fallback.`);
          } else {
            console.warn(`Finnhub Sentiment Error (${symbol}):`, err.message); 
          }
          return { data: { sentiment: { bullBearIndex: 0.5 } } }; 
        });

      // Alpha Vantage: Technical Indicators (RSI, EMA)
      const rsiPromise = axios.get(`https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${ALPHA_VANTAGE_KEY}`)
        .catch(err => { console.warn(`AlphaVantage RSI Warning (${symbol}):`, err.message); return { data: {} }; });
        
      const emaPromise = axios.get(`https://www.alphavantage.co/query?function=EMA&symbol=${symbol}&interval=daily&time_period=20&series_type=close&apikey=${ALPHA_VANTAGE_KEY}`)
        .catch(err => { console.warn(`AlphaVantage EMA Warning (${symbol}):`, err.message); return { data: {} }; });

      // Twelve Data: Time Series (for chart)
      const seriesPromise = axios.get(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${TWELVE_DATA_KEY}`)
        .catch(err => { console.warn(`TwelveData Series Warning (${symbol}):`, err.message); return { data: { values: [] } }; });

      // Execute All Requests in Parallel
      const [quote, news, rsi, ema, series] = await Promise.all([
        quotePromise,
        newsPromise,
        rsiPromise,
        emaPromise,
        seriesPromise
      ]);

      // Normalize Indicators
      const rsiData = rsi.data?.['Technical Analysis: RSI'];
      const currentRSI = rsiData ? parseFloat(Object.values(rsiData)[0] as string) : 50;

      const emaData = ema.data?.['Technical Analysis: EMA'];
      const currentEMA = emaData ? parseFloat(Object.values(emaData)[0] as string) : quote.data.c || 0;

      const price = quote.data.c || 0;
      const sentiment = news.data.sentiment?.bullBearIndex || 0.5;

      // Analysis Logic
      let signal = 'NEUTRAL';
      let confidence = 50;
      let reasoning = 'Gathering market consensus...';

      if (currentRSI < 30 && price > currentEMA) {
        signal = 'BUY';
        confidence = 75 + (sentiment * 20);
        reasoning = 'Oversold RSI with price holding above EMA supports upward momentum.';
      } else if (currentRSI > 70 && price < currentEMA) {
        signal = 'SELL';
        confidence = 80 + ((1 - sentiment) * 15);
        reasoning = 'Overbought RSI and price rejection at EMA indicate strong bearish trend.';
      } else if (price > currentEMA) {
        signal = 'NEUTRAL';
        confidence = 60;
        reasoning = 'Consolidating above EMA; awaiting RSI confirmation.';
      }

      const responseData = {
        symbol,
        price,
        change: quote.data.dp || 0,
        indicators: {
          rsi: currentRSI,
          ema: currentEMA,
          sentiment: sentiment,
        },
        analysis: {
          signal,
          confidence: Math.min(Math.round(confidence), 99),
          reasoning,
        },
        history: series.data.values?.map((v: any) => ({
          time: v.datetime,
          price: parseFloat(v.close)
        })).reverse() || [],
        lastUpdated: new Date().toISOString()
      };

      // Store in Cache
      analysisCache.set(symbol, responseData);

      res.json(responseData);

    } catch (error) {
      console.error('Analysis Engine Error:', error);
      res.status(500).json({ error: 'Failed to aggregate market data' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
