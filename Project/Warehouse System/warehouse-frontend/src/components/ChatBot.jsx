import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, Sparkles, RefreshCw, ShieldAlert } from 'lucide-react'
import { api } from '../services/api'
import './ChatBot.css'

const ROLE_COLORS = {
  admin: '#e74c3c', manager: '#8e44ad', supervisor: '#2980b9', staff: '#27ae60'
}
const ROLE_LABELS = {
  admin: 'Full Access', manager: 'Manager View',
  supervisor: 'Supervisor View', staff: 'Stock View Only'
}

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ChatBot({ user }) {
  const [open, setOpen]               = useState(false)
  const [messages, setMessages]       = useState([])
  const [input, setInput]             = useState('')
  const [streaming, setStreaming]     = useState(false)   // true while SSE is flowing
  const [suggestions, setSuggestions] = useState([])
  const [setupRequired, setSetupRequired] = useState(false)
  const [rateLimitMsg, setRateLimitMsg]   = useState('')
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const abortRef       = useRef(null)   // AbortController for cancelling stream

  const role  = user?.role || 'staff'
  const color = ROLE_COLORS[role]

  useEffect(() => {
    api.get('/chat/suggestions').then(d => setSuggestions(d.suggestions)).catch(() => {})
  }, [])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'bot',
        text: `👋 Hi **${user?.name}**! I'm the Stock Pilot AI assistant.\n\nAs a **${role}**, ${getRoleHint(role)}\n\nTry one of the suggestions below or ask anything!`,
        time: new Date(),
      }])
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getRoleHint = (r) => ({
    staff:      'you can ask about stock levels and item locations.',
    supervisor: 'you can ask about inventory and stock movements.',
    manager:    'you can ask about inventory, sales, revenue, and alerts.',
    admin:      'you have full access to all warehouse data.',
  }[r] || 'you can ask about stock levels.')

  // ── Streaming send ────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || streaming) return

    setInput('')
    setRateLimitMsg('')

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: msg, time: new Date() }])

    // Build Gemini-format history (skip the greeting)
    const history = messages
      .filter((m, i) => !(m.role === 'bot' && i === 0))
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }))

    // Add a blank bot message that we'll fill in via streaming
    const botMsgId = Date.now()
    setMessages(prev => [...prev, { role: 'bot', text: '', time: new Date(), id: botMsgId, streaming: true }])
    setStreaming(true)

    const token = localStorage.getItem('authToken')
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`${BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: msg, history }),
        signal: controller.signal,
      })

      // Handle non-2xx before streaming (e.g. 429, 400, 503)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))

        if (res.status === 429) {
          const wait = errData.retryAfter || 60
          setRateLimitMsg(`Rate limit reached — wait ${wait}s`)
          updateBotMsg(botMsgId, `⏱️ **Too many messages.** Please wait ${wait} seconds before sending another.`, true)
        } else if (errData.blocked) {
          updateBotMsg(botMsgId, `🛡️ **Message blocked by safety filter.**\n\nPlease ask a genuine warehouse question.`, true)
        } else if (errData.setupRequired) {
          setSetupRequired(true)
          updateBotMsg(botMsgId, '⚠️ **AI not configured yet.**\n\nAdd your Gemini API key to the backend `.env` file:\n```\nGEMINI_API_KEY=your_key_here\n```', true)
        } else {
          updateBotMsg(botMsgId, `❌ ${errData.message || 'Request failed.'}`, true)
        }
        return
      }

      // Read SSE stream
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const parsed = JSON.parse(line.slice(6))

            if (parsed.chunk) {
              // Append chunk to the streaming bot message
              setMessages(prev => prev.map(m =>
                m.id === botMsgId
                  ? { ...m, text: m.text + parsed.chunk }
                  : m
              ))
            }

            if (parsed.done) {
              // Mark streaming complete
              setMessages(prev => prev.map(m =>
                m.id === botMsgId ? { ...m, streaming: false } : m
              ))
            }

            if (parsed.error) {
              updateBotMsg(botMsgId, `❌ ${parsed.error}`, true)
            }
          } catch {}
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        updateBotMsg(botMsgId, '⏹️ Response stopped.', false)
      } else {
        updateBotMsg(botMsgId, '❌ Connection error. Please try again.', true)
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  const updateBotMsg = (id, text, isError) => {
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, text, isError, streaming: false } : m
    ))
  }

  const stopStream = () => {
    abortRef.current?.abort()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearChat = () => { setMessages([]); setRateLimitMsg(''); setTimeout(() => setOpen(true), 50) }

  // Render markdown-like formatting
  const renderText = (text) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>')

  return (
    <>
      {/* FAB */}
      <button
        className={`chat-fab ${open ? 'chat-fab-open' : ''}`}
        style={{ background: `linear-gradient(135deg, ${color}, #764ba2)` }}
        onClick={() => setOpen(!open)}
        title="Warehouse AI Assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && <span className="chat-fab-label">Ask AI</span>}
      </button>

      {/* Panel */}
      <div className={`chat-panel ${open ? 'chat-panel-open' : ''}`}>

        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-bot-avatar" style={{ background: `linear-gradient(135deg, ${color}, #764ba2)` }}>
              <Bot size={18} />
            </div>
            <div>
              <div className="chat-title">Stock Pilot AI</div>
              <div className="chat-subtitle">
                <span className="chat-role-dot" style={{ background: color }}></span>
                {ROLE_LABELS[role]}
              </div>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="chat-icon-btn" onClick={clearChat} title="New chat"><RefreshCw size={15} /></button>
            <button className="chat-icon-btn" onClick={() => setOpen(false)} title="Close"><X size={15} /></button>
          </div>
        </div>

        {/* Guardrail banner */}
        {rateLimitMsg && (
          <div className="chat-guardrail-banner">
            <ShieldAlert size={14} /> {rateLimitMsg}
          </div>
        )}

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'} ${msg.isError ? 'chat-msg-error' : ''}`}>
              {msg.role === 'bot' && (
                <div className="chat-msg-avatar bot-avatar" style={{ background: `linear-gradient(135deg, ${color}, #764ba2)` }}>
                  <Bot size={13} />
                </div>
              )}
              <div className="chat-bubble">
                <div
                  className="chat-bubble-text"
                  dangerouslySetInnerHTML={{ __html: renderText(msg.text) || '&nbsp;' }}
                />
                {msg.streaming && (
                  <span className="chat-cursor">▋</span>
                )}
                <div className="chat-bubble-time">
                  {msg.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="chat-msg-avatar user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && suggestions.length > 0 && (
          <div className="chat-suggestions">
            <div className="suggestions-label"><Sparkles size={12} /> Suggested questions</div>
            <div className="suggestions-list">
              {suggestions.slice(0, 3).map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={setupRequired ? 'Configure API key first...' : 'Ask about your warehouse...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={streaming}
          />
          {streaming ? (
            <button className="chat-stop-btn" onClick={stopStream} title="Stop generating">
              <span className="stop-icon"></span>
            </button>
          ) : (
            <button
              className="chat-send-btn"
              style={{ background: `linear-gradient(135deg, ${color}, #764ba2)` }}
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              title="Send"
            >
              <Send size={16} />
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="chat-footer-note">
          🛡️ Guardrails active · Streaming · Data from your live warehouse
        </div>
      </div>
    </>
  )
}
