const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;

// Mime types helper mapping
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

// Scan network interfaces to find local IPv4 address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  // Prioritize active Wi-Fi and Ethernet interfaces
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const interfaceName = name.toLowerCase();
        if (interfaceName.includes('wi-fi') || interfaceName.includes('ethernet') || interfaceName.includes('wlan') || interfaceName.includes('local area connection')) {
          return iface.address;
        }
      }
    }
  }
  
  // Fallback to first found non-internal IPv4
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse URL path
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') {
    reqPath = '/index.html';
  }
  
  // Custom config API endpoint to expose detected local IP and port
  if (reqPath === '/config') {
    const data = JSON.stringify({
      ip: getLocalIPAddress(),
      port: PORT
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
    return;
  }
  
  // Resolve physical file path
  const filePath = path.join(__dirname, reqPath);
  
  // Ensure the requested file path stays inside the project directory (security check)
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // File not found
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File Not Found');
      return;
    }
    
    // Read and serve file
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  const ip = getLocalIPAddress();
  console.log(`===================================================`);
  console.log(` Sir J.C. Bose Hall Memorial Dev Server Active!`);
  console.log(` Serving files locally:  http://localhost:${PORT}`);
  console.log(` Serving on network:    http://${ip}:${PORT}`);
  console.log(`===================================================`);
});
