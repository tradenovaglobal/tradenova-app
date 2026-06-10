"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./lib/firebase";

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 left-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 ${
      type === "success" ? "bg-emerald-900/90 border-emerald-500/50 text-emerald-200" : "bg-red-900/90 border-red-500/50 text-red-200"
    }`}>
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      <span className="font-semibold text-sm">{message}</span>
    </div>
  )
}

const initialCoins = [
  { symbol: "BTC", price: 68421.00, change: 4.2 },
  { symbol: "ETH", price: 3520.50, change: 2.8 },
  { symbol: "SOL", price: 144.80, change: 5.4 },
  { symbol: "XRP", price: 2.42, change: 1.6 },
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
          const fluctuation = (Math.random() - 0.48) * coin.price * 0.001;
          return { ...coin, price: Number((coin.price + fluctuation).toFixed(2)) };
        })
      );
    }, 3000);
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
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white font-sans relative w-full max-w-[100vw] overflow-x-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* NAVBAR */}
      <nav className="w-full border-b border-gray-800/50 bg-[#0B0F19]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">₿</div>
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">TradeNova</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
            <button className="hover:text-white transition-colors">Markets</button>
            <button className="hover:text-white transition-colors">Trade</button>
            <button className="hover:text-white transition-colors">Wallet</button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setActiveModal("login")} className="px-5 py-2 border border-gray-700 rounded-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-all text-sm font-semibold">Log In</button>
            <button onClick={() => setActiveModal("register")} className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20">Sign Up</button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-800/50 bg-[#0B0F19]/95 p-4 space-y-4">
            <div className="flex flex-col gap-3 text-gray-300 text-sm">
              <button className="py-2 hover:text-white">Markets</button>
              <button className="py-2 hover:text-white">Trade</button>
              <button className="py-2 hover:text-white">Wallet</button>
            </div>
            <div className="flex gap-3 pt-3 border-t border-gray-800">
              <button onClick={() => { setActiveModal("login"); setMenuOpen(false); }} className="flex-1 py-2 border border-gray-700 rounded-lg text-center text-sm font-semibold">Log In</button>
              <button onClick={() => { setActiveModal("register"); setMenuOpen(false); }} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-center text-sm font-semibold">Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* LIVE TICKER - Mobile Safe */}
      <div className="w-full border-b border-gray-800/50 overflow-hidden py-2 bg-[#080C16]">
        <div className="animate-marquee inline-flex gap-8 text-xs font-mono whitespace-nowrap">
          {coins.map((coin, index) => (
            <span key={index} className={`inline-flex items-center gap-1 ${coin.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className="text-gray-500">{coin.symbol}</span>
              <span className="font-semibold">${formatPrice(coin.price)}</span>
              <span>{coin.change >= 0 ? '▲' : '▼'}</span>
            </span>
          ))}
          {/* Duplicate for seamless scroll */}
          {coins.map((coin, index) => (
            <span key={`dup-${index}`} className={`inline-flex items-center gap-1 ${coin.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <span className="text-gray-500">{coin.symbol}</span>
              <span className="font-semibold">${formatPrice(coin.price)}</span>
              <span>{coin.change >= 0 ? '▲' : '▼'}</span>
            </span>
          ))}
        </div>
      </div>

      {/* HERO SECTION - Mobile Optimized */}
      <section className="relative max-w-7xl mx-auto px-4 py-12 md:py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 border border-cyan-500/20 rounded-full px-3 py-1 text-[10px] md:text-xs text-cyan-400 bg-cyan-500/5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Trusted by 12M+ Traders
        </div>

        <h1 className="text-4xl md:text-7xl font-black leading-tight mb-4 tracking-tight w-full">
          <span className="text-white">TRADE</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">LIKE FUTURE</span>
        </h1>

        <p className="text-gray-400 text-sm md:text-xl leading-relaxed max-w-xl mb-8">
          Institutional-grade crypto trading with AI analytics and bank-grade security.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-12">
          <button onClick={() => setActiveModal("register")} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all">
            Start Trading
          </button>
          <button className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-gray-700 text-base font-semibold text-gray-300 hover:border-gray-500 transition-all bg-[#111827]">
            Live Markets
          </button>
        </div>

        {/* Stats Grid - 3 Columns Safe */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 w-full max-w-lg">
          {[
            { value: "$18B+", label: "Volume" },
            { value: "12M+", label: "Traders" },
            { value: "350+", label: "Coins" }
          ].map((stat, i) => (
            <div key={i} className="bg-[#111827] border border-gray-800/50 rounded-xl p-3 md:p-5 flex flex-col items-center justify-center">
              <h2 className="text-xl md:text-3xl font-black text-white">{stat.value}</h2>
              <p className="text-gray-500 text-[10px] md:text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL OVERLAY - Mobile Perfect */}
      {activeModal && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center" onClick={() => setActiveModal(null)}>
          <div className="relative w-full sm:max-w-md bg-[#111827] sm:rounded-3xl rounded-t-3xl p-6 pt-8 sm:p-8 shadow-2xl border-t border-gray-700 sm:border border-gray-800 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all text-sm">✕</button>

            <h2 className="text-2xl sm:text-3xl font-black text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              {activeModal === "login" ? "LOG IN" : "CREATE ACCOUNT"}
            </h2>

            <div className="space-y-4">
              {activeModal === "register" && (
                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[#0B0F19] border border-gray-700 outline-none focus:border-cyan-500 transition-colors text-sm text-white" />
              )}
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#0B0F19] border border-gray-700 outline-none focus:border-cyan-500 transition-colors text-sm text-white" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#0B0F19] border border-gray-700 outline-none focus:border-cyan-500 transition-colors text-sm text-white" />

              <button onClick={activeModal === "login" ? handleLogin : handleRegister} disabled={isLoading}
                className="w-full p-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  activeModal === "login" ? "Log In" : "Create Account"
                )}
              </button>
            </div>

            <p className="text-center text-gray-500 text-xs mt-5">
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