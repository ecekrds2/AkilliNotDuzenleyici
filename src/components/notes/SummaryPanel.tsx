'use client'
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
  const [showAllQuestions, setShowAllQuestions] = useState(false)
  
  const displayedBullets = showAllBullets ? bulletPoints : bulletPoints.slice(0, 5)
  const hasMoreBullets = bulletPoints.length > 5
  
  const displayedQuestions = showAllQuestions ? questions : questions.slice(0, 5)
  const hasMoreQuestions = questions.length > 5

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
            {displayedQuestions.map((q, i) => (
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
          
          {hasMoreQuestions && (
            <button 
              onClick={() => setShowAllQuestions(!showAllQuestions)}
              className="w-full mt-3 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-all border border-transparent hover:border-indigo-500/20"
            >
              {showAllQuestions ? (
                <><ChevronUp className="w-4 h-4" /> Daha Az Goster</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Tumunu Goster ({questions.length})</>
              )}
            </button>
          )}
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
              <li key={i} className="flex items-start gap-3 text-[14px] text-white/80 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
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
}