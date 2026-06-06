"use client"

import { useEffect, useState } from "react"

export default function TradeLivePage() {

  const [price, setPrice] = useState(73313)
  const [amount, setAmount] = useState(100)
  const [entryPrice, setEntryPrice] = useState(73313)

  useEffect(() => {

    setAmount(
      Number(localStorage.getItem("tradeAmount")) || 100
    )

    setEntryPrice(
      Number(localStorage.getItem("entryPrice")) || 73313
    )

    const interval = setInterval(() => {

      setPrice((prev) => {

        const change = Math.random() * 100 - 50

        return Number(prev + change)

      })

    }, 3000)

    return () => clearInterval(interval)

  }, [])

  const profit =
    ((price - entryPrice) * amount) / entryPrice

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="w-[700px] bg-[#07111d] border border-cyan-500/20 rounded-[35px] p-10">

        <h1 className="text-5xl font-black text-cyan-400 mb-8">
          BTC/USDT LIVE TRADE
        </h1>

        <div className="space-y-5">

          <div className="bg-black p-5 rounded-2xl">
            Entry Price: {entryPrice}
          </div>

          <div className="bg-black p-5 rounded-2xl">
            Current Price: {price.toFixed(2)}
          </div>

          <div className="bg-black p-5 rounded-2xl">
            Amount: ${amount}
          </div>

          <div
            className={`p-5 rounded-2xl font-black text-3xl ${
              profit >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            Profit/Loss: ${profit.toFixed(2)}
          </div>

          <button
            onClick={() => {

              const history =
                JSON.parse(
                  localStorage.getItem("tradeHistory") || "[]"
                )

              history.push({
                coin: "BTC/USDT",
                amount,
                entryPrice,
                exitPrice: price.toFixed(2),
                profit: profit.toFixed(2),
                buyTime:
                  localStorage.getItem("buyTime"),
                sellTime:
                  new Date().toLocaleString(),
                status: "CLOSED"
              })

              localStorage.setItem(
                "tradeHistory",
                JSON.stringify(history)
              )

              localStorage.removeItem("tradeAmount")
              localStorage.removeItem("entryPrice")
              localStorage.removeItem("buyTime")

              window.location.href =
                "/trade-history"

            }}
            className="w-full p-5 rounded-2xl bg-red-500 font-black text-2xl"
          >
            CLOSE TRADE
          </button>

        </div>

      </div>

    </main>

  )
}