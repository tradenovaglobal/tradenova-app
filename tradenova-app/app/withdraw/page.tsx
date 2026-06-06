"use client"

import { useState } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../lib/firebase"

export default function WithdrawPage() {

  const [amount, setAmount] = useState("")
  const [wallet, setWallet] = useState("")

  const handleWithdraw = async () => {

    try {

      const user =
        JSON.parse(localStorage.getItem("user") || "{}")

      await addDoc(
        collection(db, "withdrawals"),
        {
          email: user.email || "",
          amount,
          wallet,
          status: "Pending",
          createdAt: new Date(),
        }
      )

      alert("Withdraw Request Submitted")

      setAmount("")
      setWallet("")

    } catch (error) {

      console.log(error)

      alert("Withdraw Failed")

    }

  }

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center p-10">

      <div className="w-full max-w-xl bg-[#07111d] border border-red-500/20 rounded-[40px] p-10 shadow-[0_0_50px_#ff000022]">

        <h1 className="text-5xl font-black text-red-400 text-center mb-10">
          Withdraw Funds
        </h1>

        <div className="space-y-6">

          <input
            type="number"
            placeholder="Withdraw Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black border border-red-500/20 outline-none"
          />

          <input
            type="text"
            placeholder="Wallet Address"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black border border-red-500/20 outline-none"
          />

          <button
            onClick={handleWithdraw}
            className="w-full p-5 rounded-2xl bg-red-500 text-white font-black text-xl shadow-[0_0_30px_#ff0000]"
          >
            Submit Withdraw
          </button>

        </div>

      </div>

    </main>

  )
}