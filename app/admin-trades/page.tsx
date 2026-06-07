"use client"

import { useEffect, useState } from "react"

export default function AdminTradesPage() {

  const [trades, setTrades] = useState<any[]>([])

  useEffect(() => {

    const savedTrades =
      JSON.parse(
        localStorage.getItem("transactions") || "[]"
      )

console.log("ADMIN TRADES DATA", savedTrades)

window.addEventListener("storage", () => {
  const latestTrades =
    JSON.parse(
      localStorage.getItem("transactions") || "[]"
    )

  setTrades(latestTrades)
})

    setTrades(savedTrades)

  }, [])

  const updateTrade = (
    index: number,
    result: "WIN" | "LOSS"
  ) => {

    const updatedTrades = [...trades]

    updatedTrades[index].adminResult = result

    updatedTrades[index].status = "Closed"

    updatedTrades[index].profit =
      result === "WIN"
        ? "+12.50"
        : "-8.50"

 localStorage.setItem(
  "transactions",
  JSON.stringify(updatedTrades)
)

    setTrades(updatedTrades)

    alert("Trade Updated")
  }

  return (

    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-black text-cyan-400 mb-10">
        Admin Trade Control
      </h1>

      {trades.length === 0 && (

        <div className="bg-[#081222] p-8 rounded-3xl border border-red-500/20">

          <h2 className="text-2xl text-red-400 font-bold">
            No Trades Found
          </h2>

          <p className="mt-3 text-gray-400">
            User has not created any trade yet
          </p>

        </div>

      )}

      {trades.map((trade, index) => (

        <div
          key={index}
          className="bg-[#081222] p-6 rounded-3xl mb-6 border border-cyan-500/20"
        >

          <p>Coin: {trade.coin}</p>

          <p>Amount: ${trade.amount}</p>

          <p>Status: {trade.status}</p>

          <p>
            Result:
            {" "}
            {trade.adminResult || "PENDING"}
          </p>

          <p>
            Profit:
            {" "}
            {trade.profit || "0"}
          </p>

          <div className="flex gap-3 mt-5">

            <button
              onClick={() =>
                updateTrade(index, "WIN")
              }
              className="bg-green-500 text-black px-6 py-2 rounded-xl font-black"
            >
              WIN
            </button>

            <button
              onClick={() =>
                updateTrade(index, "LOSS")
              }
              className="bg-red-500 px-6 py-2 rounded-xl font-black"
            >
              LOSS
            </button>

          </div>

        </div>

      ))}

    </main>

  )
}