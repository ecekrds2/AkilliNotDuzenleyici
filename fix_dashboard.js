const fs = require('fs');

// ── Dashboard Page ────────────────────────────────────────────────────────
fs.mkdirSync('src/app/dashboard', { recursive: true });
fs.writeFileSync('src/app/dashboard/page.tsx', `import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { FileText, Hash, PlusCircle, Clock, TrendingUp, Sparkles } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
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
            <div key={label} className={\`glass rounded-2xl p-5 border \${bg} animate-fade-up\`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-sm">{label}</span>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon className={\`w-4 h-4 \${color}\`} />
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
                <Link key={note.id} href={\`/notes/\${note.id}\`}
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

console.log('Dashboard written!');

// ── Notes List Page ────────────────────────────────────────────────────────
fs.mkdirSync('src/app/notes', { recursive: true });
fs.writeFileSync('src/app/notes/page.tsx', `'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import NoteCard from '@/components/notes/NoteCard'
import { PlusCircle, Search, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Note } from '@/types'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filtered, setFiltered] = useState<Note[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notes')
      .then(r => r.json())
      .then(data => { setNotes(data); setFiltered(data); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(notes); return }
    const q = search.toLowerCase()
    setFiltered(notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      (n.keywords || []).some(k => k.toLowerCase().includes(q))
    ))
  }, [search, notes])

  const handleDelete = async (id: string) => {
    if (!confirm('Bu notu silmek istediginize emin misiniz?')) return
    await fetch(\`/api/notes/\${id}\`, { method: 'DELETE' })
    setNotes(p => p.filter(n => n.id !== id))
  }

  return (
    <div className="md:pl-64 min-h-screen pb-20 md:pb-0">
      <Sidebar />
      <Navbar />
      <main className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold text-white">Notlarim</h1>
            <p className="text-white/40 text-sm mt-0.5">{notes.length} not</p>
          </div>
          <Link href="/notes/new" className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Not</span>
          </Link>
        </div>

        <div className="relative mb-6 animate-fade-up">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input id="search-notes" type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Not, kelime veya anahtar kelime ara..."
            className="input-field pl-11 w-full" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center animate-fade-up">
            <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 mb-4">
              {search ? 'Aramanizla eslesme bulunamadi' : 'Henuz not eklemediniz'}
            </p>
            {!search && (
              <Link href="/notes/new" className="btn-primary inline-flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Ilk Notunu Ekle
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3 animate-fade-up">
            {filtered.map(note => (
              <NoteCard key={note.id} note={note} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}`, 'utf8');

console.log('Notes list written!');
