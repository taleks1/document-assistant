"use client"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Bot, Loader2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiGetRequests, type DocumentRequestResponse } from "@/lib/api"

export const CHATBOT_PREFILL_KEY = "chatbot_prefill"

interface Message {
  id: string
  role: "user" | "bot"
  content: string
}

interface StreamEvent {
  type: "chunk" | "done"
  text?: string
  action?: string | null
  data?: Record<string, string> | null
  cleanText?: string
}

// "idle" → nothing happening
// "waiting" → request sent, waiting for first chunk (show typing dots)
// "streaming" → receiving chunks (show growing bot bubble, input disabled)
type ChatStatus = "idle" | "waiting" | "streaming"

function makeMsg(role: "user" | "bot", content: string): Message {
  return { id: String(Date.now() + Math.random()), role, content }
}

function BoldText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      )}
    </>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isBot = msg.role === "bot"
  return (
    <div className={cn("flex gap-2", isBot ? "flex-row" : "flex-row-reverse")}>
      {isBot && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
          isBot
            ? "rounded-tl-sm bg-muted text-foreground"
            : "rounded-tr-sm bg-primary text-primary-foreground"
        )}
      >
        {msg.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-0.5" : ""}>
            <BoldText text={line} />
          </p>
        ))}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
        <div className="flex h-5 items-center gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

export function Chatbot() {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<ChatStatus>("idle")
  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const actionDoneRef = useRef(false)

  const isBusy = status !== "idle"

  function handleNewChat() {
    if (isBusy) return
    setMessages([])
    setInput("")
    setStatus("idle")
    actionDoneRef.current = false
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const hi = user?.firstname ? `Здраво, ${user.firstname}!` : "Здраво!"
      setMessages([
        makeMsg(
          "bot",
          `${hi} Јас сум вашиот дигитален асистент.\n\nМожам да ви помогнам со:\n• Поднесување **ново барање**\n• Информации за статус на барање\n• Општа помош\n\nСо што можам да ви помогнам?`
        ),
      ])
    }
  }, [isOpen, user, messages.length])

  useEffect(() => {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, status])

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  async function handleSend() {
    const text = input.trim()
    if (!text || isBusy) return
    setInput("")

    const userMsg = makeMsg("user", text)
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setStatus("waiting")

    let botMsgId: string | null = null
    let userRequests: DocumentRequestResponse[] = []
    try { userRequests = await apiGetRequests() } catch { /* ignore */ }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: actionDoneRef.current
            ? [{ role: "user", content: text }]
            : updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          userProfile: user ? {
            firstName: user.firstname ?? "",
            lastName: user.lastname ?? "",
            idNumber: user.cardId ?? "",
            embg: user.embg ?? "",
            dateOfBirth: user.birthDate ?? "",
            documentExpiryDate: user.cardExpiryDate ?? "",
            address: user.address ?? "",
          } : null,
          userRequests: userRequests.map((r) => ({
            referenceNumber: r.referenceNumber,
            title: r.title,
            type: r.type,
            status: r.status,
          })),
        }),
      })

      if (!res.ok || !res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let sseBuffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        sseBuffer += decoder.decode(value, { stream: true })
        const lines = sseBuffer.split("\n")
        sseBuffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr) continue

          let event: StreamEvent
          try {
            event = JSON.parse(jsonStr)
          } catch {
            continue
          }

          if (event.type === "chunk" && event.text) {
            if (!botMsgId) {
              const newMsg = makeMsg("bot", event.text)
              botMsgId = newMsg.id
              setStatus("streaming")
              setMessages((prev) => [...prev, newMsg])
            } else {
              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id !== botMsgId) return m
                  const next = m.content + event.text
                  // Strip action marker the moment it appears in the stream
                  const markerIdx = next.indexOf("||ACTION||")
                  return { ...m, content: markerIdx !== -1 ? next.slice(0, markerIdx).trimEnd() : next }
                })
              )
            }
          } else if (event.type === "done") {
            if (event.action === "create_request" && event.data && !actionDoneRef.current) {
              actionDoneRef.current = true
              // Show cleanText as final bot message (marker already stripped)
              if (botMsgId) {
                if (event.cleanText) {
                  setMessages((prev) =>
                    prev.map((m) => m.id === botMsgId ? { ...m, content: event.cleanText! } : m)
                  )
                } else {
                  setMessages((prev) => prev.filter((m) => m.id !== botMsgId))
                }
              } else if (event.cleanText) {
                setMessages((prev) => [...prev, makeMsg("bot", event.cleanText!)])
              }
              sessionStorage.setItem(
                CHATBOT_PREFILL_KEY,
                JSON.stringify({
                  firstName: event.data.firstName || user?.firstname || "",
                  lastName: event.data.lastName || user?.lastname || "",
                  idNumber: event.data.idNumber || user?.cardId || "",
                  embg: event.data.embg || user?.embg || "",
                  dateOfBirth: event.data.dateOfBirth || user?.birthDate || "",
                  documentExpiryDate: event.data.documentExpiryDate || user?.cardExpiryDate || "",
                  address: event.data.address || user?.address || "",
                  requestType: event.data.requestType ?? "request",
                  requestTitle: event.data.requestTitle ?? "",
                  description: event.data.description ?? "",
                })
              )
              router.push("/citizen/new-request")
            } else {
              // Normal message OR action already done (prevent re-redirect)
              if (botMsgId && event.cleanText != null) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId ? { ...m, content: event.cleanText! } : m
                  )
                )
              } else if (!botMsgId && event.cleanText) {
                setMessages((prev) => [...prev, makeMsg("bot", event.cleanText!)])
              }
            }
          }
        }
      }
    } catch {
      const errText = "Се случи грешка. Обидете се повторно."
      if (botMsgId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, content: errText } : m))
        )
      } else {
        setMessages((prev) => [...prev, makeMsg("bot", errText)])
      }
    } finally {
      setStatus("idle")
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-0 right-6 z-50 flex h-[580px] w-[360px] flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 bg-primary px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary-foreground">Дигитален Асистент</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              title="Нов разговор"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
              onClick={handleNewChat}
              disabled={isBusy}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={messagesRef} className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {status === "waiting" && <TypingIndicator />}
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-border p-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишете порака..."
                className="flex-1"
                disabled={isBusy}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isBusy}
                className="shrink-0"
              >
                {isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      {!isOpen && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </>
  )
}
