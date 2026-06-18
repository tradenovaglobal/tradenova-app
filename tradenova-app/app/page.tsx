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
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // ✅ FIREBASE REGISTER WITH 0 VALUES
  const handleRegister = async () => {
    if (!name || !email || !password) {
      setToast({ message: "Please fill all fields!", type: "error" })
      return
    }
    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 🔴 YAHIN PE FIX KIYA HAI: SAB VALUES 0 HONGI
      await setDoc(doc(db, "users", user.email || email), {
        name: name,
        email: user.email || email,
        balance: 0,           
        profit: 0,            
        totalTrades: 0,       
        referralBonus: 0,
        status: "active",
        forceWin: false,
        createdAt: new Date(),
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

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] font-sans relative max-w-[100vw] overflow-x-hidden">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* NAVBAR (Binance Style) */}
      <nav className="w-full bg-[#0B0E11] border-b border-[#1E2329] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl md:text-2xl font-bold text-[#FCD535] tracking-tight">TradeNova</h1>
            <div className="hidden lg:flex items-center gap-6 text-sm text-[#848E9C] font-medium">
              <button className="hover:text-white transition-colors">Buy Crypto</button>
              <button className="hover:text-white transition-colors">Markets</button>
              <button className="hover:text-white transition-colors">Trade</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowLogin(true)} className="hidden md:block text-sm text-[#EAECEF] hover:text-white font-medium transition-colors">Log In</button>
            <button onClick={() => setShowRegister(true)} className="px-4 py-2 rounded-md bg-[#FCD535] text-black text-sm font-bold hover:bg-yellow-400 transition-colors">Sign Up</button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-24 pb-16 md:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl md:text-6xl font-black leading-tight text-white mb-6 tracking-tight">
            Buy & Trade<br/>Crypto with <span className="text-[#FCD535]">Confidence</span>
          </h1>
          <p className="text-[#848E9C] text-base md:text-lg max-w-lg mb-8 mx-auto lg:mx-0">
            The world's most secure and fastest crypto exchange. Start your portfolio today with zero fees on your first trade.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0 mb-10">
            <input 
              type="email" 
              placeholder="Email or Phone Number" 
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-[#1E2329] border border-[#2B3139] rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#FCD535] transition-colors"
            />
            <button onClick={() => setShowRegister(true)} className="px-6 py-3 rounded-lg bg-[#FCD535] text-black font-bold text-sm hover:bg-yellow-400 transition-colors whitespace-nowrap shadow-lg shadow-yellow-500/20">
              Get Started
            </button>
          </div>

          <div className="flex justify-center lg:justify-start gap-6 md:gap-10">
            <div>
              <p className="text-xl md:text-2xl font-bold text-white">$18B+</p>
              <p className="text-[#5E6673] text-xs mt-1">Daily Volume</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-white">12M+</p>
              <p className="text-[#5E6673] text-xs mt-1">Users</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-white">350+</p>
              <p className="text-[#5E6673] text-xs mt-1">Coins</p>
            </div>
          </div>
        </div>

        {/* Right Mock Trading UI */}
        <div className="flex-1 w-full max-w-lg">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <div className="p-4 border-b border-[#2B3139] flex justify-between items-center bg-[#161A1E]">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-sm">BTC/USDT</span>
                <span className="text-[#0ECB81] text-sm font-mono font-semibold">68,421.20</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] text-black bg-[#FCD535] px-2 py-1 rounded font-bold">1d</span>
              </div>
            </div>
            
            <div className="h-[280px] relative p-4 bg-[#0B0E11]">
              <div className="absolute inset-0 flex items-end justify-around px-6 pb-6 gap-1.5">
                {[40, 60, 35, 80, 55, 95, 65, 75, 45, 85, 50, 90, 40, 70, 88, 60].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full">
                    <div className={`w-full rounded-t-sm ${i % 2 === 0 ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'}`} style={{ height: `${h}%` }}></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-[#161A1E]">
              <button onClick={() => setShowLogin(true)} className="py-2.5 rounded-lg bg-[#0ECB81] text-black font-bold text-sm hover:bg-opacity-90 transition-all">Buy</button>
              <button onClick={() => setShowLogin(true)} className="py-2.5 rounded-lg bg-[#F6465D] text-white font-bold text-sm hover:bg-opacity-90 transition-all">Sell</button>
            </div>
          </div>
        </div>
      </section>

      {/* LOGIN MODAL */}
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

      {/* REGISTER MODAL */}
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