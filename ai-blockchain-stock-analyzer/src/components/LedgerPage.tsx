import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { LedgerRecord } from '../types';
import { FileDown, Calendar, TrendingUp, Search, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAnalysisPDF } from '../lib/pdfUtils';
import { cn } from '../lib/utils';

export default function LedgerPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'ledger'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecords(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LedgerRecord)));
      setIsLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/ledger`));

    return () => unsubscribe();
  }, [user]);

  const handleDownload = async (record: LedgerRecord) => {
    setDownloadingId(record.id);
    try {
      generateAnalysisPDF(record);
      // Success feedback
      setTimeout(() => setDownloadingId(null), 2000);
    } catch (err: any) {
      console.error('Download Error:', err);
      alert(`Failed to generate PDF: ${err.message || 'Unknown Error'}. Check browser console for details.`);
      setDownloadingId(null);
    }
  };

  const filteredRecords = records.filter(r => 
    r.stockName?.toLowerCase().includes(search.toLowerCase()) || 
    r.predictionResult?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-black tracking-tight mb-2">Personal Ledger</h1>
          <p className="text-[10px] sm:text-xs opacity-40 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Synchronized with secure analysis records
          </p>
        </div>

        <div className="relative group w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:text-[var(--accent-color)] group-focus-within:opacity-100 transition-all" />
          <input 
            type="text" 
            placeholder="Search records..."
            className="bg-[var(--surface-alpha)] border border-[var(--border-alpha)] rounded-xl py-3 pl-12 pr-6 text-xs w-full md:w-64 focus:outline-none focus:border-[var(--accent-color)]/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
           <div className="w-12 h-12 border-2 border-[var(--accent-color)]/20 border-t-[var(--accent-color)] rounded-full animate-spin" />
           <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Accessing Secure Vault...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="p-8 sm:p-12 border border-[var(--border-alpha)] rounded-3xl bg-[var(--surface-alpha)]/5 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[var(--surface-alpha)] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white/20">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">No Records Found</h3>
          <p className="text-xs sm:text-sm opacity-40 max-w-sm mx-auto">Start analyzing stocks to populate your personal historical ledger with AI-verified reports.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="group p-6 bg-[var(--surface-alpha)] border border-[var(--border-alpha)] rounded-2xl hover:border-[var(--accent-color)]/30 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between mb-6">
                   <div className="w-12 h-12 bg-[var(--bg-color)] rounded-xl flex items-center justify-center font-black group-hover:bg-[var(--accent-color)]/10 transition-colors">
                     {record.stockName[0]}
                   </div>
                   <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase",
                    record.predictionResult === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' :
                    record.predictionResult === 'SELL' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-slate-500/10 text-slate-500'
                  )}>
                    {record.predictionResult}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">{record.stockName}</h3>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-xs opacity-40 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(record.analysisDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs opacity-40 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Confidence Score: {record.confidence}%
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(record);
                    }}
                    disabled={downloadingId === record.id}
                    className={cn(
                      "flex-1 px-4 py-4 border rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-50 active:scale-95 shadow-md",
                      downloadingId === record.id 
                        ? "bg-emerald-500 text-[var(--bg-color)] border-emerald-500" 
                        : "bg-[var(--surface-alpha)] border-[var(--border-alpha)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] hover:border-[var(--accent-color)] cursor-pointer"
                    )}
                  >
                    {downloadingId === record.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Downloaded
                      </>
                    ) : (
                      <>
                        <FileDown className="w-3.5 h-3.5" /> PDF Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

