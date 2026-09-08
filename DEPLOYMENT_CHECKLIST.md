# Deployment Checklist

Use this to track your progress setting up the System Update Platform.

---

## Phase 1: Telegram Bot Setup ⏱️ ~5 minutes

- [ ] Open Telegram app
- [ ] Search for @BotFather
- [ ] Create new bot: `/newbot`
- [ ] Get Bot Token: `YOUR_BOT_TOKEN`
  ```
  Saved as: ____________________________
  ```
- [ ] Send a message to your bot
- [ ] Get Chat ID from: `https://api.telegram.org/bot{TOKEN}/getUpdates`
  ```
  Saved as: ____________________________
  ```
- [ ] Test bot with curl:
  ```bash
  curl -X POST https://api.telegram.org/bot{TOKEN}/sendMessage \
    -H "Content-Type: application/json" \
    -d '{"chat_id":"{ID}","text":"Test"}'
  ```
- [ ] Received test message in Telegram ✓

---

## Phase 2: Cloudflare Account Setup ⏱️ ~5 minutes

- [ ] Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
- [ ] Go to **R2** and create bucket named `system-updates`
- [ ] Bucket created successfully ✓
- [ ] Find R2 Account ID:
  - Go to Account Home
  - Find your Account ID in the URL bar
  ```
  Account ID: ____________________________
  ```

---

## Phase 3: Prepare Update Files ⏱️ ~10 minutes

### Windows Package
- [ ] Navigate to `scripts/` directory
- [ ] Create ZIP: `zip windows-update.zip windows-update.vbs`
- [ ] File size: ~5-10 KB (without binaries)
- [ ] Ready for upload ✓

### macOS Package
- [ ] Navigate to `scripts/` directory
- [ ] Make executable: `chmod +x mac-update.sh`
- [ ] Create ZIP: `zip mac-update.zip mac-update.sh`
- [ ] File size: ~3-5 KB (without binaries)
- [ ] Ready for upload ✓

---

## Phase 4: Upload to R2 ⏱️ ~5 minutes

- [ ] Go to R2 → `system-updates` bucket
- [ ] Upload `windows-update.zip`
  ```
  URL: https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com/windows-update.zip
  ```
- [ ] Upload `mac-update.zip`
  ```
  URL: https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com/mac-update.zip
  ```
- [ ] Both files public and accessible ✓

---

## Phase 5: Update Configuration Files ⏱️ ~10 minutes

### 5.1 Update `wrangler.toml`

```toml
[env.production]
vars = { 
  TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN",
  TELEGRAM_CHAT_ID = "YOUR_CHAT_ID"
}
```

- [ ] Bot token added
- [ ] Chat ID added
- [ ] File saved

### 5.2 Update `index.html` (line ~180)

```javascript
const baseUrl = 'https://system-updates.{YOUR_ACCOUNT_ID}.r2.cloudflarestorage.com';
```

- [ ] R2 bucket URL updated
- [ ] File saved

### 5.3 Update `scripts/windows-update.vbs` (line 18)

```vbscript
Const WEBHOOK_URL = "https://system-update-handler.{YOUR_ACCOUNT}.workers.dev/webhook/update-complete"
```

- [ ] Placeholder added (will update after Worker deployment)
- [ ] File saved

### 5.4 Update `scripts/mac-update.sh` (line 12)

```bash
WEBHOOK_URL="https://system-update-handler.{YOUR_ACCOUNT}.workers.dev/webhook/update-complete"
```

- [ ] Placeholder added (will update after Worker deployment)
- [ ] File saved

---

## Phase 6: Deploy Cloudflare Worker ⏱️ ~5 minutes

### Installation

- [ ] Node.js and npm installed
  ```bash
  node --version
  npm --version
  ```
- [ ] Wrangler installed globally:
  ```bash
  npm install -g wrangler
  ```
- [ ] Logged in to Cloudflare:
  ```bash
  wrangler login
  ```

### Deployment

- [ ] Navigate to project root
- [ ] Deploy worker:
  ```bash
  wrangler deploy --env production
  ```
- [ ] Deployment successful ✓
- [ ] Worker URL obtained:
  ```
  https://system-update-handler.{YOUR_ACCOUNT}.workers.dev
  ```

---

## Phase 7: Update Script URLs with Worker URL ⏱️ ~5 minutes

Now that you have the Worker URL, update the scripts:

### 7.1 Update `scripts/windows-update.vbs` (line 18)

```vbscript
Const WEBHOOK_URL = "https://system-update-handler.{YOUR_ACCOUNT}.workers.dev/webhook/update-complete"
```

- [ ] Worker URL added
- [ ] File saved

### 7.2 Update `scripts/mac-update.sh` (line 12)

```bash
WEBHOOK_URL="https://system-update-handler.{YOUR_ACCOUNT}.workers.dev/webhook/update-complete"
```

- [ ] Worker URL added
- [ ] File saved

### 7.3 Recreate ZIP Files

- [ ] Delete old ZIPs
- [ ] Recreate with updated scripts:
  ```bash
  zip windows-update.zip scripts/windows-update.vbs
  zip mac-update.zip scripts/mac-update.sh
  ```
- [ ] Upload new ZIPs to R2
- [ ] New files in R2 ✓

---

## Phase 8: Deploy Landing Page ⏱️ ~5 minutes

### Option A: Cloudflare Pages (Git)

