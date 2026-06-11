"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useState(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  })

  return (
    <div className={`fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 md:max-w-sm z-[100] px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all ${
      type === "success" ? "bg-emerald-900/90 border-emerald-500/50 text-emerald-200" : "bg-red-900/90 border-red-500/50 text-red-200"
    }`}>
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      <span className="font-semibold text-sm">{message}</span>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()

  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [quickEmail, setQuickEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // ✅ FIREBASE REGISTER
  const handleRegister = async () => {
    if (!name || !email || !password) {
      setToast({ message: "Please fill all fields!", type: "error" })
      return
    }
    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await setDoc(doc(db, "users", user.email || email), {
        name: name,
        email: user.email || email,
        balance: 0, profit: 0, totalTrades: 0,
        status: "active", forceWin: false, createdAt: new Date(),
      })

      localStorage.setItem("user", JSON.stringify({ name, email: user.email || email }))
      setToast({ message: "Account created successfully!", type: "success" })
      setShowRegister(false)
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setToast({ message: "This email is already registered!", type: "error" })
      } else {
        setToast({ message: "Registration failed. Try again.", type: "error" })
      }
    } finally { setIsLoading(false) }
  }

  // ✅ QUICK REGISTER FROM HERO SECTION
  const handleQuickStart = () => {
    if (!quickEmail) { setToast({ message: "Enter your email first!", type: "error" }); return }
    setEmail(quickEmail)
    setShowRegister(true)
  }

  // ✅ FIREBASE LOGIN
  const handleLogin = async () => {
    if (!email || !password) { setToast({ message: "Please fill all fields!", type: "error" }); return }
    setIsLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      localStorage.setItem("user", JSON.stringify({ email: userCredential.user.email }))
      setToast({ message: "Login Successful!", type: "success" })
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (error) {
      setToast({ message: "Invalid Email or Password!", type: "error" })
    } finally { setIsLoading(false) }
  }

  const marketData = [
    { pair: "BTC/USDT", price: "68,421.20", change: "+4.20%", isUp: true },
    { pair: "ETH/USDT", price: "3,520.50", change: "+2.81%", isUp: true },
    { pair: "SOL/USDT", price: "144.80", change: "+5.42%", isUp: true },
    { pair: "XRP/USDT", price: "2.42", change: "-0.85%", isUp: false },
    { pair: "DOGE/USDT", price: "0.152", change: "+3.10%", isUp: true },
  ]

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] font-sans relative max-w-[100vw] overflow-x-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ===== PREMIUM NAVBAR (Binance Style) ===== */}
      <nav className="w-full bg-[#0B0E11] border-b border-[#1E2329] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl md:text-2xl font-bold text-[#FCD535] tracking-tight">TradeNova</h1>
            <div className="hidden lg:flex items-center gap-6 text-sm text-[#848E9C] font-medium">
              <button className="hover:text-white transition-colors">Buy Crypto</button>
              <button className="hover:text-white transition-colors">Markets</button>
              <button className="hover:text-white transition-colors">Trade</button>
              <button className="hover:text-white transition-colors">Earn</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowLogin(true)} className="hidden md:block text-sm text-[#EAECEF] hover:text-white font-medium transition-colors">Log In</button>
            <button onClick={() => setShowRegister(true)} className="px-4 py-2 rounded-md bg-[#FCD535] text-black text-sm font-bold hover:bg-yellow-400 transition-colors">Sign Up</button>
          </div>
        </div>
      </nav>

      {/* ===== LIVE TICKER ===== */}
      <div className="w-full border-b border-[#1E2329] overflow-hidden whitespace-nowrap py-2 bg-[#0B0E11]">
        <div className="animate-marquee inline-flex gap-8 text-xs font-mono">
          {marketData.map((m, i) => (
            <span key={i} className={`inline-flex items-center gap-2 ${m.isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
              <span className="text-[#848E9C]">{m.pair}</span>
              <span className="font-semibold">${m.price}</span>
              <span>{m.change}</span>
            </span>
          ))}
          {marketData.map((m, i) => (
            <span key={`dup-${i}`} className={`inline-flex items-center gap-2 ${m.isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
              <span className="text-[#848E9C]">{m.pair}</span>
              <span className="font-semibold">${m.price}</span>
              <span>{m.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ===== HERO SECTION (Binance/Bitget Style) ===== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-24 pb-16 md:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl md:text-6xl font-black leading-tight text-white mb-6 tracking-tight">
            Buy & Trade<br/>Crypto with <span className="text-[#FCD535]">Confidence</span>
          </h1>
          <p className="text-[#848E9C] text-base md:text-lg max-w-lg mb-8 mx-auto lg:mx-0">
            The world's most secure and fastest crypto exchange. Start your portfolio today with zero fees on your first trade.
          </p>

          {/* Quick Registration Box */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0 mb-10">
            <input 
              type="email" 
              placeholder="Email or Phone Number" 
              value={quickEmail}
              onChange={(e) => setQuickEmail(e.target.value)}
              className="flex-1 bg-[#1E2329] border border-[#2B3139] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#FCD535] transition-colors"
            />
            <button onClick={handleQuickStart} className="px-6 py-3 rounded-lg bg-[#FCD535] text-black font-bold text-sm hover:bg-yellow-400 transition-colors whitespace-nowrap shadow-lg shadow-yellow-500/20">
              Get Started
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex justify-center lg:justify-start gap-6 md:gap-10">
            {[
              { value: "$18B+", label: "Daily Volume" },
              { value: "12M+", label: "Users" },
              { value: "350+", label: "Coins" }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[#5E6673] text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Mock Trading UI (Premium Look) */}
        <div className="flex-1 w-full max-w-lg">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="p-4 border-b border-[#2B3139] flex justify-between items-center bg-[#161A1E]">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-sm">BTC/USDT</span>
                <span className="text-[#0ECB81] text-sm font-mono font-semibold">68,421.20</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] text-[#848E9C] bg-[#0B0E11] px-2 py-1 rounded">1h</span>
                <span className="text-[10px] text-[#848E9C] bg-[#0B0E11] px-2 py-1 rounded">4h</span>
                <span className="text-[10px] text-black bg-[#FCD535] px-2 py-1 rounded font-bold">1d</span>
              </div>
            </div>
            
            {/* Chart Area Mockup */}
            <div className="h-[220px] md:h-[280px] relative p-4 bg-[#0B0E11]">
              <div className="absolute inset-0 flex items-end justify-around px-6 pb-6 gap-1.5">
                {[40, 60, 35, 80, 55, 95, 65, 75, 45, 85, 50, 90, 40, 70, 88, 60].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full">
                    <div className={`w-full rounded-t-sm ${i % 2 === 0 ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'}`} style={{ height: `${h}%` }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Stats Footer */}
            <div className="grid grid-cols-3 gap-px bg-[#2B3139]">
              <div className="bg-[#161A1E] p-3">
                <p className="text-[10px] text-[#5E6673]">24h Change</p>
                <p className="text-xs font-bold text-[#0ECB81]">+4.20%</p>
              </div>
              <div className="bg-[#161A1E] p-3">
                <p className="text-[10px] text-[#5E6673]">24h High</p>
                <p className="text-xs font-bold text-white font-mono">69,150</p>
              </div>
              <div className="bg-[#161A1E] p-3">
                <p className="text-[10px] text-[#5E6673]">24h Low</p>
                <p className="text-xs font-bold text-white font-mono">66,850</p>
              </div>
            </div>
            
            {/* Trade Buttons Mockup */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#161A1E]">
              <button className="py-2.5 rounded-lg bg-[#0ECB81] text-black font-bold text-sm hover:bg-opacity-90 transition-all">Buy</button>
              <button className="py-2.5 rounded-lg bg-[#F6465D] text-white font-bold text-sm hover:bg-opacity-90 transition-all">Sell</button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="bg-[#0B0E11] border-t border-[#1E2329] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-4">Why Trade with TradeNova?</h2>
          <p className="text-[#5E6673] text-center mb-12 md:mb-16 text-sm max-w-md mx-auto">Industry-leading security, lowest fees, and lightning-fast execution.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🛡️", title: "Bank-Grade Security", desc: "Multi-layer asset protection with cold storage and 2FA authentication." },
              { icon: "⚡", title: "Lightning Fast", desc: "Matching engine processes 1.4 million transactions per second." },
              { icon: "💰", title: "Lowest Fees", desc: "Trade with the lowest trading fees in the industry. Zero hidden charges." }
            ].map((f, i) => (
              <div key={i} className="bg-[#1E2329] border border-[#2B3139] rounded-xl p-6 md:p-8 hover:border-[#FCD535]/30 transition-all hover:shadow-xl hover:shadow-yellow-500/5 group cursor-pointer">
                <span className="text-3xl block mb-4">{f.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FCD535] transition-colors">{f.title}</h3>
                <p className="text-[#848E9C] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LOGIN MODAL ===== */}
      {showLogin && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
          <div className="w-full max-w-md bg-[#1E2329] rounded-2xl p-6 md:p-8 border border-[#2B3139] shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0B0E11] flex items-center justify-center text-[#848E9C] hover:text-white text-sm">✕</button>
            <h2 className="text-2xl font-black text-center mb-6 text-white">Log In</h2>
            <div className="space-y-4">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 rounded-lg bg-[#0B0E11] border border-[#2B3139] outline-none focus:border-[#FCD535] text-sm text-white" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3.5 rounded-lg bg-[#0B0E11] border border-[#2B3139] outline-none focus:border-[#FCD535] text-sm text-white" />
              <button onClick={handleLogin} disabled={isLoading} className="w-full py-3.5 rounded-lg bg-[#FCD535] text-black font-bold text-base hover:bg-yellow-400 disabled:opacity-50 flex justify-center items-center gap-2">
                {isLoading ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Log In"}
              </button>
            </div>
            <p className="text-center text-[#5E6673] text-xs mt-5">Don't have an account? <button onClick={() => { setShowLogin(false); setShowRegister(true); }} className="text-[#FCD535] font-semibold hover:underline">Sign Up</button></p>
          </div>
        </div>
      )}

      {/* ===== REGISTER MODAL ===== */}
      {showRegister && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowRegister(false)}>
          <div className="w-full max-w-md bg-[#1E2329] rounded-2xl p-6 md:p-8 border border-[#2B3139] shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowRegister(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0B0E11] flex items-center justify-center text-[#848E9C] hover:text-white text-sm">✕</button>
            <h2 className="text-2xl font-black text-center mb-6 text-white">Create Account</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3.5 rounded-lg bg-[#0B0E11] border border-[#2B3139] outline-none focus:border-[#FCD535] text-sm text-white" />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 rounded-lg bg-[#0B0E11] border border-[#2B3139] outline-none focus:border-[#FCD535] text-sm text-white" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3.5 rounded-lg bg-[#0B0E11] border border-[#2B3139] outline-none focus:border-[#FCD535] text-sm text-white" />
              <button onClick={handleRegister} disabled={isLoading} className="w-full py-3.5 rounded-lg bg-[#FCD535] text-black font-bold text-base hover:bg-yellow-400 disabled:opacity-50 flex justify-center items-center gap-2">
                {isLoading ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Create Account"}
              </button>
            </div>
            <p className="text-center text-[#5E6673] text-xs mt-5">Already have an account? <button onClick={() => { setShowRegister(false); setShowLogin(true); }} className="text-[#FCD535] font-semibold hover:underline">Log In</button></p>
          </div>
        </div>
      )}

    </main>
  )
}