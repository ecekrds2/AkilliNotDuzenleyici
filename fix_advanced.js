const fs = require('fs');

// 1. Döküman ayrıştırma API'si ekleme (PDF & DOCX)
fs.mkdirSync('src/app/api/parse-document', { recursive: true });
fs.writeFileSync('src/app/api/parse-document/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Dosya bulunamadi' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const data = await pdfParse(buffer)
      text = data.text
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      file.name.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      return NextResponse.json({ error: 'Sadece PDF ve DOCX desteklenir' }, { status: 400 })
    }

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    console.error('File parse error:', error)
    return NextResponse.json({ error: 'Dosya okunurken bir hata olustu' }, { status: 500 })
  }
}
`, 'utf8');

// 2. Yeni Not sayfasina Dosya Yukleme Ekleme
fs.writeFileSync('src/app/notes/new/page.tsx', `'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { ArrowLeft, Sparkles, Loader2, FileText, UploadCloud } from 'lucide-react'
import Link from 'next/link'

export default function NewNotePage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const wordCount = form.content.trim() ? form.content.trim().split(/\\s+/).length : 0

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
    
    setParsing(true)
    setError('')
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Dosya okunamadi')
      
      setForm(f => ({ ...f, content: data.text }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setParsing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.content.trim().length < 20) {
      setError('Metin en az 20 karakter olmalidir')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Not olusturulamadi'); return }
    router.push(\`/notes/\${data.id}\`)
  }

  return (
    <div className="md:pl-64 min-h-screen pb-20 md:pb-0">
      <Sidebar />
      <Navbar />
      <main className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div className="flex items-center gap-4">
            <Link href="/notes" className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Yeni Not</h1>
              <p className="text-white/40 text-sm mt-0.5">AI ile otomatik ozet ve soru-cevap</p>
            </div>
          </div>
          
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf,.docx" 
              className="hidden" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing}
              className="btn-ghost bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-sm py-2 px-4"
            >
              {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>PDF / DOCX Yukle</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up">
          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">Baslik</label>
            <input id="note-title" type="text" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input-field text-lg font-medium" placeholder="Notun basligini girin..." required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Icerik</label>
              <div className="flex items-center gap-3 text-white/30 text-xs">
                <span>{wordCount} kelime</span>
              </div>
            </div>
            <textarea id="note-content" value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="input-field resize-none min-h-[320px] leading-relaxed"
              placeholder="Ozetlemek istediginiz metni buraya yapistirin veya yukaridan PDF/DOCX yukleyin..." required />
          </div>

          {form.content.length > 0 && form.content.length < 20 && (
            <p className="text-amber-400/70 text-xs flex items-center gap-1">
              <FileText className="w-3 h-3" />
              En az 20 karakter giriniz ({20 - form.content.length} karakter kaldi)
            </p>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <div className="glass rounded-xl p-4 flex items-start gap-3 border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-white/50 text-xs leading-relaxed">
              Not kaydedildikten sonra AI otomatik olarak anlamli bir kisa ozet, onemli maddeler ve 
              metnin anlasilmasini kolaylastiracak Soru-Cevap ikilileri uretecektir.
            </p>
          </div>

          <button id="create-note-btn" type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /><span>AI Analiz Ediyor...</span></>
              : <><Sparkles className="w-5 h-5" /><span>AI ile Analiz Et ve Kaydet</span></>}
          </button>
        </form>
      </main>
    </div>
  )
}`, 'utf8');

// 3. SummaryPanel: Anahtar kelimeleri kaldir, Q&A'yi vurgula
fs.writeFileSync('src/components/notes/SummaryPanel.tsx', `'use client'
import { useState } from 'react'
import { Sparkles, List, Cpu, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface SummaryPanelProps {
  shortSummary: string
  bulletPoints: string[]
  keywords?: string[] // unused now but kept for type compatibility
  questions?: { question: string, answer: string }[]
  method?: 'huggingface' | 'offline'
  language?: string
}

export default function SummaryPanel({ shortSummary, bulletPoints, questions = [], method }: SummaryPanelProps) {
  const [showAllBullets, setShowAllBullets] = useState(false)
  
  const displayedBullets = showAllBullets ? bulletPoints : bulletPoints.slice(0, 5)
  const hasMoreBullets = bulletPoints.length > 5

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
          {method === 'huggingface' ? 'Hugging Face' : 'Offline AI'}
        </span>
      </div>

      {/* Kisa Ozet */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">Genel Ozet</h3>
        <p className="text-white/90 text-[15px] leading-relaxed">{shortSummary}</p>
      </div>

      {/* Soru & Cevap Bolumu */}
      {questions.length > 0 && (
        <div className="glass rounded-2xl p-6 border-indigo-500/20">
          <h3 className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> Icerik Soru & Cevaplari
          </h3>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="bg-indigo-500/5 rounded-xl p-4 border border-indigo-500/10">
                <p className="text-white font-medium text-sm mb-2 flex gap-2">
                  <span className="text-indigo-400 font-bold">S:</span> {q.question}
                </p>
                <p className="text-white/70 text-sm leading-relaxed flex gap-2">
                  <span className="text-indigo-400/60 font-bold">C:</span> {q.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onemli Noktalar */}
      {bulletPoints.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
            <List className="w-4 h-4" /> Onemli Detaylar
          </h3>
          <ul className="space-y-3 mb-4">
            {displayedBullets.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-white/80 animate-fade-up" style={{ animationDelay: \`\${i * 40}ms\` }}>
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" style={{minWidth:'6px'}} />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
          
          {hasMoreBullets && (
            <button 
              onClick={() => setShowAllBullets(!showAllBullets)}
              className="w-full mt-3 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-all border border-transparent hover:border-indigo-500/20"
            >
              {showAllBullets ? (
                <><ChevronUp className="w-4 h-4" /> Daha Az Goster</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Tumunu Goster ({bulletPoints.length})</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}`, 'utf8');

// 4. NLP gelistirmeleri: Ozet mantigi, Q&A uretimi
const nlpCode = `import { SummaryResult } from '@/types'

const TR_STOPWORDS = new Set([
  'bir','bu','şu','o','ve','ile','de','da','ki','mi','mı','mu','mü',
  'için','ama','fakat','ancak','lakin','çünkü','zira','ise','ya','veya',
  'hem','ne','nasıl','neden','niçin','hangi','her','hiç','çok','az',
  'daha','en','kadar','gibi','göre','karşı','rağmen','beri','bana',
  'sana','ona','bize','size','onlara','ben','sen','biz','siz','onlar',
  'benim','senin','onun','bizim','sizin','onların','bazı','tüm','hep',
  'bile','sadece','yalnızca','artık','hala','henüz','zaten','belki',
  'muhtemelen','sanki','değil','var','yok','olan','olarak','oldu',
  'olur','edilir','edilmiş','edildi','kez','defa','kere','sonra',
  'önce','içinde','dışında','yanında','karşısında','ayrıca','özellikle',
  'genellikle','sıklıkla','bazen','çoğunlukla','ile','den','dan','ten',
  'tan','nin','nın','nun','nün','ya','ye','oysa','halbuki','madem',
  'demek','yani','öyle','böyle','şöyle','nerede','nereye','nereden',
  'kim','kimin','kime','kimi','kendi','kendisi','kendini','hepsi',
  'hiçbiri','birisi','biri','diğer','öteki','aynı','farklı','yeni',
  'eski','büyük','küçük','iyi','kötü','güzel','çirkin','uzun','kısa',
  'hızlı','yavaş','kolay','zor','ilk','son','çeşitli','pek','epey',
  'gayet','oldukça','başka','bunun','şunun','onun','bunlar','şunlar',
  'onlar','bunları','şunları','bunu','şunu','buna','şuna','birlikte'
])

const EN_STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','was','are','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','can','that','which','who','whom','whose','where','when','why',
  'how','all','each','every','both','either','neither','no','so','yet',
  'not','this','these','those','it','its','i','me','my','we','our','you',
  'your','he','his','she','her','they','their','them','what','as','if',
  'then','than','also','too','very','just','because','into','through',
  'during','before','after','above','below','between','out','about','up',
  'down','only','own','same','other','more','most','than','such','while',
  'although','though','unless','until','since','however','therefore',
  'furthermore','moreover','nevertheless','nonetheless','meanwhile',
  'consequently','accordingly','thus','hence','indeed','certainly'
])

export function detectLanguage(text: string): 'tr' | 'en' {
  const trChars = (text.match(/[çğışöüÇĞİŞÖÜ]/g) || []).length
  const totalChars = text.replace(/\\s/g, '').length
  if (totalChars === 0) return 'tr'
  return trChars / totalChars > 0.015 ? 'tr' : 'en'
}

function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?])\\s+([A-ZÇĞİŞÖÜA-Z])/g, '$1\\n$2')
    .split('\\n')
    .map(s => s.trim().replace(/\\s+/g, ' '))
    .filter(s => s.length > 15 && s.split(' ').length >= 4)
}

function tokenizeWords(text: string, stopwords: Set<string>): string[] {
  return text
    .toLowerCase()
    .replace(/[^\\w\\sçğışöüÇĞİŞÖÜ]/g, ' ')
    .split(/\\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w) && !/^\\d+$/.test(w))
}

function computeTF(words: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const word of words) freq.set(word, (freq.get(word) || 0) + 1)
  const max = Math.max(...freq.values(), 1)
  freq.forEach((v, k) => freq.set(k, v / max))
  return freq
}

function scoreSentence(sentence: string, tf: Map<string, number>, stopwords: Set<string>, index: number, total: number): number {
  const words = tokenizeWords(sentence, stopwords)
  if (words.length === 0) return 0

  const tfScore = words.reduce((sum, w) => sum + (tf.get(w) || 0), 0) / words.length

  let positionBonus = 0
  const relPos = index / total
  if (relPos < 0.15) positionBonus = 0.4 
  else if (relPos > 0.85) positionBonus = 0.2

  const wordCount = sentence.split(' ').length
  const lengthBonus = wordCount >= 8 && wordCount <= 25 ? 0.1 : -0.1
  const hasNumbers = /\\d/.test(sentence) ? 0.1 : 0

  return tfScore + positionBonus + lengthBonus + hasNumbers
}

function buildShortSummary(scored: Array<{ sentence: string; score: number; index: number }>): string {
  // En onemli 3 cumleyi butun halde al, kesme yapma
  const top = scored
    .slice(0, 3)
    .sort((a, b) => a.index - b.index)
    .map(s => {
      let txt = s.sentence
      if (!txt.endsWith('.') && !txt.endsWith('!') && !txt.endsWith('?')) txt += '.'
      return txt
    })

  return top.join(' ')
}

function generateQuestions(
  tf: Map<string, number>,
  scored: Array<{ sentence: string; score: number; index: number }>,
  lang: string
): { question: string, answer: string }[] {
  // En cok gecen ama anlamli anahtar kelimeleri bul (ornek: isimler, kavramlar)
  const topKeywords = [...tf.entries()]
    .filter(([word]) => word.length >= 5 && !/\\d/.test(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // En iyi 5 kelime uzerinden soru uret
    .map(([word]) => word)

  const questions: { question: string, answer: string }[] = []
  const usedSentences = new Set<string>()

  for (const keyword of topKeywords) {
    const bestSentence = scored.find(s => 
      s.sentence.toLowerCase().includes(keyword.toLowerCase()) && 
      !usedSentences.has(s.sentence)
    )

    if (bestSentence) {
      usedSentences.add(bestSentence.sentence)
      const kwCased = keyword.charAt(0).toUpperCase() + keyword.slice(1)
      
      const questionTypesTr = [
        \`"\${kwCased}" nedir ve metinde nasil aciklanmistir?\`,
        \`"\${kwCased}" kavraminin icerikteki onemi nedir?\`,
        \`Metinde "\${kwCased}" hakkinda hangi bilgiler yer aliyor?\`
      ]
      
      const questionTypesEn = [
        \`What is "\${kwCased}" as explained in the text?\`,
        \`What is the significance of "\${kwCased}" in the content?\`,
        \`What information is provided about "\${kwCased}"?\`
      ]

      const qTypes = lang === 'tr' ? questionTypesTr : questionTypesEn
      const randomQ = qTypes[questions.length % qTypes.length]
      
      questions.push({
        question: randomQ,
        answer: bestSentence.sentence
      })
    }
    
    // Max 4 soru yeterli
    if (questions.length >= 4) break
  }

  return questions
}

export function summarizeOffline(text: string): SummaryResult {
  const lang = detectLanguage(text)
  const stopwords = lang === 'tr' ? TR_STOPWORDS : EN_STOPWORDS

  const sentences = splitSentences(text)
  const allWords = tokenizeWords(text, stopwords)
  const tf = computeTF(allWords)

  if (sentences.length === 0 || allWords.length < 5) {
    const fallback = text.slice(0, 250)
    return {
      shortSummary: fallback,
      bulletPoints: [fallback],
      keywords: [],
      questions: [],
      language: lang,
      method: 'offline',
    }
  }

  const scored = sentences
    .map((sentence, i) => ({
      sentence,
      score: scoreSentence(sentence, tf, stopwords, i, sentences.length),
      index: i,
    }))
    .sort((a, b) => b.score - a.score)

  const shortSummary = buildShortSummary(scored)

  // Bullet limitini 15'e cikar (eskiden 5'ti)
  const bulletCount = Math.min(15, Math.ceil(sentences.length * 0.5))
  const bulletPoints = scored
    .slice(0, bulletCount)
    .sort((a, b) => a.index - b.index)
    .map(s => s.sentence)

  const questions = generateQuestions(tf, scored, lang)

  return { shortSummary, bulletPoints, keywords: [], questions, language: lang, method: 'offline' }
}
`;

fs.writeFileSync('src/lib/nlp.ts', nlpCode, 'utf8');

console.log('Scripts updated for file parsing, Q&A and summary improvement!');
