const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = Number(process.env.PORT) || 3000;
const root = __dirname;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  let requestedPath = req.url === '/' ? '/index.html' : req.url;
  requestedPath = decodeURIComponent(requestedPath.split('?')[0]);
  const filePath = path.join(root, requestedPath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server Error');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${DEFAULT_PORT} is busy. Trying ${DEFAULT_PORT + 1}...`);
    server.listen(DEFAULT_PORT + 1, () => {
      console.log(`Frontend server running on http://localhost:${DEFAULT_PORT + 1}`);
    });
  } else {
    throw error;
  }
});

server.listen(DEFAULT_PORT, () => {
  console.log(`Frontend server running on http://localhost:${DEFAULT_PORT}`);
});
