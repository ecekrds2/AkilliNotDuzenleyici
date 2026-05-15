import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import MobileHeader from '@/components/layout/MobileHeader'
import { Book, Cpu, Layers, HelpCircle, CheckSquare, FileText, AlertTriangle } from 'lucide-react'

export default async function DocumentationPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  return (
    <div className="md:pl-64 min-h-screen pb-20 md:pb-0">
      <MobileHeader />
      <Sidebar />
      <Navbar />
      <main className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-up">
        
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Book className="w-8 h-8 text-indigo-400" />
            Dokümantasyon ve Kullanım Rehberi
          </h1>
          <p className="text-white/40">Akıllı Not Özetleyici'nin tüm özelliklerini keşfedin ve notlarınızı verimli yönetin.</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-400 font-semibold mb-1">Önemli Bilgilendirme: Dosya Yükleme (PDF / DOCX)</h3>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              PDF ve DOCX belge okuma modülü, altyapı iyileştirmeleri ve sunucu optimizasyon çalışmaları sebebiyle <strong>şu an için geçici olarak devre dışı bırakılmıştır.</strong> Şimdilik özet çıkarmak istediğiniz metinleri kopyalayarak "Not İçeriği" alanına doğrudan yapıştırabilirsiniz.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-indigo-400" /> Yapay Zeka Özellikleri (Groq Llama 3)
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Sistemimiz, saniyeler içerisinde binlerce kelimeyi analiz edebilen yüksek performanslı Groq Llama 3 motorunu kullanmaktadır. Yüklediğiniz notlar seçtiğiniz <strong>Dersin bağlamına göre</strong> özel olarak analiz edilir.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span><strong>Özetleme:</strong> Metninizi Kısa, Orta ve Detaylı olmak üzere üç farklı derinlikte özetler.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span><strong>Fosforlu Kalem (Highlights):</strong> Metninizdeki en kritik kavramları ve cümleleri tespit ederek sarı kalemle otomatik vurgular.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span><strong>AI Chat:</strong> "Chat" sekmesinden notunuzla ilgili doğrudan yapay zekaya sorular sorabilir, anlaşılmayan yerleri açıklatabilirsiniz.</span>
              </li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-purple-400" /> Etkileşimli Çalışma Kartları (Flashcards)
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Yapay zeka, notunuzdan öğrenilmesi gereken en önemli terimleri çıkararak önlü-arkalı bilgi kartlarına dönüştürür.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span>Kartın üzerine tıklayarak arkasındaki detayı görebilirsiniz.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span>Eğer soruları ezberlediyseniz, en alttaki <strong>"Tekrar Oluştur"</strong> butonuna tıklayarak metinden yepyeni bilgi kartları üretilmesini sağlayabilirsiniz.</span>
              </li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <CheckSquare className="w-5 h-5 text-green-400" /> Sınavlar ve Soru-Cevap
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Öğrendiklerinizi test etmeniz için notlarınıza özel test sınavları hazırlanır.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <span><strong>Soru & Cevap:</strong> Konuyla ilgili direkt ve zorlayıcı sorular. Bu bölüm de buton ile yenilenebilir.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <span><strong>Test Sınavı:</strong> 4 şıklı sorularla kendinizi deneyin. Verdiğiniz cevaplara göre "Çözülen Soru" istatistiğiniz Dashboard'da artacaktır. Cevapladıktan sonra detaylı açıklama da gösterilir.</span>
              </li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-400" /> Dersler ve Not Yönetimi
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Notlarınızı "Dersler" mantığına oturtarak bir düzene soktuk.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>Sistem sizin için otomatik ana dersleri tanımlar. Ancak siz <strong>Derslerim</strong> menüsünden dilediğiniz kadar özel ders ismi oluşturabilirsiniz.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>Yeni not eklerken dersi seçtiğinizde yapay zeka analizlerini o dersin akademik diline göre ayarlar.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span><strong>Notlarım</strong> sayfasından tüm notlarınızı derslere göre filtreleyebilir veya içeriklerine göre arayabilirsiniz.</span>
              </li>
            </ul>
          </section>

        </div>
      </main>
    </div>
  )
}
