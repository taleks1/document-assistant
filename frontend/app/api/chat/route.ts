import { NextRequest } from "next/server"

const GEMINI_MODEL = "gemini-3.1-flash-lite-preview"
const ACTION_MARKER = "||ACTION||"

interface UserProfile {
  firstName: string
  lastName: string
  idNumber: string
  embg: string
  dateOfBirth: string
  documentExpiryDate: string
  address: string
}

interface UserRequest {
  referenceNumber: string
  title: string
  type: string
  status: string
}

function buildSystemPrompt(profile: UserProfile | null, requests: UserRequest[]): string {
  const profileSection = profile
    ? `[SAVED USER PROFILE]
firstName: ${profile.firstName || "(empty)"}
lastName: ${profile.lastName || "(empty)"}
idNumber: ${profile.idNumber || "(empty)"}
embg: ${profile.embg || "(empty)"}
dateOfBirth: ${profile.dateOfBirth || "(empty)"}
documentExpiryDate: ${profile.documentExpiryDate || "(empty)"}
address: ${profile.address || "(empty)"}`
    : "[SAVED USER PROFILE: none]"

  const requestsSection = requests.length > 0
    ? `[USER'S REQUESTS]\n` + requests.map(
        (r) => `- [${r.referenceNumber}] ${r.title} (type: ${r.type}, status: ${r.status})`
      ).join("\n")
    : "[USER'S REQUESTS: none]"

  return `You are a digital assistant for a Macedonian government administrative portal. Always respond in Macedonian language (Cyrillic script). Be concise — maximum 3-4 sentences per response.

You can help with:
- Submitting a new request (guided flow: type → title → description → personal data → redirect)
- General portal help

You have access to the user's real requests listed below. When the user asks about the status of a request:
- If it is in the list → answer with the exact status from the list.
- If it is NOT in the list, or the list is empty → say you cannot find it and tell them to check the "Мои барања" page. NEVER invent or guess a status.

${requestsSection}

Request types (use these exact values in requestType):
- Барање → request
- Дозвола → permit
- Жалба → complaint
- Апликација → application
- Приговор → objection
- Потврда → certificate
- Изјава → statement
- Пријава → report
- Друго → other

${profileSection}

STRICT STEP-BY-STEP RULES FOR SUBMITTING A REQUEST — FOLLOW IN ORDER, NEVER SKIP:

STEP 1: Ask for request type. Wait for user reply.
STEP 2: Ask for title (min 3 chars). Wait for user reply.
STEP 3: Ask for description (min 10 chars). Wait for user reply.
STEP 4: MANDATORY — ask exactly this question and STOP. Do NOT emit ACTION yet:
  "Дали да ги користам вашите зачувани лични податоци или сакате да внесете различни?"
  Wait for user reply before doing ANYTHING else.
STEP 5a: Only if user replied "saved" (or similar) to STEP 4 → emit ACTION with saved profile values.
STEP 5b: Only if user replied "different" (or similar) to STEP 4 → show this form and wait for one reply:

Внесете ги вашите податоци:
Име:
Презиме:
Број на документ:
Матичен број:
Датум на раѓање:
Важност на документ:
Адреса:

STEP 6: After user fills the form → parse answers and emit ACTION immediately.

ABSOLUTE RULES:
- NEVER emit ||ACTION|| before completing STEP 4 and receiving the user's reply.
- NEVER skip STEP 4 even if you already have saved profile data.
- NEVER ask fields one by one — always show the full form at once.
- Convert any date the user provides to DD.MM.YYYY format in the ACTION marker.

When you have all data, write exactly this sentence first (in Macedonian):
"Податоците се успешно пополнети. Проверете ги и потврдете."
Then on a new line append the ACTION marker (nothing after it):
||ACTION||{"requestType":"...","requestTitle":"...","description":"...","firstName":"...","lastName":"...","idNumber":"...","embg":"...","dateOfBirth":"...","documentExpiryDate":"...","address":"..."}

Replace all placeholders with real values. No markdown, no code blocks — plain JSON after the marker.`
}

