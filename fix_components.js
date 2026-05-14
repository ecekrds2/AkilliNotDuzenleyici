const fs = require('fs');

// Sidebar - signOut from next-auth/react (client)
fs.mkdirSync('src/components/layout', { recursive: true });
fs.writeFileSync('src/components/layout/Sidebar.tsx', `'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Sparkles, LayoutDashboard, FileText, PlusCircle, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/notes', icon: FileText, label: 'Notlarim' },
  { href: '/notes/new', icon: PlusCircle, label: 'Yeni Not' },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside style={{position:'fixed',left:0,top:0,height:'100%',width:'16rem',display:'flex',flexDirection:'column',zIndex:40}} className="glass border-r border-white/[0.06] hidden md:flex">
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Akilli Not</p>
            <p className="text-white/30 text-xs">AI Ozetleyici</p>
          </div>
        </div>
      </div>
      <nav style={{flex:1,padding:'1rem'}} className="space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={"flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 " +
                (active
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/[0.04]")}>
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-white/[0.06]">
        <button onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Cikis Yap</span>
        </button>
      </div>
    </aside>
  )
}`, 'utf8');

// Navbar mobile
fs.writeFileSync('src/components/layout/Navbar.tsx', `'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, PlusCircle } from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/notes', icon: FileText, label: 'Notlar' },
  { href: '/notes/new', icon: PlusCircle, label: 'Yeni' },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden glass border-t border-white/[0.06]" style={{position:'fixed',bottom:0,left:0,right:0,zIndex:40}}>
      <div className="flex items-center justify-around py-3 px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={"flex flex-col items-center gap-1 transition-colors " + (active ? "text-indigo-400" : "text-white/40")}>
              <Icon className="w-5 h-5" />
              <span style={{fontSize:'10px'}}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}`, 'utf8');

// NoteCard
fs.mkdirSync('src/components/notes', { recursive: true });
fs.writeFileSync('src/components/notes/NoteCard.tsx', `'use client'
import Link from 'next/link'
import { Trash2, ChevronRight, Clock, Hash } from 'lucide-react'
import { Note } from '@/types'

interface NoteCardProps { note: Note; onDelete: (id: string) => void }

export default function NoteCard({ note, onDelete }: NoteCardProps) {
  const date = new Date(note.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
  return (
    <div className="glass glass-hover rounded-2xl p-5 group">
      <div className="flex items-start justify-between gap-3">
        <Link href={"/notes/" + note.id} className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base truncate group-hover:text-indigo-300 transition-colors">
            {note.title}
          </h3>
          <p className="text-white/40 text-sm mt-1 leading-relaxed" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
            {note.shortSummary || note.content.slice(0, 120)}
          </p>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onDelete(note.id)}
            className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            style={{opacity:0}} onMouseEnter={e => (e.currentTarget.style.opacity='1')} onMouseLeave={e => (e.currentTarget.style.opacity='0')}>
            <Trash2 className="w-4 h-4" />
          </button>
          <Link href={"/notes/" + note.id} className="p-2 rounded-lg text-white/20 hover:text-white/60 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      {note.keywords && note.keywords.length > 0 && (
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <Hash className="w-3 h-3 text-white/20" />
          {note.keywords.slice(0, 4).map(kw => (
            <span key={kw} className="badge bg-white/[0.04] border border-white/[0.08] text-white/50">{kw}</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.04]">
        <Clock className="w-3 h-3 text-white/20" />
        <span className="text-white/30 text-xs">{date}</span>
        {note.wordCount && <span className="text-white/20 text-xs">{note.wordCount} kelime</span>}
        <span className={"badge ml-auto " + (note.language === 'tr' ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" : "bg-purple-500/10 border border-purple-500/20 text-purple-400")}>
          {note.language === 'tr' ? 'TR' : 'EN'}
        </span>
      </div>
    </div>
  )
}`, 'utf8');

// SummaryPanel
fs.writeFileSync('src/components/notes/SummaryPanel.tsx', `import { Sparkles, List, Hash, Cpu } from 'lucide-react'

interface SummaryPanelProps {
  shortSummary: string
  bulletPoints: string[]
  keywords: string[]
  method?: 'huggingface' | 'offline'
  language?: string
}

export default function SummaryPanel({ shortSummary, bulletPoints, keywords, method }: SummaryPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" /> AI Analiz Sonuclari
        </h2>
        <span className={"badge " + (method === 'huggingface'
          ? "bg-green-500/10 border border-green-500/20 text-green-400"
          : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400")}>
          <Cpu className="w-3 h-3 mr-1" />
          {method === 'huggingface' ? 'Hugging Face' : 'Offline NLP'}
        </span>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">Kisa Ozet</h3>
        <p className="text-white/80 text-sm leading-relaxed">{shortSummary}</p>
      </div>

      {bulletPoints.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
            <List className="w-3 h-3" /> Onemli Noktalar
          </h3>
          <ul className="space-y-2">
            {bulletPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" style={{minWidth:'6px'}} />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {keywords.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
            <Hash className="w-3 h-3" /> Anahtar Kelimeler
          </h3>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <span key={i} className="badge bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 cursor-default">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}`, 'utf8');

console.log('All components written!');
