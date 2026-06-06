"use client"

import { useEffect, useState } from "react"

import {
  addDoc,
  collection,
  getDocs,
} from "firebase/firestore"

import { db } from "../lib/firebase"

export default function SupportPage() {

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])

  const loadMessages = async () => {

    const user =
      JSON.parse(localStorage.getItem("user") || "{}")

    const snap = await getDocs(
     collection(db, "supportmessages")
    )

    const data = snap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(
        (msg: any) =>
          msg.email === user.email
      )

    setMessages(data)

  }

  useEffect(() => {
    loadMessages()
  }, [])

  const sendMessage = async () => {

    const user =
      JSON.parse(localStorage.getItem("user") || "{}")

    await addDoc(
      collection(db, "supportmessages"),
      {
        name: user.name || "User",
        email: user.email || "",
        userId: user.uid || "TNX-USER",
        message,
        status: "Pending",
        createdAt: new Date(),
      }
    )

    alert("Message Sent")

    setMessage("")

    loadMessages()

  }

  return (

    <main className="min-h-screen bg-black text-white p-8">

      <div className="max-w-5xl mx-auto">

        <div className="bg-[#07111d] border border-cyan-500/20 rounded-[40px] p-8 shadow-[0_0_50px_#00ffff22]">

          <h1 className="text-6xl font-black text-cyan-400 mb-10">
            Customer Service
          </h1>

          <div className="space-y-6 mb-10">

            {messages.map((msg) => (

              <div
                key={msg.id}
                className="bg-black border border-cyan-500/10 rounded-3xl p-6"
              >

                <p className="text-cyan-400 font-black">
                  Your Message
                </p>

                <div className="mt-3 bg-[#07111d] rounded-2xl p-5">
                  {msg.message}
                </div>

                {msg.adminReply && (

                  <div className="mt-5 bg-green-500/10 border border-green-500/20 rounded-2xl p-5">

                    <p className="text-green-400 font-black mb-3">
                      Admin Reply
                    </p>

                    <p>
                      {msg.adminReply}
                    </p>

                  </div>

                )}

              </div>

            ))}

          </div>

          <textarea
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            className="w-full h-[220px] bg-black border border-cyan-500/20 rounded-3xl p-6 text-white outline-none text-xl"
          />

          <button
            onClick={sendMessage}
            className="w-full mt-8 p-6 rounded-3xl bg-cyan-400 text-black font-black text-2xl shadow-[0_0_30px_#00ffff]"
          >
            Send Message
          </button>

        </div>

      </div>

    </main>

  )
}