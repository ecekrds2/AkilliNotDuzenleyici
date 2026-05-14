'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import MobileHeader from '@/components/layout/MobileHeader'
import SummaryPanel from '@/components/notes/SummaryPanel'
import { ArrowLeft, Edit3, Trash2, Save, X, Loader2, Clock } from 'lucide-react'
import Link from 'next/link'
import { Note } from '@/types'

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then(r => r.json())
      .then(data => {
        setNote(data)
        setForm({ title: data.title, content: data.content })
        setLoading(false)
      })
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) { setNote(data); setEditing(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Bu notu silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Silme işlemi başarısız')
      router.push('/notes')
      router.refresh()
    } catch (err) {
      alert('Hata: Not silinemedi.')
    }
  }

  if (loading) return (
    <div className="md:pl-64 min-h-screen">
      <MobileHeader />
      <Sidebar /><Navbar />
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    </div>
  )

  if (!note) return (
    <div className="md:pl-64 min-h-screen">
      <MobileHeader />
      <Sidebar /><Navbar />
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-white/50 mb-4">Not bulunamadi</p>
        <Link href="/notes" className="btn-primary">Notlara Don</Link>
      </div>
    </div>
  )

  const date = new Date(note.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="md:pl-64 min-h-screen pb-20 md:pb-0">
      <MobileHeader />
      <Sidebar />
      <Navbar />
      <main className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="flex items-start gap-4 mb-6 animate-fade-up">
          <Link href="/notes" className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all mt-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            {editing
              ? <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input-field text-2xl font-bold w-full" />
              : <h1 className="text-2xl font-bold text-white">{note.title}</h1>
            }
            <div className="flex items-center gap-3 mt-1">
              <Clock className="w-3 h-3 text-white/30" />
              <span className="text-white/30 text-xs">{date}</span>
              {note.wordCount && <span className="text-white/20 text-xs">{note.wordCount} kelime</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="btn-ghost flex items-center gap-2 text-sm">
                  <X className="w-4 h-4" /> Iptal
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Kaydet
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-2 text-sm">
                  <Edit3 className="w-4 h-4" /> Duzenle
                </button>
                <button onClick={handleDelete} className="btn-danger flex items-center gap-2 text-sm">
                  <Trash2 className="w-4 h-4" /> Sil
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">Icerik</h2>
            {editing
              ? <textarea value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="input-field resize-none min-h-[400px] text-sm leading-relaxed w-full" />
              : <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
            }
          </div>
          <div>
            {note.shortSummary ? (
              <SummaryPanel
                shortSummary={note.shortSummary}
                bulletPoints={note.bulletPoints || []}
                questions={note.questions || []}
                language={note.language}
              />
            ) : (
              <div className="glass rounded-2xl p-8 text-center">
                <p className="text-white/40 text-sm">Ozet henuz olusturulmamis</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}