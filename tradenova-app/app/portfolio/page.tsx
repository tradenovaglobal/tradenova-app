"use client";

import { useEffect, useState } from "react";

export default function PortfolioPage() {
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [kycStatus, setKycStatus] = useState("Pending");

  useEffect(() => {
    const depositData = JSON.parse(
      localStorage.getItem("deposits") || "[]"
    );

    const withdrawData = JSON.parse(
      localStorage.getItem("withdraws") || "[]"
    );

    const kycData = JSON.parse(
      localStorage.getItem("kyc") || "{}"
    );

    setDeposits(depositData);
    setWithdrawals(withdrawData);

    if (kycData.status) {
      setKycStatus(kycData.status);
    }

    let totalDeposit = 0;

    depositData.forEach((item: any) => {
      if (item.status === "Approved") {
        totalDeposit += Number(item.amount);
      }
    });

    let totalWithdraw = 0;

    withdrawData.forEach((item: any) => {
      if (item.status === "Approved") {
        totalWithdraw += Number(item.amount);
      }
    });

    setBalance(totalDeposit - totalWithdraw);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-8">

      <h1 className="text-5xl font-black text-cyan-400 mb-10">
        Portfolio Overview
      </h1>

      <div className="grid md:grid-cols-4 gap-6 mb-10">

        <div className="bg-[#081222] p-6 rounded-3xl border border-cyan-500/20">
          <p className="text-gray-400">Available Balance</p>
          <h2 className="text-3xl font-black text-green-400">
            ${balance}
          </h2>
        </div>

        <div className="bg-[#081222] p-6 rounded-3xl border border-cyan-500/20">
          <p className="text-gray-400">Deposits</p>
          <h2 className="text-3xl font-black text-cyan-400">
            {deposits.length}
          </h2>
        </div>

        <div className="bg-[#081222] p-6 rounded-3xl border border-cyan-500/20">
          <p className="text-gray-400">Withdrawals</p>
          <h2 className="text-3xl font-black text-red-400">
            {withdrawals.length}
          </h2>
        </div>

        <div className="bg-[#081222] p-6 rounded-3xl border border-cyan-500/20">
          <p className="text-gray-400">KYC Status</p>
          <h2 className="text-2xl font-black text-yellow-400">
            {kycStatus}
          </h2>
        </div>

      </div>

      <div className="bg-[#081222] rounded-3xl p-6 border border-cyan-500/20">

        <h2 className="text-3xl font-black text-white mb-6">
          Recent Activity
        </h2>

        {deposits.slice(0, 5).map((item, index) => (
          <div
            key={index}
            className="bg-black rounded-2xl p-4 mb-3"
          >
            Deposit - ${item.amount} - {item.status}
          </div>
        ))}

        {withdrawals.slice(0, 5).map((item, index) => (
          <div
            key={index}
            className="bg-black rounded-2xl p-4 mb-3"
          >
            Withdrawal - ${item.amount} - {item.status}
          </div>
        ))}

      </div>

    </main>
  );
}