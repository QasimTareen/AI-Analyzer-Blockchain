import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { 
  TrendingUp, TrendingDown, Shield, Search, 
  Activity, BarChart3, Database, Cpu, 
  RefreshCcw, AlertCircle, CheckCircle2,
  Clock, Hash, BrainCircuit, User,
  Menu, X, Code, LayoutDashboard,
  Star, History, LogOut, Settings,
  Sun, Moon, FileText, UserCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { Prediction, MarketData, LedgerRecord } from './types';
import { generateMarketPrediction } from './services/predictionService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LandingPage from './components/LandingPage';
import LedgerPage from './components/LedgerPage';
import ProfilePage from './components/ProfilePage';
import ApiDocsPanel from './components/ApiDocs/ApiDocsPanel';
import StockChat from './components/StockChat';
import ThreeBackground from './components/ThreeBackground';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';

const INITIAL_MARKETS: MarketData[] = [
  { symbol: 'BTC', price: 64230.50, change: 2.4, volume: '42.1B', isCrypto: true },
  { symbol: 'ETH', price: 3450.20, change: -1.2, volume: '18.5B', isCrypto: true },
  { symbol: 'NVDA', price: 875.40, change: 5.8, volume: '12.4B' },
  { symbol: 'AAPL', price: 175.20, change: 0.5, volume: '6.2B' },
  { symbol: 'TSLA', price: 165.40, change: -3.4, volume: '9.8B' },
  { symbol: 'QQQ', price: 440.20, change: 1.1, volume: '15.2B' },
  { symbol: 'MSFT', price: 420.40, change: 0.8, volume: '8.4B' },
  { symbol: 'SOL', price: 145.40, change: 8.5, volume: '3.2B', isCrypto: true },
];

function MainApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'profile' | 'api'>('dashboard');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [activeAnalysis, setActiveAnalysis] = useState<Prediction | null>(null);
  const [recentLedger, setRecentLedger] = useState<LedgerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Mock historical data fallback
  const mockHistory = useMemo(() => {
    const market = INITIAL_MARKETS.find(m => m.symbol === selectedSymbol) || INITIAL_MARKETS[0];
    return Array.from({ length: 20 }, (_, i) => ({
      time: i.toString(),
      price: market.price + Math.sin(i / 2) * 5 + (Math.random() - 0.5) * 10
    }));
  }, [selectedSymbol]);

  // Actual data to display
  const displayHistory = useMemo(() => {
    if (activeAnalysis && activeAnalysis.symbol === selectedSymbol && activeAnalysis.history) {
      return activeAnalysis.history;
    }
    return mockHistory;
  }, [activeAnalysis, selectedSymbol, mockHistory]);

  // Load Recent Ledger Records
  useEffect(() => {
    if (!user) {
      setRecentLedger([]);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'ledger'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentLedger(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LedgerRecord)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/ledger`));

    return () => unsubscribe();
  }, [user]);

  const currentMarket = useMemo(() => 
    INITIAL_MARKETS.find(m => m.symbol === selectedSymbol) || INITIAL_MARKETS[0], 
  [selectedSymbol]);

  const runAnalysis = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const newPrediction = await generateMarketPrediction(selectedSymbol, currentMarket.price);
      setActiveAnalysis(newPrediction);
      
      // Save to Firestore Ledger automatically
      try {
        const ledgerItem: Omit<LedgerRecord, 'id'> = {
          stockName: selectedSymbol,
          analysisDate: new Date().toISOString(),
          predictionResult: newPrediction.signal,
          confidence: newPrediction.confidence,
          price: newPrediction.price,
          reasoning: newPrediction.reasoning,
          createdAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'users', user.uid, 'ledger'), ledgerItem);
      } catch (dbError) {
        handleFirestoreError(dbError, OperationType.CREATE, `users/${user.uid}/ledger`);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("AI Analysis failed. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans selection:bg-[var(--accent-color)]/30 flex flex-col relative overflow-x-hidden transition-colors duration-500">
      <Suspense fallback={null}>
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]">
          <ThreeBackground />
        </div>
      </Suspense>
      {/* Navigation - Top Header */}
      <header className="flex h-16 sm:h-20 items-center justify-between px-4 lg:px-12 border-b border-[var(--border-alpha)] z-50 sticky top-0 bg-[var(--bg-color)]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-color)] group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-lg sm:text-2xl font-black tracking-tighter uppercase italic">AI ANALYZER</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-mono hidden md:inline">SECURE_LAYER</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-[var(--surface-alpha)] p-1 rounded-xl border border-[var(--border-alpha)]">
          <TabButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Analyzer"
          />
          <TabButton 
            active={activeTab === 'ledger'} 
            onClick={() => setActiveTab('ledger')}
            icon={<FileText className="w-4 h-4" />}
            label="Ledger"
          />
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
            icon={<UserCircle className="w-4 h-4" />}
            label="Profile"
          />
          <TabButton 
            active={activeTab === 'api'} 
            onClick={() => setActiveTab('api')}
            icon={<Code className="w-4 h-4" />}
            label="API"
          />
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--surface-alpha)] border border-[var(--border-alpha)] flex items-center justify-center hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/20 transition-all group"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-color)] group-hover:rotate-90 transition-transform duration-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-color)] group-hover:-rotate-12 transition-transform duration-500" />
            )}
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black tracking-tighter text-[var(--accent-color)] italic uppercase truncate max-w-[120px]">{profile?.displayName}</span>
              <span className="text-[9px] font-mono uppercase opacity-30">
                ACTIVE_NODE
              </span>
            </div>
            <button 
              onClick={() => logout()}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--surface-alpha)] border border-[var(--border-alpha)] flex items-center justify-center hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-[var(--text-color)]/40 hover:text-rose-500"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-12 pb-24 lg:pb-12 relative z-10 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-12 gap-8 relative z-10"
            >
              {/* Left Column: Markets */}
              <section className="col-span-12 lg:col-span-3 border border-[var(--border-alpha)] p-4 sm:p-6 rounded-3xl bg-[var(--surface-alpha)] order-3 lg:order-1">
                <div className="mb-4 sm:mb-8">
                   <p className="text-[10px] uppercase tracking-[0.4em] opacity-30 font-bold mb-4 sm:mb-6">Market Assets</p>
                   <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] pb-2 lg:pb-0 pr-0 lg:pr-2 no-scrollbar custom-scrollbar">
                    {INITIAL_MARKETS.map((m) => (
                      <button
                        key={m.symbol}
                        onClick={() => setSelectedSymbol(m.symbol)}
                        className={cn(
                          "min-w-[120px] lg:min-w-0 w-full transition-all text-left flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl border flex-shrink-0 lg:flex-shrink",
                          selectedSymbol === m.symbol ? "bg-[var(--accent-color)]/10 border-[var(--accent-color)]/30" : "border-transparent opacity-40 hover:opacity-100 hover:bg-[var(--bg-color)]/50"
                        )}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className={cn("text-lg sm:text-xl font-black italic tracking-tighter", selectedSymbol === m.symbol && "text-[var(--accent-color)]")}>{m.symbol}</span>
                          {m.isCrypto && <div className="w-1 h-1 rounded-full bg-sky-400" />}
                        </div>
                        <div className="text-right hidden xs:block">
                          <p className="text-[10px] font-mono opacity-80">${m.price.toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl hidden lg:block">
                   <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-black mb-3">Institutional Status</p>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-mono opacity-60 uppercase">Feeds Synchronized</span>
                   </div>
                </div>
              </section>

              {/* Center Column: Charts */}
              <section className="col-span-12 lg:col-span-6 space-y-4 sm:space-y-8 order-1 lg:order-2">
                 <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 bg-[var(--surface-alpha)] border border-[var(--border-alpha)] p-6 sm:p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 blur-3xl -z-10" />
                    <div className="text-center md:text-left">
                      <h2 className="text-3xl sm:text-5xl font-black tracking-tighter italic opacity-90">{selectedSymbol}_CORE</h2>
                      <p className="text-[10px] uppercase tracking-[0.3em] opacity-30 mt-2 font-black">AI Neural Assessment Engine</p>
                    </div>
                    
                    <button 
                      onClick={runAnalysis}
                      disabled={isLoading}
                      className="w-full md:w-auto group relative bg-[var(--accent-color)] text-[var(--bg-color)] font-black text-[12px] px-8 py-4 rounded-xl sm:rounded-2xl uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      <span className="flex items-center justify-center gap-3">
                        {isLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                        {isLoading ? "Analyzing..." : "Run Analysis"}
                      </span>
                    </button>
                 </div>

                 <div className="h-[300px] sm:h-[400px] border border-[var(--border-alpha)] bg-[var(--surface-alpha)] rounded-3xl p-4 sm:p-6 overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={displayHistory}>
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="10 10" stroke="var(--border-alpha)" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-alpha)', borderRadius: '16px' }}
                          labelStyle={{ display: 'none' }}
                          itemStyle={{ color: 'var(--accent-color)', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="var(--accent-color)" 
                          fill="url(#chartGradient)" 
                          strokeWidth={3}
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 border border-[var(--border-alpha)] rounded-3xl overflow-hidden divide-x divide-y md:divide-y-0 divide-[var(--border-alpha)] bg-[var(--surface-alpha)]">
                    <MetricSquare label="Market Price" value={`$${(activeAnalysis?.symbol === selectedSymbol ? activeAnalysis.price : currentMarket.price).toLocaleString()}`} />
                    <MetricSquare label="AI Confidence" value={activeAnalysis?.symbol === selectedSymbol ? `${activeAnalysis.confidence}%` : "---"} />
                    <MetricSquare label="Sentiment" value={activeAnalysis?.symbol === selectedSymbol ? activeAnalysis.indicators.sentiment.toFixed(2) : "---"} />
                    <MetricSquare label="Signal" value={activeAnalysis?.symbol === selectedSymbol ? activeAnalysis.signal : "IDLE"} isAccent />
                 </div>

                 {activeAnalysis?.symbol === selectedSymbol && activeAnalysis.timestamp && (
                   <div className="flex justify-end mt-2">
                     <p className="text-[8px] uppercase tracking-widest opacity-20 font-mono">
                       Sync Time: {new Date(activeAnalysis.timestamp).toLocaleTimeString()}
                     </p>
                   </div>
                 )}
              </section>

              {/* Right Column: Mini Ledger */}
              <section className="col-span-12 lg:col-span-3 border border-[var(--border-alpha)] rounded-3xl bg-[var(--surface-alpha)] flex flex-col p-6 sm:p-8 order-2 lg:order-3">
                 <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <p className="text-[10px] uppercase tracking-[0.4em] opacity-30 font-bold">Recent Records</p>
                    <button onClick={() => setActiveTab('ledger')} className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest hover:underline">View All</button>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 flex-1 overflow-y-auto no-scrollbar custom-scrollbar">
                    {recentLedger.map((record) => (
                      <div key={record.id} className="p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-color)] border border-[var(--border-alpha)] group hover:border-[var(--accent-color)]/20 transition-all">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-black italic">{record.stockName}</span>
                           <span className={cn(
                             "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase",
                             record.predictionResult === 'BUY' ? "bg-emerald-500/10 text-emerald-500" :
                             record.predictionResult === 'SELL' ? "bg-rose-500/10 text-rose-500" : "bg-slate-500/10 text-slate-500"
                           )}>{record.predictionResult}</span>
                        </div>
                        <div className="flex items-center justify-between opacity-30 text-[9px] font-mono">
                           <span>{new Date(record.analysisDate).toLocaleDateString()}</span>
                           <span>{record.confidence}% Conf.</span>
                        </div>
                      </div>
                    ))}
                    {recentLedger.length === 0 && (
                      <div className="py-20 text-center opacity-20 italic text-xs col-span-full">No recent analyses saved</div>
                    )}
                 </div>
                 
                 <div className="mt-6 sm:mt-8 p-4 bg-[var(--accent-color)] text-[var(--bg-color)] rounded-xl sm:rounded-2xl text-center shadow-lg">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Secure Extraction</p>
                    <p className="text-[8px] opacity-80 uppercase font-medium">All records are encrypted</p>
                 </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'ledger' && <LedgerPage key="ledger" />}
          {activeTab === 'profile' && <ProfilePage key="profile" />}
          {activeTab === 'api' && <ApiDocsPanel key="api" />}
        </AnimatePresence>
      </main>

      {/* Global Status Footer */}
      <footer className="p-8 flex justify-between items-center border-t border-[var(--border-alpha)] bg-[var(--bg-color)] z-50">
        <div className="flex space-x-12 text-[9px] uppercase tracking-[0.3em] opacity-30 font-medium overflow-x-auto whitespace-nowrap">
          <span className="flex items-center gap-2 shrink-0">
             <div className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-pulse" /> 
             SESSION: {user ? user.uid.substring(0, 12).toUpperCase() : 'ANONYMOUS_CORE'}
          </span>
          <span className="shrink-0">ENCRYPTION: AES-X-512</span>
          <span className="shrink-0">LATENCY: 14MS</span>
          <span className="shrink-0">ON-CHAIN_INTEGRITY: POSITIVE</span>
        </div>
        <div className="hidden lg:flex items-center gap-3">
           <p className="text-[9px] uppercase tracking-[0.5em] text-[var(--accent-color)] font-black italic">INTELLIGENCE_LAYER_VERIFIED</p>
           <Shield className="w-4 h-4 text-[var(--accent-color)]" />
        </div>
      </footer>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden flex items-center justify-around bg-[var(--bg-color)]/95 backdrop-blur-2xl border-t border-[var(--border-alpha)] py-2 px-6 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <MobileNavItem 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          label="Analyze"
        />
        <MobileNavItem 
          active={activeTab === 'ledger'} 
          onClick={() => setActiveTab('ledger')} 
          icon={<FileText className="w-5 h-5" />} 
          label="Ledger"
        />
        <MobileNavItem 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          icon={<UserCircle className="w-5 h-5" />} 
          label="Profile"
        />
        <MobileNavItem 
          active={activeTab === 'api'} 
          onClick={() => setActiveTab('api')} 
          icon={<Code className="w-5 h-5" />} 
          label="API"
        />
      </nav>

      <StockChat />
    </div>
  );
}

// Sub-components for cleaner App code
function MobileNavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 py-1 px-3 transition-all duration-300 relative",
        active ? "text-[var(--accent-color)]" : "opacity-40"
      )}
    >
      <div className={cn(
        "transition-transform",
        active && "scale-110 -translate-y-0.5"
      )}>
        {icon}
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      {active && (
        <motion.div 
          layoutId="mobileNavActive" 
          className="absolute -top-2 w-1 h-1 bg-[var(--accent-color)] rounded-full shadow-[0_0_10px_var(--glow-color)]"
        />
      )}
    </button>
  );
}
function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 sm:px-6 py-2.5 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all duration-300",
        active ? "bg-[var(--accent-color)] text-[var(--bg-color)] shadow-[0_0_15px_var(--glow-color)]" : "opacity-40 hover:opacity-100 hover:bg-[var(--surface-alpha)]"
      )}
    >
      {icon}
      <span className="hidden xs:inline">{label}</span>
    </button>
  );
}

function StatusLine({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] uppercase tracking-[0.2em] opacity-30 font-bold">{label}</span>
      <span className={cn("text-[10px] font-mono font-black italic", color)}>{value}</span>
    </div>
  );
}

function MetricSquare({ label, value, isAccent }: { label: string, value: string, isAccent?: boolean }) {
  return (
    <div className="p-4 sm:p-8 flex flex-col justify-center items-center text-center group hover:bg-[var(--surface-alpha)] transition-colors">
      <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-30 mb-2 sm:mb-3 font-bold group-hover:opacity-50 transition-colors">{label}</p>
      <p className={cn(
        "text-lg sm:text-2xl font-light tracking-tighter truncate w-full",
        isAccent ? "text-[var(--accent-color)] font-black italic uppercase" : "opacity-90"
      )}>
        {value}
      </p>
    </div>
  );
}

function IndicatorProgress({ label, value, max }: { label: string, value: number, max: number }) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.3em] opacity-40 font-bold group-hover:opacity-80 transition-colors">{label}</span>
        <span className="text-[10px] font-mono text-[var(--accent-color)]">{(value || 0).toFixed(0)}%</span>
      </div>
      <div className="h-1 w-full bg-[var(--surface-alpha)] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          className="h-full bg-[var(--text-color)]/40 group-hover:bg-[var(--accent-color)] transition-colors duration-500"
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
