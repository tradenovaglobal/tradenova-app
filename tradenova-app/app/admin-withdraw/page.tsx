"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";

export default function AdminWithdrawPage() {

  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const fetchWithdrawals = async () => {

    const querySnapshot = await getDocs(
      collection(db, "withdrawals")
    );

    const data: any[] = [];

    querySnapshot.forEach((docItem) => {

      data.push({
        id: docItem.id,
        ...docItem.data(),
      });

    });

    setWithdrawals(data);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const approveWithdraw = async (
    id: string,
    amount: number
  ) => {

    try {

      const withdrawRef = doc(db, "withdrawals", id);

      await updateDoc(withdrawRef, {
        status: "Approved",
      });

      const walletRef = doc(
        db,
        "wallets",
        "mainWallet"
      );

      const walletSnap = await getDoc(walletRef);

      if (walletSnap.exists()) {

        const currentBalance =
          walletSnap.data().balance || 0;

        await updateDoc(walletRef, {
          balance: currentBalance - amount,
        });
      }

      alert("Withdrawal Approved ✅");

      fetchWithdrawals();

    } catch (error: any) {
      alert(error.message);
    }
  };

  const rejectWithdraw = async (id: string) => {

    try {

      const withdrawRef = doc(db, "withdrawals", id);

      await updateDoc(withdrawRef, {
        status: "Rejected",
      });

      alert("Withdrawal Rejected ❌");

      fetchWithdrawals();

    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] p-10">

      <h1 className="text-6xl font-bold text-[#00FFB2] mb-10">
        Admin Withdrawal Panel
      </h1>

      <div className="space-y-6">

        {withdrawals.map((item) => (

          <div
            key={item.id}
            className="bg-white/5 border border-white/10 rounded-3xl p-8"
          >

            <h2 className="text-4xl font-bold text-[#00FFB2] mb-4">
              {item.coin}
            </h2>

            <p className="text-white mb-2">
              Amount: ${item.amount}
            </p>

            <p className="text-white mb-2">
              Wallet: {item.wallet}
            </p>

            <p
              className={`mb-6 font-bold text-xl ${
                item.status === "Approved"
                  ? "text-green-400"
                  : item.status === "Rejected"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              Status: {item.status}
            </p>

            <div className="flex gap-4">

              <button
                onClick={() =>
                  approveWithdraw(
                    item.id,
                    Number(item.amount)
                  )
                }
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold"
              >
                Approve
              </button>

              <button
                onClick={() =>
                  rejectWithdraw(item.id)
                }
                className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold"
              >
                Reject
              </button>

            </div>

          </div>
        ))}

      </div>

    </main>
  );
}