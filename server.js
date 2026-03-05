// ============================================
// MORSE SPEL - WebSocket Relay Server
// ============================================
// Hoe het werkt:
//   1. Elke telefoon maakt een WebSocket verbinding met deze server
//   2. Zender stuurt { type:"press", team:1, state:"down" }
//   3. Server stuurt dat bericht door naar ALLE andere verbonden clients
//   4. Ontvangers reageren alleen op hun eigen team
//
// Installatie op Glitch.com:
//   - Maak nieuw project: glitch.com/new → "glitch-hello-node"
//   - Vervang server.js met deze code
//   - Voeg in package.json toe: "ws": "^8.0.0" onder dependencies
// ============================================

const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

// Maak een HTTP server (nodig voor Glitch/Replit)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Morse Spel Server actief ✓');
});

// Maak de WebSocket server bovenop de HTTP server
const wss = new WebSocket.Server({ server });

// Bijhouden hoeveel clients verbonden zijn
let clientCount = 0;

wss.on('connection', (socket) => {
  clientCount++;
  console.log(`Client verbonden. Totaal: ${clientCount}`);

  // Stuur bevestiging naar de nieuwe client
  socket.send(JSON.stringify({ type: 'connected', clients: clientCount }));

  // Als een bericht binnenkomt van één client...
  socket.on('message', (rawData) => {
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      return; // Ongeldig bericht, negeer
    }

    console.log(`Bericht van team ${data.team}: ${data.state}`);

    // Stuur het bericht door naar ALLE andere verbonden clients
    wss.clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  // Als een client de verbinding verbreekt
  socket.on('close', () => {
    clientCount--;
    console.log(`Client verbroken. Totaal: ${clientCount}`);
  });

  socket.on('error', (err) => {
    console.error('Socket fout:', err.message);
  });
});

server.listen(PORT, () => {
  console.log(`Morse server draait op poort ${PORT}`);
});
