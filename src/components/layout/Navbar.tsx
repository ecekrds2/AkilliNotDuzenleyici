'use client'
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
}