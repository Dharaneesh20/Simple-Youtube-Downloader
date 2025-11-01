# AWS EC2 Deployment Guide for YouTube Downloader

## � **IMPORTANT: Direct Downloads to User Machines**

This YouTube Downloader is designed to save videos **directly to users' computers**, NOT to cloud storage. This approach:

✅ **Saves AWS costs** - No storage fees for large video files  
✅ **Protects user privacy** - Files go straight to their device  
✅ **Reduces bandwidth costs** - No double transfer (server→storage→user)  
✅ **Faster for users** - Direct download vs cloud storage retrieval  
✅ **Automatic cleanup** - Server doesn't accumulate files  

## �🚀 Quick Local Fix (Port Conflict)

If you're getting the port 3000 error locally, use:
```bash
npm run start:auto-port
```
This will automatically find an available port and start the server.

## ☁️ AWS EC2 Deployment (Free Tier Eligible)

### Step 1: Launch EC2 Instance
1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Amazon Linux 2023** (Free tier eligible)
3. Instance type: **t2.micro** (Free tier eligible)
4. Create new key pair (download .pem file)
5. Security Group: Allow SSH (22) and HTTP (80) + Custom TCP (3000)
6. Launch instance

### Step 2: Connect to Your Instance
```bash
# Windows (using PowerShell or WSL)
ssh -i "your-key.pem" ec2-user@your-instance-public-ip

# Example:
# ssh -i "youtube-downloader.pem" ec2-user@3.15.123.45
```

### Step 3: Install Dependencies on EC2
```bash
# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install git
sudo yum install -y git

# Install ffmpeg
sudo yum install -y epel-release
sudo yum install -y ffmpeg

# Verify installations
node --version
npm --version
ffmpeg -version
```

### Step 4: Deploy Your Application
```bash
# Option A: Upload via SCP (from your local machine)
scp -i "your-key.pem" -r "C:\Users\Dharaneesh\Desktop\Youtube Downloader\YT_SDK" ec2-user@your-instance-ip:~/

# Option B: Use Git (recommended)
# First, push your code to GitHub, then:
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### Step 5: Setup Application on EC2
```bash
# Navigate to app directory
cd YT_SDK  # or your app directory

# Install npm dependencies
npm install

# Download yt-dlp for Linux
wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O yt-dlp
chmod +x yt-dlp

# Create downloads directory
mkdir -p downloads

# Test the setup
./yt-dlp --version
```

### Step 6: Start the Application
```bash
# For testing (will stop when you disconnect)
npm run prod

# For production (keeps running after disconnect)
# Install PM2 first
sudo npm install -g pm2

# Start with PM2
pm2 start server.js --name "youtube-downloader" --env production

# Set PM2 to start on boot
pm2 startup
pm2 save
```

### Step 7: Configure Nginx (Optional - for port 80)
```bash
# Install nginx
sudo yum install -y nginx

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Edit nginx config
sudo nano /etc/nginx/nginx.conf
```

Add this to the server block:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

```bash
# Restart nginx
sudo systemctl restart nginx
```

## 🔐 Security Considerations

### Security Group Rules:
- **SSH (22)**: Your IP only
- **HTTP (80)**: 0.0.0.0/0 (if using nginx)
- **Custom TCP (3000)**: 0.0.0.0/0 (if direct access)

### Application Security:
```bash
# Set environment variables for production
export NODE_ENV=production
export HOST=0.0.0.0
export PORT=3000

# Or create a .env file:
echo "NODE_ENV=production" > .env
echo "HOST=0.0.0.0" >> .env
echo "PORT=3000" >> .env
```

## 💰 Cost Optimization (Free Tier)

### Free Tier Limits:
- **750 hours/month** of t2.micro instances
- **30 GB** of EBS storage
- **15 GB** of bandwidth out

### Cost-Saving Features (Built-in):
✅ **Direct Downloads**: Videos download straight to user's machine (no storage costs)  
✅ **Temporary Server Storage**: Files are only temporarily stored during processing  
✅ **Minimal Bandwidth**: Only metadata transfers, not video files  
✅ **Auto-Cleanup**: Server doesn't accumulate large video files  

### Tips to Stay Free:
1. Use only **one t2.micro** instance
2. Stop instance when not needed
3. Monitor usage in AWS billing dashboard
4. Set up billing alerts

## 📥 How Direct Downloads Work

### User Experience:
1. **User enters YouTube URL** → Server processes metadata
2. **User selects quality** → Server starts yt-dlp download  
3. **Download completes** → User gets direct download link
4. **User clicks link** → File downloads to their device
5. **Server cleanup** → Temporary file removed (optional)

### Technical Flow:
```
User Browser ←→ EC2 Server ←→ YouTube
     ↓              ↓
User's Downloads   Temp Storage
    Folder        (Auto-cleanup)
```

This means **zero long-term storage costs** on AWS!

### Auto-shutdown script (optional):
```bash
# Create auto-shutdown at midnight
echo "0 0 * * * sudo shutdown -h now" | crontab -
```

## 🌐 Access Your Application

Once deployed, access your app at:
- **Direct**: `http://your-ec2-public-ip:3000`
- **With Nginx**: `http://your-ec2-public-ip`

## 🔧 Troubleshooting

### Common Issues:

1. **yt-dlp not found**:
```bash
# Make sure yt-dlp is executable
chmod +x yt-dlp
ls -la yt-dlp
```

2. **Port already in use**:
```bash
# Kill process on port 3000
sudo lsof -ti:3000 | xargs sudo kill -9
# Or use different port
PORT=3001 npm start
```

3. **Permission denied**:
```bash
# Fix file permissions
chmod +x yt-dlp
chmod -R 755 downloads/
```

4. **Memory issues**:
```bash
# Monitor memory usage
free -h
# Add swap if needed (t2.micro has limited RAM)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📊 Monitoring

### Check application status:
```bash
# With PM2
pm2 status
pm2 logs youtube-downloader

# Without PM2
ps aux | grep node
netstat -tlnp | grep :3000
```

### Monitor system resources:
```bash
# CPU and memory
top
htop  # if installed

# Disk space
df -h

# Network
netstat -i
```

## 🔄 Updates and Maintenance

### Update application:
```bash
# Pull latest code
git pull origin main

# Restart application
pm2 restart youtube-downloader
# or without PM2:
pkill node && npm run prod
```

### Update yt-dlp:
```bash
# Download latest version
wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O yt-dlp
chmod +x yt-dlp
```

## 📋 Production Checklist

- [ ] EC2 instance launched (t2.micro)
- [ ] Security groups configured
- [ ] Node.js and dependencies installed
- [ ] Application deployed and tested
- [ ] PM2 configured for production
- [ ] Nginx configured (optional)
- [ ] Domain name configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Monitoring set up
- [ ] Backup strategy planned
- [ ] Billing alerts configured

Your YouTube Downloader is now ready for production use on AWS EC2! 🎉