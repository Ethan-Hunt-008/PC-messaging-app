Cross-PC Messaging App
A real-time messaging application built with React, Vite, and WebSocket, enabling seamless communication between devices (macOS and Windows) over a local network or the internet. The app features a modern chat interface with message bubbles, timestamps, and a mode toggle for switching between local and internet connectivity.
Features

Real-Time Messaging: Send and receive messages instantly.
Dual Modes: Supports local network (ws://) and internet (wss://) communication.
Modern UI: Clean message bubbles with timestamps, smooth animations, no avatars.
Mode Toggle: Switch between local and internet modes via a dropdown.
Cross-Platform: Packaged as .dmg for macOS and .exe for Windows (universal build).

Requirements

Node.js: Version 18.x or higher (recommended: v18.17.0).
npm: Version 9.x or higher (included with Node.js).
Devices: Two macOS devices (e.g., MacBook Pro, MacBook Air) or Windows PCs for testing.
Internet Connection: Required for internet mode and Render deployment.
Git: For cloning the repository.
Render Account: For deploying the WebSocket server (internet mode).
Wine: Required on macOS for building Windows .exe.
Web Browser: For debugging with Dev Tools.

Project Structure
cross-pc-messaging-app/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   └── Chat.jsx    # Main chat UI component
│   │   └── index.js        # Entry point
│   ├── forge.config.js     # Electron Forge configuration
│   ├── vite.config.js      # Vite configuration
│   └── package.json        # Client dependencies
├── server/                 # WebSocket server
│   ├── index.js            # Server logic
│   └── package.json        # Server dependencies
└── README.md               # This file

Setup Instructions
1. Clone the Repository
git clone <your-github-repo-url>
cd cross-pc-messaging-app

2. Setup Server
Local Server

Navigate to the server directory:cd server


Install dependencies:npm install


Verify index.js (WebSocket server):const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 5000, host: '0.0.0.0' });

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



Internet Server (Render)

Push server folder to GitHub:cd server
git init
git add .
git commit -m "Initial server commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main


Deploy to Render:
Go to Render, create a new Web Service.
Connect your GitHub repo (server folder).
Configure:
Name: messaging-app-z07H
Runtime: Node
Start Command: npm start
Environment Variable: PORT=5000


Deploy and note the URL (e.g., https://messaging-app-z07H.onrender.com).
WebSocket URL: wss://messaging-app-z07H.onrender.com.



3. Setup Client

Navigate to the client directory:cd client


Install dependencies:npm install


Update src/pages/Chat.jsx with correct WebSocket URLs:
Local: Replace ws://192.168.1.100:5000 with your Mac's IP (ifconfig | grep inet).
Internet: Use your Render URL (e.g., wss://messaging-app-z07H.onrender.com).

const wsUrl = mode === 'local' ? 'ws://<your-mac-ip>:5000' : 'wss://messaging-app-z07H.onrender.com';



4. Build and Package
For macOS (.dmg)

Build the React app:npm run build


Package as a macOS app:npm run make


Find the .dmg:ls -la client/out/make


Expected: cross-pc-messaging-app-1.0.0-universal.dmg


Copy .dmg to the second Mac (e.g., via AirDrop or USB).
Install by opening .dmg and dragging to Applications.

For Windows (.exe)

Install Wine on macOS (for Windows builds):brew install wine


Install Windows maker:npm install --save-dev @electron-forge/maker-squirrel


Create/Update forge.config.js:module.exports = {
  packagerConfig: {
    asar: true,
    executableName: 'CrossPCMessagingApp'
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'CrossPCMessagingApp',
        setupExe: 'CrossPCMessagingApp-Setup.exe'
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO'
      }
    }
  ]
};


Build and package:npm run build
npm run make -- --platform=win32 --arch=x64


Find the .exe:ls -la client/out/make/squirrel.windows/x64


Expected: CrossPCMessagingApp-Setup.exe


Copy .exe to a Windows PC (e.g., via USB or Google Drive).

Running the App
Local Mode

Start the Server (on first Mac):cd server
npm start


Confirms: WebSocket server running on ws://0.0.0.0:5000.


Launch the App:
macOS: Open app from Applications.
Windows: Run CrossPCMessagingApp-Setup.exe to install, then launch.
Select "Local Network" from the dropdown.


Test Messaging:
Send a message from one device (e.g., "Local test!").
Verify it appears on the other device.
Reply and check on the first device.


Check Console:
Dev Tools (right-click > Inspect > Console or F12): Connected to WebSocket.
Server terminal: Client connected.



Internet Mode

Ensure Local Server is Off:
Stop the server (Ctrl+C in server terminal).


Launch the App:
macOS: Open app from Applications.
Windows: Open installed app.
Select "Internet" from the dropdown.


Test Messaging:
Send a message from one device (e.g., "Internet test!").
Verify it appears on the other device.
Reply and check on the first device.


Check Console:
Dev Tools: Connected to WebSocket.
Render Dashboard: Check logs for Client connected and message JSON.



Testing

Local Mode Test:
Ensure devices are on the same Wi-Fi.
Start server on the first Mac.
Select "Local Network" and send messages.
Verify: Messages appear with timestamps below bubbles, no avatars.


Internet Mode Test:
Stop local server.
Connect one device to a different network (e.g., mobile hotspot) for full verification.
Select "Internet" and send messages.
Verify: Messages appear via Render server, timestamps below bubbles.


Toggle Test:
Switch between "Local Network" and "Internet" modes.
Check Dev Tools for WebSocket disconnected and Connected to WebSocket.


Cross-Platform Test:
Test between macOS and Windows devices in both modes.
Verify consistent UI and messaging.



Troubleshooting

UI Not Updating:
Clear build cache:cd client
rm -rf dist out node_modules package-lock.json
npm install
npm run build
npm run make


Clear Electron cache: Dev Tools > Application > Clear Storage.


Local Mode Fails:
Verify server IP (ifconfig | grep inet).
Temporarily disable firewall:sudo defaults write /Library/Preferences/com.apple.alf globalstate -int 0


Re-enable:sudo defaults write /Library/Preferences/com.apple.alf globalstate -int 1






Internet Mode Fails:
Check Render logs (https://dashboard.render.com).
Verify WebSocket URL (wss://messaging-app-z07H.onrender.com).
Ensure PORT=5000 in Render environment variables.


Windows Build Fails:
Ensure Wine installed (wine --version).
Run with debug:DEBUG=electron-forge:* npm run make -- --platform=win32 --arch=x64




Messages Not Sending:
Check Dev Tools for errors (e.g., WebSocket connection failed).
Verify WebSocket server is running (local or Render).



License
MIT License. See LICENSE file for details.