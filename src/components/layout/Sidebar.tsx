'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Sparkles, LayoutDashboard, FileText, PlusCircle, LogOut, X, BookOpen } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSidebar } from '@/lib/sidebar-context'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/courses', icon: BookOpen, label: 'Derslerim' },
  { href: '/notes', icon: FileText, label: 'Notlarim' },
  { href: '/notes/new', icon: PlusCircle, label: 'Yeni Not' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useSidebar()
  const [recentNotes, setRecentNotes] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/notes')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setRecentNotes(data.slice(0, 15)) // Show last 15 notes
      })
  }, [pathname]) // Refresh when pathname changes

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`glass border-r border-white/[0.06] fixed left-0 top-0 h-full w-64 flex flex-col z-[100] transition-transform duration-300 ease-in-out 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0`}
      >
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Akilli Not</p>
              <p className="text-white/30 text-xs">AI Ozetleyici</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-white/40 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem' }} className="space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link 
                key={href} 
                href={href}
                onClick={() => setIsOpen(false)}
                className={"flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 " +
                  (active
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]")}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-4">
          <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2 mt-2 px-2">
            Son Notlar
          </div>
          <div className="space-y-0.5">
            {recentNotes.map((note: any) => (
              <Link 
                key={note.id} 
                href={`/notes/${note.id}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 text-sm ${
                  pathname === `/notes/${note.id}` 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 shrink-0" />
                <span className="truncate">{note.title}</span>
              </Link>
            ))}
            {recentNotes.length === 0 && (
              <p className="text-xs text-white/30 px-2 py-1">Henüz not yok.</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/[0.06]">
          <button 
            onClick={() => signOut({ callbackUrl: window.location.origin + '/auth/login' })}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Cikis Yap</span>
          </button>
        </div>
      </aside>
    </>
  )
}