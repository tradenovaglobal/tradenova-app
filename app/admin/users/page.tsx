"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import AdminSidebar from "../../components/AdminSidebar"

// --- Toast Component ---
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error" | "warning"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all ${
      type === "success" ? "bg-emerald-900/90 border-emerald-500/50 text-emerald-200" : 
      type === "error" ? "bg-red-900/90 border-red-500/50 text-red-200" :
      "bg-amber-900/90 border-amber-500/50 text-amber-200"
    }`}>
      <span className="text-xl">{type === "success" ? "✅" : type === "error" ? "❌" : "⚠️"}</span>
      <span className="font-semibold text-sm">{message}</span>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteModal, setDeleteModal] = useState<any>(null) // For delete confirmation

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"))
      const usersList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      setUsers(usersList)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching users:", error)
      setIsLoading(false)
      setToast({ message: "Failed to load users!", type: "error" })
    }
  }

  // ✅ BLOCK / UNBLOCK USER
  const toggleBlockUser = async (user: any) => {
    try {
      const newStatus = user.status === "blocked" ? "active" : "blocked"
      await updateDoc(doc(db, "users", user.email), { status: newStatus })
      
      setToast({ 
        message: `User ${user.name || user.email} has been ${newStatus === "blocked" ? "BLOCKED" : "UNBLOCKED"}`, 
        type: newStatus === "blocked" ? "error" : "success" 
      })
      fetchUsers() 
    } catch (error) {
      console.error("Error updating user status:", error)
      setToast({ message: "Failed to update status!", type: "error" })
    }
  }

  // ✅ DELETE USER
  const confirmDeleteUser = async () => {
    if (!deleteModal) return
    try {
      await deleteDoc(doc(db, "users", deleteModal.email))
      setToast({ message: `User ${deleteModal.email} deleted successfully!`, type: "success" })
      setDeleteModal(null) // Close modal
      fetchUsers() 
    } catch (error) {
      console.error("Error deleting user:", error)
      setToast({ message: "Failed to delete user!", type: "error" })
      setDeleteModal(null)
    }
  }

  // Search Filter
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-[#05070a] text-white flex font-sans max-w-[100vw] overflow-x-hidden">
      <AdminSidebar />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* DELETE CONFIRMATION MODAL (Premium) */}
      {deleteModal && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setDeleteModal(null)}>
          <div className="relative w-full max-w-sm bg-[#111827] border border-red-500/30 rounded-2xl p-6 shadow-2xl shadow-red-500/10" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-xl font-bold text-white">Delete User?</h3>
              <p className="text-gray-400 text-sm mt-2">Are you sure you want to permanently delete <span className="text-red-400 font-semibold">{deleteModal.email}</span>? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 font-semibold hover:bg-gray-800 transition-all">Cancel</button>
              <button onClick={confirmDeleteUser} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-500/20 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor, block, and delete platform users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0a0e17] border border-cyan-500/30 rounded-xl p-4">
            <p className="text-[10px] md:text-xs text-cyan-400 uppercase font-semibold">Total Users</p>
            <h2 className="text-xl md:text-2xl font-black text-cyan-400 mt-1">{users.length}</h2>
          </div>
          <div className="bg-[#0a0e17] border border-emerald-500/30 rounded-xl p-4">
            <p className="text-[10px] md:text-xs text-emerald-400 uppercase font-semibold">Active</p>
            <h2 className="text-xl md:text-2xl font-black text-emerald-400 mt-1">{users.filter(u => u.status !== "blocked").length}</h2>
          </div>
          <div className="bg-[#0a0e17] border border-red-500/30 rounded-xl p-4 col-span-2 md:col-span-1">
            <p className="text-[10px] md:text-xs text-red-400 uppercase font-semibold">Blocked</p>
            <h2 className="text-xl md:text-2xl font-black text-red-400 mt-1">{users.filter(u => u.status === "blocked").length}</h2>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search by Email or Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0e17] border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-cyan-500 transition-colors text-white"
          />
        </div>

        {/* Users Table */}
        <div className="bg-[#0a0e17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-800 bg-[#05070a]">
                  <th className="px-6 py-4 text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-4 text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-gray-600">
                      <svg className="animate-spin h-8 w-8 text-cyan-500 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading Users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-gray-600">
                      <span className="text-4xl block mb-3">👤</span>
                      <p className="font-semibold text-gray-400">No Users Found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isBlocked = user.status === "blocked"
                    return (
                      <tr key={user.id} className={`hover:bg-[#2b3139] transition-colors ${isBlocked ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm ${isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                              {(user.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{user.name || "Unknown"}</p>
                              <p className="text-gray-500 text-[11px] font-mono">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-mono font-bold text-emerald-400 text-sm">
                          ${(Number(user.balance) || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                            isBlocked ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          }`}>
                            {isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => toggleBlockUser(user)}
                              className={`px-3 md:px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold transition-all border ${
                                isBlocked 
                                  ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30" 
                                  : "bg-amber-600/10 text-amber-400 border-amber-500/30 hover:bg-amber-600/30"
                              }`}
                            >
                              {isBlocked ? "Unblock" : "Block"}
                            </button>
                            
                            <button 
                              onClick={() => setDeleteModal(user)}
                              className="px-3 md:px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold bg-red-600/10 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-all"
                            >
                              Delete
                            </button>
                          </div>
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
    </main>
  )
}