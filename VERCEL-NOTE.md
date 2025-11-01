# Vercel Deployment Note

## Important Limitations

This YouTube downloader uses `yt-dlp` which requires:
1. Binary executable (yt-dlp.exe on Windows, yt-dlp on Linux)
2. File system access for temporary storage
3. Long-running processes for video processing

**Vercel's serverless functions have these limitations:**
- Cannot execute binaries
- Limited to 10-second execution time (Hobby plan)
- `/tmp` directory only for writes
- No persistent storage

## Solutions

### Option 1: Deploy to Different Platform
Consider these alternatives that support longer processes:
- **Railway.app** - Free tier with persistent storage
- **Render.com** - Free tier for web services
- **Heroku** - Supports buildpacks for yt-dlp
- **DigitalOcean App Platform** - Starting at $5/month
- **AWS EC2 or Lightsail** - Full VM control

### Option 2: Use Client-Side Only
Remove server-side downloads and use:
- Direct YouTube embed links
- Third-party APIs (may have limitations)
- Browser extensions integration

### Option 3: Hybrid Approach
- Use Vercel for the frontend UI
- Deploy API to a different service (Railway, Render, etc.)
- Update API URLs in frontend

## Recommended: Railway Deployment

Railway supports yt-dlp natively:

1. Create account at railway.app
2. Connect your GitHub repository
3. Add start command: `npm start`
4. Railway will automatically detect and deploy

No configuration changes needed!
