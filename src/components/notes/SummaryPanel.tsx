'use client'
import { useState } from 'react'
import { Sparkles, List, Cpu, HelpCircle, ChevronDown, ChevronUp, Layers, CheckSquare, AlignLeft } from 'lucide-react'

interface SummaryPanelProps {
  shortSummary: string
  mediumSummary?: string
  detailedSummary?: string
  bulletPoints: string[]
  keywords?: string[]
  questions?: { question: string, answer: string }[]
  flashcards?: { front: string, back: string }[]
  examQuestions?: { question: string, options: string[], answer: string, explanation: string }[]
  method?: 'huggingface' | 'offline' | 'gemini'
  language?: string
}

type TabType = 'summary' | 'bullets' | 'qa' | 'flashcards' | 'exam' | 'chat'
type SummaryLevel = 'short' | 'medium' | 'detailed'

export default function SummaryPanel({ 
  shortSummary, 
  mediumSummary, 
  detailedSummary, 
  bulletPoints, 
  questions = [], 
  flashcards = [],
  examQuestions = [],
  method,
  content = '' // We need the original content for chat context
}: SummaryPanelProps & { content?: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('summary')
  const [summaryLevel, setSummaryLevel] = useState<SummaryLevel>('short')
  const [showAllQuestions, setShowAllQuestions] = useState(false)
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({})
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({})
  
  // Chat States
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  const displayedQuestions = showAllQuestions ? questions : questions.slice(0, 5)
  const hasMoreQuestions = questions.length > 5

  const toggleFlashcard = (index: number) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const handleExamAnswer = (qIndex: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }))
    setShowExplanations(prev => ({ ...prev, [qIndex]: true }))
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return
    const userMessage = chatInput
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setIsChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context: content })
      })
      const data = await res.json()
      if (data.answer) {
        setChatMessages(prev => [...prev, { role: 'ai', text: data.answer }])
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Bir hata oluştu, lütfen tekrar deneyin.' }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const currentSummary = 
    summaryLevel === 'short' ? shortSummary :
    summaryLevel === 'medium' ? (mediumSummary || shortSummary) :
    (detailedSummary || shortSummary)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" /> AI Analiz Sonuclari
        </h2>
        <span className={"badge " + (
          method === 'groq' ? "bg-orange-500/10 border border-orange-500/20 text-orange-400" :
          method === 'gemini' ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400" :
          method === 'huggingface' ? "bg-green-500/10 border border-green-500/20 text-green-400" :
          "bg-white/5 border border-white/10 text-white/40"
        )}>
          <Cpu className="w-3 h-3 mr-1" />
          {method === 'groq' ? 'Groq Llama 3' : method === 'gemini' ? 'Gemini AI' : method === 'huggingface' ? 'Hugging Face' : 'Offline AI'}
        </span>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar border-b border-white/[0.06]">
        <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${activeTab === 'summary' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5' : 'text-white/50 hover:text-white/80'}`}>
          <AlignLeft className="w-4 h-4 inline-block mr-2" /> Ozet
        </button>
        {bulletPoints.length > 0 && (
          <button onClick={() => setActiveTab('bullets')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${activeTab === 'bullets' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5' : 'text-white/50 hover:text-white/80'}`}>
            <List className="w-4 h-4 inline-block mr-2" /> Maddeler
          </button>
        )}
        {questions.length > 0 && (
          <button onClick={() => setActiveTab('qa')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${activeTab === 'qa' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5' : 'text-white/50 hover:text-white/80'}`}>
            <HelpCircle className="w-4 h-4 inline-block mr-2" /> Soru & Cevap
          </button>
        )}
        {flashcards.length > 0 && (
          <button onClick={() => setActiveTab('flashcards')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${activeTab === 'flashcards' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5' : 'text-white/50 hover:text-white/80'}`}>
            <Layers className="w-4 h-4 inline-block mr-2" /> Flashcards
          </button>
        )}
        {examQuestions.length > 0 && (
          <button onClick={() => setActiveTab('exam')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${activeTab === 'exam' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5' : 'text-white/50 hover:text-white/80'}`}>
            <CheckSquare className="w-4 h-4 inline-block mr-2" /> Sinav
          </button>
        )}
        <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${activeTab === 'chat' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5' : 'text-white/50 hover:text-white/80'}`}>
          <Sparkles className="w-4 h-4 inline-block mr-2" /> Chat
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="mt-4">
        
        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="glass rounded-2xl p-6 animate-fade-up">
            <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-lg inline-flex">
              <button onClick={() => setSummaryLevel('short')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${summaryLevel === 'short' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white/80'}`}>Kısa</button>
              <button onClick={() => setSummaryLevel('medium')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${summaryLevel === 'medium' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white/80'}`}>Orta</button>
              <button onClick={() => setSummaryLevel('detailed')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${summaryLevel === 'detailed' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white/80'}`}>Detaylı</button>
            </div>
            <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap">{currentSummary}</p>
          </div>
        )}

        {/* BULLETS TAB */}
        {activeTab === 'bullets' && (
          <div className="glass rounded-2xl p-6 animate-fade-up">
            <ul className="space-y-3">
              {bulletPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-white/80 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" style={{minWidth:'6px'}} />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* QA TAB */}
        {activeTab === 'qa' && (
          <div className="glass rounded-2xl p-6 animate-fade-up">
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
              <button onClick={() => setShowAllQuestions(!showAllQuestions)} className="w-full mt-3 py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-all">
                {showAllQuestions ? <><ChevronUp className="w-4 h-4" /> Daha Az Goster</> : <><ChevronDown className="w-4 h-4" /> Tumunu Goster</>}
              </button>
            )}
          </div>
        )}

        {/* FLASHCARDS TAB */}
        {activeTab === 'flashcards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up">
            {flashcards.map((card, i) => (
              <div 
                key={i} 
                onClick={() => toggleFlashcard(i)}
                className="glass rounded-2xl p-6 min-h-[160px] flex items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-all relative [perspective:1000px]"
              >
                <div className={`transition-all duration-500 w-full h-full flex items-center justify-center ${flippedCards[i] ? 'opacity-0 scale-95 absolute' : 'opacity-100 scale-100'}`}>
                  <p className="text-white font-semibold text-lg">{card.front}</p>
                </div>
                <div className={`transition-all duration-500 w-full h-full flex items-center justify-center ${flippedCards[i] ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
                  <p className="text-white/80 text-sm">{card.back}</p>
                </div>
                <div className="absolute bottom-2 right-3 text-[10px] text-white/30 uppercase tracking-widest">Tikla ve Cevir</div>
              </div>
            ))}
          </div>
        )}

        {/* EXAM TAB */}
        {activeTab === 'exam' && (
          <div className="space-y-6 animate-fade-up">
            {examQuestions.map((eq, i) => {
              const isAnswered = showExplanations[i]
              const isCorrect = selectedAnswers[i] && selectedAnswers[i].charAt(0) === eq.answer.charAt(0)

              return (
                <div key={i} className="glass rounded-2xl p-6">
                  <p className="text-white font-medium mb-4 text-[15px]">{i + 1}. {eq.question}</p>
                  <div className="space-y-2">
                    {eq.options.map((opt, j) => {
                      const isSelected = selectedAnswers[i] === opt
                      const isOptionCorrect = opt.charAt(0) === eq.answer.charAt(0)
                      let btnClass = "w-full text-left p-3 rounded-xl border transition-all text-sm "
                      
                      if (!isAnswered) {
                        btnClass += "border-white/10 hover:border-indigo-500/30 text-white/70 hover:text-white hover:bg-white/5"
                      } else {
                        if (isOptionCorrect) btnClass += "border-green-500/50 bg-green-500/10 text-green-300 font-medium"
                        else if (isSelected) btnClass += "border-red-500/50 bg-red-500/10 text-red-300"
                        else btnClass += "border-white/5 text-white/30 opacity-50"
                      }

                      return (
                        <button 
                          key={j} 
                          disabled={isAnswered}
                          onClick={() => handleExamAnswer(i, opt)}
                          className={btnClass}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {isAnswered && (
                    <div className={`mt-4 p-4 rounded-xl text-sm ${isCorrect ? 'bg-green-500/10 text-green-200' : 'bg-red-500/10 text-red-200'}`}>
                      <p className="font-semibold mb-1">{isCorrect ? 'Tebrikler, dogru!' : 'Yanlis cevap.'}</p>
                      <p className="opacity-80 leading-relaxed">{eq.explanation}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="glass rounded-2xl p-6 flex flex-col h-[400px] animate-fade-up">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 hide-scrollbar">
              {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <Sparkles className="w-8 h-8 mb-2 text-indigo-400" />
                  <p className="text-sm">Not hakkında aklına takılan her şeyi sorabilirsin.</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white/10 text-white/90 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white/50 p-3 rounded-2xl rounded-bl-sm text-sm animate-pulse">
                    Yazıyor...
                  </div>
                </div>
              )}
            </div>
            <div className="relative mt-auto">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Bu notla ilgili bir soru sor..."
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isChatLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors disabled:opacity-50"
              >
                Gonder
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}