"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminSidebar() {

  const pathname = usePathname()

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Users", path: "/admin/users" },
    { name: "Deposits", path: "/admin/deposits" },
    { name: "Withdrawals", path: "/admin/withdrawals" },
    { name: "KYC", path: "/admin/kyc" },
    { name: "Support", path: "/admin/support" },
  ]

  return (
    <div className="w-72 min-h-screen bg-[#050b16] border-r border-cyan-500/20">

      <div className="p-6 border-b border-cyan-500/20">

        <h1 className="text-3xl font-black text-cyan-400">
          TradeNova
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Premium Admin
        </p>

      </div>

      <div className="p-4 space-y-3">

        {menu.map((item) => (

          <Link
            key={item.path}
            href={item.path}
            className={`block p-4 rounded-2xl font-bold transition ${
              pathname === item.path
                ? "bg-cyan-500 text-black"
                : "bg-[#081222] text-white hover:bg-cyan-500/20"
            }`}
          >
            {item.name}
          </Link>

        ))}

      </div>

    </div>
  )
}