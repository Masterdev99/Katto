# System Update Platform

A Cloudflare-based software update distribution system with OS detection and Telegram notifications. Users download update packages for their system, extract them locally, run the installation script, and receive a Telegram notification when complete.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   User's Browser                         │
│          ┌─────────────────────────────────┐            │
│          │  Landing Page (OS Detection)    │            │
│          │  - Detects Windows/macOS        │            │
│          │  - Auto-downloads ZIP file      │            │
│          └─────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│            Cloudflare Infrastructure                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Pages: Landing page hosting                    │   │
│  │  R2: Store ZIP files                            │   │
│  │  Workers: Webhook API for notifications         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Local Update Scripts                        │
│  ┌────────────────────────┐  ┌─────────────────────┐   │
│  │  Windows (VBS)         │  │  macOS (Bash)       │   │
│  │  - Runs update process │  │  - Runs update      │   │
│  │  - Sends notification  │  │  - Sends webhook    │   │
│  └────────────────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
                   Telegram Bot API
                          ↓
                    Your Telegram Chat
```

## Project Structure

```
.
├── index.html              # Landing page with OS detection
├── README.md              # This file
├── wrangler.toml          # Cloudflare Workers config
├── src/
│   └── index.js           # Worker API handler
└── scripts/
    ├── windows-update.vbs # Windows update script
    └── mac-update.sh      # macOS update script
```

## Setup Instructions

### 1. Create Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Create a new bot: `/newbot`
3. Give it a name (e.g., "System Update Bot")
4. Copy the **Bot Token** (you'll need this)
5. Get your **Chat ID**:
   - Message your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your chat ID in the response

### 2. Cloudflare Setup

#### A. Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2 Storage** → **Create Bucket**
3. Name it: `system-updates`
4. Upload these files:
   - `windows-update.zip` (containing the `windows-update.vbs` script)
   - `mac-update.zip` (containing the `mac-update.sh` script)

#### B. Generate R2 API Token

1. In R2 → **Settings** → **API Tokens**
2. Create a new token with permissions:
   - `Object Read`
   - `Object Write`
3. Save the **Access Key ID** and **Secret Access Key**

#### C. Deploy Landing Page

Using Cloudflare Pages:

1. Create a new Pages project
2. Connect your GitHub repo (or upload files directly)
3. Set build command: (leave empty for static HTML)
4. Set publish directory: `.`
5. Deploy `index.html` and any CSS/JS files

**Update the R2 URLs in `index.html`:**
```javascript
const baseUrl = 'https://your-r2-bucket.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com';
// Or use a custom domain if you've set one up
```

#### D. Deploy Cloudflare Worker

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Update `wrangler.toml` with your values:
   ```toml
   [env.production]
   vars = { 
     TELEGRAM_BOT_TOKEN = "your-bot-token-here",
     TELEGRAM_CHAT_ID = "your-chat-id-here"
   }
   
   [[r2_buckets]]
   binding = "UPDATE_BUCKET"
   bucket_name = "system-updates"
   ```

3. Deploy:
   ```bash
   wrangler deploy --env production
   ```

4. Your Worker URL will be: `https://system-update-handler.YOUR_ACCOUNT.workers.dev`

### 3. Update Configuration Files

Update these files with your actual URLs:

**index.html** (line ~180):
```javascript
function getDownloadLink(osType) {
    const baseUrl = 'https://system-updates.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com';
    // Or your custom domain
    const files = {
        windows: `${baseUrl}/windows-update.zip`,
        mac: `${baseUrl}/mac-update.zip`
    };
    return files[osType] || null;
}
```

**windows-update.vbs** (line ~18):
```vbscript
Const WEBHOOK_URL = "https://system-update-handler.YOUR_ACCOUNT.workers.dev/webhook/update-complete"
```

**mac-update.sh** (line ~12):
```bash
WEBHOOK_URL="https://system-update-handler.YOUR_ACCOUNT.workers.dev/webhook/update-complete"
```

### 4. Create ZIP Packages

**For Windows:**
```bash
# Create windows-update.zip containing:
# - windows-update.vbs (the script to run)
# - Any additional files needed
zip windows-update.zip windows-update.vbs
```

