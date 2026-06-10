"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./lib/firebase";

// --- Toast Component ---
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 max-w-[90vw] ${
      type === "success" ? "bg-emerald-900/90 border-emerald-500/50 text-emerald-200" : "bg-red-900/90 border-red-500/50 text-red-200"
    }`}>
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      <span className="font-semibold text-sm">{message}</span>
    </div>
  )
}

// --- Mock Data for Live Ticker ---
const initialCoins = [
  { symbol: "BTC/USDT", price: 68421.00, change: 4.2 },
  { symbol: "ETH/USDT", price: 3520.50, change: 2.8 },
  { symbol: "SOL/USDT", price: 144.80, change: 5.4 },
  { symbol: "XRP/USDT", price: 2.42, change: 1.6 },
  { symbol: "DOGE/USDT", price: 0.152, change: -0.8 },
];

export default function HomePage() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<"login" | "register" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [coins, setCoins] = useState(initialCoins);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prevCoins => 
        prevCoins.map(coin => {
          const fluctuation = (Math.random() - 0.48) * coin.price * 0.002;
          const newPrice = coin.price + fluctuation;
          return { ...coin, price: Number(newPrice.toFixed(coin.price > 100 ? 2 : 4)) };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = () => {
    setActiveModal(null);
    router.push("/register");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setToast({ message: "Please fill in all fields", type: "error" });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setToast({ message: "Login Successful!", type: "success" });
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error) {
      setToast({ message: "Invalid Email or Password", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden font-sans relative max-w-[100vw]">
      {/* Background Lights */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* NAVBAR */}
      <nav className="w-full border-b border-gray-800/50 bg-[#0B0F19]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg shadow-cyan-500/20">
              ₿
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              TradeNova
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
            <button className="hover:text-white transition-colors">Markets</button>
            <button className="hover:text-white transition-colors">Trade</button>
            <button className="hover:text-white transition-colors">Wallet</button>
            <button className="hover:text-white transition-colors">Support</button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setActiveModal("login")} className="px-5 py-2.5 border border-gray-700 rounded-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-all text-sm font-semibold">
              Log In
            </button>
            <button onClick={() => setActiveModal("register")} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all">
              Sign Up
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-800/50 bg-[#0B0F19]/95 backdrop-blur-xl p-4 space-y-4">
            <div className="flex flex-col gap-3 text-gray-300">
              <button className="py-2 hover:text-white">Markets</button>
              <button className="py-2 hover:text-white">Trade</button>
              <button className="py-2 hover:text-white">Wallet</button>
              <button className="py-2 hover:text-white">Support</button>
            </div>
            <div className="flex gap-3 pt-3 border-t border-gray-800">
              <button onClick={() => { setActiveModal("login"); setMenuOpen(false); }} className="flex-1 py-2.5 border border-gray-700 rounded-lg text-center text-sm font-semibold">Log In</button>
              <button onClick={() => { setActiveModal("register"); setMenuOpen(false); }} className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-center text-sm font-semibold">Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* LIVE TICKER - Fixed for mobile */}
      <div className="w-full border-b border-gray-800/50 overflow-hidden whitespace-nowrap py-2 bg-[#080C16]">
        <div className="animate-marquee inline-flex gap-8 text-xs font-mono">
          {coins.map((coin, index) => (
            <span key={index} className={`inline-flex items-center gap-1 ${coin.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className="text-gray-400 font-sans">{coin.symbol}</span>
              <span className="font-semibold">${formatPrice(coin.price)}</span>
              <span className="text-[10px]">{coin.change >= 0 ? '▲' : '▼'}{Math.abs(coin.change).toFixed(1)}%</span>
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {coins.map((coin, index) => (
            <span key={`dup-${index}`} className={`inline-flex items-center gap-1 ${coin.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className="text-gray-400 font-sans">{coin.symbol}</span>
              <span className="font-semibold">${formatPrice(coin.price)}</span>
              <span className="text-[10px]">{coin.change >= 0 ? '▲' : '▼'}{Math.abs(coin.change).toFixed(1)}%</span>
            </span>
          ))}
        </div>
      </div>

      {/* HERO SECTION - Mobile Optimized */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 flex flex-col lg:flex-row gap-10 lg:gap-12 items-center">
        <div className="relative z-10 w-full">
          <div className="inline-flex items-center gap-2 border border-cyan-500/20 rounded-full px-3 py-1.5 text-[10px] md:text-xs text-cyan-400 bg-cyan-500/5 mb-5 font-medium backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Trusted by 12M+ Traders
          </div>

          <h1 className="text-4xl md:text-7xl font-black leading-tight mb-4 md:mb-6 tracking-tight">
            <span className="text-white">TRADE</span><br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">LIKE FUTURE</span>
          </h1>

          <p className="text-gray-400 text-sm md:text-xl leading-relaxed max-w-xl mb-6 md:mb-10">
            Experience institutional-grade crypto trading with live AI analytics and bank-grade security.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-10 md:mb-14">
            <button onClick={() => setActiveModal("register")} className="px-6 py-3 md:px-8 md:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base md:text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all">
              Start Trading
            </button>
            <button className="px-6 py-3 md:px-8 md:py-4 rounded-xl border border-gray-700 text-base md:text-lg font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition-all bg-[#111827]">
              Live Markets
            </button>
          </div>

          {/* Stats Grid - 3 Columns on all screens now, but smaller text on mobile */}
          <div className="grid grid-cols-3 gap-2 md:gap-6">
            {[
              { value: "$18B+", label: "Volume" },
              { value: "12M+", label: "Traders" },
              { value: "350+", label: "Coins" }
            ].map((stat, i) => (
              <div key={i} className="bg-[#111827] border border-gray-800/50 rounded-xl md:rounded-2xl p-3 md:p-6">
                <h2 className="text-lg md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{stat.value}</h2>
                <p className="text-gray-500 mt-0.5 md:mt-2 text-[10px] md:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE CHART CARD - Hidden on Mobile to save space and prevent overflow */}
        <div className="relative hidden lg:block w-full">
          <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="relative bg-[#111827]/80 border border-gray-800/50 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-black/50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">BTC/USDT</h2>
                <p className="text-gray-500 text-sm mt-1">Bitcoin / Tether</p>
              </div>
              <div className="px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-5xl font-black text-white font-mono tracking-tight">
                ${formatPrice(coins[0].price)}
              </h3>
              <p className="text-emerald-400 text-lg mt-1 font-semibold">▲ +{coins[0].change.toFixed(2)}%</p>
            </div>

            <div className="h-[250px] w-full relative overflow-hidden rounded-xl bg-[#080C16] border border-gray-800/50 flex items-end justify-around px-8 pb-8 pt-20">
              {[40, 60, 55, 80, 72, 95, 88, 100].map((h, i) => (
                <div
                  key={i}
                  className="w-8 md:w-14 rounded-t-2xl bg-gradient-to-t from-cyan-600 to-cyan-400 opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-[#080C16] rounded-lg p-3 border border-gray-800/50">
                <p className="text-[10px] text-gray-500 uppercase">24h High</p>
                <p className="text-sm font-bold text-white font-mono">$69,140</p>
              </div>
              <div className="bg-[#080C16] rounded-lg p-3 border border-gray-800/50">
                <p className="text-[10px] text-gray-500 uppercase">24h Low</p>
                <p className="text-sm font-bold text-white font-mono">$66,850</p>
              </div>
              <div className="bg-[#080C16] rounded-lg p-3 border border-gray-800/50">
                <p className="text-[10px] text-gray-500 uppercase">Volume</p>
                <p className="text-sm font-bold text-white font-mono">$1.2B</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL OVERLAY - Mobile Centered */}
      {activeModal && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <div className="relative w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setActiveModal(null)} className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all">
              ✕
            </button>

            <h2 className="text-2xl md:text-3xl font-black text-center mb-6 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              {activeModal === "login" ? "LOG IN" : "CREATE ACCOUNT"}
            </h2>

            <div className="space-y-4">
              {activeModal === "register" && (
                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[#0B0F19] border border-gray-700 outline-none focus:border-cyan-500 transition-colors text-sm" />
              )}
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#0B0F19] border border-gray-700 outline-none focus:border-cyan-500 transition-colors text-sm" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#0B0F19] border border-gray-700 outline-none focus:border-cyan-500 transition-colors text-sm" />

              <button onClick={activeModal === "login" ? handleLogin : handleRegister} disabled={isLoading}
                className="w-full p-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  activeModal === "login" ? "Log In" : "Create Account"
                )}
              </button>
            </div>

            <p className="text-center text-gray-500 text-xs md:text-sm mt-5">
              {activeModal === "login" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setActiveModal(activeModal === "login" ? "register" : "login")} className="text-cyan-400 font-semibold hover:underline">
                {activeModal === "login" ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}