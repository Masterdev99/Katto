# Configuration Reference

This file shows all the configuration values you need to set up.

## Telegram Setup

Get these from @BotFather on Telegram:

```
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"
TELEGRAM_CHAT_ID = "YOUR_CHAT_ID_HERE"
```

Example:
```
TELEGRAM_BOT_TOKEN = "6123456789:XXXXXXXXXXXXXX"
TELEGRAM_CHAT_ID = "987654321"
```

## Cloudflare Setup

### R2 Bucket Information

```
R2_BUCKET_NAME = "system-updates"
R2_ACCOUNT_ID = "YOUR_ACCOUNT_ID"
R2_PUBLIC_URL = "https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com"
```

Example:
```
R2_PUBLIC_URL = "https://system-updates.abc123xyz.r2.cloudflarestorage.com"
```

## Cloudflare Worker URL

After deploying the Worker:

```
WORKER_URL = "https://system-update-handler.YOUR_ACCOUNT.workers.dev"
```

Example:
```
WORKER_URL = "https://system-update-handler.abc123xyz.workers.dev"
```

## Cloudflare Pages URL

After deploying the landing page:

```
PAGES_URL = "https://system-update-XXXX.pages.dev"
```

Example:
```
PAGES_URL = "https://system-update-landing.pages.dev"
```

---

## Files to Update

### 1. `wrangler.toml`

```toml
name = "system-update-handler"
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { 
  TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE",
  TELEGRAM_CHAT_ID = "YOUR_CHAT_ID_HERE"
}

[[r2_buckets]]
binding = "UPDATE_BUCKET"
bucket_name = "system-updates"
```

### 2. `index.html` (Line ~180)

```javascript
function getDownloadLink(osType) {
    const baseUrl = 'https://system-updates.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com';
    const files = {
        windows: `${baseUrl}/windows-update.zip`,
        mac: `${baseUrl}/mac-update.zip`
    };
    return files[osType] || null;
}
```

### 3. `scripts/windows-update.vbs` (Line 18)

```vbscript
Const WEBHOOK_URL = "https://system-update-handler.YOUR_ACCOUNT.workers.dev/webhook/update-complete"
```

### 4. `scripts/mac-update.sh` (Line 12)

```bash
WEBHOOK_URL="https://system-update-handler.YOUR_ACCOUNT.workers.dev/webhook/update-complete"
```

---

## Setup Checklist

- [ ] Created Telegram bot with @BotFather
- [ ] Have bot token and chat ID
- [ ] Cloudflare account created
- [ ] R2 bucket created (`system-updates`)
- [ ] ZIP files uploaded to R2
- [ ] Updated `wrangler.toml` with credentials
- [ ] Updated `index.html` with R2 URL
- [ ] Updated `windows-update.vbs` with Worker URL
- [ ] Updated `mac-update.sh` with Worker URL
- [ ] Deployed Cloudflare Worker
- [ ] Deployed landing page to Pages
- [ ] Tested webhook with curl
- [ ] Tested landing page in browser
- [ ] Tested update scripts locally

---

## Deployment Commands

```bash
# Install dependencies
npm install

# Deploy worker
wrangler deploy --env production

# View logs
wrangler tail --env production

# Test API
curl -X POST https://system-update-handler.YOUR_ACCOUNT.workers.dev/webhook/update-complete \
  -H "Content-Type: application/json" \
  -d '{
    "system": "Windows",
    "timestamp": "2024-01-15 10:30:00",
    "version": "2.0.0",
    "userId": "test-user"
  }'
```

---

## Directory Structure

After setup, your files should look like:

```
system-update-platform/
├── index.html                 # ✓ Update R2 URL
├── wrangler.toml             # ✓ Update credentials
├── package.json
├── README.md
├── QUICKSTART.md
├── CONFIG.SAMPLE.md
├── .gitignore
├── src/
│   └── index.js              # Worker code (no changes needed)
└── scripts/
    ├── windows-update.vbs    # ✓ Update Worker URL
    └── mac-update.sh         # ✓ Update Worker URL
```

---

## Need Help?

1. **Bot token errors**: Check @BotFather, make sure token format is correct
2. **R2 errors**: Verify bucket exists and files are uploaded
3. **Worker errors**: Check `wrangler tail` logs
4. **Landing page not loading**: Verify Cloudflare Pages deployment
5. **Webhook not working**: Test with curl first

See `README.md` for detailed troubleshooting.
