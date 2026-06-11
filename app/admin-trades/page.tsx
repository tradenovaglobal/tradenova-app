"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore"
import { db } from "../lib/firebase"
import AdminSidebar from "../components/AdminSidebar"

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

// Fund Modal Component
const FundModal = ({ isOpen, onClose, onSubmit, type }: { isOpen: boolean; onClose: () => void; onSubmit: (amount: number) => void; type: "add" | "remove" }) => {
  const [amount, setAmount] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) return
    onSubmit(numAmount)
    setAmount("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-[#1E2329] border border-[#2B3139] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-1">
          {type === "add" ? "Add Funds" : "Remove Funds"}
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Enter the amount to {type === "add" ? "credit" : "debit"} from user account
        </p>
        
        <input
          type="number"
          placeholder="Enter amount (e.g., 500)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-xl p-4 text-white text-lg font-mono focus:outline-none focus:border-[#FCD535] transition-colors"
          autoFocus
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-[#0B0E11] text-gray-400 font-bold hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all active:scale-95 ${
              type === "add" 
                ? "bg-gradient-to-r from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-900/30" 
                : "bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:shadow-red-900/30"
            }`}
          >
            {type === "add" ? "✅ Add Funds" : "❌ Remove Funds"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"add" | "remove">("add")
  const [selectedUser, setSelectedUser] = useState<{ id: string; balance: number } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, "users"))
      const list: any[] = []
      snapshot.forEach((docItem) => {
        list.push({ id: docItem.id, ...docItem.data() })
      })
      setUsers(list)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const openFundModal = (user: any, type: "add" | "remove") => {
    setSelectedUser({ id: user.id, balance: user.balance || 0 })
    setModalType(type)
    setIsModalOpen(true)
  }

  const handleFundSubmit = async (amount: number) => {
    if (!selectedUser) return

    try {
      const newBalance = modalType === "add" 
        ? Number(selectedUser.balance) + amount 
        : Number(selectedUser.balance) - amount

      await updateDoc(doc(db, "users", selectedUser.id), {
        balance: newBalance
      })

      setToast({ 
        message: `Successfully ${modalType === "add" ? "added" : "removed"} $${amount.toFixed(2)}`, 
        type: "success" 
      })
      loadUsers()
    } catch (error) {
      setToast({ message: "Transaction failed!", type: "error" })
    }
  }

  // ✅ FORCE WIN/LOSS TOGGLE FUNCTION
  const toggleForceWin = async (item: any) => {
    try {
      const userRef = doc(db, "users", item.id)
      const currentStatus = item.forceWin || false
      
      await updateDoc(userRef, {
        forceWin: !currentStatus
      })
      
      setToast({ 
        message: !currentStatus ? "✅ User set to ALWAYS WIN!" : "❌ User set to ALWAYS LOSS!", 
        type: !currentStatus ? "success" : "error" 
      })
      loadUsers()
    } catch (error) {
      setToast({ message: "Failed to update user status", type: "error" })
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] flex">
      <AdminSidebar />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <FundModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFundSubmit} 
        type={modalType} 
      />

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Users <span className="text-cyan-400">Management</span></h1>
          <p className="text-sm text-[#848E9C] mt-1">Manage user balances, roles, and trade outcomes</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#848E9C]">
            <div className="w-12 h-12 border-4 border-[#2B3139] border-t-[#FCD535] rounded-full animate-spin mb-4"></div>
            <p className="font-semibold">Loading Users...</p>
          </div>
        ) : (
          <div className="bg-[#1E2329] rounded-xl border border-[#2B3139] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#2B3139] bg-[#0B0E11]">
                    <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">KYC</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Trade Mode</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B3139]/50">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-[#5E6673]">
                        <div className="flex flex-col items-center">
                          <span className="text-5xl mb-3">👥</span>
                          <p className="font-semibold text-[#848E9C]">No Users Found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#0B0E11]/50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#2B3139] flex items-center justify-center text-[#FCD535] font-bold text-sm border-2 border-transparent">
                              {user.name?.substring(0, 1).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-bold text-white">{user.name || "Unknown"}</p>
                              <p className="text-sm text-[#5E6673]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-white font-bold">${(Number(user.balance) || 0).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.kycStatus === "Approved" ? "bg-[#0ECB81]/10 text-[#0ECB81] border border-[#0ECB81]/30" : 
                            user.kycStatus === "Rejected" ? "bg-[#F6465D]/10 text-[#F6465D] border border-[#F6465D]/30" : 
                            "bg-[#FCD535]/10 text-[#FCD535] border border-[#FCD535]/30"
                          }`}>
                            {user.kycStatus || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {/* ✅ FORCE WIN/LOSS BUTTON */}
                          <button
                            onClick={() => toggleForceWin(user)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                              user.forceWin 
                                ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-900/20" 
                                : "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-900/20"
                            }`}
                          >
                            {user.forceWin ? "👑 WIN MODE" : "💀 LOSS MODE"}
                          </button>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openFundModal(user, "add")}
                              className="bg-[#2B3139] hover:bg-[#3B4149] text-[#0ECB81] px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                            >
                              + Add
                            </button>
                            <button
                              onClick={() => openFundModal(user, "remove")}
                              className="bg-[#2B3139] hover:bg-[#3B4149] text-[#F6465D] px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                            >
                              - Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

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