**For macOS:**
```bash
# Create mac-update.zip containing:
# - mac-update.sh (the script to run)
# - Any additional files needed
chmod +x mac-update.sh
zip mac-update.zip mac-update.sh
```

Upload both ZIP files to your R2 bucket.

## How It Works

### User Flow

1. **Visit landing page**
   - User navigates to your Cloudflare Pages URL
   - JavaScript detects their OS (Windows/macOS)

2. **Download**
   - "Download Update" button appears
   - User clicks to download the appropriate ZIP file
   - Browser automatically starts the download

3. **Extract & Run**
   - User manually extracts the ZIP file
   - On Windows: Double-click `windows-update.vbs`
   - On macOS: Run `bash mac-update.sh` in Terminal

4. **Installation**
   - Script displays progress notifications
   - Performs update installation
   - Shows completion message

5. **Notification**
   - Script sends HTTP POST to Cloudflare Worker webhook
   - Worker receives update completion details
   - Telegram notification is sent to your configured chat

### Webhook Payload

The scripts send JSON data to `/webhook/update-complete`:

```json
{
  "system": "Windows",
  "timestamp": "2024-01-15 10:30:45",
  "version": "2.0.0",
  "userId": "computer-name"
}
```

Worker responds with:
```json
{
  "success": true,
  "message": "Update notification received and processed"
}
```

## Security Considerations

- **CORS**: Worker allows cross-origin requests from any origin (can be restricted)
- **Authentication**: Currently no auth on webhook (consider adding HMAC verification)
- **VBS Execution**: Windows may show UAC prompts depending on permissions
- **Webhook URL**: Keep your Worker URL private or add rate limiting

### Recommended Enhancements

1. Add HMAC signature verification to webhook
2. Implement rate limiting on the API
3. Add user authentication to access updates
4. Log all update events for compliance
5. Add version checking before allowing downloads

## Troubleshooting

### Landing page not detecting OS correctly

Check browser's User-Agent string:
```javascript
console.log(navigator.userAgent);
```

### Downloads not starting

- Verify R2 bucket is public or has CORS headers configured
- Check browser console for CORS errors
- Ensure ZIP file paths in `index.html` are correct

### Telegram notification not received

- Verify bot token is correct
- Verify chat ID is correct
- Check Worker logs: `wrangler tail --env production`
- Verify webhook URL is accessible from scripts

### VBS script won't run

- Windows may block external scripts (UAC)
- User must approve script execution
- Ensure network access is available
- Check firewall settings

### Shell script permission denied on macOS

```bash
chmod +x mac-update.sh
```

Then run:
```bash
bash mac-update.sh
```

## Testing

### Test the API Webhook

```bash
curl -X POST https://system-update-handler.YOUR_ACCOUNT.workers.dev/webhook/update-complete \
  -H "Content-Type: application/json" \
  -d '{"system":"Windows","timestamp":"2024-01-15 10:30:00","version":"2.0.0","userId":"test-user"}'
```

### Test Telegram Bot

```bash
curl -X POST https://api.telegram.org/bot<BOT_TOKEN>/sendMessage \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"<CHAT_ID>","text":"Test message"}'
```

## Customization

### Update Theme

Modify `index.html` styles:
- Change gradient colors (line ~10)
- Update header icon (line ~59)
- Modify feature list (line ~117)

### Update Messages

Edit notification message in `src/index.js`:
```javascript
function buildNotificationMessage(system, timestamp, version, userId) {
    // Customize the Telegram message format
}
```

### Add More Operating Systems

Update `detectOS()` in `index.html` and add corresponding scripts.

## Performance Tips

- Use Cloudflare's cache for the landing page
- Consider serving ZIPs from R2 with caching headers
- Monitor Worker CPU time for optimization

## Monitoring

Check Cloudflare Analytics:
- Pages requests and bandwidth
- Worker execution time
- R2 bucket access patterns

View Worker logs:
```bash
wrangler tail --env production
```

## Costs

- **Cloudflare Pages**: Free for landing page
- **R2**: $0.015/GB stored + egress costs
- **Workers**: Free tier covers most use cases ($0.50 per million requests after)
- **Telegram Bot**: Free

---

**Version**: 2.0.0  
**Last Updated**: 2024-01-15

For updates and support, check your webhook logs and Telegram notifications.
