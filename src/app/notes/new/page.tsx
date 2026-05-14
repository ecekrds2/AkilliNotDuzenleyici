'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { ArrowLeft, Sparkles, Loader2, FileText, UploadCloud } from 'lucide-react'
import Link from 'next/link'

export default function NewNotePage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
    
    setParsing(true)
    setError('')
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Dosya okunamadi')
      
      setForm(f => ({ ...f, content: data.text }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setParsing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.content.trim().length < 20) {
      setError('Metin en az 20 karakter olmalidir')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Not olusturulamadi'); return }
    router.push(`/notes/${data.id}`)
  }

  return (
    <div className="md:pl-64 min-h-screen pb-20 md:pb-0">
      <Sidebar />
      <Navbar />
      <main className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div className="flex items-center gap-4">
            <Link href="/notes" className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Yeni Not</h1>
              <p className="text-white/40 text-sm mt-0.5">AI ile otomatik ozet ve soru-cevap</p>
            </div>
          </div>
          
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf,.docx" 
              className="hidden" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing}
              className="btn-ghost bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-sm py-2 px-4"
            >
              {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>PDF / DOCX Yukle</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up">
          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">Baslik</label>
            <input id="note-title" type="text" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input-field text-lg font-medium" placeholder="Notun basligini girin..." required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Icerik</label>
              <div className="flex items-center gap-3 text-white/30 text-xs">
                <span>{wordCount} kelime</span>
              </div>
            </div>
            <textarea id="note-content" value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="input-field resize-none min-h-[320px] leading-relaxed"
              placeholder="Ozetlemek istediginiz metni buraya yapistirin veya yukaridan PDF/DOCX yukleyin..." required />
          </div>

          {form.content.length > 0 && form.content.length < 20 && (
            <p className="text-amber-400/70 text-xs flex items-center gap-1">
              <FileText className="w-3 h-3" />
              En az 20 karakter giriniz ({20 - form.content.length} karakter kaldi)
            </p>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <div className="glass rounded-xl p-4 flex items-start gap-3 border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-white/50 text-xs leading-relaxed">
              Not kaydedildikten sonra AI otomatik olarak anlamli bir kisa ozet, onemli maddeler ve 
              metnin anlasilmasini kolaylastiracak Soru-Cevap ikilileri uretecektir.
            </p>
          </div>

          <button id="create-note-btn" type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /><span>AI Analiz Ediyor...</span></>
              : <><Sparkles className="w-5 h-5" /><span>AI ile Analiz Et ve Kaydet</span></>}
          </button>
        </form>
      </main>
    </div>
  )
}