'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import MobileHeader from '@/components/layout/MobileHeader'
import NoteCard from '@/components/notes/NoteCard'
import { PlusCircle, Search, FileText, Loader2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Note } from '@/types'

function NotesContent() {
  const searchParams = useSearchParams()
  const initialCourseId = searchParams.get('courseId') || 'all'

  const [notes, setNotes] = useState<Note[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [filtered, setFiltered] = useState<Note[]>([])
  const [search, setSearch] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/notes').then(r => r.json()),
      fetch('/api/courses').then(r => r.json())
    ]).then(([notesData, coursesData]) => {
      setNotes(notesData)
      if (Array.isArray(coursesData)) setCourses(coursesData)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = notes
    if (selectedCourse !== 'all') {
      result = result.filter(n => n.courseId === selectedCourse)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.highlights || []).some((h: string) => h.toLowerCase().includes(q))
      )
    }
    setFiltered(result)
  }, [search, notes, selectedCourse])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Silme işlemi başarısız')
      setNotes(p => p.filter(n => n.id !== id))
    } catch (err) {
      alert('Hata: Not silinemedi. Lütfen tekrar deneyin.')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Notlarim</h1>
          <p className="text-white/40 text-sm mt-0.5">{filtered.length} not</p>
        </div>
        <Link href="/notes/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Not</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-up">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input id="search-notes" type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Not veya kelime ara..."
            className="input-field pl-11 w-full" />
        </div>
        <div className="relative min-w-[200px]">
          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <select 
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="input-field pl-11 w-full appearance-none bg-black/20"
          >
            <option value="all">Tüm Dersler</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
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
    </>
  )
}

export default function NotesPage() {
  return (
    <div className="md:pl-64 min-h-screen pb-20 md:pb-0">
      <MobileHeader />
      <Sidebar />
      <Navbar />
      <main className="p-6 md:p-8 max-w-4xl mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        }>
          <NotesContent />
        </Suspense>
      </main>
    </div>
  )
}