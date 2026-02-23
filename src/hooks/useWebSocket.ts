import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type ChatMessage = {
    type: 'message' | 'system';
    text: string;
    userId?: string;
    username?: string;
    createdAt: string;
};

type HelloMessage = {
    type: 'hello';
    userId: string;
    username?: string;
    createdAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isHelloMessage(value: unknown): value is HelloMessage {
    if (!isRecord(value)) return false;
    return value.type === 'hello' && isString(value.userId);
}

function isChatMessage(value: unknown): value is ChatMessage {
    if (!isRecord(value)) return false;
    const hasType = value.type === 'message' || value.type === 'system';
    return hasType && isString(value.text ?? '') && isString(value.createdAt ?? '');
}

type UseWebSocketOptions = {
    url: string;
    autoReconnect?: boolean;
};

export function useWebSocket({ url, autoReconnect = true }: UseWebSocketOptions) {
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [myUserId, setMyUserId] = useState<string | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimerRef = useRef<number | null>(null);

    const connect = useCallback(() => {
        if (
            socketRef.current &&
            (socketRef.current.readyState === WebSocket.OPEN ||
                socketRef.current.readyState === WebSocket.CONNECTING)
        ) {
            return;
        }

        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const raw: unknown = JSON.parse(event.data as string);
                if (isHelloMessage(raw)) {
                    setMyUserId(raw.userId);
                    return;
                }
                if (isChatMessage(raw)) {
                    setMessages((prev) => [...prev, raw]);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            if (autoReconnect) {
                //exponential backoff
                const attempt = reconnectAttemptsRef.current + 1;
                reconnectAttemptsRef.current = attempt;
                const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
                if (reconnectTimerRef.current) {
                    window.clearTimeout(reconnectTimerRef.current);
                }
                reconnectTimerRef.current = window.setTimeout(() => connect(), delay);
            }
        };

        ws.onerror = () => {
            console.error('WebSocket error');
        };
    }, [url, autoReconnect]);

    const sendMessage = useCallback((text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const payload = { type: 'message', text: trimmed };
            socketRef.current.send(JSON.stringify(payload));
        }
    }, []);

    const setName = useCallback((name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const payload = { type: 'setName', name: trimmed } as const;
            socketRef.current.send(JSON.stringify(payload));
        }
    }, []);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimerRef.current) {
                window.clearTimeout(reconnectTimerRef.current);
            }
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connect]);

    return useMemo(
        () => ({ isConnected, messages, sendMessage, setName, myUserId }),
        [isConnected, messages, sendMessage, setName, myUserId],
    );
}
