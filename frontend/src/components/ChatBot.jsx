import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, MessageCircle, Send, X } from 'lucide-react'
import { sendMessage } from '../services/chatService'

const CHIPS = ['Book appointment', 'Find a doctor', 'Symptoms help']
const GREETING = { role: 'bot', text: 'Hi! I am the Prescripto assistant. How can I help today?' }

const ChatBot = () => {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(true)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const panelRef = useRef(null)
  const launcherRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector('input')?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); launcherRef.current?.focus(); return }
      if (e.key !== 'Tab') return
      const items = panelRef.current?.querySelectorAll('button:not([disabled]), input')
      if (!items?.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const send = async (text) => {
    const value = text.trim()
    if (!value || typing) return
    setMessages((m) => [...m, { role: 'user', text: value }])
    setInput('')
    setTyping(true)
    const reply = await sendMessage(value)
    setTyping(false)
    setMessages((m) => [...m, reply])
  }

  const toggle = () => { setOpen((o) => !o); setUnread(false) }

  return (
    <div className='fixed bottom-5 right-5 z-50'>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role='dialog'
            aria-label='Chat assistant'
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className='mb-3 flex h-[460px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'
          >
            <div className='flex items-center justify-between bg-primary px-4 py-3 text-white'>
              <div className='flex items-center gap-2'>
                <Bot size={20} />
                <div>
                  <p className='text-sm font-medium leading-tight'>Prescripto Assistant</p>
                  <p className='text-xs text-white/80'>Demo mode</p>
                </div>
              </div>
              <button type='button' aria-label='Minimize chat' onClick={toggle} className='rounded p-1 hover:bg-white/20'><X size={18} /></button>
            </div>

            <div className='flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 text-sm' aria-live='polite'>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p className={`max-w-[80%] rounded-2xl px-3 py-2 ${m.role === 'user' ? 'rounded-br-sm bg-primary text-white' : 'rounded-bl-sm border border-slate-200 bg-white text-gray-700'}`}>{m.text}</p>
                </div>
              ))}
              {typing && (
                <div className='flex justify-start' aria-label='Assistant is typing'>
                  <p className='flex gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3 py-3'>
                    {[0, 1, 2].map((d) => (
                      <motion.span key={d} className='h-1.5 w-1.5 rounded-full bg-gray-400' animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }} />
                    ))}
                  </p>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className='flex flex-wrap gap-2 border-t border-slate-200 bg-white px-3 pt-3'>
              {CHIPS.map((chip) => (
                <button key={chip} type='button' onClick={() => send(chip)} className='rounded-full border border-primary/40 px-3 py-1 text-xs text-primary hover:bg-indigo-50'>{chip}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input) }} className='flex items-center gap-2 bg-white p-3'>
              <input value={input} onChange={(e) => setInput(e.target.value)} aria-label='Message' placeholder='Type a message' className='flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none' />
              <button type='submit' aria-label='Send message' disabled={!input.trim() || typing} className='rounded-full bg-primary p-2.5 text-white disabled:opacity-50'><Send size={16} /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='flex justify-end'>
        <button
          ref={launcherRef}
          type='button'
          onClick={toggle}
          aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
          aria-expanded={open}
          title='Chat with us'
          className='relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105'
        >
          {open ? <X size={24} /> : <MessageCircle size={24} />}
          {unread && !open && (
            <span className='absolute right-0 top-0 flex h-3.5 w-3.5'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75 motion-reduce:animate-none'></span>
              <span className='relative inline-flex h-3.5 w-3.5 rounded-full bg-rose-500'></span>
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default ChatBot
