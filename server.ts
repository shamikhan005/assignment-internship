import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './src/server/socketio';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    if (parsedUrl.pathname?.startsWith('/socket.io/')) {
      res.writeHead(200, {
        'Content-Type': 'text/plain',
      });
      res.end('Socket.IO server endpoint');
    } else {
      handle(req, res, parsedUrl);
    }
  });

  const io = initSocketServer(server);

  server.listen(3000, (err?: Error) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
