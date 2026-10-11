'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCheck,
  Play,
  Pause,
  Volume2,
  X,
  FileText,
  ShieldCheck,
  ExternalLink,
  PhoneCall,
  Video,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'

interface ChatMessage {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: string
  hasAudio?: boolean
  audioScript?: string
  fileAttachment?: {
    name: string
    size: string
    type: string
  }
}

export default function WhatsAppBotSimulator({
  defaultOpen = false,
  onClose
}: {
  defaultOpen?: boolean
  onClose?: () => void
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'hindi' | 'hinglish' | 'tamil' | 'english'>('hindi')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: '🙏 *Namaste! Welcome to VyapaarSathi Statutory Dispatch Bot.*\n\nForward any statutory notice (GST, Income Tax, EPFO) here as a PDF or photo. Our AI will instantly translate it, calm your panic, and sync it with your Chartered Accountant.',
      timestamp: '10:02 AM'
    }
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen, isTyping])

  const playVoiceNote = (script: string, messageId: string) => {
    if (typeof window === 'undefined') return

    if (isPlayingAudio === messageId) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(null)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.lang = selectedLanguage === 'tamil' ? 'ta-IN' : selectedLanguage === 'english' ? 'en-IN' : 'hi-IN'
    utterance.rate = 0.95
    utterance.onend = () => setIsPlayingAudio(null)
    utterance.onerror = () => setIsPlayingAudio(null)

    setIsPlayingAudio(messageId)
    window.speechSynthesis.speak(utterance)
  }

  const handleSendNotice = async (noticeType: 'drc-01' | '148a' | 'custom', customQuery?: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    let userMsg: ChatMessage

    if (noticeType === 'drc-01') {
      userMsg = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: 'Sir, I received this scary GST DRC-01 notice via email today! Please check what to do.',
        timestamp: timeStr,
        fileAttachment: {
          name: 'GST_DRC_01_Notice_FY24-25.pdf',
          size: '1.2 MB',
          type: 'application/pdf'
        }
      }
    } else if (noticeType === '148a') {
      userMsg = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: 'Received Income Tax Section 148A notice for High Value Transaction. Is this an audit?',
        timestamp: timeStr,
        fileAttachment: {
          name: 'IT_148A_Demand_Order.pdf',
          size: '850 KB',
          type: 'application/pdf'
        }
      }
    } else {
      userMsg = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: customQuery || inputText,
        timestamp: timeStr
      }
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userMsg.text,
          language: selectedLanguage
        })
      })

      const data = await res.json()
      setIsTyping(false)

      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.replyText || 'Received your inquiry. Your CA has been notified.',
        timestamp: botTime,
        hasAudio: true,
        audioScript: data.voiceScript || 'Namaste ji, bilkul ghabraiye nahi. Yeh notice routine mismatch ke baare me hai.'
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      setIsTyping(false)
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: '⚠️ Network timeout connecting to GSTN gateway. Your docket has been saved locally.',
        timestamp: timeStr
      }
      setMessages((prev) => [...prev, botMsg])
    }
  }

  return (
    <>
      {/* TRIGGER BADGE / BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-xl flex items-center gap-2 font-mono text-xs font-bold transition-all transform hover:scale-105 cursor-pointer border-2 border-white"
        >
          <MessageSquare size={18} />
          <span className="hidden sm:inline">WhatsApp Ingestion Bot</span>
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
        </button>
      )}

      {/* MODAL / SIMULATOR WINDOW */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#EFEAE2] border-2 border-ink rounded-sm shadow-2xl w-full max-w-lg flex flex-col h-[85vh] max-h-[700px] overflow-hidden text-ink relative">
            
            {/* WHATSAPP TOP BAR */}
            <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold font-serif text-white text-base">
                  VS
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm leading-tight">VyapaarSathi Official</h4>
                    <span className="bg-white text-[#075E54] text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-green-100 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    <span>Online · MSME Compliance Gateway</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-white/80">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="bg-[#054c44] text-white text-[10px] font-mono px-2 py-1 rounded border border-white/20 focus:outline-none cursor-pointer"
                >
                  <option value="hindi">हिंदी (Hindi)</option>
                  <option value="hinglish">Hinglish</option>
                  <option value="tamil">தமிழ் (Tamil)</option>
                  <option value="english">English</option>
                </select>

                <button
                  onClick={() => {
                    if (isPlayingAudio) window.speechSynthesis.cancel()
                    setIsOpen(false)
                    if (onClose) onClose()
                  }}
                  className="hover:text-white p-1 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* QUICK DEMO DISPATCH ACTIONS */}
            <div className="bg-[#DCF8C6]/60 border-b border-gray-300 px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0 text-[11px] font-mono">
              <span className="text-gray-600 font-bold uppercase shrink-0">One-Click Dispatch:</span>
              <button
                onClick={() => handleSendNotice('drc-01')}
                className="bg-white hover:bg-gray-100 px-2.5 py-1 rounded-sm border border-gray-300 text-ink font-semibold whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
              >
                + Send GST DRC-01 PDF
              </button>
              <button
                onClick={() => handleSendNotice('148a')}
                className="bg-white hover:bg-gray-100 px-2.5 py-1 rounded-sm border border-gray-300 text-ink font-semibold whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
              >
                + Send IT 148A PDF
              </button>
            </div>

            {/* CHAT MESSAGES SCROLL AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
              <div className="text-center my-2">
                <span className="bg-white/80 text-gray-500 text-[10px] font-mono px-2.5 py-0.5 rounded-full shadow-2xs">
                  TODAY · END-TO-END ENCRYPTED
                </span>
              </div>

              {messages.map((m) => {
                const isUser = m.sender === 'user'
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 shadow-xs space-y-2 relative ${
                        isUser
                          ? 'bg-[#DCF8C6] text-gray-900 rounded-tr-none'
                          : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                      }`}
                    >
                      {/* Attached File Preview if any */}
                      {m.fileAttachment && (
                        <div className="bg-black/5 p-2 rounded flex items-center gap-2 border border-black/10">
                          <div className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center font-bold text-[10px] shrink-0">
                            PDF
                          </div>
                          <div className="flex-1 truncate">
                            <p className="font-bold text-[11px] truncate">{m.fileAttachment.name}</p>
                            <p className="text-[9px] text-gray-500 font-mono">{m.fileAttachment.size}</p>
                          </div>
                        </div>
                      )}

                      {/* Message Content */}
                      <div className="whitespace-pre-line leading-relaxed text-[12px]">
                        {m.text}
                      </div>

                      {/* Embedded Audio Briefing Note */}
                      {m.hasAudio && m.audioScript && (
                        <div className="mt-2 pt-2 border-t border-gray-200 bg-amber-50/60 p-2.5 rounded border border-amber-200/60 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-amber-900 uppercase flex items-center gap-1">
                              <Volume2 size={12} /> Awaaz Vernacular Voice Briefing
                            </span>
                            <span className="text-[9px] font-mono text-gray-500">0:45s</span>
                          </div>

                          <button
                            onClick={() => playVoiceNote(m.audioScript!, m.id)}
                            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-[#075E54] hover:bg-[#064e46] text-white rounded font-mono text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            {isPlayingAudio === m.id ? (
                              <>
                                <Pause size={13} />
                                <span>Pause Reassuring Voice Note</span>
                              </>
                            ) : (
                              <>
                                <Play size={13} />
                                <span>Play Reassuring Voice Note ({selectedLanguage})</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Timestamp & Ticks */}
                      <div className="flex items-center justify-end gap-1 text-[9px] text-gray-400 font-mono pt-0.5">
                        <span>{m.timestamp}</span>
                        {isUser && <CheckCheck size={12} className="text-[#34B7F1]" />}
                      </div>
                    </div>
                  </div>
                )
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg p-2.5 shadow-xs text-xs font-mono text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-green-600 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-green-600 animate-bounce [animation-delay:0.4s]"></span>
                    <span>VyapaarSathi AI is analyzing statutory notice...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* WHATSAPP INPUT BAR */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (inputText.trim()) handleSendNotice('custom', inputText)
              }}
              className="bg-[#F0F2F5] px-3 py-2.5 border-t border-gray-300 flex items-center gap-2 shrink-0"
            >
              <button
                type="button"
                onClick={() => handleSendNotice('drc-01')}
                title="Attach PDF Notice"
                className="text-gray-500 hover:text-ink p-1.5 rounded-full hover:bg-gray-200 cursor-pointer"
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                placeholder="Type your notice query or paste text..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-[#075E54]"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-[#075E54] hover:bg-[#064e46] disabled:opacity-40 text-white p-2 rounded-full cursor-pointer transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
