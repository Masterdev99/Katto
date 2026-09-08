# Quick Reference Card

Keep this handy during deployment.

---

## Essential URLs

```
Cloudflare Dashboard:     https://dash.cloudflare.com
Telegram @BotFather:     https://t.me/botfather
Telegram getUpdates:     https://api.telegram.org/bot{TOKEN}/getUpdates
Cloudflare Pages:        https://dash.cloudflare.com/pages
Cloudflare R2:           https://dash.cloudflare.com/r2
```

---

## Credentials to Collect

```
Telegram Bot Token:      6123456789:_________________________
Telegram Chat ID:        123456789
Cloudflare Account ID:   _________________________
R2 Bucket Name:          system-updates
Worker URL:              https://system-update-handler.{ACCOUNT}.workers.dev
Pages URL:               https://system-update-XXXX.pages.dev
R2 Base URL:             https://system-updates.{ACCOUNT}.r2.cloudflarestorage.com
```

---

## Files to Update

### 1️⃣ wrangler.toml
```toml
[env.production]
vars = { 
  TELEGRAM_BOT_TOKEN = "{TOKEN}",
  TELEGRAM_CHAT_ID = "{CHAT_ID}"
}
```

### 2️⃣ index.html (line ~180)
```javascript
const baseUrl = 'https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com';
```

### 3️⃣ windows-update.vbs (line 18)
```vbscript
Const WEBHOOK_URL = "https://system-update-handler.{ACCOUNT}.workers.dev/webhook/update-complete"
```

### 4️⃣ mac-update.sh (line 12)
```bash
WEBHOOK_URL="https://system-update-handler.{ACCOUNT}.workers.dev/webhook/update-complete"
```

---

## 10-Minute Setup

```bash
# 1. Deploy Worker
wrangler deploy --env production
# → Copy Worker URL

# 2. Update scripts with Worker URL
# Edit files above (3 & 4)

# 3. Recreate ZIPs with updated scripts
zip windows-update.zip scripts/windows-update.vbs
zip mac-update.zip scripts/mac-update.sh

# 4. Upload to R2 via Cloudflare dashboard

# 5. Deploy landing page to Pages
# (Via dashboard or git)

# 6. Test API
curl -X POST {WORKER_URL}/webhook/update-complete \
  -H "Content-Type: application/json" \
  -d '{"system":"Windows","timestamp":"2024-01-15 10:30:00","version":"2.0.0","userId":"test"}'

# 7. Check Telegram for notification ✓
```

---

## File Locations

```
Project Root:
├── index.html              ← Update R2 URL
├── wrangler.toml           ← Update credentials
├── package.json
├── README.md               ← Full docs
├── QUICKSTART.md           ← Deployment guide
├── DEPLOYMENT_CHECKLIST.md ← Progress tracker
├── src/
│   └── index.js            ← Worker code
└── scripts/
    ├── windows-update.vbs  ← Update Worker URL
    └── mac-update.sh       ← Update Worker URL
```

---

## Critical Configuration Values

| Name | Example | Where Used |
|------|---------|-----------|
| Bot Token | `6123456789:ABCD...` | wrangler.toml |
| Chat ID | `987654321` | wrangler.toml |
| Account ID | `abc123xyz` | index.html, scripts |
| Worker URL | `https://system-update-handler.abc123.workers.dev` | index.html, scripts |
| R2 URL | `https://system-updates.abc123.r2.cloudflarestorage.com` | index.html |

---

## Command Reference

### Telegram Bot Setup
```bash
# Test bot endpoint
curl -X POST https://api.telegram.org/bot{TOKEN}/getMe

# Send test message
curl -X POST https://api.telegram.org/bot{TOKEN}/sendMessage \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"{CHAT_ID}","text":"Hello"}'

# Get updates
curl https://api.telegram.org/bot{TOKEN}/getUpdates
```

### Cloudflare Workers
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler deploy --env production

# View logs
wrangler tail --env production

# Test webhook
curl -X POST https://system-update-handler.{ACCOUNT}.workers.dev/webhook/update-complete \
  -H "Content-Type: application/json" \
  -d '{"system":"Windows","timestamp":"2024-01-15 10:30:00","version":"2.0.0","userId":"test-user"}'
