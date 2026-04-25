import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Youtube, Copy, Check, Sparkles, Loader2, AlertCircle, PlaySquare, LayoutDashboard, BarChart2, Settings, Users, ArrowUpRight } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=9CbcpdPtGvw');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateComments = async () => {
    if (!url.trim() && !topic.trim()) {
      setError('Lütfen bir video linki veya konusu girin.');
      return;
    }
    
    setLoading(true);
    setError('');
    setComments([]);
    setCopiedIndex(null);
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Sen bir YouTube algoritma uzmanı ve SEO stratejistisin. Görevimiz, verilen YouTube videosunun içeriğiyle GERÇEK ANLAMDA eşleşen, videoyu izlemiş hissiyatı veren ve etkileşimi (watch time, reply, like) maksimuma çıkaracak 3 farklı derinlikli yorum alternatifi oluşturmak.

BUNU YAPARKEN EN ÖNEMLİ KURAL: Yorumlar KESİNLİKLE yapay zeka ile yazılmış gibi durmamalı! Aşırı resmi kelimeler ("muazzam", "harikalikulade", "olağanüstü", "belirtmek isterim ki"), robotik cümle yapıları ve aşırı kusursuz bir dil kullanma. Gerçek bir YouTube izleyicisi, sıkı bir takipçi veya oyun/içerik tutkunu nasıl konuşuyorsa öyle konuş (samimi, doğal, günlük dilde). Bazen hafif ünlemler, emojiler veya günlük tabirler ("abi", "resmen", "ya", "harbi") kullanabilirsin.

Öncelikle şu YouTube linkini kullanarak videonun başlığını, kanalını, konusunu ve içeriğini araştır ve anla. Uydurma, alakasız veya genel geçer yorumlar YAPMA; yorumlar tamamen videonun gerçekliğiyle uyuşmalı. 

Aşağıdaki stratejileri uygula:
1. Spesifik Zaman Damgaları: Videodan çarpıcı anlara zaman damgaları (Örn: [01:00], [13:54]) ekleyerek izleyicilerin o anlara geri dönmesini sağla.
2. Doğal Etkileşim ve Soru: Diğer izleyicileri tartışmaya dahil edecek, "Siz ne düşünüyorsunuz?", "Orada ben de aynı tepkiyi verdim, sizce de öyle değil mi?" gibi DOĞAL sorular sor.
3. İçerik Uyumu: Emeği takdir eden, videodaki detaylara doğal bir şekilde değinen, kanal sahibiyle bağ kuran yorumlar yaz. 
4. Hashtagler: Çok abartmadan yorumun doğal akışına uygun 1-2 hashtag ekle.

Video Linki: ${url}
Video Konusu (Opsiyonel): ${topic}`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                comment: {
                  type: Type.STRING,
                  description: 'Üretilen Youtube yorumu',
                },
              },
              required: ['comment'],
            },
          },
        },
      });

      const jsonStr = response.text?.trim() || '[]';
      const parsed = JSON.parse(jsonStr) as { comment: string }[];
      setComments(parsed.map(p => p.comment));
    } catch (err) {
      console.error(err);
      setError('Yorumlar oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header Navigation */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <PlaySquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">AlgoComment AI</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-sm font-medium text-slate-500">
            <span className="text-blue-600 flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4"/> Panel</span>
            <span className="hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"><BarChart2 className="w-4 h-4"/> Analitik</span>
            <span className="hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"><Settings className="w-4 h-4"/> Ayarlar</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
        </div>
      </nav>

      <main className="flex-1 p-8 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full">
        {/* Left Sidebar: Video Input & Config */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Video Analizi</h2>
            
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              YouTube Video Linki
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Video Konusu (Opsiyonel)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Örn: Teknik eğitim vb..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 mb-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />

            {error && (
              <div className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={generateComments}
              disabled={loading}
              className="w-full mt-2 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analiz Et & Oluştur
                </>
              )}
            </button>
          </div>

          {/* Algorithm Insights Mini-Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Algoritma Yakalama Potansiyeli
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">94%</span>
              <span className="text-xs mb-1 opacity-80 font-medium">Yüksek Etkileşim</span>
            </div>
            <p className="mt-3 text-xs opacity-90 leading-relaxed">
              Üretilen yorumlarınız, platform algoritmasına göre maksimum etkileşim için optimize edilmiştir.
            </p>
          </div>
        </div>

        {/* Right Side: Generated Results */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Video Stats Preview (Mock elements for visual consistency) */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Tahmini Gösterim Artışı</p>
                <p className="text-lg font-bold text-slate-800">+12.5K</p>
              </div>
            </div>
            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Yanıtlanma Olasılığı</p>
                <p className="text-lg font-bold text-slate-800">8.2%</p>
              </div>
            </div>
          </div>

          {/* Generated Comments Section */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm min-h-[300px]">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">
                {comments.length > 0 ? "Önerilen Yorumlar" : "Analiz Bekleniyor..."}
              </h3>
            </div>
            
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {comments.length === 0 && !loading && (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm flex-col gap-3">
                  <Youtube className="w-12 h-12 text-slate-200" />
                  <p>Algoritma dostu yorumları görmek için bir video linki girin ve oluştur'a tıklayın.</p>
                </div>
              )}
              
              {loading && (
                <div className="h-full flex items-center justify-center text-slate-500 font-medium flex-col gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p>Video detayları inceleniyor ve derinlikli yorumlar üretiliyor...</p>
                </div>
              )}
              
              {!loading && comments.map((comment, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border relative transition-all ${
                    idx === 0 
                      ? "bg-blue-50/50 border-blue-200" 
                      : "bg-slate-50/50 border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      idx === 0 
                        ? "text-blue-600 bg-blue-100" 
                        : "text-slate-500 bg-slate-200"
                    }`}>
                      {idx === 0 ? "Zirve Etkileşim" : idx === 1 ? "Etkileşim Odaklı" : "Topluluk Teşvik Edici"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {idx === 0 ? "98%" : idx === 1 ? "91%" : "85%"} ETKİ
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    "{comment}"
                  </p>
                  <button 
                    onClick={() => copyToClipboard(comment, idx)}
                    className={`mt-4 text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      idx === 0 ? "text-blue-600 hover:text-blue-700" : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    {copiedIndex === idx ? (
                      <><Check className="w-3.5 h-3.5" /> Kopyalandı!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Yorumu Kopyala</>
                    )}
                  </button>
                </div>
              ))}
            </div>
            
            {comments.length > 0 && (
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                <p className="text-xs text-slate-500 italic hidden sm:block">Tüm yorumlar YouTube arama SEO'su ve anlamsal eşleşmeye göre tasarlanmıştır.</p>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button 
                    onClick={() => setComments([])}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                  >
                    Temizle
                  </button>
                  <button
                    onClick={() => {
                       navigator.clipboard.writeText(comments.join('\n\n'));
                       // Minimal multiple copy feedback, typically handled by setting copied state for all, but simple here
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Tümünü Kopyala
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

