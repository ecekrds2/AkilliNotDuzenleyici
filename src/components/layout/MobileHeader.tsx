'use client'
import { Menu, Sparkles } from 'lucide-react'
import { useSidebar } from '@/lib/sidebar-context'

export default function MobileHeader() {
  const { setIsOpen } = useSidebar()

  return (
    <header className="md:hidden glass sticky top-0 left-0 right-0 z-30 border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
        <span className="text-white font-semibold text-sm">Akilli Not</span>
      </div>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-white/60 hover:text-white transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
    </header>
  )
}
