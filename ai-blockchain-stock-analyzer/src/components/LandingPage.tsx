import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ShieldCheck, 
  BrainCircuit, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  Chrome,
  Zap,
  Lock,
  LineChart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
const ThreeBackground = React.lazy(() => import('./ThreeBackground'));

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { loginWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Auth failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] relative overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6 flex justify-center pointer-events-none">
        <div className="w-full max-w-6xl bg-black/40 backdrop-blur-3xl border border-white/5 rounded-full px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-color)]" />
            </div>
            <span className="text-[10px] sm:text-sm font-black tracking-tighter uppercase italic">AI ANALYZER</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => scrollToSection('home')} className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-[var(--accent-color)] transition-all">Home</button>
            <button onClick={() => scrollToSection('about')} className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-[var(--accent-color)] transition-all">About</button>
            <button onClick={() => scrollToSection('features')} className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-[var(--accent-color)] transition-all">What it does</button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => openAuth('login')}
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 px-2 sm:px-4 py-2"
            >
              Login
            </button>
            <button 
              onClick={() => openAuth('signup')}
              className="bg-[var(--accent-color)] text-black text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:shadow-glow transition-all active:scale-95 whitespace-nowrap"
            >
              Join Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex flex-col items-center justify-center relative px-6 py-32 overflow-hidden">
        <Suspense fallback={null}>
          <ThreeBackground />
        </Suspense>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[var(--accent-color)]/5 blur-[120px] rounded-full animate-pulse" />
        </div>

        <div className="w-full max-w-5xl space-y-8 sm:space-y-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 sm:mb-6">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-60 font-mono">Neural Grid Release v2.04</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-[9rem] font-black italic tracking-tighter leading-[0.8] uppercase flex flex-col items-center">
              <span>UNRESTRICTED</span>
              <span className="text-[var(--accent-color)] not-italic font-sans">INTELLIGENCE.</span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl opacity-40 font-medium leading-relaxed max-w-2xl mx-auto italic">
              Quantum-grade market prediction algorithms fused with on-chain verification. Accessible to everyone, verified by code.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 perspective-1000"
          >
            <motion.button 
              whileHover={{ 
                scale: 1.05,
                rotateX: 5,
                rotateY: 5,
                z: 20,
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openAuth('signup')}
              className="w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 bg-[var(--accent-color)] text-black rounded-2xl sm:rounded-[2rem] font-black italic text-base sm:text-lg uppercase tracking-tighter hover:shadow-glow transition-all active:scale-95 flex items-center justify-center gap-3 preserve-3d"
            >
              Initialize Access
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>
            <button 
              onClick={() => scrollToSection('about')}
              className="w-full sm:w-auto px-10 sm:px-12 py-5 sm:py-6 bg-white/5 border border-white/10 rounded-2xl sm:rounded-[2rem] font-black italic text-base sm:text-lg uppercase tracking-tighter hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              Review Architecture
            </button>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20 hover:opacity-50 transition-opacity cursor-pointer" onClick={() => scrollToSection('about')}>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] rotate-90 mb-4">DRAG_SCROLL</span>
          <div className="w-[1px] h-12 bg-white" />
        </div>
      </section>

      {/* About Section */}
      <motion.section 
        id="about" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-black/40 relative"
      >
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-12"
          >
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--accent-color)]/10 rounded-xl flex items-center justify-center border border-[var(--border-alpha)]">
                <BrainCircuit className="w-5 h-5 text-[var(--accent-color)]" />
              </div>
              <span className="text-sm font-black tracking-widest uppercase opacity-40">System Background</span>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter leading-none uppercase">
                THE ANALYZER <br/>
                <span className="text-[var(--accent-color)] not-italic font-sans text-3xl sm:text-6xl">ORIGIN STORY.</span>
              </h2>
              <p className="text-base sm:text-xl opacity-40 leading-relaxed font-medium">
                Born from the intersection of high-frequency trading and neural network research, AI Analyzer was built to eliminate market noise and bias. 
              </p>
              <p className="text-sm sm:text-lg opacity-30 leading-relaxed">
                Most platforms offer data. We offer convergence. By processing petabytes of historic and real-time data simultaneously, our engine identifies high-confidence patterns long before they become visible to the retail market.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="space-y-2">
                <div className="text-3xl font-black italic">94.2%</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Model Accuracy</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-black italic">1.2ms</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Latency Delta</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="relative perspective-1000"
            whileHover="hover"
          >
            <motion.div className="absolute inset-0 bg-[var(--accent-color)]/10 blur-[80px] rounded-full" />
            <motion.div 
              variants={{
                hover: { rotateY: 15, rotateX: -5, scale: 1.02 }
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative border border-white/10 rounded-[4rem] p-8 aspect-square flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl overflow-hidden group preserve-3d"
            >
               <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
               <motion.div
                 variants={{
                   hover: { translateZ: 50, scale: 1.1 }
                 }}
               >
                 <TrendingUp className="w-48 h-48 text-[var(--accent-color)] opacity-20 transition-transform duration-1000" />
               </motion.div>
               
               <motion.div 
                 variants={{
                   hover: { translateZ: 80, y: -20 }
                 }}
                 className="absolute top-12 left-12 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl animate-bounce"
               >
                 <ShieldCheck className="w-6 h-6 text-emerald-500" />
               </motion.div>
               <motion.div 
                 variants={{
                   hover: { translateZ: 100, x: 20 }
                 }}
                 className="absolute bottom-24 right-12 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl animate-pulse"
               >
                <Lock className="w-6 h-6 text-blue-500" />
               </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* What it does Section */}
      <motion.section 
        id="features" 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="min-h-screen py-32 px-6 flex flex-col items-center justify-center relative"
      >
        <div className="w-full max-w-4xl text-center space-y-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter leading-none uppercase">
               SYSTEM <br/>
              <span className="text-[var(--accent-color)] not-italic font-sans text-3xl sm:text-6xl">CAPABILITIES.</span>
            </h2>
            <p className="text-lg opacity-40 font-medium italic">Comprehensive market surveillance protocols.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 perspective-1000">
            <motion.div 
              whileHover={{ 
                rotateX: 10, 
                rotateY: 10, 
                z: 50,
                scale: 1.05
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-8 sm:p-10 bg-white/5 border border-white/10 rounded-3xl sm:rounded-[3rem] text-left space-y-4 sm:space-y-6 hover:bg-white/10 transition-colors group transform-gpu preserve-3d shadow-2xl"
            >
              <div className="p-3 sm:p-4 bg-emerald-500/10 rounded-xl sm:rounded-2xl border border-emerald-500/20 w-fit group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black italic tracking-tight uppercase">Neural Analysis</h3>
              <p className="text-[12px] sm:text-sm opacity-40 leading-relaxed font-mono uppercase tracking-tighter">Deep learning models trained on millions of data points to forecast institutional liquidity moves.</p>
            </motion.div>

            <motion.div 
              whileHover={{ 
                rotateX: 10, 
                rotateY: -10, 
                z: 50,
                scale: 1.05
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-10 bg-white/5 border border-white/10 rounded-[3rem] text-left space-y-6 hover:bg-white/10 transition-colors group transform-gpu preserve-3d shadow-2xl"
            >
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 w-fit group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black italic tracking-tight uppercase">On-Chain Ledger</h3>
              <p className="text-sm opacity-40 leading-relaxed font-mono uppercase tracking-tighter">Every prediction is immutable. A permanent, cryptographically signed record of every strategic signal.</p>
            </motion.div>

            <motion.div 
              whileHover={{ 
                rotateX: -10, 
                rotateY: 10, 
                z: 50,
                scale: 1.05
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-10 bg-white/5 border border-white/10 rounded-[3rem] text-left space-y-6 hover:bg-white/10 transition-colors group transform-gpu preserve-3d shadow-2xl"
            >
              <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 w-fit group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-2xl font-black italic tracking-tight uppercase">Quantum Sentiment</h3>
              <p className="text-sm opacity-40 leading-relaxed font-mono uppercase tracking-tighter">Real-time processing of global social and news streams to detect market anomalies instantly.</p>
            </motion.div>
          </div>

          <button 
            onClick={() => openAuth('signup')}
            className="px-16 py-8 bg-white text-black rounded-[2.5rem] font-black italic text-xl uppercase tracking-tighter hover:bg-[var(--accent-color)] transition-all active:scale-95 shadow-2xl"
          >
            Ready to Begin?
          </button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 px-6 flex flex-col items-center gap-8">
        <div className="flex items-center gap-2 opacity-20 grayscale">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-black" />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase">AI ANALYZER SYSTEM</span>
        </div>
        <div className="text-[10px] font-mono tracking-[0.5em] opacity-10 uppercase text-center leading-loose">
          © 2026 Quantum Logic Labs // Decentralized Intel Nodes <br/>
          Institutional Restricted Access // All Signals Encrypted
        </div>
      </footer>

      {/* Auth Overlay Overlay */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: 0 }}
              className="w-full max-w-md bg-[var(--surface-color)] border border-white/10 rounded-3xl sm:rounded-[3rem] p-6 sm:p-8 lg:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-50" />
              
              <button 
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-6 sm:top-8 right-6 sm:right-8 text-[10px] font-black tracking-widest opacity-30 hover:opacity-100 flex items-center gap-2 transition-opacity"
              >
                CLOSE <ChevronRight className="w-4 h-4" />
              </button>

              <div className="space-y-8 sm:space-y-10">
                <div className="space-y-4 text-center">
                  <div className="inline-block p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-[var(--accent-color)]/5 border border-white/10 mb-2 sm:mb-4">
                    <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--accent-color)]" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase leading-none">
                    {authMode === 'login' ? 'VERIFY_ACCESS' : 'INITIALIZE_ID'}
                  </h2>
                  <p className="text-[10px] sm:text-xs opacity-40 font-medium">Authentication required via SSL Secure Gateway</p>
                </div>

                <div className="space-y-6">
                  <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                    <button 
                      onClick={() => setAuthMode('login')}
                      className={cn(
                        "flex-1 py-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all",
                        authMode === 'login' ? "bg-[var(--accent-color)] text-black shadow-lg" : "opacity-40 hover:opacity-100"
                      )}
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => setAuthMode('signup')}
                      className={cn(
                        "flex-1 py-3 text-[10px] uppercase tracking-widest font-black rounded-xl transition-all",
                        authMode === 'signup' ? "bg-[var(--accent-color)] text-black shadow-lg" : "opacity-40 hover:opacity-100"
                      )}
                    >
                      Sign Up
                    </button>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handleGoogleAuth}
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-center gap-4 py-5 bg-white text-black rounded-2xl font-black text-sm hover:bg-[var(--accent-color)] transition-all group active:scale-95 disabled:opacity-50 shadow-xl"
                    >
                      {isLoggingIn ? (
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          <Chrome className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          {authMode === 'login' ? 'PROCEED TO ACCESS' : 'ESTABLISH NEW ID'}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-8 text-center space-y-4">
                  <p className="text-[9px] uppercase tracking-[0.4em] opacity-20 font-black">Satellite Node: Asia-South1</p>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono opacity-40 uppercase">Encrypted Tunnel Established</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
