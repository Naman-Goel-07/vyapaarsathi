'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Languages,
  MessageSquare,
  Radio,
  Loader2,
  FileText,
  ChevronDown
} from 'lucide-react'

export type LanguageCode =
  | 'hinglish'
  | 'hindi'
  | 'gujarati'
  | 'marathi'
  | 'tamil'
  | 'telugu'
  | 'bengali'
  | 'kannada'
  | 'english';

interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeLabel: string;
  locale: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'hinglish', name: 'Hinglish', nativeLabel: 'Hinglish', locale: 'en-IN' },
  { code: 'hindi', name: 'Hindi', nativeLabel: 'हिंदी', locale: 'hi-IN' },
  { code: 'gujarati', name: 'Gujarati', nativeLabel: 'ગુજરાતી', locale: 'gu-IN' },
  { code: 'marathi', name: 'Marathi', nativeLabel: 'मराठी', locale: 'mr-IN' },
  { code: 'tamil', name: 'Tamil', nativeLabel: 'தமிழ்', locale: 'ta-IN' },
  { code: 'telugu', name: 'Telugu', nativeLabel: 'తెలుగు', locale: 'te-IN' },
  { code: 'bengali', name: 'Bengali', nativeLabel: 'বাংলা', locale: 'bn-IN' },
  { code: 'kannada', name: 'Kannada', nativeLabel: 'ಕನ್ನಡ', locale: 'kn-IN' },
  { code: 'english', name: 'English', nativeLabel: 'English', locale: 'en-IN' }
];

interface VernacularVoiceAssistantProps {
  authority: string;
  form: string;
  issue: string;
  deadline?: string | null;
  penaltyAmount?: number | null;
  businessName?: string;
}

