# In-App Chat — Setup Instructions
# TechnoLogs WebSocket Chat Feature

## Files summary
| File | Where to put it |
|---|---|
| V16__add_chat.sql | springboot/src/main/resources/db/migration/ |
| chat.php | php/api/chat.php |
| chat_server.php | php/chat_server.php |
| ChatWindow.jsx | react/src/components/shared/ChatWindow.jsx |
| CUSTOMER_CHANGES.jsx | read and apply to CustomerDashboard.jsx |
| TECHNICIAN_CHANGES.jsx | read and apply to TechnicianDashboard.jsx |

---

## Step 1 — Database
Copy V16__add_chat.sql to your Flyway migrations folder.
Flyway runs it automatically on next Spring Boot startup.

---

## Step 2 — PHP files
- Copy chat.php → php/api/chat.php
- Copy chat_server.php → php/chat_server.php

---

## Step 3 — Install Ratchet (WebSocket library)
Run this once inside your php/ folder:

  cd php
  composer require cboden/ratchet

---

## Step 4 — Add VITE_WS_URL to React env
In react/.env, add:

  VITE_WS_URL=ws://localhost:8080

---

## Step 5 — Start the WebSocket server
Open a terminal and run:

  cd php
  php chat_server.php

You will see:
  TechnoLogs Chat Server — ws://0.0.0.0:8080
  Press Ctrl+C to stop.

Keep this running while you develop.
For production, use Supervisor or PM2 to keep it alive permanently.

---

## Step 6 — Apply React changes
Follow the instructions in:
- CUSTOMER_CHANGES.jsx   → apply to react/src/pages/CustomerDashboard.jsx
- TECHNICIAN_CHANGES.jsx → apply to react/src/pages/TechnicianDashboard.jsx

Copy ChatWindow.jsx → react/src/components/shared/ChatWindow.jsx

---

## How it works after setup

CUSTOMER:
1. Goes to My Repairs (dashboard or repairs section)
2. Sees a "💬 Chat" button on any repair that has an assigned technician
3. Clicks it → ChatWindow opens as a modal overlay
4. Types a message → sent live via WebSocket
5. Sees typing indicator when technician is typing
6. Read receipts (✓ sent, ✓✓ read) on their messages

TECHNICIAN:
1. Sees "💬 Chat" button in every row of their repair tables
2. Also sees "💬 Chat with Customer" button inside the repair modal
3. Clicks either → ChatWindow opens
4. Same real-time experience

MESSAGES:
- Persisted in chat_messages table (PostgreSQL)
- History loaded on open (last 50 messages)
- One room per repair (auto-created on first open)
- Messages survive server restarts (loaded from DB on reconnect)

---

## Troubleshooting

Chat shows "Offline" / not connecting:
→ Make sure php chat_server.php is running
→ Check VITE_WS_URL in react/.env matches the port (8080)

Chat button not showing for customer:
→ The button only appears when technician_name is set on the repair
→ Owner must assign a technician first

"Access denied" error:
→ The customer must be the owner of that repair
→ The technician must be assigned to that repair