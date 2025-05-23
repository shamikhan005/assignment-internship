import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { initSocketServer } from './src/server/socketio';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

   const io = new SocketIOServer(server, {
    path: '/socket.io/',
  });

  initSocketServer(io as any);

  server.listen(3000, (err?: Error) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
