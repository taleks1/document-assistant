import type { Metadata, Viewport } from "next"
import { AuthProvider } from "@/lib/auth-context"
import { Inter } from "next/font/google"

import "./globals.css"

// ✅ fonts (да не бидат unused)
//const geist = Geist({ subsets: ["latin"] })
//const geistMono = Geist_Mono({ subsets: ["latin"] })
const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "AI Document Assistant - Government Services Portal",
}

export const viewport: Viewport = {
  themeColor: "#1e40af",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
<body className={`${inter.className} font-sans antialiased`}>        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}