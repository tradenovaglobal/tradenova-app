"use client"

import { useState, useEffect } from "react"
import { addDoc, collection, doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-slide-in ${
      type === "success" ? "bg-green-900/90 border-green-500/50 text-green-200" : "bg-red-900/90 border-red-500/50 text-red-200"
    }`}>
      <span className="text-xl">{type === "success" ? "✅" : "❌"}</span>
      <span className="font-semibold">{message}</span>
    </div>
  )
}

export default function WithdrawPage() {
  const [amount, setAmount] = useState("")
  const [wallet, setWallet] = useState("")
  const [userData, setUserData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    loadUserBalance()
  }, [])

  const loadUserBalance = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) return
    try {
      const userRef = doc(db, "users", user.email)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        setUserData(userSnap.data())
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  const handleWithdraw = async () => {
    const withdrawAmount = Number(amount)
    const availableBalance = userData?.balance || 0

    if (!withdrawAmount || withdrawAmount <= 0) {
      setToast({ message: "Please enter a valid amount!", type: "error" })
      return
    }

    if (withdrawAmount > availableBalance) {
      setToast({ message: "Insufficient balance!", type: "error" })
      return
    }

    if (!wallet.trim()) {
      setToast({ message: "Please enter wallet address!", type: "error" })
      return
    }

    setIsSubmitting(true)

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      await addDoc(collection(db, "withdrawals"), {
        email: user.email || "",
        userId: user.uid || "", // ✅ Important for Admin Refund logic
        amount: withdrawAmount,
        wallet: wallet.trim(),
        coin: "USDT (TRC20)",
        status: "Pending",
        createdAt: new Date(),
      })

      setToast({ message: "Withdrawal request submitted successfully!", type: "success" })
      setAmount("")
      setWallet("")
      
    } catch (error) {
      console.log(error)
      setToast({ message: "Withdrawal failed. Please try again.", type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableBalance = userData?.balance?.toFixed(2) || "0.00"

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] p-6 md:p-10 flex items-center justify-center">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-full max-w-3xl bg-[#1E2329] border border-[#2B3139] rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#2B3139] bg-[#181A20]">
          <h1 className="text-2xl font-bold text-white">Withdraw Crypto</h1>
          <p className="text-sm text-[#848E9C] mt-1">Transfer crypto to your external wallet</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">

          {/* Available Balance */}
          <div className="bg-[#0B0E11] border border-[#2B3139] rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#848E9C]">Available Balance</p>
              <p className="text-2xl font-bold text-[#FCD535] font-mono mt-1">${availableBalance}</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>

          {/* Network Warning */}
          <div className="bg-[#F6465D]/5 border border-[#F6465D]/20 rounded-lg p-4 text-sm text-[#F6465D] flex items-start gap-3">
            <span className="text-lg mt-0.5">⚠️</span>
            <div>
              <p className="font-bold">Network Warning</p>
              <p className="text-[#848E9C] text-xs mt-1">Only withdraw using the <span className="text-white font-bold">TRC20 (Tron)</span> network. Depositing to any other network may result in loss of funds.</p>
            </div>
          </div>

          <div className="space-y-5">
            
            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Withdraw Amount (USDT)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#0B0E11] border border-[#2B3139] outline-none text-white font-mono text-lg placeholder-[#5E6673] focus:border-[#FCD535] transition-colors pr-20"
                />
                <button 
                  onClick={() => setAmount(availableBalance)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#2B3139] hover:bg-[#3B4149] text-[#FCD535] px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">TRC20 Wallet Address</label>
              <input
                type="text"
                placeholder="Paste your TRC20 wallet address here"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#0B0E11] border border-[#2B3139] outline-none text-white font-mono text-sm placeholder-[#5E6673] focus:border-[#FCD535] transition-colors"
              />
            </div>

          </div>

          {/* Submit Button */}
          <button
            onClick={handleWithdraw}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
              isSubmitting 
                ? "bg-[#2B3139] text-[#848E9C] cursor-not-allowed" 
                : "bg-[#F6465D] text-white hover:bg-red-600 active:scale-[0.98] shadow-lg shadow-red-900/30"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-[#848E9C]/30 border-t-[#848E9C] rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              "Submit Withdrawal"
            )}
          </button>

        </div>
      </div>

      {/* Tailwind Animation for Toast */}
      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  )
}