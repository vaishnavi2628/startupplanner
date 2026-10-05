import { useEffect, useRef, useState } from 'react';
import api, { errMsg } from '../api.js';
import Alert from './Alert.jsx';

const SUGGESTIONS = [
  'How can I get my first 10 customers?',
  'What is the biggest risk in my plan?',
  'How could I start with half the budget?',
];

export default function ChatPanel({ planId, initial = [] }) {
  const [messages, setMessages] = useState(initial);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, busy]);

  async function send(q) {
    const message = (q ?? text).trim();
    if (!message || busy) return;
    setError(''); setText(''); setBusy(true);
    setMessages((m) => [...m, { role: 'user', content: message }]);
    try {
      const { data } = await api.post(`/plans/${planId}/chat`, { message });
      setMessages(data.chat);
    } catch (e) {
      setError(errMsg(e));
      setMessages((m) => m.slice(0, -1));
      setText(message);
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    if (!window.confirm('Clear this conversation?')) return;
    await api.delete(`/plans/${planId}/chat`);
    setMessages([]);
  }

  return (
    <div className="flex h-[560px] max-h-[80vh] flex-col rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h3 className="font-bold">Ask about this plan</h3>
          <p className="text-xs text-muted">Answers use your idea, budget and analysis.</p>
        </div>
        {messages.length > 0 && <button onClick={clear} className="text-xs font-semibold text-muted hover:text-rose">Clear</button>}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted">Try asking:</p>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="block w-full rounded-lg border border-line px-3 py-2 text-left text-sm hover:border-pine hover:text-pine">{s}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${m.role === 'user' ? 'rounded-br-sm bg-pine text-white' : 'rounded-bl-sm bg-paper'}`}>{m.content}</div>
          </div>
        ))}
        {busy && <div className="text-sm text-muted">Thinking…</div>}
        <div ref={endRef} />
      </div>

      <div className="space-y-2 border-t border-line p-3">
        <Alert>{error}</Alert>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a question" maxLength={1000} aria-label="Your question" />
          <button className="btn-primary" disabled={busy || !text.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
}
