"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import AdminSidebar from "@/components/AdminSidebar"

// Toast Notification Component
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

export default function AdminWithdrawPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "Pending" | "Approved" | "Rejected">("ALL")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, "withdrawals"))
      const data: any[] = []
      querySnapshot.forEach((docItem) => {
        data.push({ id: docItem.id, ...docItem.data() })
      })
      // Newest first
      setWithdrawals(data.reverse())
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
    } finally {
      setLoading(false)
    }
  }

  const approveWithdraw = async (item: any) => {
    try {
      // 1. Update Withdrawal Status
      await updateDoc(doc(db, "withdrawals", item.id), { status: "Approved" })

      // 2. Deduct from Admin Main Wallet
      const walletRef = doc(db, "wallets", "mainWallet")
      const walletSnap = await getDoc(walletRef)

      if (walletSnap.exists()) {
        const currentBalance = walletSnap.data().balance || 0
        await updateDoc(walletRef, {
          balance: Number(currentBalance) - Number(item.amount)
        })
      }

      setToast({ message: `Withdrawal of $${item.amount} approved!`, type: "success" })
      fetchWithdrawals()
    } catch (error: any) {
      setToast({ message: "Approval failed: " + error.message, type: "error" })
    }
  }

  const rejectWithdraw = async (item: any) => {
    try {
      // 1. Update Withdrawal Status
      await updateDoc(doc(db, "withdrawals", item.id), { status: "Rejected" })

      // 2. REFUND USER: Document ID email hai, userId nahi!
      if (item.email) { // ✅ FIXED: item.userId ki jagah item.email use kiya
        const userRef = doc(db, "users", item.email) // ✅ FIXED
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const currentBalance = userSnap.data().balance || 0
          await updateDoc(userRef, {
            balance: Number(currentBalance) + Number(item.amount)
          })
        }
      }

      setToast({ message: `Withdrawal rejected. $${item.amount} refunded to user.`, type: "success" })
      fetchWithdrawals()
    } catch (error: any) {
      setToast({ message: "Rejection failed: " + error.message, type: "error" })
    }
  }

  // Filter Logic
  const filteredWithdrawals = withdrawals.filter((item) => {
    const status = item.status || "Pending"
    if (filter === "ALL") return true
    return status === filter
  })

  // Stats calculation
  const pendingCount = withdrawals.filter(t => !t.status || t.status === "Pending").length
  const approvedCount = withdrawals.filter(t => t.status === "Approved").length
  const rejectedCount = withdrawals.filter(t => t.status === "Rejected").length
  const totalPendingAmount = withdrawals.filter(t => !t.status || t.status === "Pending").reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  return (
    <main className="min-h-screen bg-[#0b0e11] text-white flex">
      <AdminSidebar />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              Withdrawal <span className="text-cyan-400">Requests</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Review, approve, or reject user withdrawals</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["ALL", "Pending", "Approved", "Rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filter === f 
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/10" 
                    : "bg-[#1e2329] text-gray-400 border border-transparent hover:bg-[#2b3139]"
                }`}
              >
                {f} {f === "Pending" && pendingCount > 0 && `(${pendingCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-yellow-900/30 shadow-md">
            <p className="text-yellow-500 text-xs uppercase tracking-wider mb-1">Pending Amount</p>
            <p className="text-2xl font-bold text-yellow-400">${totalPendingAmount.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-gray-800 shadow-md">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-white">{withdrawals.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-green-900/30 shadow-md">
            <p className="text-green-500 text-xs uppercase tracking-wider mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-400">{approvedCount}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-red-900/30 shadow-md">
            <p className="text-red-500 text-xs uppercase tracking-wider mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p className="font-semibold">Loading Withdrawals...</p>
          </div>
        ) : (
          /* Withdrawal Cards */
          <div className="space-y-4">
            {filteredWithdrawals.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <span className="text-5xl mb-3 block">💰</span>
                <p className="font-semibold text-gray-400">No Withdrawal Requests</p>
                <p className="text-sm text-gray-600 mt-1">Waiting for users to request withdrawals...</p>
              </div>
            ) : (
              filteredWithdrawals.map((item) => {
                const status = item.status || "Pending"
                return (
                  <div
                    key={item.id}
                    className="bg-[#1e2329] border border-gray-800 rounded-xl p-6 shadow-xl shadow-black/20 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      
                      {/* Left: Withdrawal Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-yellow-900/30 border border-yellow-800/50 flex items-center justify-center text-yellow-400 font-bold text-sm">
                            {item.coin?.substring(0, 2) || "💰"}
                          </div>
                          <h3 className="text-lg font-bold text-white">{item.coin || "Crypto"}</h3>
                          
                          {status === "Approved" && (
                            <span className="bg-green-900/40 text-green-400 border border-green-800/50 px-3 py-1 rounded-full text-xs font-bold ml-auto md:ml-2">✅ Approved</span>
                          )}
                          {status === "Rejected" && (
                            <span className="bg-red-900/40 text-red-400 border border-red-800/50 px-3 py-1 rounded-full text-xs font-bold ml-auto md:ml-2">❌ Rejected</span>
                          )}
                          {status === "Pending" && (
                            <span className="bg-yellow-900/40 text-yellow-400 border border-yellow-800/50 px-3 py-1 rounded-full text-xs font-bold animate-pulse ml-auto md:ml-2">⏳ Pending</span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Amount</p>
                            <p className="text-white font-mono font-bold text-lg">${Number(item.amount).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Wallet Address</p>
                            <p className="text-gray-300 font-mono text-xs truncate bg-[#0b0e11] px-2 py-1 rounded-md border border-gray-800 mt-1">{item.wallet || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      {status === "Pending" && (
                        <div className="flex md:flex-col gap-2 md:w-48">
                          <button
                            onClick={() => approveWithdraw(item)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-green-900/40 active:scale-95 flex items-center justify-center gap-2"
                          >
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => rejectWithdraw(item)}
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-red-900/40 active:scale-95 flex items-center justify-center gap-2"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
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