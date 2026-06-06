"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import AdminSidebar from "../../components/AdminSidebar"

export default function SupportPage() {

  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply] = useState("")

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {

    const snap = await getDocs(
      collection(db, "supportmessages")
    )

    const data = snap.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }))

    setMessages(data)
  }

  const sendReply = async (
    id: string
  ) => {

    if (!reply) {
      alert("Write reply first")
      return
    }

    await updateDoc(
      doc(db, "supportmessages", id),
      {
        adminReply: reply,
        status: "Answered",
      }
    )

    alert("Reply Sent")

    setReply("")

    loadMessages()
  }

  return (

    <main className="min-h-screen bg-black flex">

      <AdminSidebar />

      <div className="flex-1 p-10">

        <h1 className="text-5xl font-black text-white mb-10">
          Customer Support
        </h1>

        <div className="space-y-6">

          {messages.map((item:any) => (

            <div
              key={item.id}
              className="bg-[#081222] border border-cyan-500/20 rounded-3xl p-6"
            >

              <h2 className="text-cyan-400 font-black text-xl">
                {item.name}
              </h2>

              <p className="text-gray-400">
                {item.email}
              </p>

              <div className="mt-4 bg-black rounded-2xl p-4">
                {item.message}
              </div>

              {item.adminReply ? (

                <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-2xl p-4">

                  <p className="text-green-400 font-black">
                    Reply Sent
                  </p>

                  <p>{item.adminReply}</p>

                </div>

              ) : (

                <>

                  <textarea
                    placeholder="Write reply..."
                    value={reply}
                    onChange={(e)=>
                      setReply(e.target.value)
                    }
                    className="w-full mt-4 h-32 bg-black border border-cyan-500/20 rounded-2xl p-4 text-white"
                  />

                  <button
                    onClick={() =>
                      sendReply(item.id)
                    }
                    className="mt-4 px-8 py-3 rounded-2xl bg-cyan-400 text-black font-black"
                  >
                    Send Reply
                  </button>

                </>

              )}

            </div>

          ))}

        </div>

      </div>

    </main>

  )
}