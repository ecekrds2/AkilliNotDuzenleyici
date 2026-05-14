const fs = require('fs');
const path = require('path');

const files = {};

// ── layout.tsx ──────────────────────────────────────────────────────────────
files['src/app/layout.tsx'] = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Akilli Not Ozetleyici',
  description: 'Notlarinizi yapay zeka ile analiz edin ve ozet cikarin',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <body className={\`\${inter.variable} font-sans bg-[#0a0a0f] text-white antialiased\`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}`;

// ── providers.tsx ─────────────────────────────────────────────────────────
files['src/app/providers.tsx'] = `'use client'
import { SessionProvider } from 'next-auth/react'
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}`;

// ── page.tsx (root) ───────────────────────────────────────────────────────
files['src/app/page.tsx'] = `import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')
  redirect('/auth/login')
}`;

// ── types/index.ts ────────────────────────────────────────────────────────
files['src/types/index.ts'] = `export interface Note {
  id: string
  title: string
  content: string
  shortSummary?: string
  bulletPoints?: string[]
  keywords?: string[]
  language?: string
  wordCount?: number
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface SummaryResult {
  shortSummary: string
  bulletPoints: string[]
  keywords: string[]
  language: string
  method: 'huggingface' | 'offline'
}`;

// ── lib/auth.ts ───────────────────────────────────────────────────────────
files['src/lib/auth.ts'] = `import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/auth/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        ;(session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
}`;

// ── lib/huggingface.ts ───────────────────────────────────────────────────
files['src/lib/huggingface.ts'] = `import { SummaryResult } from '@/types'
import { summarizeOffline } from './nlp'

export async function summarizeWithHF(text: string): Promise<SummaryResult | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) return null
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/csebuetnlp/mT5_multilingual_XLSum',
      {
        method: 'POST',
        headers: {
          Authorization: \`Bearer \${apiKey}\`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text.slice(0, 1024),
          parameters: { max_length: 150, min_length: 40 },
        }),
        signal: AbortSignal.timeout(15000),
      }
    )
    if (!response.ok) return null
    const data = await response.json()
    const summaryText: string = data[0]?.summary_text || data[0]?.generated_text || ''
    if (!summaryText) return null
    const offline = summarizeOffline(text)
    return {
      shortSummary: summaryText,
      bulletPoints: offline.bulletPoints,
      keywords: offline.keywords,
      language: offline.language,
      method: 'huggingface',
    }
  } catch {
    return null
  }
}

export async function summarize(text: string): Promise<SummaryResult> {
  const hfResult = await summarizeWithHF(text)
  return hfResult ?? summarizeOffline(text)
}`;

// Write all files
for (const [filePath, content] of Object.entries(files)) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Written:', filePath);
}
console.log('All files done!');
