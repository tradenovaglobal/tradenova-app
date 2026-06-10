"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import AdminSidebar from "../../components/AdminSidebar";

// Toast Component (Trades wala hi hai)
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

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null); // Button disable rakhne ke liye
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    try {
      const snapshot = await getDocs(collection(db, "deposits"));
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Latest deposits upar dikhane ke liye (Agar timestamp field hai toh usse sort karo, nahi toh reverse)
      setDeposits(list.reverse());
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading deposits:", error);
      setIsLoading(false);
    }
  };

  const approveDeposit = async (deposit: any) => {
    // ✅ FIX 1: Double Approval Protection
    if (deposit.status === "Approved") {
      setToast({ message: "This deposit is already approved!", type: "warning" });
      return;
    }

    setProcessingId(deposit.id); // Button pe loading shuru

    try {
      const usersSnapshot = await getDocs(
        query(collection(db, "users"), where("email", "==", deposit.email))
      );

      if (usersSnapshot.empty) {
        setToast({ message: "User Not Found in Database!", type: "error" });
        setProcessingId(null);
        return;
      }

      const userDoc = usersSnapshot.docs[0];
      const userData: any = userDoc.data();
      const currentBalance = Number(userData.balance || 0);

      // User ka balance update karo
      await updateDoc(userDoc.ref, {
        balance: currentBalance + Number(deposit.amount),
      });

      // Deposit ka status update karo
      await updateDoc(doc(db, "deposits", deposit.id), {
        status: "Approved",
      });

      setToast({ message: `Successfully approved $${deposit.amount} for ${deposit.email}`, type: "success" });
      loadDeposits(); // Table refresh karo
    } catch (error) {
      console.error(error);
      setToast({ message: "Approval Failed! Check console.", type: "error" });
    } finally {
      setProcessingId(null); // Loading hatao
    }
  };

  // ✅ FIX 2: Reject Functionality Added
  const rejectDeposit = async (deposit: any) => {
    if (deposit.status === "Rejected") return;

    setProcessingId(deposit.id);
    try {
      await updateDoc(doc(db, "deposits", deposit.id), {
        status: "Rejected",
      });
      setToast({ message: `Deposit of $${deposit.amount} rejected.`, type: "error" });
      loadDeposits();
    } catch (error) {
      console.error(error);
      setToast({ message: "Rejection Failed!", type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  // Wallet address truncate karne ka function (e.g., 0x1234...abcd)
  const truncateWallet = (wallet: string) => {
    if (!wallet) return "N/A";
    return wallet.length > 12 ? `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}` : wallet;
  };

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    let classes = "";
    let text = status;
    switch (status) {
      case "Approved":
        classes = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
        break;
      case "Rejected":
        classes = "bg-red-500/10 text-red-400 border-red-500/30";
        break;
      default: // Pending
        classes = "bg-amber-500/10 text-amber-400 border-amber-500/30";
        text = "Pending";
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${classes} inline-flex items-center gap-1.5`}>
        {status === "Pending" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
        {text}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[#05070a] text-white flex font-sans">
      <AdminSidebar />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        {/* Background Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Deposit Requests
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Review and manage user fund deposits
          </p>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
           <div className="bg-[#0a0e17] border border-amber-500/30 rounded-2xl p-5 shadow-lg shadow-amber-500/5">
             <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending</p>
             <h2 className="text-3xl font-black text-amber-400 mt-1">{deposits.filter(d => d.status === "Pending" || !d.status).length}</h2>
           </div>
           <div className="bg-[#0a0e17] border border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-500/5">
             <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Approved</p>
             <h2 className="text-3xl font-black text-emerald-400 mt-1">{deposits.filter(d => d.status === "Approved").length}</h2>
           </div>
           <div className="bg-[#0a0e17] border border-red-500/30 rounded-2xl p-5 shadow-lg shadow-red-500/5">
             <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Rejected</p>
             <h2 className="text-3xl font-black text-red-400 mt-1">{deposits.filter(d => d.status === "Rejected").length}</h2>
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
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Coin</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Wallet</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proof</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-600">
                      <div className="flex flex-col items-center">
                        <svg className="animate-spin h-8 w-8 text-cyan-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading Deposits...
                      </div>
                    </td>
                  </tr>
                ) : deposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-600">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-3">💰</span>
                        <p className="font-semibold text-gray-400">No Deposits Found</p>
                        <p className="text-sm text-gray-600 mt-1">Users haven't made any deposits yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  deposits.map((deposit) => {
                    const isProcessing = processingId === deposit.id;
                    const isPending = !deposit.status || deposit.status === "Pending";

                    return (
                      <tr key={deposit.id} className="hover:bg-[#2b3139] transition-colors">
                        <td className="px-6 py-5 font-medium text-sm">{deposit.email}</td>
                        <td className="px-6 py-5 font-mono font-bold text-emerald-400">
                          ${Number(deposit.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-5">
                          <span className="bg-gray-800 px-2 py-1 rounded text-xs font-bold text-white">
                            {deposit.coin || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-mono text-xs text-gray-400" title={deposit.wallet}>
                          {truncateWallet(deposit.wallet)}
                        </td>
                        <td className="px-6 py-5">
                          {deposit.screenshot ? (
                            <a href={deposit.screenshot} target="_blank" rel="noreferrer" 
                               className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              View
                            </a>
                          ) : (
                            <span className="text-gray-600 text-xs">None</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={deposit.status || "Pending"} />
                        </td>
                        <td className="px-6 py-5 text-right">
                          {isPending ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => approveDeposit(deposit)}
                                disabled={isProcessing}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                              >
                                {isProcessing ? <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "✓"}
                                Approve
                              </button>
                              <button
                                onClick={() => rejectDeposit(deposit)}
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
                    );
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
  );
}