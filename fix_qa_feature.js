const fs = require('fs');

// 1. NLP.ts güncellemesi: Q&A üretimi ve Bullet Point sınırını artırma
let nlpContent = fs.readFileSync('src/lib/nlp.ts', 'utf8');

// replace the return type and add question generation
const extractKeywordsRegex = /function extractKeywords.*?}/s;
const buildShortSummaryRegex = /function buildShortSummary.*?}/s;

// Add generateQuestions function
const generateQuestionsFunc = `
function generateQuestions(
  tf: Map<string, number>,
  scored: Array<{ sentence: string; score: number; index: number }>,
  lang: string
): { question: string, answer: string }[] {
  const topKeywords = [...tf.entries()]
    .filter(([word]) => word.length > 5 && !/\\d/.test(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  const questions: { question: string, answer: string }[] = [];
  const usedSentences = new Set<string>();

  for (const keyword of topKeywords) {
    // Kelimeyi iceren en yuksek skorlu cumleyi bul
    const bestSentence = scored.find(s => 
      s.sentence.toLowerCase().includes(keyword.toLowerCase()) && 
      !usedSentences.has(s.sentence)
    );

    if (bestSentence) {
      usedSentences.add(bestSentence.sentence);
      // Basit bir soru kalibi olustur
      const question = lang === 'tr' 
        ? \`"\${keyword.charAt(0).toUpperCase() + keyword.slice(1)}" hakkinda metinde ne söylenmektedir?\`
        : \`What does the text say about "\${keyword.charAt(0).toUpperCase() + keyword.slice(1)}"?\`;
      
      questions.push({
        question,
        answer: bestSentence.sentence
      });
    }
  }

  // Eger hic soru uretemezsek, en iyi 3 cumleden genel sorular uret
  if (questions.length === 0) {
    for (const s of scored.slice(0, 3)) {
      questions.push({
        question: lang === 'tr' ? 'Bu metindeki önemli bir detay nedir?' : 'What is an important detail in this text?',
        answer: s.sentence
      });
    }
  }

  return questions;
}
`;

nlpContent = nlpContent.replace('export function summarizeOffline', generateQuestionsFunc + '\nexport function summarizeOffline');

// Update bullet count limit
nlpContent = nlpContent.replace('Math.min(5, Math.ceil(sentences.length * 0.4))', 'Math.min(15, sentences.length)'); // up to 15 bullets

// Add questions to return object
nlpContent = nlpContent.replace('return { shortSummary, bulletPoints, keywords, language: lang, method: \'offline\' }', `
  const questions = generateQuestions(tf, scored, lang);
  return { shortSummary, bulletPoints, keywords, questions, language: lang, method: 'offline' }
`);

fs.writeFileSync('src/lib/nlp.ts', nlpContent, 'utf8');


// 2. huggingface.ts güncellemesi
let hfContent = fs.readFileSync('src/lib/huggingface.ts', 'utf8');
hfContent = hfContent.replace('keywords: offline.keywords,', 'keywords: offline.keywords,\n        questions: offline.questions,');
fs.writeFileSync('src/lib/huggingface.ts', hfContent, 'utf8');


// 3. API Route güncellemeleri
let apiNotesList = fs.readFileSync('src/app/api/notes/route.ts', 'utf8');
apiNotesList = apiNotesList.replace('keywords: n.keywords ? JSON.parse(n.keywords) : [],', 'keywords: n.keywords ? JSON.parse(n.keywords) : [],\n    questions: n.questions ? JSON.parse(n.questions) : [],');
apiNotesList = apiNotesList.replace('keywords: JSON.stringify(summary.keywords),', 'keywords: JSON.stringify(summary.keywords),\n        questions: JSON.stringify(summary.questions),');
apiNotesList = apiNotesList.replace('keywords: summary.keywords', 'keywords: summary.keywords, questions: summary.questions');
fs.writeFileSync('src/app/api/notes/route.ts', apiNotesList, 'utf8');

let apiNotesId = fs.readFileSync('src/app/api/notes/[id]/route.ts', 'utf8');
apiNotesId = apiNotesId.replace('keywords: note.keywords ? JSON.parse(note.keywords) : [],', 'keywords: note.keywords ? JSON.parse(note.keywords) : [],\n    questions: note.questions ? JSON.parse(note.questions) : [],');
apiNotesId = apiNotesId.replace('keywords: JSON.stringify(summary.keywords),', 'keywords: JSON.stringify(summary.keywords),\n        questions: JSON.stringify(summary.questions),');
apiNotesId = apiNotesId.replace('keywords: summary.keywords,', 'keywords: summary.keywords,\n      questions: summary.questions,');
fs.writeFileSync('src/app/api/notes/[id]/route.ts', apiNotesId, 'utf8');


// 4. SummaryPanel.tsx güncellemesi (Show More ve Q&A UI)
fs.writeFileSync('src/components/notes/SummaryPanel.tsx', `'use client'
import { useState } from 'react'
import { Sparkles, List, Hash, Cpu, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface SummaryPanelProps {
  shortSummary: string
  bulletPoints: string[]
  keywords: string[]
  questions?: { question: string, answer: string }[]
  method?: 'huggingface' | 'offline'
  language?: string
}

export default function SummaryPanel({ shortSummary, bulletPoints, keywords, questions = [], method }: SummaryPanelProps) {
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
          {method === 'huggingface' ? 'Hugging Face' : 'Offline NLP'}
        </span>
      </div>

      {/* Kisa Ozet */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">Kisa Ozet</h3>
        <p className="text-white/80 text-sm leading-relaxed">{shortSummary}</p>
      </div>

      {/* Soru & Cevap Bolumu */}
      {questions.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
            <HelpCircle className="w-3 h-3" /> Konu Ile Alakali Soru-Cevap
          </h3>
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                <p className="text-indigo-300 font-medium text-sm mb-2">Soru: {q.question}</p>
                <p className="text-white/70 text-sm leading-relaxed">Cevap: {q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onemli Noktalar */}
      {bulletPoints.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
            <List className="w-3 h-3" /> Onemli Noktalar
          </h3>
          <ul className="space-y-3 mb-4">
            {displayedBullets.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/70 animate-fade-up" style={{ animationDelay: \`\${i * 50}ms\` }}>
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" style={{minWidth:'6px'}} />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
          
          {hasMoreBullets && (
            <button 
              onClick={() => setShowAllBullets(!showAllBullets)}
              className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-colors"
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

      {/* Anahtar Kelimeler */}
      {keywords.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
            <Hash className="w-3 h-3" /> Anahtar Kelimeler
          </h3>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <span key={i} className="badge bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 cursor-default">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}`, 'utf8');

console.log('Q&A feature and bullet points update applied successfully!');
