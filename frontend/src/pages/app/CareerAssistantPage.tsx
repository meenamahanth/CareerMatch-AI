import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { careerAssistantApi } from '../../api/careerAssistant'
import { resumeApi } from '../../api/resume'
import { formatErrorMessage } from '../../api/client'
import type { ResumeResponse } from '../../api/types'

type Message = { role: 'user' | 'assistant'; content: string }

export default function CareerAssistantPage() {
  const { token, user, profile } = useAuth()
  const [resume, setResume] = useState<ResumeResponse | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [contextLoading, setContextLoading] = useState(true)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    resumeApi.list(token)
      .then(response => { if (!cancelled) setResume(response.resumes?.[0] ?? null) })
      .catch(() => { if (!cancelled) setResume(null) })
      .finally(() => { if (!cancelled) setContextLoading(false) })
    return () => { cancelled = true }
  }, [token])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, loading])

  async function send(event: FormEvent) {
    event.preventDefault()
    const prompt = draft.trim()
    if (!prompt || !token || loading) return
    const history = messages.slice(-10)
    setMessages(current => [...current, { role: 'user', content: prompt }])
    setDraft('')
    setError('')
    setLoading(true)
    try {
      const response = await careerAssistantApi.chat({ message: prompt, conversation_history: history }, token)
      setMessages(current => [...current, { role: 'assistant', content: response.answer }])
    } catch (err) {
      setError(formatErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const skills = resume?.extracted_data?.skills ?? []

  return (
    <div className="assistant-workspace">
      <header className="assistant-heading">
        <div><p className="label-accent">CAREER INTELLIGENCE</p><h1 className="headline-lg">Career Assistant</h1><p className="body-md">A grounded conversation about your next career move.</p></div>
        <span className="assistant-status"><span /> GROQ AI</span>
      </header>
      <div className="assistant-layout">
        <section className="assistant-conversation" aria-label="Career Assistant conversation">
          <div className="assistant-messages" aria-live="polite">
            {messages.length === 0 && <div className="assistant-welcome"><span className="assistant-mark">✳</span><h2>What would you like to work through?</h2><p>Ask about your resume, a role you are targeting, interview preparation, or how to build a skill.</p><div className="assistant-prompts">{['How can I strengthen my profile?', 'Help me prepare for an ML interview', 'What should I focus on next?'].map(prompt => <button type="button" key={prompt} onClick={() => setDraft(prompt)}>{prompt}<span>↗</span></button>)}</div></div>}
            {messages.map((message, index) => <article className={`assistant-message assistant-message-${message.role}`} key={`${message.role}-${index}`}><span className="assistant-message-label">{message.role === 'user' ? 'YOU' : 'CAREER MATCH AI'}</span><p>{message.content}</p></article>)}
            {loading && <article className="assistant-message assistant-message-assistant"><span className="assistant-message-label">CAREER MATCH AI</span><p className="assistant-thinking">Thinking through your question…</p></article>}
            <div ref={endRef} />
          </div>
          {error && <div className="assistant-error" role="alert">{error} <button type="button" onClick={() => setError('')}>Dismiss</button></div>}
          <form className="assistant-composer" onSubmit={send}><label className="sr-only" htmlFor="assistant-prompt">Ask Career Match AI</label><textarea id="assistant-prompt" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} placeholder="Ask Career Match AI anything…" rows={2} disabled={loading} /><div className="assistant-composer-footer"><span>Enter to send · Shift + Enter for a new line</span><button type="submit" disabled={!draft.trim() || loading} aria-label="Send message">{loading ? '…' : 'Send'} <span>↗</span></button></div></form>
        </section>
        <aside className="assistant-context"><p className="label-sm">YOUR CONTEXT</p><h2>Personalized to you</h2><div className="assistant-context-item"><span>PROFILE</span><strong>{user?.name ?? 'Your profile'}</strong><small>{profile ? 'Profile ready' : 'Add profile details for tailored guidance'}</small></div><div className="assistant-context-item"><span>RESUME</span><strong>{contextLoading ? 'Checking…' : resume ? 'Analyzed' : 'Not uploaded'}</strong><small>{resume?.filename ?? 'Upload a resume to ground career advice'}</small></div><div className="assistant-context-item"><span>TOP SKILLS</span>{skills.length ? <div className="assistant-skill-list">{skills.slice(0, 6).map(skill => <span key={skill}>{skill}</span>)}</div> : <small>Skills will appear after resume analysis</small>}</div><p className="assistant-privacy">Your answers are generated by the Career Match AI backend and use your available profile context.</p></aside>
      </div>
    </div>
  )
}