```

### ZIP File Creation
```bash
# Windows
zip windows-update.zip scripts/windows-update.vbs

# macOS
chmod +x scripts/mac-update.sh
zip mac-update.zip scripts/mac-update.sh
```

---

## Success Checklist

After each phase, verify:

```bash
# Phase 1: Telegram
☐ Received test message from bot

# Phase 2: Cloudflare
☐ R2 bucket created
☐ Found Account ID

# Phase 3-4: Files
☐ ZIPs created and uploaded to R2
☐ URLs accessible in browser

# Phase 5: Config
☐ Updated all 4 files
☐ Credentials added to wrangler.toml

# Phase 6: Worker
☐ Wrangler deployed successfully
☐ Got Worker URL

# Phase 7: Scripts
☐ Updated script files
☐ Recreated ZIPs
☐ Re-uploaded to R2

# Phase 8: Pages
☐ Landing page deployed
☐ Got Pages URL
☐ Page loads in browser

# Phase 9: Testing
☐ Curl test to Worker succeeds
☐ Telegram notification received
☐ Landing page shows correct OS
☐ Download buttons work
```

---

## Common Mistakes ⚠️

| Mistake | Solution |
|---------|----------|
| Forgot to update R2 URL | Update index.html line ~180 |
| Forgot to update Worker URL in scripts | Re-create ZIPs and upload |
| Used wrong chat ID format | Must be number, not username |
| Bot token has spaces/typos | Copy carefully from BotFather |
| Didn't recreate ZIPs after updates | Delete old ones, create new |
| R2 bucket private | Make files public or check CORS |
| wrangler not found | `npm install -g wrangler` |
| Worker deploy fails | `wrangler login` first |

---

## Testing Steps (In Order)

```
1. Telegram Bot Test
   curl https://api.telegram.org/bot{TOKEN}/getMe
   Expected: "ok": true

2. R2 Bucket Test
   Visit R2 URLs in browser
   Expected: File downloads or preview

3. Worker Deploy
   wrangler deploy --env production
   Expected: Success message with URL

4. Worker API Test
   curl -X POST {WORKER_URL}/webhook/update-complete ...
   Expected: 200 OK with {"success": true}

5. Telegram Notification Test
   (Should receive after step 4)
   Expected: Message in your Telegram chat

6. Landing Page Test
   Visit Pages URL
   Expected: Page loads with correct OS detected

7. Download Test
   Click button on landing page
   Expected: ZIP file downloads
```

---

## Environment Variables (for reference)

Store these in your `.env` file (don't commit!):

```bash
TELEGRAM_BOT_TOKEN=6123456789:XXXXXXXXX
TELEGRAM_CHAT_ID=987654321
CLOUDFLARE_ACCOUNT_ID=abc123xyz
R2_BASE_URL=https://system-updates.abc123.r2.cloudflarestorage.com
WORKER_URL=https://system-update-handler.abc123.workers.dev
PAGES_URL=https://system-update-XXXX.pages.dev
```

---

## Useful Links

```
📖 Full Documentation:     README.md
🚀 Quick Start Guide:      QUICKSTART.md
📋 Deployment Progress:    DEPLOYMENT_CHECKLIST.md
🏗️  Architecture Details:  ARCHITECTURE.md
⚙️  Configuration Samples: CONFIG.SAMPLE.md
```

---

## Support Resources

| Issue | Resource |
|-------|----------|
| Telegram setup | @BotFather on Telegram |
| Cloudflare issues | https://community.cloudflare.com |
| Worker errors | `wrangler tail --env production` |
| VBS script help | Windows Script documentation |
| Bash script help | `man bash` or ShellCheck |

---

## Cost Estimate

```
Landing Page (Pages):      $0/month (free)
API (Workers):             $0-5/month
File Storage (R2):         ~$1-10/month (depends on usage)
Telegram Bot:              $0/month (free)
────────────────────────────────────────
Total:                     ~$1-15/month
```

---

## Remember

✅ Save all credentials in a safe place  
✅ Never commit `.env` file with secrets  
✅ Test each component before moving on  
✅ Keep backups of working configurations  
✅ Monitor logs: `wrangler tail --env production`  
✅ Check Telegram regularly for notifications  

---

**Last Updated:** 2024-01-15  
**Version:** 2.0.0
