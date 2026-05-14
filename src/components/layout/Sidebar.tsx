'use client'
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
}