# YouTube Downloader - Free & Open Source

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![No Ads](https://img.shields.io/badge/ads-none-brightgreen.svg)
![Free](https://img.shields.io/badge/cost-free-brightgreen.svg)

> **Download YouTube videos directly to your device - No server storage, No ads, Completely free!**

## ✨ Features

- 🆓 **100% Free** - No premium plans, no hidden costs
- 🚫 **No Ads** - Clean, ad-free experience
- 🔒 **Privacy First** - Downloads directly to your device
- ☁️ **No Server Storage** - Zero cloud storage costs
- 🌐 **Serverless** - Powered by Vercel
- 📱 **Mobile Friendly** - Works on all devices
- ⚡ **Fast** - Direct browser downloads
- 🎨 **Modern UI** - Beautiful, intuitive interface

## 🚀 Deploy to Vercel (1-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dharaneesh20/YT_Downloader)

### Manual Deployment Steps:

1. **Fork this repository**
2. **Sign up on [Vercel](https://vercel.com)** (free account)
3. **Import your repository**
4. **Deploy!** - That's it!

Vercel will automatically:
- Build your project
- Deploy to a global CDN
- Provide a free `.vercel.app` domain
- Enable HTTPS automatically

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/Dharaneesh20/YT_Downloader.git
cd YT_Downloader

# Install dependencies
npm install

# Start development server
npm start

# Open browser
http://localhost:3000
```

## 🏗️ Architecture

### Direct Browser Downloads (No Server Storage)
```
┌─────────────┐
│   User's    │
│   Browser   │ ← Downloads directly here!
└──────┬──────┘
       │
       │ 1. Enter URL
       │ 2. Fetch metadata
       │ 3. Get download link
       │ 
┌──────▼──────┐
│   Vercel    │ ← Serverless functions only
│   (API)     │ ← NO video storage!
└──────┬──────┘
       │
       │ Video info only
       │
┌──────▼──────┐
│   YouTube   │ ← Videos stay here
│    API      │
└─────────────┘
```

### Why This Approach?
- ✅ **Zero storage costs** - No videos stored on server
- ✅ **Instant downloads** - Direct to user's device
- ✅ **Privacy** - No file retention
- ✅ **Scalable** - Serverless handles any load
- ✅ **Free forever** - Vercel free tier is enough

## 📁 Project Structure

```
YT_Downloader/
├── api/
│   └── index.js          # Vercel serverless functions
├── public/
│   ├── index.html        # Main page
│   ├── styles.css        # Styling
│   └── client-download.js # Client-side download logic
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies
└── README.md            # This file
```

## 🔧 How It Works

1. **User enters YouTube URL** → Browser sends to API
2. **API extracts video ID** → Returns metadata only
3. **Client generates download link** → Using YouTube's public APIs
4. **Browser downloads video** → Directly to user's device
5. **No server storage** → Videos never touch your server!

## 🌟 Quality Options

- 🎬 8K HDR (if available)
- 🎬 8K
- 🎬 4K HDR
- 🎬 4K
- 🎬 Full HD (1080p)
- 🎬 HD (720p)
- 🎬 SD (480p)
- 🎵 Audio Only

## 💰 Cost Breakdown

### Vercel Free Tier Includes:
- ✅ 100GB bandwidth/month
- ✅ Unlimited serverless function executions
- ✅ Free SSL certificate
- ✅ Global CDN
- ✅ Automatic deployments

### Your Costs:
- **Hosting**: $0
- **Storage**: $0 (no storage needed!)
- **Bandwidth**: $0 (videos not served by you)
- **SSL**: $0
- **Total**: **$0/month** 🎉

## 🛡️ Privacy & Security

- 🔒 **No tracking** - No analytics, no cookies
- 🔒 **No data collection** - We don't store anything
- 🔒 **HTTPS enabled** - Secure connection
- 🔒 **Client-side processing** - Your data stays with you

## 📝 License

MIT License - Feel free to use, modify, and distribute!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Disclaimer

This tool is for educational purposes only. Please respect YouTube's Terms of Service and copyright laws. Only download videos you have permission to download.

## 🙏 Acknowledgments

- YouTube for providing public APIs
- Vercel for free serverless hosting
- Font Awesome for icons
- All contributors and users

## 📧 Contact

- GitHub: [@Dharaneesh20](https://github.com/Dharaneesh20)
- Repository: [YT_Downloader](https://github.com/Dharaneesh20/YT_Downloader)

---

**Made with ❤️ by Dharaneesh20 | Free Forever | No Ads, No Tracking**

⭐ Star this repo if you find it useful!