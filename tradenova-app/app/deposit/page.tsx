"use client"

import { useState } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../lib/firebase"

export default function DepositPage() {

  const [amount, setAmount] = useState("")
  const [wallet, setWallet] = useState("")
  const [hash, setHash] = useState("")

  const handleDeposit = async () => {

    try {

      const user =
        JSON.parse(localStorage.getItem("user") || "{}")

      await addDoc(
        collection(db, "deposits"),
        {
          email: user.email || "",
          amount,
          wallet,
          txHash: hash,
          coin: "USDT (TRC20)",
          status: "Pending",
          createdAt: new Date(),
        }
      )

      alert("Deposit Request Submitted")

      setAmount("")
      setWallet("")
      setHash("")

    } catch (error) {

      console.log(error)

      alert("Deposit Failed")

    }

  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-10">

      <div className="w-full max-w-xl bg-[#07111d] border border-cyan-500/20 rounded-[40px] p-10 shadow-[0_0_40px_#00ffff22]">

        <h1 className="text-5xl font-black text-cyan-400 mb-10 text-center">
          Deposit Funds
        </h1>

        <div className="space-y-6">

          <input
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black border border-cyan-500/20 outline-none"
          />

          <input
            type="text"
            placeholder="Wallet Address"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black border border-cyan-500/20 outline-none"
          />

          <input
            type="text"
            placeholder="Transaction Hash"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black border border-cyan-500/20 outline-none"
          />

          <button
            onClick={handleDeposit}
            className="w-full p-5 rounded-2xl bg-cyan-400 text-black font-black text-xl shadow-[0_0_30px_#00ffff]"
          >
            Submit Deposit
          </button>

        </div>

      </div>

    </main>
  )
}