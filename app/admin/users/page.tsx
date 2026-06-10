"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore"
import { db } from "../../lib/firebase"
import AdminSidebar from "../../components/AdminSidebar"

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

// Modal Component for Adding/Removing Funds
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
      <div className="bg-[#1e2329] border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
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
          className="w-full bg-[#0b0e11] border border-gray-700 rounded-xl p-4 text-white text-lg font-mono focus:outline-none focus:border-cyan-500 transition-colors"
          autoFocus
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-[#0b0e11] text-gray-400 font-bold hover:bg-gray-800 transition-colors"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<"add" | "remove">("add")
  const [selectedUser, setSelectedUser] = useState<{ id: string; balance: number } | null>(null)

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

  // Filtered users by search
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Stats calculation
  const totalBalance = users.reduce((sum, u) => sum + (Number(u.balance) || 0), 0)
  const verifiedCount = users.filter(u => u.kycStatus === "Approved").length
  const pendingKycCount = users.filter(u => !u.kycStatus || u.kycStatus === "Pending").length

  return (
    <main className="min-h-screen bg-[#0b0e11] text-white flex">
      <AdminSidebar />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Fund Modal */}
      <FundModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFundSubmit} 
        type={modalType} 
      />

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              Users <span className="text-cyan-400">Management</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage user balances, roles, and KYC status</p>
          </div>
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e2329] border border-gray-800 rounded-xl px-4 py-3 pl-10 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-gray-800 shadow-md">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Users</p>
            <p className="text-2xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-cyan-900/30 shadow-md">
            <p className="text-cyan-500 text-xs uppercase tracking-wider mb-1">Total Balance</p>
            <p className="text-2xl font-bold text-cyan-400">${totalBalance.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-green-900/30 shadow-md">
            <p className="text-green-500 text-xs uppercase tracking-wider mb-1">KYC Verified</p>
            <p className="text-2xl font-bold text-green-400">{verifiedCount}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-yellow-900/30 shadow-md">
            <p className="text-yellow-500 text-xs uppercase tracking-wider mb-1">KYC Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{pendingKycCount}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p className="font-semibold">Loading Users Data...</p>
          </div>
        ) : (
          /* Users Table */
          <div className="bg-[#1e2329] rounded-xl border border-gray-800 overflow-hidden shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#0b0e11]">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-600">
                        <div className="flex flex-col items-center">
                          <span className="text-5xl mb-3">👥</span>
                          <p className="font-semibold text-gray-400">No Users Found</p>
                          <p className="text-sm text-gray-600 mt-1">Wait for users to register...</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#2b3139]/50 transition-colors duration-200">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-800 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-900/30">
                              {user.name?.substring(0, 2).toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-bold text-white">{user.name || "Unknown"}</p>
                              <p className="text-sm text-gray-500">{user.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-white font-bold">
                            ${(Number(user.balance) || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {user.kycStatus === "Approved" ? (
                            <span className="bg-green-900/40 text-green-400 border border-green-800/50 px-3 py-1 rounded-full text-xs font-bold">Verified</span>
                          ) : user.kycStatus === "Rejected" ? (
                            <span className="bg-red-900/40 text-red-400 border border-red-800/50 px-3 py-1 rounded-full text-xs font-bold">Rejected</span>
                          ) : (
                            <span className="bg-yellow-900/40 text-yellow-400 border border-yellow-800/50 px-3 py-1 rounded-full text-xs font-bold">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.role === "admin" 
                              ? "bg-cyan-900/40 text-cyan-400 border border-cyan-800/50" 
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                          }`}>
                            {user.role || "user"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openFundModal(user, "add")}
                              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                            >
                              <span>+</span> Add
                            </button>
                            <button
                              onClick={() => openFundModal(user, "remove")}
                              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                            >
                              <span>-</span> Remove
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