- [ ] Initialize git repo:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  ```
- [ ] Push to GitHub
- [ ] Go to Cloudflare Pages
- [ ] Connect GitHub repo
- [ ] Set build settings:
  - Build command: (empty)
  - Publish directory: `.`
- [ ] Deploy
- [ ] Pages URL:
  ```
  https://system-update-{XXXX}.pages.dev
  ```

### Option B: Cloudflare Pages (Direct Upload)

- [ ] Go to Pages → Upload Assets
- [ ] Select and upload `index.html`
- [ ] Pages deployed ✓
- [ ] Pages URL obtained ✓

---

## Phase 9: Testing ⏱️ ~10 minutes

### 9.1 Test Worker API

- [ ] Run curl test:
  ```bash
  curl -X POST https://system-update-handler.{ACCOUNT}.workers.dev/webhook/update-complete \
    -H "Content-Type: application/json" \
    -d '{
      "system": "Windows",
      "timestamp": "2024-01-15 10:30:00",
      "version": "2.0.0",
      "userId": "test-user"
    }'
  ```
- [ ] Worker returns `{"success": true, ...}` ✓
- [ ] Telegram notification received ✓

### 9.2 Test Landing Page

- [ ] Visit Pages URL in browser
- [ ] Page loads with "System Update" theme ✓
- [ ] OS is detected correctly:
  - Windows: Shows "Windows"
  - macOS: Shows "macOS"
- [ ] ✓

### 9.3 Test Downloads (if R2 access works)

- [ ] Click "Download Update" button
- [ ] Appropriate ZIP file downloads
- [ ] ✓ Windows users get .zip with .vbs
- [ ] ✓ macOS users get .zip with .sh

### 9.4 Test Local Scripts

#### Windows (if available)

- [ ] Extract `windows-update.zip`
- [ ] Double-click `windows-update.vbs`
- [ ] Script displays notifications
- [ ] Completes without errors
- [ ] Telegram notification received ✓

#### macOS (if available)

- [ ] Extract `mac-update.zip`
- [ ] Run:
  ```bash
  chmod +x mac-update.sh
  bash mac-update.sh
  ```
- [ ] Script displays progress
- [ ] Shows completion message
- [ ] Telegram notification received ✓

---

## Phase 10: Documentation & Cleanup ⏱️ ~5 minutes

- [ ] Review `README.md`
- [ ] Review `QUICKSTART.md`
- [ ] Review `CONFIG.SAMPLE.md`
- [ ] Review `ARCHITECTURE.md`
- [ ] Set up git repo if not done:
  ```bash
  git init
  git add .
  git commit -m "System Update Platform - Initial setup"
  ```
- [ ] Create `.env` file locally (don't commit):
  ```
  TELEGRAM_BOT_TOKEN=...
  TELEGRAM_CHAT_ID=...
  WORKER_URL=...
  R2_URL=...
  ```

---

## Final Verification

### Landing Page
- [ ] Title: "System Update"
- [ ] Has download button
- [ ] OS is detected
- [ ] Styled with gradient theme
- [ ] Mobile responsive

### Worker API
- [ ] Endpoint: `/webhook/update-complete`
- [ ] Accepts POST requests
- [ ] Validates input
- [ ] Sends Telegram notifications
- [ ] Returns success responses

### Scripts
- [ ] Windows script runs without errors
- [ ] macOS script runs and displays progress
- [ ] Both send webhook notifications
- [ ] Both trigger Telegram messages

### Storage
- [ ] R2 bucket contains 2 ZIP files
- [ ] ZIPs are publicly accessible
- [ ] ZIPs contain correct scripts

---

## Deployment Summary

| Component | Status | URL/Location |
|-----------|--------|--------------|
| Telegram Bot | ✓ | @YourBotName |
| Cloudflare R2 | ✓ | `system-updates` bucket |
| Windows ZIP | ✓ | R2 bucket |
| macOS ZIP | ✓ | R2 bucket |
| Worker API | ✓ | `system-update-handler.{ACCOUNT}.workers.dev` |
| Landing Page | ✓ | `system-update-{XXXX}.pages.dev` |

---

## Useful Commands

### View Worker Logs
```bash
wrangler tail --env production
```

### Redeploy Worker
```bash
wrangler deploy --env production
```

### Test Telegram Bot
```bash
curl -X POST https://api.telegram.org/bot{TOKEN}/sendMessage \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"{CHAT_ID}","text":"Test message"}'
```

### Test Worker Webhook
```bash
curl -X POST https://system-update-handler.{ACCOUNT}.workers.dev/webhook/update-complete \
  -H "Content-Type: application/json" \
  -d '{"system":"Windows","timestamp":"2024-01-15 10:30:00","version":"2.0.0","userId":"test"}'
```

---

## Troubleshooting Quick Links

| Issue | Solution | Link |
|-------|----------|------|
| Telegram not working | Check bot token and chat ID | README.md → Troubleshooting |
| R2 downloads failing | Verify URLs and permissions | README.md → Troubleshooting |
| Worker errors | Check logs with `wrangler tail` | README.md → Troubleshooting |
| Script won't run | Check execution permissions | README.md → Troubleshooting |

---

## Post-Deployment Customization

Once everything is working:

- [ ] Customize landing page design
- [ ] Update update scripts with real installation logic
- [ ] Add version tracking
- [ ] Set up analytics
- [ ] Configure custom domain
- [ ] Set up CI/CD for automatic deployments

---

**Status:** ⚪ Not Started | 🟡 In Progress | 🟢 Complete

**Overall Progress:** ___% Complete

Last Updated: ________________
