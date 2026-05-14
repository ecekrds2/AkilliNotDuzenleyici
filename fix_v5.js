const fs = require('fs');

// NextAuth v5 beta icin auth.ts - yeni API
fs.mkdirSync('src/lib', { recursive: true });
fs.writeFileSync('src/lib/auth.ts', `import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/auth/login' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string
        if (!email || !password) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        const isValid = await bcrypt.compare(password, user.password)
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
        (session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
})`, 'utf8');

// NextAuth v5 route handler
fs.mkdirSync('src/app/api/auth/[...nextauth]', { recursive: true });
fs.writeFileSync('src/app/api/auth/[...nextauth]/route.ts', `import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers`, 'utf8');

// Dashboard - NextAuth v5 auth()
fs.mkdirSync('src/app/dashboard', { recursive: true });
fs.writeFileSync('src/app/dashboard/page.tsx', `import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { FileText, Hash, PlusCircle, Clock, TrendingUp, Sparkles } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  const userId = (session.user as { id?: string }).id
  if (!userId) redirect('/auth/login')

  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  const totalNotes = await prisma.note.count({ where: { userId } })
  const allKeywords = notes.flatMap(n => (n.keywords ? JSON.parse(n.keywords) : []))
  const uniqueKeywords = new Set(allKeywords).size
  const totalWords = notes.reduce((acc, n) => acc + (n.wordCount || 0), 0)

  const stats = [
    { label: 'Toplam Not', value: totalNotes, icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-600/10 border-indigo-500/20' },
    { label: 'Anahtar Kelime', value: uniqueKeywords, icon: Hash, color: 'text-purple-400', bg: 'bg-purple-600/10 border-purple-500/20' },
    { label: 'Toplam Kelime', value: totalWords.toLocaleString('tr-TR'), icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-600/10 border-blue-500/20' },
  ]

  return (
    <div className="md:pl-64 min-h-screen pb-20 md:pb-0">
      <Sidebar />
      <Navbar />
      <main className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8 animate-fade-up">
          <p className="text-white/40 text-sm mb-1">Hosgeldin,</p>
          <h1 className="text-3xl font-bold text-white">{session.user.name} 👋</h1>
          <p className="text-white/40 mt-1">Notlarin seni bekliyor</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={"glass rounded-2xl p-5 border animate-fade-up " + bg}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-sm">{label}</span>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon className={"w-4 h-4 " + color} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" /> Son Notlar
            </h2>
            <Link href="/notes" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
              Tumunu Gor
            </Link>
          </div>

          {notes.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 mb-4">Henuz not eklemedin</p>
              <Link href="/notes/new" className="btn-primary inline-flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Ilk Notunu Ekle
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map(note => (
                <Link key={note.id} href={"/notes/" + note.id}
                  className="glass glass-hover rounded-2xl p-5 flex items-center justify-between gap-4 block">
                  <div className="min-w-0">
                    <h3 className="text-white font-medium truncate">{note.title}</h3>
                    <p className="text-white/40 text-sm mt-0.5 truncate">
                      {note.shortSummary || note.content.slice(0, 80)}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-white/30 text-xs hidden sm:block">
                      {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                    <span className="badge bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      {note.language === 'tr' ? 'TR' : 'EN'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 animate-fade-up">
          <Link href="/notes/new"
            className="glass rounded-2xl p-5 border border-indigo-500/20 flex items-center gap-4 hover:bg-indigo-600/10 transition-all duration-200 group block">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-medium">Yeni Not Ekle</p>
              <p className="text-white/40 text-sm">AI ile hemen ozetleyin</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}`, 'utf8');

// Root page - v5
fs.writeFileSync('src/app/page.tsx', `import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function Home() {
  const session = await auth()
  if (session) redirect('/dashboard')
  redirect('/auth/login')
}`, 'utf8');

