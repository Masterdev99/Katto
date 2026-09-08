# System Update Platform - Architecture

## High-Level Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE ECOSYSTEM                         │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐   │
│  │ PAGES            │  │ WORKERS          │  │ R2             │   │
│  │ (Landing Page)   │  │ (API Webhook)    │  │ (File Storage) │   │
│  │                  │  │                  │  │                │   │
│  │ - OS Detection   │  │ - POST webhook   │  │ - Windows ZIP  │   │
│  │ - Auto-download  │  │ - Send Telegram  │  │ - macOS ZIP    │   │
│  │ - 10KB HTML      │  │ - Log events     │  │ - ~50MB each   │   │
│  └──────────────────┘  └──────────────────┘  └────────────────┘   │
│         ↑                      ↑                       ↓            │
│         └──────────────────────┴───────────────────────┘            │
│                           ↓                                         │
└────────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────────┐
│                    USER'S LOCAL COMPUTER                            │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Step 1: Download ZIP                                        │  │
│  │ - Browser visits landing page                               │  │
│  │ - JavaScript detects OS                                     │  │
│  │ - Downloads appropriate ZIP from R2                         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                            ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Step 2: Extract & Run Script                                │  │
│  │ - User manually extracts ZIP                                │  │
│  │ - Windows: Double-click .vbs or run via cmd                │  │
│  │ - macOS: Run "bash script.sh" in Terminal                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                            ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Step 3: Update Installation                                 │  │
│  │ - Script displays progress to user                          │  │
│  │ - Performs system update logic                              │  │
│  │ - Shows completion message                                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                            ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ Step 4: Send Webhook Notification                           │  │
│  │ - Script makes HTTP POST to Cloudflare Worker               │  │
│  │ - Sends: system type, timestamp, version, user ID           │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────────┐
│                      TELEGRAM BOT API                               │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Receives notification from Cloudflare Worker                 │ │
│  │ Sends message to your Telegram chat                          │ │
│  │ You receive alert on your phone/device                       │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Cloudflare Pages - Landing Page

**What it does:**
- Hosts the HTML landing page
- Detects user's OS from User-Agent header
- Provides download button for appropriate ZIP file
- Styled as system update notification

**Technology:**
- Static HTML + CSS + JavaScript
- No backend needed
- Fast CDN delivery globally

**Key Files:**
- `index.html` - The landing page

**Deployment:**
- Via Cloudflare Pages (Git or direct upload)
- URL: `https://system-update-XXXX.pages.dev`

**Performance:**
- Page load: < 100ms
- Cached globally on Cloudflare CDN
- ~10KB total size

---

### 2. Cloudflare R2 - File Storage

**What it does:**
- Stores Windows update ZIP file
- Stores macOS update ZIP file
- Serves downloads to users

**Technology:**
- S3-compatible object storage
- Globally distributed
- Configurable caching

**Files Stored:**
```
system-updates/
├── windows-update.zip       (~50MB)
│   └── windows-update.vbs    (update script)
│
└── mac-update.zip           (~50MB)
    └── mac-update.sh        (update script)
```

**Access:**
- Public URLs: `https://system-updates.{ACCOUNT}.r2.cloudflarestorage.com/{filename}`
- Can use custom domain
- Downloads are fast due to caching

**Costs:**
- $0.015/GB stored per month
- Egress charges apply (~$0.02/GB)
- Free tier covers small deployments

---

### 3. Cloudflare Workers - API Backend

**What it does:**
- Receives webhook notifications from update scripts
- Validates incoming data
- Sends notifications to Telegram Bot API
- Logs events (optional, using KV)

**Technology:**
- Serverless JavaScript runtime
- Global edge distribution
- Sub-millisecond latency

**Endpoints:**

```
POST /webhook/update-complete
├─ Receives: { system, timestamp, version, userId }
├─ Validates input
├─ Calls Telegram API
└─ Returns: { success: true/false, message: "..." }

GET /health
└─ Returns: { status: "ok" }
```

**Request Flow:**

```
windows-update.vbs / mac-update.sh
         ↓
    [HTTP POST]
         ↓
Cloudflare Worker
    ↓ validate ↓ send to Telegram
Telegram Bot API
         ↓
   Your Chat
```

**Performance:**
- Webhook processing: ~50ms average
- Telegram API call: ~200-500ms
- Total: < 1 second response time

**Deployment:**
- Via Wrangler CLI
- URL: `https://system-update-handler.{ACCOUNT}.workers.dev`

---

### 4. VBS Script (Windows)

**What it does:**
- Runs on Windows user's computer after extraction
- Displays update progress UI
- Simulates/runs actual update process
- Sends webhook notification when complete
- Handles errors gracefully

**Language:** VBScript (Windows native)

**Execution:**
- Double-click to run
- Can be run via Command Prompt
- May require admin privileges

**Flow:**
```
1. Display initial notification
   └─ "System Update v2.0.0 ready to install"

2. Run update process
   ├─ Step 1: Pre-flight checks
   ├─ Step 2: Download components
   ├─ Step 3: Install updates
   └─ Step 4: Verify installation

3. Send webhook notification
   └─ POST to Worker API with details

4. Show completion message
   └─ "Update complete - System v2.0.0"
```

