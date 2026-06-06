"use client"

import { useState } from "react"

const coins = [
  ["BTC/USDT", "73,313.0", "-2.62%"],
  ["ETH/USDT", "3,520.6", "+2.81%"],
  ["SOL/USDT", "144.25", "+5.45%"],

  ["XRP/USDT", "2.4201", "+1.62%"],
  ["DOGE/USDT", "0.2201", "-0.81%"],
]

const candles = [
  [120, 220, true],
  [220, 160, false],
  [160, 300, true],
  [300, 260, false],
  [260, 340, true],
  [340, 290, false],
  [290, 420, true],
  [420, 380, false],
  [380, 460, true],
  [460, 410, false],
  [410, 480, true],
  [480, 430, false],
  [430, 520, true],
  [520, 470, false],
  [470, 560, true],
]

export default function TradingPage() { const [walletBalance, setWalletBalance] = useState(12450)

const handleBuy = () => {

  const transactions =
    JSON.parse(
      localStorage.getItem("transactions") || "[]"
    )

  transactions.push({
    type: "BUY",
    coin: "BTC/USDT",
    amount: 1000,
    createdAt: new Date().toISOString()
  })

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  )

  setWalletBalance(walletBalance - 1000)

  alert("Buy Order Executed")
}

const handleSell = () => {

  const transactions =
    JSON.parse(
      localStorage.getItem("transactions") || "[]"
    )

  transactions.push({
    type: "SELL",
    coin: "BTC/USDT",
    amount: 1000,
    createdAt: new Date().toISOString()
  })

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  )

  setWalletBalance(walletBalance + 1000)

  alert("Sell Order Executed")
}

  return (

    <main className="min-h-screen bg-black text-white p-5">

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">

        <div className="bg-[#050b16] border border-cyan-500/20 rounded-[35px] overflow-hidden">

          <div className="p-6 border-b border-cyan-500/10">

            <div className="flex items-center justify-between">

              <div>

                <h1 className="text-5xl font-black text-cyan-400">
                  BTC/USDT
                </h1>

                <div className="flex items-center gap-4 mt-3">

                  <p className="text-4xl font-black text-white">
                    73,313.0
                  </p>

                  <p className="text-red-500 text-2xl font-bold">
                    -1,974.0 (-2.62%)
                  </p>

                </div>

              </div>

              <div className="bg-green-500/20 text-green-400 px-5 py-2 rounded-full">
                LIVE
              </div>

            </div>

            <div className="flex gap-4 mt-6 text-lg">

              {["1m","5m","15m","30m","1H","4H","1D","1W","1M"].map((time) => (

                <button
                  key={time}
                  className={`
                    px-4 py-2 rounded-xl
                    ${time === "1D"
                      ? "bg-cyan-500 text-black font-bold"
                      : "bg-black text-white"}
                  `}
                >
                  {time}
                </button>

              ))}

            </div>

          </div>

          <div className="relative h-[700px] bg-[#020817] overflow-hidden">

            <div className="absolute inset-0">

              {[...Array(16)].map((_, i) => (

                <div
                  key={i}
                  className="absolute w-full border-t border-white/5"
                  style={{ top: `${i * 45}px` }}
                />

              ))}

              {[...Array(18)].map((_, i) => (

                <div
                  key={i}
                  className="absolute h-full border-l border-white/5"
                  style={{ left: `${i * 70}px` }}
                />

              ))}

            </div>

            <div className="relative z-10 flex items-end h-full gap-3 px-6 pb-16">

              {candles.map((candle, i) => {

                const open = candle[0] as number
                const close = candle[1] as number
                const green = candle[2] as boolean

                return (

                  <div
                    key={i}
                    className="flex flex-col items-center flex-1 relative"
                  >

                    <div
                      className={`
                        w-[2px]
                        absolute
                        bg-white
                        opacity-70
                      `}
                      style={{
                        height: `${Math.max(open, close) + 60}px`,
                        bottom: `${Math.min(open, close) - 30}px`
                      }}
                    />

                    <div
                      className={`
                        w-full
                        rounded-sm
                        shadow-lg
                        ${green
                          ? "bg-green-500 shadow-green-500/40"
                          : "bg-red-500 shadow-red-500/40"}
                      `}
                      style={{
                        height: `${Math.abs(close - open)}px`,
                        marginBottom: `${Math.min(open, close)}px`
                      }}
                    />

                  </div>

                )

              })}

            </div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050b16] to-transparent" />

          </div>

          <div className="grid grid-cols-2 gap-5 p-6 border-t border-cyan-500/10">

<button
  onClick={handleBuy}
  className="p-6 rounded-2xl bg-green-500 text-black text-3xl font-black shadow-[0_0_35px_#00ff00] hover:scale-105 duration-300"
>
  BUY
</button>

<button
  onClick={handleSell}
  className="p-6 rounded-2xl bg-red-500 text-white text-3xl font-black shadow-[0_0_35px_#ff0000] hover:scale-105 duration-300"
>
  SELL
</button>

          </div>

        </div>

        <div className="space-y-5">

          <div className="bg-[#050b16] border border-cyan-500/20 rounded-[35px] p-5">

            <h1 className="text-4xl font-black mb-6">
              Live Market
            </h1>

            <div className="space-y-4">

              {coins.map((coin, i) => (

                <div
                  key={i}
                  className="bg-black rounded-2xl p-5 flex justify-between items-center border border-white/5"
                >

                  <div>

                    <h1 className="text-2xl font-black">
                      {coin[0]}
                    </h1>

                    <p className="text-gray-500">
                      Live Pair
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-2xl font-black">
                      {coin[1]}
                    </p>

                    <p
                      className={
                        coin[2].includes("-")
                          ? "text-red-500"
                          : "text-green-400"
                      }
                    >
                      {coin[2]}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

          <div className="bg-[#050b16] border border-yellow-500/20 rounded-[35px] p-5">

            <h1 className="text-4xl font-black text-yellow-400 mb-6">
              Portfolio
            </h1>

            <div className="space-y-4">

              <div className="bg-black rounded-2xl p-5">

                <p className="text-gray-400">
                  Wallet Balance
                </p>

                <h1 className="text-5xl font-black text-cyan-400 mt-3">
                 ${walletBalance}
                </h1>

              </div>

              <div className="bg-black rounded-2xl p-5">

                <p className="text-gray-400">
                  Open Positions
                </p>

                <h1 className="text-5xl font-black text-green-400 mt-3">
                  12 Trades
                </h1>

              </div>

              <div className="bg-black rounded-2xl p-5">

                <p className="text-gray-400">
                  Today's PnL
                </p>

                <h1 className="text-5xl font-black text-green-400 mt-3">
                  +$2,450
                </h1>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>

  )
}