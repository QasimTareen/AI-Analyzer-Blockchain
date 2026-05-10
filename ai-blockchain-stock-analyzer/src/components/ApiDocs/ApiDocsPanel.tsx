import React from 'react';
import { 
  FileCode, 
  Terminal, 
  Globe, 
  Lock, 
  ChevronRight, 
  Copy,
  Hash
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ApiDocsPanel() {
  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-5xl mx-auto space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-3xl xs:text-4xl sm:text-6xl font-thin tracking-tighter italic font-serif text-[var(--accent-color)] mb-4 leading-none">API_DEVELOPER_CORE</h2>
        <p className="opacity-40 text-xs sm:text-sm max-w-2xl leading-relaxed">
          The Blockchain-AI Predictor exposes a high-performance REST API for technical indicators, 
          real-time sentiment vectors, and on-chain prediction verification.
        </p>
      </header>

      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] font-black opacity-30">
          <Terminal className="w-4 h-4" /> Endpoint Authentication
        </div>
        <div className="bg-[var(--surface-alpha)] border border-[var(--border-alpha)] p-4 sm:p-6 rounded-xl space-y-4">
          <p className="text-[10px] sm:text-xs opacity-60">Include your API key as a Bearer token in the request header.</p>
          <div className="bg-[var(--bg-color)]/40 p-3 sm:p-4 rounded-lg font-mono text-[10px] sm:text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group overflow-hidden">
            <code className="text-sky-400 break-all sm:break-normal">Authorization: Bearer {'<YOUR_API_KEY>'}</code>
            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-color)]/20 group-hover:text-[var(--accent-color)] cursor-pointer transition-colors self-end sm:self-auto" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        <ApiEndpoint 
          method="GET" 
          path="/api/v1/predict/{symbol}" 
          desc="Generate a non-verifiable real-time signal via AI inference engine."
        />
        <ApiEndpoint 
          method="POST" 
          path="/api/v1/verify" 
          desc="Verify an existing prediction hash against the blockchain ledger."
        />
        <ApiEndpoint 
          method="GET" 
          path="/api/v1/sentiment/vector" 
          desc="Fetch raw sentiment data points derived from indexed news nodes."
        />
        <ApiEndpoint 
          method="GET" 
          path="/api/v1/market/technical" 
          desc="Retrieve SMA, RSI, and MACD indicators for specified assets."
        />
      </div>

      <section className="bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/20 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-3 sm:space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
             <Lock className="w-5 h-5 text-[var(--accent-color)]" />
             <h3 className="text-lg sm:text-xl font-black italic tracking-tight uppercase">ON-CHAIN PRIVACY</h3>
          </div>
          <p className="text-[10px] sm:text-xs opacity-50 max-w-xl">
             Private keys for signing transactions are handled via hardware-secured HSM nodes. 
             User data never touches the inference layer without intermediate hashing.
          </p>
        </div>
        <button className="w-full md:w-auto px-8 py-3 bg-[var(--accent-color)] text-[var(--bg-color)] font-black text-[10px] uppercase tracking-[0.3em] rounded transition-all hover:scale-105 active:scale-95">
          Request SDK Access
        </button>
      </section>
    </div>
  );
}

function ApiEndpoint({ method, path, desc }: { method: 'GET' | 'POST', path: string, desc: string }) {
  return (
    <div className="border border-[var(--border-alpha)] bg-[var(--surface-alpha)] p-6 rounded-xl hover:border-[var(--accent-color)]/30 transition-all group">
      <div className="flex items-center gap-3 mb-4">
        <span className={cn(
          "text-[9px] font-black px-2 py-0.5 rounded",
          method === 'GET' ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        )}>{method}</span>
        <code className="text-[10px] font-mono opacity-80">{path}</code>
      </div>
      <p className="text-xs opacity-40 group-hover:opacity-100 transition-opacity leading-relaxed">{desc}</p>
    </div>
  );
}
