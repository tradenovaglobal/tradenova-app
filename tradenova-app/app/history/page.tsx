"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export default function HistoryPage() {

  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdraws, setWithdraws] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {

    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    if (!user.email) return;

    // Deposits

    const depositSnap = await getDocs(
      collection(db, "deposits")
    );

    const userDeposits = depositSnap.docs
      .map((doc) => doc.data())
      .filter(
        (item: any) =>
          item.email === user.email
      );

    setDeposits(userDeposits);

    // Withdraws

    const withdrawSnap = await getDocs(
      collection(db, "withdrawals")
    );

    const userWithdraws = withdrawSnap.docs
      .map((doc) => doc.data())
      .filter(
        (item: any) =>
          item.email === user.email
      );

    setWithdraws(userWithdraws);
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-black text-purple-400 mb-8">
          Transaction History
        </h1>

        {/* Deposits */}

        <div className="bg-[#07111d] p-6 rounded-3xl mb-8 border border-cyan-500/20">

          <h2 className="text-3xl font-bold text-cyan-400 mb-4">
            Deposit History
          </h2>

          {deposits.length === 0 ? (

            <p>No Deposits Found</p>

          ) : (

            deposits.map((item, index) => (

              <div
                key={index}
                className="bg-black p-4 rounded-xl mb-3"
              >
                <p>Amount: ${item.amount}</p>
                <p>Status: {item.status}</p>
                <p>Coin: {item.coin}</p>
              </div>

            ))
          )}

        </div>

        {/* Withdraws */}

        <div className="bg-[#07111d] p-6 rounded-3xl border border-red-500/20">

          <h2 className="text-3xl font-bold text-red-400 mb-4">
            Withdraw History
          </h2>

          {withdraws.length === 0 ? (

            <p>No Withdraw Requests Found</p>

          ) : (

            withdraws.map((item, index) => (

              <div
                key={index}
                className="bg-black p-4 rounded-xl mb-3"
              >
                <p>Amount: ${item.amount}</p>
                <p>Status: {item.status}</p>
              </div>

            ))
          )}

        </div>

      </div>

    </main>
  );
}