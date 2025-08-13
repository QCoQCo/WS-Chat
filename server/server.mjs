import http from 'http';
import { WebSocketServer } from 'ws';

const PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket chat server is running.\n');
});

const wss = new WebSocketServer({ server });


//In-memory client registry. For simplicity, we keep a Set of sockets.
const clients = new Set();

function broadcast(jsonMessage, exceptSocket = null) {
  const messageString = JSON.stringify(jsonMessage);
  for (const socket of clients) {
    if (socket.readyState === 1 /* OPEN */ && socket !== exceptSocket) {
      socket.send(messageString);
    }
  }
}

function nowIso() {
  return new Date().toISOString();
}

wss.on('connection', (socket, request) => {
  clients.add(socket);

  const clientId = Math.random().toString(36).slice(2, 10);
  socket.clientId = clientId;
  socket.username = `user-${clientId}`;

  socket.send(
    JSON.stringify({ type: 'system', text: 'Welcome to WS chat!', createdAt: nowIso() })
  );

  // Send initial identification to the connected client
  socket.send(
    JSON.stringify({
      type: 'hello',
      userId: clientId,
      username: socket.username,
      createdAt: nowIso(),
    })
  );

  broadcast(
    { type: 'system', text: `${socket.username} joined`, createdAt: nowIso() },
    socket
  );

  socket.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed && parsed.type === 'message' && typeof parsed.text === 'string') {
        const outgoing = {
          type: 'message',
          text: parsed.text.slice(0, 2000),
          userId: clientId,
          username: socket.username,
          createdAt: nowIso(),
        };
        broadcast(outgoing);
      } else if (parsed && parsed.type === 'setName') {
        const rawName = typeof parsed.name === 'string' ? parsed.name : '';
        const next = rawName.trim().slice(0, 32);
        if (next.length > 0) {
          const prev = socket.username;
          socket.username = next;
          broadcast({ type: 'system', text: `${prev} is now ${next}`, createdAt: nowIso() });
        } else {
          socket.send(
            JSON.stringify({ type: 'system', text: 'Name must be non-empty', createdAt: nowIso() })
          );
        }
      }
    } catch (err) {
      socket.send(
        JSON.stringify({ type: 'system', text: 'Invalid message format', createdAt: nowIso() })
      );
    }
  });

  socket.on('close', () => {
    clients.delete(socket);
    broadcast({ type: 'system', text: `${socket.username} left`, createdAt: nowIso() });
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});


