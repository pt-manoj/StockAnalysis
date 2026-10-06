import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndBroadcastData, getLatest, isSector, watchSector, unwatchSector } from './services/dataService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;
const CLIENT_DIST = process.env.CLIENT_DIST || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '');

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

/*const corsOptions = CLIENT_URL ? { origin: CLIENT_URL.split(','), methods: ['GET', 'POST'] } : undefined;
const io = new Server(httpServer, { cors: corsOptions });
if (corsOptions) app.use(cors(corsOptions));

io.on('connection', (socket) => {
  const snapshot = getLatest();
  if (snapshot) socket.emit('data-update', snapshot);

  let watching = null;
  const stopWatching = () => {
    if (watching) unwatchSector(watching);
    watching = null;
  };

  socket.on('watch-sector', (name) => {
    stopWatching();
    if (isSector(name)) {
      watching = name;
      watchSector(name);
    }
  });
  socket.on('unwatch-sector', stopWatching);
  socket.on('disconnect', stopWatching);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', lastUpdate: getLatest()?.timestamp ?? null });
});

app.use(express.static(CLIENT_DIST, { index: false, maxAge: '1h' }));
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(CLIENT_DIST, 'index.html'), (err) => {
    if (err) res.status(404).send('Client build not found');
  });
});

const POLL_MS = 3000;
let pollTimer;

async function poll() {
  try {
    await fetchAndBroadcastData(io);
  } catch (error) {
    console.error('Poll failed:', error.message);
  }
  pollTimer = setTimeout(poll, POLL_MS);
}
*/
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  poll();
});

function shutdown() {
  clearTimeout(pollTimer);
  io.close();
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
