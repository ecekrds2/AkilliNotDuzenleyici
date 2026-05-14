'use client'
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
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
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
}