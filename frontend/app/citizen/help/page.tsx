"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Send, Bot, User, HelpCircle, FileText, Clock, Shield, Loader2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const faqItems = [
  {
    question: "Како да поднесам ново барање?",
    answer: "Оди на 'Ново барање' од менито. Прикачи личен документ, дозволи AI да ги извлече податоците, пополни детали и поднеси. Можеш во секое време да го следиш статусот."
  },
  {
    question: "Какви типови на барања постојат?",
    answer: "Можеш да поднесеш: Барање, Дозвола, Жалба, Потврда и други административни барања. Избери соодветен тип при креирање."
  },
  {
    question: "Колку време трае обработката?",
    answer: "Зависи од типот. Потврди: 2-3 дена. Дозволи: 5-10 дена. Можеш да следиш статус во реално време."
  },
  {
    question: "Кои документи се потребни?",
    answer: "Минимум: лична карта, пасош или возачка. За некои барања треба и дополнителни документи."
  },
  {
    question: "Како да го следам статусот?",
    answer: "Оди во 'Следење статус' и внеси ID на барање. Или види ги сите во 'Мои барања'."
  },
  {
    question: "Може ли да го изменам барањето?",
    answer: "Не, по поднесување не може да се менува. Поднеси ново ако треба корекција."
  },
]

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Здраво! Јас сум твој AI асистент. Како можам да помогнам?",
    timestamp: new Date()
  }
]

const botResponses: Record<string, string> = {
  submit: "За ново барање: оди во 'Ново барање', прикачи документ, пополни детали и поднеси.",
  track: "Следи статус во 'Следење статус' со ID на барањето.",
  document: "Потребен е личен документ (JPG, PNG, PDF до 10MB).",
  time: "Потврди: 2-3 дена. Дозволи: 5-10 дена.",
  help: "Можам да помогнам со барања, статус, документи и сл.",
  default: "Те молам постави поконкретно прашање."
}

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const getBotResponse = (msg: string) => {
    const m = msg.toLowerCase()
    if (m.includes("барање")) return botResponses.submit
    if (m.includes("статус")) return botResponses.track
    if (m.includes("документ")) return botResponses.document
    if (m.includes("време")) return botResponses.time
    if (m.includes("помош")) return botResponses.help
    return botResponses.default
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    await new Promise((r) => setTimeout(r, 1000))

    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: getBotResponse(inputValue),
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsTyping(false)
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold">Центар за помош</h1>
        <p className="text-muted-foreground">Постави прашање или види FAQ</p>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        
        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2">
              <HelpCircle /> ЧПП
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={String(i)}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex gap-2">
              <Bot /> AI Асистент
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col flex-1 p-0">
            
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                  <div className="p-2 rounded bg-muted">
                    {m.content}
                  </div>
                </div>
              ))}
            </ScrollArea>

            <div className="p-4 border-t flex gap-2">
              <Input
                placeholder="Пиши порака..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send />
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}