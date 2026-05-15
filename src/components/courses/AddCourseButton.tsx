'use client'
import { useState } from 'react'
import { PlusCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddCourseButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAdd = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (res.ok) {
        setIsOpen(false)
        setName('')
        router.refresh()
      }
    } catch {
      alert('Ders eklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary inline-flex items-center gap-2 w-full sm:w-auto justify-center"
      >
        <PlusCircle className="w-4 h-4" />
        Ders Ekle
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10 animate-fade-up">
            <h2 className="text-xl font-semibold text-white mb-4">Yeni Ders Ekle</h2>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ders Adı (örn: Biyoloji)"
              className="input-field w-full mb-4"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={handleAdd}
                disabled={loading || !name.trim()}
                className="btn-primary px-6 flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
