const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 5001, host: '0.0.0.0' }); // Bind to all interfaces

server.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });
  });

  ws.on('close', () => console.log('Client disconnected'));
});

console.log('WebSocket server running on ws://0.0.0.0:5000');