export default function VernacularVoiceAssistant({
  authority,
  form,
  issue,
  deadline,
  penaltyAmount = null,
  businessName = 'Vyapaari Ji'
}: VernacularVoiceAssistantProps) {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('hinglish');
  const [script, setScript] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const activeOption = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];

  // Fetch or update speech script when language changes
  const fetchBriefing = async (targetLang: LanguageCode) => {
    setLoading(true);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }

    try {
      const res = await fetch('/api/voice-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authority,
          form,
          issue,
          deadline,
          penaltyAmount,
          businessName,
          language: targetLang
        })
      });

      const data = await res.json();
      if (data.script) {
        setScript(data.script);
      }
    } catch (err) {
      console.error('Failed to load vernacular voice briefing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing('hinglish');
  }, []);

  const handleLanguageSelect = (lang: LanguageCode) => {
    if (lang === selectedLang) return;
    setSelectedLang(lang);
    fetchBriefing(lang);
  };

  // Text-To-Speech Playback
  const handlePlay = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = script || `Namaste Ji. Yeh ${authority} se ek routine scrutiny notice hai. Ghabraiye mat.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    // Pick appropriate browser voice for Indian locale
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => 
      v.lang.toLowerCase() === activeOption.locale.toLowerCase() ||
      v.lang.toLowerCase().startsWith(activeOption.locale.slice(0, 2))
    );

    if (targetVoice) {
      utterance.voice = targetVoice;
    } else {
      // Fallback to any Indian English or default voice
      const indianVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India'));
      if (indianVoice) utterance.voice = indianVoice;
    }
    utterance.lang = activeOption.locale;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleRestart = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setTimeout(handlePlay, 100);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📢 *VyapaarSathi Notice Briefing (${activeOption.name} / ${activeOption.nativeLabel})*\n\n` +
      `🏛️ *Authority:* ${authority}\n` +
      `📑 *Notice Form:* ${form}\n\n` +
      `🎙️ *Audio Summary:* ${script}\n\n` +
      `✅ _VyapaarSathi - We don't explain the notice, we close it._`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="bg-amber-500/10 border-2 border-amber-600/30 rounded-sm p-4 sm:p-5 my-4 relative overflow-hidden text-slate-900">
      {/* BACKGROUND GRAPHIC */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* LEFT: BRANDING & HEADLINE */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider flex items-center gap-1">
              <Radio size={11} className={isPlaying ? 'animate-pulse text-red-200' : ''} />
              Awaaz • Multi-Lingual Audio Dispatch
            </span>
            <span className="text-amber-900/70 font-mono text-xs font-semibold">
              9 Indian Languages Supported
            </span>
          </div>

          <h4 className="text-base sm:text-lg font-serif font-bold text-slate-950 flex items-center gap-2">
            <Volume2 size={18} className="text-amber-700" />
            Listen in {activeOption.name} ({activeOption.nativeLabel})
          </h4>

          <p className="text-xs text-slate-700 max-w-xl leading-relaxed">
            Legal notices create immense panic for shopkeepers. Tap play to listen in your mother tongue without legal jargon.
          </p>
        </div>

        {/* RIGHT: PLAY / PAUSE BUTTON */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              disabled={loading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xs shadow-sm flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <Play size={15} fill="currentColor" />
              )}
              <span>Play {activeOption.name} Audio</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Pause size={15} fill="currentColor" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={handleRestart}
            className="p-2 bg-white hover:bg-amber-100 text-slate-700 border border-amber-300 rounded-xs transition-colors"
            title="Restart playback"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* MULTI-LANGUAGE BADGE ROW */}
      <div className="mt-4 pt-3 border-t border-amber-300/60">
        <div className="flex items-center gap-2 mb-2">
          <Languages size={13} className="text-amber-800" />
          <span className="text-[11px] font-mono uppercase font-bold text-amber-900">
            Select Language ({LANGUAGES.length} Available):
          </span>
        </div>

        {/* HORIZONTALLY SCROLLABLE LANGUAGE PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                disabled={loading}
                className={`px-2.5 py-1 text-xs font-mono rounded-xs shrink-0 transition-all cursor-pointer border flex items-center gap-1 ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-2xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 border-amber-300/80 hover:border-slate-400 font-medium'
                }`}
              >
                <span>{lang.nativeLabel}</span>
                <span className="text-[10px] opacity-70">({lang.name})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AUDIO WAVEFORM EQUALIZER BAR (WHEN PLAYING) */}
      {isPlaying && (
        <div className="mt-3 pt-2 border-t border-amber-300/40 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
            <span className="w-1.5 h-3 bg-amber-700 animate-pulse"></span>
            <span className="w-1.5 h-6 bg-amber-600 animate-pulse delay-75"></span>
            <span className="w-1.5 h-4 bg-amber-800 animate-pulse delay-150"></span>
            <span className="w-1.5 h-7 bg-amber-700 animate-pulse delay-100"></span>
            <span className="w-1.5 h-3 bg-amber-600 animate-pulse delay-200"></span>
            <span className="ml-2 text-[11px]">SPEAKING IN {activeOption.name.toUpperCase()} ({activeOption.nativeLabel})...</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-900/60">Speed:</span>
            {[1.0, 1.25].map(s => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] ${playbackSpeed === s ? 'bg-amber-700 text-white' : 'bg-white text-slate-700'}`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TRANSCRIPT ACCORDION & WHATSAPP FORWARD */}
      <div className="mt-3 pt-2.5 border-t border-amber-300/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="text-amber-900 hover:text-amber-950 font-mono font-semibold flex items-center gap-1 text-[11px] underline underline-offset-2"
        >
          <FileText size={12} />
          {showTranscript ? `Hide ${activeOption.name} Transcript` : `Read ${activeOption.name} Transcript`}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleWhatsAppShare}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xs font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <MessageSquare size={12} />
            <span>Forward {activeOption.name} Note to WhatsApp</span>
          </button>
        </div>
      </div>

      {/* SCRIPT ACCORDION BODY */}
      {showTranscript && (
        <div className="mt-3 bg-white p-3.5 rounded-xs border border-amber-300 text-xs font-sans text-slate-800 leading-relaxed space-y-1 shadow-inner">
          <div className="flex justify-between items-center text-slate-400 font-mono text-[10px] uppercase font-bold">
            <span>Spoken Script ({activeOption.name} - {activeOption.nativeLabel}):</span>
            <span className="text-amber-800 font-semibold">{script ? `${script.split(' ').length} words` : ''}</span>
          </div>
          <p className="font-medium text-slate-900 italic text-sm">
            "{script}"
          </p>
        </div>
      )}
    </div>
  );
}
