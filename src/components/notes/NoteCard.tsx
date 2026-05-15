'use client'
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
        <Link href={"/notes/" + note.id} className="flex-1 min-w-0 block">
          <h3 className="text-white font-semibold text-base truncate group-hover:text-indigo-300 transition-colors">
            {note.title}
          </h3>
          <p className="text-white/40 text-sm mt-1 leading-relaxed"
            style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
            {note.shortSummary || note.content.slice(0, 120)}
          </p>
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          <button
            id={"delete-" + note.id}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(note.id) }}
            title="Notu Sil"
            className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link href={"/notes/" + note.id}
            className="p-2 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {note.highlights && note.highlights.length > 0 && (
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <Hash className="w-3 h-3 text-white/20" />
          {note.highlights.slice(0, 5).map(kw => (
            <span key={kw} className="badge bg-white/[0.04] border border-white/[0.08] text-white/50">{kw}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.04]">
        <Clock className="w-3 h-3 text-white/20" />
        <span className="text-white/30 text-xs">{date}</span>
        {note.wordCount ? <span className="text-white/20 text-xs">{note.wordCount} kelime</span> : null}
        <span className={"badge ml-auto " + (note.language === 'tr'
          ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
          : "bg-purple-500/10 border border-purple-500/20 text-purple-400")}>
          {note.language === 'tr' ? 'TR' : 'EN'}
        </span>
      </div>
    </div>
  )
}