**Key Features:**
- Error handling with logging
- Silent notification sending (doesn't block user)
- Reads computer name for tracking
- Timestamps all events

**Data Sent:**
```json
{
  "system": "Windows",
  "timestamp": "2024-01-15 10:30:45",
  "version": "2.0.0",
  "userId": "COMPUTER-NAME"
}
```

---

### 5. Shell Script (macOS)

**What it does:**
- Runs on macOS user's computer after extraction
- Displays colorful progress output in Terminal
- Runs actual update process
- Shows native macOS notifications
- Sends webhook notification when complete

**Language:** Bash Shell Script

**Execution:**
```bash
chmod +x mac-update.sh
bash mac-update.sh
```

**Flow:**
```
1. Display header with ASCII art
   └─ System Update v2.0.0

2. Show native macOS notification
   └─ Uses osascript to display system alert

3. Run update steps
   ├─ Step 1: Pre-flight checks
   ├─ Step 2: Prepare components
   ├─ Step 3: Install update
   └─ Step 4: Verify installation

4. Send webhook notification
   └─ POST to Worker API using curl

5. Show completion summary
   ├─ Computer name
   ├─ User name
   └─ Timestamp
```

**Key Features:**
- Color-coded output (blue, green, yellow)
- Progress indicators
- Native macOS notifications
- Comprehensive error handling
- Logs to ~/Library/Logs/system-update.log

**Data Sent:**
```json
{
  "system": "macOS",
  "timestamp": "2024-01-15T10:30:45Z",
  "version": "2.0.0",
  "userId": "current-username"
}
```

---

### 6. Telegram Bot API

**What it does:**
- Receives notifications from Cloudflare Worker
- Sends messages to your Telegram chat
- Provides real-time alerts

**Integration:**
- Bot Token from @BotFather
- Chat ID for your account/group
- HTTPS API calls from Worker

**Message Format:**
```
🪟 System Update Completed

Platform: Windows
Version: 2.0.0
User: WORKSTATION-ABC
Time: 2024-01-15 10:30:45

✅ Update installation successful on this machine.
```

**Cost:** Free

---

## Data Flow Diagram

### Complete Journey

```
USER VISITS LANDING PAGE
          ↓
    [Cloudflare Pages]
          ↓
   JavaScript Detects OS
          ↓
    [Windows/macOS?]
      ↙        ↘
 Windows      macOS
      ↓         ↓
  Download from R2
      ↓
[User's Computer]
      ↓
Extract ZIP & Run Script
      ↓
      ├─ windows-update.vbs  OR  mac-update.sh
      │
      ├─ Display Progress
      │
      ├─ Run Update Logic
      │
      ├─ Send HTTP POST to Worker
      │  ├─ System: Windows/macOS
      │  ├─ Timestamp: 2024-01-15 10:30:45
      │  ├─ Version: 2.0.0
      │  └─ User ID: Computer-Name
      │
      ↓
[Cloudflare Worker]
      ├─ Validate Request
      ├─ Build Telegram Message
      ├─ Call Telegram Bot API
      │
      ↓
[Telegram Bot API]
      ↓
[Your Telegram Chat]
      ↓
📱 🔔 "System Update Completed" Notification
```

## Security Architecture

### Data Flow Security

```
                SECURE CHANNELS
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Landing Page → R2 (HTTPS CDN)                     │
│  └─ No sensitive data, static files only           │
│                                                     │
│  Scripts → Worker (HTTPS)                          │
│  └─ POST with JSON payload                         │
│  └─ No credentials in script                       │
│  └─ Worker validates webhook source                │
│                                                     │
│  Worker → Telegram (HTTPS)                         │
│  └─ API call with bot token in headers             │
│  └─ Token never exposed to client                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### What's Exposed vs. Protected

**Public (OK to expose):**
- Landing page URL
- R2 bucket URLs (public access)
- R2 file content

**Secret (Never expose):**
- Telegram bot token → stored in Wrangler env
- Chat ID → stored in Wrangler env
- Worker URL → can be public but rate limited
- Webhook signing key (if added)

## Scalability

### Current Architecture Limits

- **Landing Page:** Unlimited (CDN cached)
- **R2 Storage:** Unlimited (pay as you go)
- **Workers:** 100,000 requests/day free, $0.50/million after
- **Telegram:** Bot API limits ~30 messages/second

### Scaling Considerations

For 10,000+ users downloading per day:
1. Add rate limiting to Worker
2. Consider KV for tracking users
3. Monitor Telegram API rate limits
4. Use R2 cache headers for ZIP files

---

## Technology Stack Summary

| Component | Technology | Provider | Cost |
|-----------|-----------|----------|------|
| Landing Page | HTML/CSS/JS | Cloudflare Pages | Free |
| API Backend | JavaScript | Cloudflare Workers | Free-$5/month |
| File Storage | S3 Compatible | Cloudflare R2 | Pay as you go (~$1-10/month) |
| Updates (Windows) | VBScript | Local execution | Free |
| Updates (macOS) | Bash Shell | Local execution | Free |
| Notifications | Telegram Bot API | Telegram | Free |

**Total Monthly Cost:** ~$5-15 (mostly egress from R2)

---

## Alternative Architectures

### Option 1: Add Analytics Dashboard
```
Worker → KV Store → Dashboard (Pages)
```
Track all update events with timestamps and user IDs.

### Option 2: Add Version Management
```
Database → Query for latest version
Script → Check version before downloading
```
Allow multiple versions to be available.

### Option 3: Add User Authentication
```
Landing Page → Auth endpoint → Gated downloads
```
Restrict who can download updates.

---

For more details, see `README.md` and deployment instructions.
