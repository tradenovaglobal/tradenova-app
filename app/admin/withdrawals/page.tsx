"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore"
import { db } from "../../lib/firebase"
import AdminSidebar from "../../components/AdminSidebar"

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error" | "warning"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-slide-in ${
      type === "success" ? "bg-emerald-900/90 border-emerald-500/50 text-emerald-200" : 
      type === "error" ? "bg-red-900/90 border-red-500/50 text-red-200" :
      "bg-amber-900/90 border-amber-500/50 text-amber-200"
    }`}>
      <span className="text-xl">{type === "success" ? "✅" : type === "error" ? "❌" : "⚠️"}</span>
      <span className="font-semibold text-sm">{message}</span>
    </div>
  )
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null) // Double click protection
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null)

  useEffect(() => {
    loadWithdrawals()
  }, [])

  const loadWithdrawals = async () => {
    try {
      const snapshot = await getDocs(collection(db, "withdrawals"))
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      setWithdrawals(data.reverse()) // Latest first
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading withdrawals:", error)
      setIsLoading(false)
    }
  }

  const approveWithdrawal = async (withdrawal: any) => {
    // Double Approval Protection
    if (withdrawal.status === "Approved") {
      setToast({ message: "This withdrawal is already approved!", type: "warning" })
      return
    }

    setProcessingId(withdrawal.id) // Lock the button

    try {
      const userQuery = query(collection(db, "users"), where("email", "==", withdrawal.email))
      const userSnapshot = await getDocs(userQuery)

      if (userSnapshot.empty) {
        setToast({ message: "User Not Found in Database!", type: "error" })
        setProcessingId(null)
        return
      }

      const userDoc = userSnapshot.docs[0]
      const userData: any = userDoc.data()
      const currentBalance = Number(userData.balance || 0)
      const amount = Number(withdrawal.amount || 0)

      if (currentBalance < amount) {
        setToast({ message: `Insufficient Balance! User only has $${currentBalance.toFixed(2)}`, type: "error" })
        setProcessingId(null)
        return
      }

      // Deduct Balance
      await updateDoc(userDoc.ref, {
        balance: currentBalance - amount,
      })

      // Update Status
      await updateDoc(doc(db, "withdrawals", withdrawal.id), {
        status: "Approved",
      })

      setToast({ message: `Withdrawal of $${amount.toFixed(2)} approved for ${withdrawal.email}`, type: "success" })
      loadWithdrawals()
    } catch (error) {
      console.error(error)
      setToast({ message: "Approval Failed! Check console.", type: "error" })
    } finally {
      setProcessingId(null) // Unlock the button
    }
  }

  const rejectWithdrawal = async (withdrawal: any) => {
    if (withdrawal.status === "Rejected") return

    setProcessingId(withdrawal.id)
    try {
      await updateDoc(doc(db, "withdrawals", withdrawal.id), {
        status: "Rejected",
      })
      setToast({ message: `Withdrawal of $${Number(withdrawal.amount).toFixed(2)} rejected.`, type: "error" })
      loadWithdrawals()
    } catch (error) {
      console.error(error)
      setToast({ message: "Rejection Failed!", type: "error" })
    } finally {
      setProcessingId(null)
    }
  }

  // Wallet truncation (e.g 0x1234...abcd)
  const truncateWallet = (wallet: string) => {
    if (!wallet) return "N/A"
    return wallet.length > 12 ? `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}` : wallet
  }

  // Status Badge
  const StatusBadge = ({ status }: { status: string }) => {
    let classes = ""
    let text = status || "Pending"
    switch (status) {
      case "Approved":
        classes = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        break
      case "Rejected":
        classes = "bg-red-500/10 text-red-400 border-red-500/30"
        break
      default: // Pending
        classes = "bg-amber-500/10 text-amber-400 border-amber-500/30"
        text = "Pending"
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${classes} inline-flex items-center gap-1.5`}>
        {(!status || status === "Pending") && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
        {text}
      </span>
    )
  }

  return (
    <main className="min-h-screen bg-[#05070a] text-white flex font-sans">
      <AdminSidebar />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Withdrawal Requests
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Process and manage user fund withdrawals
          </p>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
           <div className="bg-[#0a0e17] border border-amber-500/30 rounded-2xl p-5 shadow-lg shadow-amber-500/5">
             <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending</p>
             <h2 className="text-3xl font-black text-amber-400 mt-1">
               {withdrawals.filter(w => !w.status || w.status === "Pending").length}
             </h2>
           </div>
           <div className="bg-[#0a0e17] border border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-500/5">
             <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Approved (Paid)</p>
             <h2 className="text-3xl font-black text-emerald-400 mt-1">
               {withdrawals.filter(w => w.status === "Approved").length}
             </h2>
           </div>
           <div className="bg-[#0a0e17] border border-red-500/30 rounded-2xl p-5 shadow-lg shadow-red-500/5">
             <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Rejected</p>
             <h2 className="text-3xl font-black text-red-400 mt-1">
               {withdrawals.filter(w => w.status === "Rejected").length}
             </h2>
           </div>
        </div>

        {/* Table Section */}
        <div className="relative z-10 bg-[#0a0e17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl shadow-black/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 bg-[#05070a]">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Wallet Address</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-600">
                      <div className="flex flex-col items-center">
                        <svg className="animate-spin h-8 w-8 text-red-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading Withdrawals...
                      </div>
                    </td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-600">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-3">🚀</span>
                        <p className="font-semibold text-gray-400">No Withdrawals Found</p>
                        <p className="text-sm text-gray-600 mt-1">Users haven't requested any withdrawals yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal) => {
                    const isProcessing = processingId === withdrawal.id
                    const isPending = !withdrawal.status || withdrawal.status === "Pending"

                    return (
                      <tr key={withdrawal.id} className="hover:bg-[#2b3139] transition-colors">
                        <td className="px-6 py-5 font-medium text-sm">{withdrawal.email}</td>
                        <td className="px-6 py-5 font-mono font-bold text-red-400">
                          -${Number(withdrawal.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-5 font-mono text-xs text-gray-400" title={withdrawal.wallet}>
                          <div className="flex items-center gap-2">
                            <span>{truncateWallet(withdrawal.wallet)}</span>
                            {withdrawal.wallet && (
                              <button 
                                onClick={() => navigator.clipboard.writeText(withdrawal.wallet)} 
                                className="text-gray-600 hover:text-cyan-400 transition-colors"
                                title="Copy Wallet Address"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={withdrawal.status || "Pending"} />
                        </td>
                        <td className="px-6 py-5 text-right">
                          {isPending ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => approveWithdrawal(withdrawal)}
                                disabled={isProcessing}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                              >
                                {isProcessing ? <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "✓"}
                                Approve
                              </button>
                              <button
                                onClick={() => rejectWithdrawal(withdrawal)}
                                disabled={isProcessing}
                                className="bg-red-600/20 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 hover:text-white px-4 py-2 rounded-lg text-xs font-bold border border-red-500/30 transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-xs italic">Processed</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Animation for Toast */}
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