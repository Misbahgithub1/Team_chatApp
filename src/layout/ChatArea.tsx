import { useState } from 'react'
import { useChat } from '../hooks/useChat'

type ChatAreaProps = {
  displayName?: string
  city?: string
  country?: string
}

export function ChatArea({ displayName, city, country }: ChatAreaProps) {
  const [draft, setDraft] = useState('')

  const { messages, isConnected, sendMessage } = useChat({
    roomId: 'general',
    displayName: displayName ?? '',
    city: city ?? '',
    country: country ?? '',
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!draft.trim()) return
    sendMessage(draft)
    setDraft('')
  }

  return (
    <div className="layout-panel layout-panel--chat scroll">
      <header className="layout-panel__header">
        <h2 className="layout-panel__title">Conversation</h2>
        <span className="badge bg-secondary border-0">
          {isConnected ? 'Live · general' : 'Reconnecting…'}
        </span>
      </header>

      <div className="layout-panel__body chat-layout">
        <div className="chat-layout__messages">
          <div className="message-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.fromSelf ? 'message--outgoing' : 'message--incoming'}`}
              >
                {!message.fromSelf && <div className="message__avatar" />}

                <div>
                  <div className="message__bubble">
                    {!message.fromSelf && (
                      <div className="message__meta" style={{ marginBottom: 4 }}>
                        {message.sender}
                      </div>
                    )}
                    {message.content}
                  </div>
                  <div className="message__meta">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {message.fromSelf ? ' · You' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="chat-layout__input">
          <form className="chat-input" onSubmit={handleSubmit}>
            <input
              className="chat-input__field"
              placeholder="Type a message or use /commands…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="chat-input__actions">
              <button type="submit" className="chat-input__button" disabled={!draft.trim()}>
                Send
              </button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  )
}

