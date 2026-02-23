import './App.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWebSocket, type ChatMessage } from './hooks/useWebSocket';

function App() {
    const wsUrl = useMemo(() => {
        const host = window.location.hostname;
        const port = 3001; //server port
        return `ws://${host}:${port}`;
    }, []);

    const { isConnected, messages, sendMessage, setName, myUserId } = useWebSocket({ url: wsUrl });
    const [input, setInput] = useState('');
    const [nameInput, setNameInput] = useState('');
    const listRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <div className='App app-container'>
            <h2>WS Chat</h2>
            <div className='status'>
                Status: <strong>{isConnected ? 'Connected' : 'Disconnected'}</strong>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!nameInput.trim()) return;
                    setName(nameInput);
                }}
                className='name-form'
            >
                <input
                    type='text'
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder='Set your username'
                    className='name-input'
                />
                <button
                    type='submit'
                    disabled={!isConnected || !nameInput.trim()}
                    className='name-save-btn'
                >
                    Save name
                </button>
            </form>
            <div ref={listRef} className='messages'>
                {messages.map((m: ChatMessage, idx: number) => (
                    <div key={idx} className='message-item'>
                        <div className='timestamp'>
                            {new Date(m.createdAt).toLocaleTimeString()}
                        </div>
                        <div>
                            {m.type === 'system' ? (
                                <em className='system-text'>{m.text}</em>
                            ) : (
                                <span>
                                    <strong
                                        className={
                                            m.userId && myUserId && m.userId === myUserId
                                                ? 'username username--self'
                                                : 'username'
                                        }
                                    >
                                        {m.username ?? m.userId ?? 'anon'}
                                    </strong>
                                    : {m.text}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={onSubmit} className='chat-form'>
                <input
                    type='text'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Type a message...'
                    className='chat-input'
                />
                <button
                    type='submit'
                    disabled={!isConnected || !input.trim()}
                    className='chat-send-btn'
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default App;
