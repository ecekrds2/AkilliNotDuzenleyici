'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, ArrowRight, Sparkles, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Kayit basarisiz'); return }
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4 animate-pulse-glow">
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Akilli Not</h1>
          <p className="text-white/40 mt-1 text-sm">Hesabini olustur, ozetlemeye basla</p>
        </div>
        <div className="glass rounded-3xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Hesap Olustur</h2>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">Ad Soyad</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input id="name" type="text" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field pl-10" placeholder="Adiniz Soyadiniz" required />
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input id="reg-email" type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field pl-10" placeholder="ornek@email.com" required />
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">Sifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input id="reg-password" type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pl-10" placeholder="En az 6 karakter" minLength={6} required />
              </div>
            </div>
            <button id="register-btn" type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><span>Kayit Ol</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-center text-white/40 text-sm mt-6">
            Zaten hesabin var mi?{' '}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Giris Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}