import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import MobileHeader from '@/components/layout/MobileHeader'
import Link from 'next/link'
import { BookOpen, ChevronRight, PlusCircle, Sparkles } from 'lucide-react'

import AddCourseButton from '@/components/courses/AddCourseButton'

export default async function CoursesPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  const userId = (session.user as { id?: string }).id
  if (!userId) redirect('/auth/login')

  const courses = await prisma.course.findMany({
    where: { userId },
    include: {
      _count: {
        select: { notes: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="md:pl-64 min-h-screen pb-20 md:pb-0">
      <MobileHeader />
      <Sidebar />
      <Navbar />
      <main className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              Derslerim
            </h1>
            <p className="text-white/40 text-sm mt-1">Tüm dersleriniz ve notlarınız</p>
          </div>
          <AddCourseButton />
        </div>

        {courses.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center animate-fade-up">
            <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 mb-4">Henüz hiç ders veya not eklemediniz.</p>
            <Link href="/notes/new" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Yeni Not Ekle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up">
            {courses.map(course => (
              <Link 
                key={course.id} 
                href={`/notes?courseId=${course.id}`}
                className="glass glass-hover rounded-2xl p-6 group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{course.name}</h3>
                <p className="text-white/40 text-sm mb-4">{course._count.notes} adet not bulunuyor</p>
                <div className="flex items-center text-indigo-400 text-sm font-medium">
                  Notları Gör <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