// Notes API - v5 auth()
fs.mkdirSync('src/app/api/notes', { recursive: true });
fs.writeFileSync('src/app/api/notes/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { summarize } from '@/lib/huggingface'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const notes = await prisma.note.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(notes.map(n => ({
    ...n,
    bulletPoints: n.bulletPoints ? JSON.parse(n.bulletPoints) : [],
    keywords: n.keywords ? JSON.parse(n.keywords) : [],
  })))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { title, content } = await req.json()
    if (!title || !content) return NextResponse.json({ error: 'Baslik ve icerik zorunludur' }, { status: 400 })
    const summary = await summarize(content)
    const note = await prisma.note.create({
      data: {
        title, content, userId,
        shortSummary: summary.shortSummary,
        bulletPoints: JSON.stringify(summary.bulletPoints),
        keywords: JSON.stringify(summary.keywords),
        language: summary.language,
        wordCount: content.split(/\\s+/).length,
      },
    })
    return NextResponse.json({ ...note, bulletPoints: summary.bulletPoints, keywords: summary.keywords }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Not olusturulamadi' }, { status: 500 })
  }
}`, 'utf8');

// Notes [id] API - v5 auth()
fs.mkdirSync('src/app/api/notes/[id]', { recursive: true });
fs.writeFileSync('src/app/api/notes/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { summarize } from '@/lib/huggingface'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const note = await prisma.note.findFirst({ where: { id: params.id, userId } })
  if (!note) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  return NextResponse.json({ ...note, bulletPoints: note.bulletPoints ? JSON.parse(note.bulletPoints) : [], keywords: note.keywords ? JSON.parse(note.keywords) : [] })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const existing = await prisma.note.findFirst({ where: { id: params.id, userId } })
  if (!existing) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  const { title, content } = await req.json()
  const summary = await summarize(content)
  const updated = await prisma.note.update({
    where: { id: params.id },
    data: { title, content, shortSummary: summary.shortSummary, bulletPoints: JSON.stringify(summary.bulletPoints), keywords: JSON.stringify(summary.keywords), language: summary.language, wordCount: content.split(/\\s+/).length },
  })
  return NextResponse.json({ ...updated, bulletPoints: summary.bulletPoints, keywords: summary.keywords })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as { id?: string }).id
  const existing = await prisma.note.findFirst({ where: { id: params.id, userId } })
  if (!existing) return NextResponse.json({ error: 'Not bulunamadi' }, { status: 404 })
  await prisma.note.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}`, 'utf8');

// Summarize API - v5
fs.mkdirSync('src/app/api/summarize', { recursive: true });
fs.writeFileSync('src/app/api/summarize/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { summarize } from '@/lib/huggingface'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { text } = await req.json()
    if (!text || text.trim().length < 20) return NextResponse.json({ error: 'Metin cok kisa' }, { status: 400 })
    const result = await summarize(text)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Ozet olusturulamadi' }, { status: 500 })
  }
}`, 'utf8');

// Login page - uses next-auth/react signIn (client)
fs.mkdirSync('src/app/auth/login', { recursive: true });
fs.writeFileSync('src/app/auth/login/page.tsx', `'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Sparkles, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { ...form, redirect: false })
    setLoading(false)
    if (res?.error) { setError('Email veya sifre yanlis'); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4 animate-pulse-glow">
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Akilli Not</h1>
          <p className="text-white/40 mt-1 text-sm">Notlarinizi AI ile ozetleyin</p>
        </div>
        <div className="glass rounded-3xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Giris Yap</h2>
          {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input id="email" type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field pl-10" placeholder="ornek@email.com" required />
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">Sifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input id="password" type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pl-10" placeholder="••••••••" required />
              </div>
            </div>
            <button id="login-btn" type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Giris Yap</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-center text-white/40 text-sm mt-6">
            Hesabin yok mu?{' '}
            <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Kayit Ol</Link>
          </p>
        </div>
      </div>
    </div>
  )
}`, 'utf8');

// Providers wrapper - v5 SessionProvider
fs.writeFileSync('src/app/providers.tsx', `'use client'
import { SessionProvider } from 'next-auth/react'
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}`, 'utf8');

console.log('NextAuth v5 migration complete!');
