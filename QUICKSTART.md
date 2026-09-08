# Quick Start Guide

Get your System Update Platform running in 10 minutes.

## Prerequisites

- Cloudflare Account (free tier works)
- Telegram Bot (get from @BotFather)
- Node.js & npm installed

## Step 1: Get Telegram Bot Token & Chat ID (2 min)

1. Open Telegram → Search for **@BotFather**
2. Send `/newbot` and follow prompts
3. Save your **Bot Token**
4. Send any message to your bot
5. Visit: `https://api.telegram.org/bot{TOKEN}/getUpdates`
6. Copy your **chat_id** from the response

Example response:
```json
{
  "result": [
    {
      "message": {
        "chat": {
          "id": 123456789  // ← This is your chat ID
        }
      }
    }
  ]
}
```

## Step 2: Create Cloudflare R2 Bucket (2 min)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2** → **Create Bucket**
3. Name: `system-updates`
4. Leave other settings default
5. Click **Create**

## Step 3: Upload Update Files to R2 (1 min)

Create your ZIP files:

**Windows Package:**
```bash
zip windows-update.zip scripts/windows-update.vbs
```

**macOS Package:**
```bash
chmod +x scripts/mac-update.sh
zip mac-update.zip scripts/mac-update.sh
```

Upload to R2 bucket via Cloudflare dashboard.

## Step 4: Get R2 Public URLs

After uploading, find the public URLs:
1. Go to R2 → `system-updates` bucket
2. Click each file → copy the public URL

You'll need:
- `https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com/windows-update.zip`
- `https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com/mac-update.zip`

## Step 5: Update Configuration (2 min)

### Update `index.html` (line ~180)

Replace the baseUrl:
```javascript
const baseUrl = 'https://system-updates.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com';
```

### Update `wrangler.toml`

```toml
[env.production]
vars = { 
  TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE",
  TELEGRAM_CHAT_ID = "YOUR_CHAT_ID_HERE"
}
```

### Update Script URLs

**windows-update.vbs** (line 18):
```vbscript
Const WEBHOOK_URL = "https://system-update-handler.YOUR_ACCOUNT.workers.dev/webhook/update-complete"
```

**mac-update.sh** (line 12):
```bash
WEBHOOK_URL="https://system-update-handler.YOUR_ACCOUNT.workers.dev/webhook/update-complete"
```

## Step 6: Deploy (2 min)

### Install Wrangler
```bash
npm install -g wrangler
```

### Deploy Worker
```bash
wrangler deploy --env production
```

After deployment, you'll get a URL like:
```
https://system-update-handler.YOUR_ACCOUNT.workers.dev
```

**Update script URLs with this URL** (see Step 5 above).

Re-deploy:
```bash
wrangler deploy --env production
```

### Deploy Landing Page

Using Cloudflare Pages:

1. Go to **Pages** → **Upload Assets**
2. Upload `index.html`
3. Your page is live at: `https://system-update-XXXX.pages.dev`

Or connect your GitHub repo for auto-deployment.

## Step 7: Test It Out (1 min)

### Test Worker API
```bash
curl -X POST https://system-update-handler.YOUR_ACCOUNT.workers.dev/webhook/update-complete \
  -H "Content-Type: application/json" \
  -d '{
    "system": "Windows",
    "timestamp": "2024-01-15 10:30:00",
    "version": "2.0.0",
    "userId": "test-user"
  }'
```

You should receive a Telegram notification! 📱

### Test Landing Page

1. Visit your Pages URL
2. See your OS detected
3. Click Download (won't work until R2 URLs are correct)

## Configuration Summary

| Item | Example | Location |
|------|---------|----------|
| Bot Token | `6123456789:XXXXXXXXXXXXXX` | `wrangler.toml` |
| Chat ID | `987654321` | `wrangler.toml` |
| R2 URL | `system-updates.{ID}.r2...` | `index.html` |
| Worker URL | `system-update-handler...` | `scripts/*.vbs`, `scripts/*.sh` |
| Pages URL | `system-update-XXXX.pages.dev` | Share with users |

## Common Issues

### "Bucket not found" error
- Check R2 bucket name is exactly `system-updates`
- R2 URL format must be correct

### "Unauthorized" on Telegram
- Verify bot token is correct
- Verify chat ID is a number (not a username)

### Scripts won't run after download
- Windows: Right-click → Run as Administrator
- macOS: `chmod +x mac-update.sh` then `bash mac-update.sh`

### No Telegram notification received
- Check bot token in `wrangler.toml`
- Run the curl test command above
- Check Worker logs: `wrangler tail --env production`

## Next Steps

1. Customize landing page theme (see `index.html` CSS)
2. Modify update scripts with your actual update logic
3. Add more features (analytics, versioning, etc.)
4. Set up custom domain for your Pages site

---

**Need help?** Check `README.md` for detailed documentation.
