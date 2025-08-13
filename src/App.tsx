
import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useWebSocket, type ChatMessage } from './hooks/useWebSocket'

function App() {
  const wsUrl = useMemo(() => {
    const host = window.location.hostname
    const port = 3001
    return `ws://${host}:${port}`
  }, [])

  const { isConnected, messages, sendMessage, setName, myUserId } = useWebSocket({ url: wsUrl })
  const [input, setInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  return (
    <div className='App' style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h2>WS Chat</h2>
      <div style={{ marginBottom: 8 }}>
        Status: <strong>{isConnected ? 'Connected' : 'Disconnected'}</strong>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!nameInput.trim()) return
          setName(nameInput)
        }}
        style={{ display: 'flex', gap: 8, marginBottom: 12 }}
      >
        <input
          type='text'
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder='Set your username'
          style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button type='submit' disabled={!isConnected || !nameInput.trim()} style={{ padding: '8px 12px' }}>
          Save name
        </button>
      </form>
      <div
        ref={listRef}
        style={{
          border: '1px solid #ccc',
          borderRadius: 8,
          height: 360,
          overflowY: 'auto',
          padding: 12,
          background: '#fafafa'
        }}
      >
        {messages.map((m: ChatMessage, idx: number) => (
          <div key={idx} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(m.createdAt).toLocaleTimeString()}</div>
            <div>
              {m.type === 'system' ? (
                <em style={{ color: '#666' }}>{m.text}</em>
              ) : (
                <span>
                  <strong style={{ color: m.userId && myUserId && m.userId === myUserId ? '#ff9800' : '#1976d2' }}>
                    {m.username ?? m.userId ?? 'anon'}
                  </strong>: {m.text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Type a message...'
          style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button type='submit' disabled={!isConnected || !input.trim()} style={{ padding: '10px 16px' }}>
          Send
        </button>
      </form>
    </div>
  )
}

export default App
