# 🔧 YouTube Downloader - Troubleshooting Guide

## ✅ **ISSUES RESOLVED:**

### 1. Port Conflict (EADDRINUSE) - **FIXED** ✅
- **Problem**: Port 3000 already in use
- **Solution**: Automatic port detection implemented
- **How to use**: `npm run start:auto-port` or double-click `Start-Smart.bat`

### 2. yt-dlp YouTube Extraction Issues - **FIXED** ✅
- **Problem**: YouTube's anti-bot measures causing extraction failures
- **Solution**: Updated yt-dlp arguments with proper user agent and retry logic
- **Result**: Better compatibility with YouTube's current systems

## 📋 **Current Status:**
- ✅ Server starts without port conflicts
- ✅ Enhanced yt-dlp arguments for better YouTube compatibility
- ✅ Latest yt-dlp version (2025.09.26)
- ✅ AWS EC2 deployment ready

## 🚀 **How to Run:**

### Local Development:
```bash
# Automatic port detection (recommended)
npm run start:auto-port

# Or use the smart batch file
Start-Smart.bat

# Manual port setting
set PORT=3001 && npm start
```

### Production/EC2:
```bash
npm run prod
```

## 🔧 **If You Still Get yt-dlp Errors:**

### 1. Update yt-dlp to Latest Version:
```bash
# Run the update batch file
Update-yt-dlp.bat

# Or manually:
curl -L -o yt-dlp.exe https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe
```

### 2. Test yt-dlp Directly:
```bash
# Test with a simple video
.\yt-dlp.exe --list-formats "https://www.youtube.com/watch?v=jNQXAC9IVRw"

# Test download
.\yt-dlp.exe -f "best[height<=720]" "https://www.youtube.com/watch?v=jNQXAC9IVRw" -o "test.%(ext)s"
```

### 3. Common yt-dlp Issues and Solutions:

#### **Issue**: "nsig extraction failed"
- **Cause**: YouTube's signature algorithm changed
- **Solution**: Update yt-dlp to latest version
- **Status**: **FIXED** with enhanced arguments

#### **Issue**: "Requested format is not available" 
- **Cause**: Video restrictions or format not available
- **Solution**: Use simpler format strings (already implemented)
- **Workaround**: Try different quality settings

#### **Issue**: "Only images are available"
- **Cause**: Video may be a Shorts or have restrictions
- **Solution**: Try with different URLs or quality settings

### 4. Enhanced Arguments Now Used:
```javascript
// These are now automatically applied:
'--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
'--extractor-retries', '3'
'--fragment-retries', '3'
'--no-check-certificates'
'--throttled-rate', '100K'
```

## 🌐 **AWS EC2 Deployment:**

### Quick Deploy Commands:
```bash
# 1. Launch t2.micro EC2 instance
# 2. Connect via SSH
ssh -i "your-key.pem" ec2-user@your-instance-ip

# 3. Install dependencies
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git ffmpeg

# 4. Deploy your app
# Upload files or clone from git

# 5. Setup
cd YT_SDK
npm install
wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O yt-dlp
chmod +x yt-dlp

# 6. Start in production
npm run prod

# 7. Keep running with PM2
sudo npm install -g pm2
pm2 start server.js --name "youtube-downloader"
pm2 startup && pm2 save
```

## 💡 **Performance Tips:**

### For Better YouTube Compatibility:
1. **Keep yt-dlp Updated**: YouTube changes frequently
2. **Use Simple Format Strings**: Complex formats may fail
3. **Implement Rate Limiting**: Avoid hitting YouTube's limits
4. **Monitor for Changes**: YouTube anti-bot measures evolve

### For EC2 Deployment:
1. **Use t2.micro**: Stays within free tier
2. **Monitor Resources**: Check CPU/memory usage
3. **Set up Nginx**: For port 80 access
4. **Enable HTTPS**: For production security

## 📊 **Monitoring Commands:**

### Check Application Status:
```bash
# Local
netstat -ano | findstr :3000

# EC2 with PM2
pm2 status
pm2 logs youtube-downloader

# System resources
top
df -h
```

### Test yt-dlp Health:
```bash
# Check version
.\yt-dlp.exe --version

# Test extraction
.\yt-dlp.exe -J "https://www.youtube.com/watch?v=jNQXAC9IVRw" --no-warnings
```

## 🔄 **Regular Maintenance:**

### Weekly:
- Update yt-dlp: Run `Update-yt-dlp.bat`
- Check disk space on EC2
- Monitor AWS billing dashboard

### Monthly:
- Update Node.js dependencies: `npm update`
- Review error logs
- Check for new YouTube API changes

## 📞 **Still Having Issues?**

1. **Check the logs**: Look at terminal output for specific errors
2. **Test yt-dlp directly**: Isolate whether it's a yt-dlp or server issue
3. **Try different videos**: Some videos may have restrictions
4. **Update everything**: yt-dlp, Node.js, dependencies
5. **Check AWS costs**: Monitor free tier usage

## ✅ **Success Indicators:**

- Server starts without port errors ✅
- Can access web interface at http://localhost:3000 ✅
- Format requests work (get video info) ✅
- Downloads complete successfully ✅
- No "EADDRINUSE" errors ✅

**Your YouTube Downloader is now optimized and ready for production! 🎉**