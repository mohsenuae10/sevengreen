// Temporary server to serve SQL to browser for migration
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 7777;
const sqlFile = path.join(__dirname, 'migrations_only.sql');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  if (req.url === '/sql') {
    const sql = fs.readFileSync(sqlFile, 'utf8');
    res.writeHead(200);
    res.end(sql);
  } else {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Serving SQL at http://127.0.0.1:${PORT}/sql`);
});
