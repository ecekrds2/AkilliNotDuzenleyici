import Link from 'next/link'
import { Book, Cpu, Layers, HelpCircle, CheckSquare, FileText, AlertTriangle, ArrowLeft, Terminal } from 'lucide-react'

export const metadata = {
  title: 'Dokümantasyon | Akıllı Not Özetleyici',
  description: 'Akıllı Not Özetleyici platformunun geliştirici ve kullanıcı dokümantasyonu.'
}

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white/90 selection:bg-indigo-500/30 font-sans">
      
      {/* Standalone Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06] px-6 lg:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Book className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-bold tracking-tight">Akıllı Not Özetleyici</p>
              <p className="text-white/40 text-[11px] uppercase tracking-widest font-semibold">Docs v1.0.0</p>
            </div>
          </div>
          <Link href="/auth/login" className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Uygulamaya Dön
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 lg:py-20 animate-fade-up">
        
        <div className="mb-16">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Akıllı Not Platformu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Resmi Dokümantasyonu</span>
          </h1>
          <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
            Bu dokümantasyon, platformun sunduğu özellikleri, sistem mimarisini ve eğitim teknolojileri vizyonunu detaylı bir şekilde açıklamaktadır.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -z-10 rounded-full"></div>
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg text-amber-400 font-semibold mb-2 tracking-tight">Önemli Sistem Durumu: Dosya Yükleme (PDF / DOCX)</h3>
            <p className="text-amber-200/80 leading-relaxed">
              PDF ve DOCX belge okuma modülü (Parser API), altyapı iyileştirmeleri ve sunucu optimizasyon çalışmaları sebebiyle <strong>şu an için geçici olarak devre dışı bırakılmıştır.</strong> Şimdilik özet çıkarmak istediğiniz metinleri panoya kopyalayarak "Not İçeriği" alanına doğrudan yapıştırarak sistemi %100 verimle kullanabilirsiniz.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Yapay Zeka Motoru (Groq Llama 3)</h2>
            </div>
            <div className="glass rounded-2xl p-8 border border-white/5">
              <p className="text-white/60 leading-relaxed mb-6">
                Sistemimiz, saniyeler içerisinde binlerce kelimeyi analiz edebilen yüksek performanslı Groq Llama 3 motorunu kullanmaktadır. NLP (Doğal Dil İşleme) işlemleri, kullanıcının seçtiği "Ders" bağlamına göre özelleştirilir.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Özetleme Modülü</h4>
                  <p className="text-sm text-white/50">Kısa, Orta ve Detaylı derinlik seviyelerinde parametrik özetleme algoritmaları.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="font-semibold text-white mb-2">Highlights (Fosforlu Kalem)</h4>
                  <p className="text-sm text-white/50">Kritik kavram tespiti ve arayüz üzerinden gerçek zamanlı sarı fosforlama efekti.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="font-semibold text-white mb-2">İnteraktif Chat</h4>
                  <p className="text-sm text-white/50">Doküman içerisine RAG (Retrieval-Augmented Generation) benzeri yaklaşım ile soru sorma.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Dinamik Bilgi Kartları (Flashcards)</h2>
            </div>
            <div className="glass rounded-2xl p-8 border border-white/5 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <p className="text-white/60 leading-relaxed mb-6">
                  Spaced-repetition (aralıklı tekrar) konseptini desteklemek için otomatik oluşturulan önlü-arkalı bilgi kartları sistemidir. Sistem asenkron olarak çalışır ve kullanıcı talep ettiğinde <code className="text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded text-sm">/api/notes/[id]/regenerate</code> uç noktasından yepyeni kartlar çekebilir.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <span>3D CSS animasyonları ile desteklenmiş arayüz.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <span>Her bir ders için özelleştirilmiş kavram çıkartımı.</span>
                  </li>
                </ul>
              </div>
              <div className="w-full md:w-64 aspect-[4/3] rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center p-6 text-center">
                <p className="text-white/80 font-medium">Flashcard Preview UI</p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Sınav ve Ölçme Değerlendirme Modülü</h2>
            </div>
            <div className="glass rounded-2xl p-8 border border-white/5">
              <p className="text-white/60 leading-relaxed mb-6">
                Yapay zeka, öğrenme hedeflerini pekiştirmek için 10 adet sınav zorluğunda çoktan seçmeli soru ve açık uçlu Soru-Cevap ikilisi hazırlar. Bu sistem kullanıcı etkileşimine göre skoru (Çözülen Soru Sayısı) veritabanına yazar.
              </p>
              <div className="bg-black/30 rounded-xl p-4 font-mono text-sm text-green-400/80 mb-6">
                <Terminal className="w-4 h-4 mb-2 opacity-50" />
                POST /api/user/increment-questions<br />
                {'{ success: true }'}
              </div>
              <p className="text-white/60 text-sm">
                * Kullanıcı her test çözdüğünde bu istatistik güncellenir ve ana sayfadaki Dashboard üzerinde görüntülenir.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Kategori & Ders Yönetimi Mimarisi</h2>
            </div>
            <div className="glass rounded-2xl p-8 border border-white/5">
              <p className="text-white/60 leading-relaxed mb-6">
                Klasör bazlı not yönetimi yerine "Ders" tabanlı bir model kullanılmıştır. Sistem sıfırdan kayıt olan veya hiç dersi olmayan üyelere <code className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded text-sm">Matematik, Fizik, Kimya vb.</code> 7 adet ana dersi otomatik olarak tanımlar (seed). Kullanıcılar dilerse kendi derslerini sınırsız olarak yaratabilir.
              </p>
            </div>
          </section>

        </div>
        
        <footer className="mt-20 py-8 border-t border-white/5 text-center">
          <p className="text-white/30 text-sm">© 2026 Akıllı Not Özetleyici - Tüm hakları saklıdır.</p>
        </footer>

      </main>
    </div>
  )
}