interface GeminiContent {
  role: "user" | "model"
  parts: [{ text: string }]
}

function toGeminiContents(
  messages: Array<{ role: string; content: string }>
): GeminiContent[] {
  const result: GeminiContent[] = []
  for (const msg of messages) {
    const role: "user" | "model" = msg.role === "user" ? "user" : "model"
    if (result.length > 0 && result[result.length - 1].role === role) {
      result[result.length - 1].parts[0].text += "\n" + msg.content
    } else {
      result.push({ role, parts: [{ text: msg.content }] })
    }
  }
  while (result.length > 0 && result[0].role !== "user") result.shift()
  return result
}

function makeErrorStream(message: string): Response {
  const body = `data: ${JSON.stringify({ type: "done", action: null, data: null, cleanText: message })}\n\n`
  return new Response(body, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  })
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return makeErrorStream("Асистентот не е конфигуриран (недостасува GEMINI_API_KEY).")
  }

  let messages: Array<{ role: string; content: string }>
  let userProfile: UserProfile | null = null
  let userRequests: UserRequest[] = []
  try {
    const body = await req.json()
    messages = body.messages
    userProfile = body.userProfile ?? null
    userRequests = body.userRequests ?? []
  } catch {
    return makeErrorStream("Невалидно барање.")
  }

  if (!messages?.length) return makeErrorStream("Испратете порака.")

  const contents = toGeminiContents(messages)
  if (contents.length === 0) return makeErrorStream("Испратете порака.")

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`

  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: buildSystemPrompt(userProfile, userRequests) }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
  })

  let geminiRes: Response | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1500 * attempt))
    try {
      geminiRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      })
      if (geminiRes.status !== 503) break
      console.warn(`[chat] Gemini 503, retry ${attempt + 1}/3`)
    } catch (e) {
      console.error("[chat] fetch to Gemini failed:", e)
      return makeErrorStream("Се случи грешка при поврзување со AI сервисот.")
    }
  }

  if (!geminiRes || !geminiRes.ok || !geminiRes.body) {
    const errBody = await geminiRes?.text().catch(() => "(no body)") ?? "(no response)"
    console.error("[chat] Gemini non-OK:", geminiRes?.status, errBody)
    return makeErrorStream("AI сервисот врати грешка. Обидете се повторно.")
  }

  const encoder = new TextEncoder()
  const reader = geminiRes.body.getReader()

  const stream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder()
      let sseBuffer = ""
      let accumulated = ""

      const send = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          sseBuffer += decoder.decode(value, { stream: true })
          const lines = sseBuffer.split("\n")
          sseBuffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const jsonStr = line.slice(6).trim()
            if (!jsonStr || jsonStr === "[DONE]") continue
            try {
              const chunk = JSON.parse(jsonStr)
              const text: string = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
              if (!text) continue
              accumulated += text
              send({ type: "chunk", text })
            } catch {
              // ignore malformed chunks
            }
          }
        }

        let cleanText = accumulated
        let action: string | null = null
        let actionData: Record<string, string> | null = null

        const markerIdx = accumulated.indexOf(ACTION_MARKER)
        if (markerIdx !== -1) {
          cleanText = accumulated.slice(0, markerIdx).trimEnd()
          const afterMarker = accumulated.slice(markerIdx + ACTION_MARKER.length).trim()
          const jsonStart = afterMarker.indexOf("{")
          const jsonEnd = afterMarker.lastIndexOf("}")
          if (jsonStart !== -1 && jsonEnd !== -1) {
            try {
              actionData = JSON.parse(afterMarker.slice(jsonStart, jsonEnd + 1))
              action = "create_request"
            } catch (e) {
              console.error("[chat] action JSON parse failed:", afterMarker, e)
            }
          }
        }

        send({ type: "done", action, data: actionData, cleanText })
      } catch {
        send({ type: "done", action: null, data: null, cleanText: accumulated || "Грешка. Обидете се повторно." })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
