"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import axios from "axios";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [hash, setHash] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const handleDeposit = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

    if (!proof) {
  alert("Please Upload Screenshot");
  return;
}

const formData = new FormData();

formData.append("file", proof);
formData.append("upload_preset", "kyc_upload");

const upload = await axios.post(
  "https://api.cloudinary.com/v1_1/deqaaukdk/image/upload",
  formData
);

await addDoc(collection(db, "deposits"), {
  email: user.email || "",
  amount,
  wallet,
  txHash: hash,
  screenshot: upload.data.secure_url,
  coin: "USDT (TRC20)",
  status: "Pending",
  createdAt: new Date(),
});

      alert("Deposit Submitted Successfully");

      setAmount("");
      setWallet("");
      setHash("");
      setProof(null);
    } catch (error) {
      console.log(error);
      alert("Deposit Failed");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-10">

      <div className="w-full max-w-2xl bg-[#07111d] border border-cyan-500/20 rounded-[40px] p-10 shadow-[0_0_40px_#00ffff22]">

        <h1 className="text-5xl font-black text-cyan-400 mb-10 text-center">
          Deposit USDT (TRC20)
        </h1>

        <div className="bg-black rounded-3xl p-6 mb-8 border border-cyan-500/20">

          <img
            src="/trc20.png"
            alt="TRC20 QR"
            className="w-72 mx-auto rounded-xl"
          />

          <div className="mt-6">

            <p className="text-gray-400">
              Network
            </p>

            <h2 className="text-green-400 font-bold text-xl">
              Tron (TRC20)
            </h2>

            <p className="text-gray-400 mt-5">
              Wallet Address
            </p>

            <p className="break-all text-white font-bold">
              TTRUMgWMU1YK1h9RETLKLR1ZvVBuXG6EY5
            </p>

          </div>

        </div>

        <div className="space-y-5">

          <input
            type="number"
            placeholder="Deposit Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black border border-cyan-500/20 outline-none"
          />

          <input
            type="text"
            placeholder="Your Wallet Address"
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

          <div>

            <label className="block mb-2 text-cyan-400 font-bold">
              Upload Payment Screenshot
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setProof(
                  e.target.files?.[0] || null
                )
              }
              className="w-full p-5 rounded-2xl bg-black border border-cyan-500/20 outline-none"
            />

          </div>

          <button
            onClick={handleDeposit}
            className="w-full p-5 rounded-2xl bg-cyan-400 text-black font-black text-xl shadow-[0_0_30px_#00ffff]"
          >
            Submit Deposit
          </button>

        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5">

          <button
            onClick={() =>
              (window.location.href =
                "/support")
            }
            className="p-5 rounded-2xl bg-green-500 text-black font-black"
          >
            Deposit via UPI
          </button>

          <button
            onClick={() =>
              (window.location.href =
                "/support")
            }
            className="p-5 rounded-2xl bg-yellow-500 text-black font-black"
          >
            Deposit via Bank Transfer
          </button>

        </div>

      </div>

    </main>
  );
}