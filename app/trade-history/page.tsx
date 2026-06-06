"use client"

import { useEffect, useState } from "react"

export default function TradeHistoryPage() {

  const [trades, setTrades] = useState<any[]>([])

  useEffect(() => {

    const data = JSON.parse(
      localStorage.getItem("tradeHistory") || "[]"
    )

    setTrades(data)

  }, [])

  return (

    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-black text-cyan-400 mb-10">
        Trade History
      </h1>

      <div className="grid grid-cols-3 gap-5 mb-10">

        <div className="bg-[#081222] p-5 rounded-2xl border border-cyan-500/20">
          <p className="text-gray-400">Total Trades</p>
          <h2 className="text-3xl font-black text-cyan-400">
            {trades.length}
          </h2>
        </div>

        <div className="bg-[#081222] p-5 rounded-2xl border border-green-500/20">
          <p className="text-gray-400">Win Rate</p>
          <h2 className="text-3xl font-black text-green-400">
            83%
          </h2>
        </div>

        <div className="bg-[#081222] p-5 rounded-2xl border border-yellow-500/20">
          <p className="text-gray-400">Total Profit</p>
          <h2 className="text-3xl font-black text-yellow-400">
            +$245.80
          </h2>
        </div>

      </div>

      {trades.length === 0 ? (

        <p>No Trades Found</p>

      ) : (

        trades.map((trade, index) => (

          <div
            key={index}
            className="bg-[#081222] p-6 rounded-2xl mb-5 border border-cyan-500/20"
          >

            <p className="text-gray-400 mb-2">
              Trade ID: TRD-{100000 + index}
            </p>

            <h2 className="text-2xl font-black text-cyan-400 mb-5">
              Trade Summary
            </h2>

            <div className="grid grid-cols-2 gap-4">

              <p>
                Pair: {trade.coin}
              </p>

              <div>
                <span
                  className={
                    trade.type === "BUY"
                      ? "bg-green-500 text-black px-3 py-1 rounded-xl font-black"
                      : "bg-red-500 text-white px-3 py-1 rounded-xl font-black"
                  }
                >
                  {trade.type}
                </span>
              </div>

              <p>
                Investment: ${trade.amount}
              </p>

              <p>
                Status: {trade.status}
              </p>

              <p>
                Entry Price: ${trade.entryPrice}
              </p>

              <p>
                Exit Price: ${trade.exitPrice}
              </p>

              <p>
                Opened At: {trade.buyTime || "-"}
              </p>

              <p>
                Closed At: {trade.sellTime || "-"}
              </p>

              <p>
                Duration: {trade.time || 60} Sec
              </p>

              <div
                className={
                  Number(trade.profit) >= 0
                    ? "text-green-400 text-xl font-black"
                    : "text-red-400 text-xl font-black"
                }
              >
                PnL: ${trade.profit}
              </div>

              <p
                className={
                  trade.adminResult === "WIN"
                    ? "text-green-400 font-black"
                    : trade.adminResult === "LOSS"
                    ? "text-red-400 font-black"
                    : "text-yellow-400 font-black"
                }
              >
                Result: {trade.adminResult || "PENDING"}
              </p>

            </div>

          </div>

        ))

      )}

    </main>

  )
}