const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const app = express();

// Use environment PORT or default to 3000
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

// Middleware
app.use(express.json());
// Serve static files from public folder (one level up from api folder)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// API endpoint to get video info
// This uses YouTube's public APIs or scraping (no server-side downloads)
app.post('/api/video-info', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Extract video ID from URL
        const videoId = extractVideoId(url);
        
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Get available formats using yt-dlp
        const ytdlpPath = path.join(__dirname, '..', 'yt-dlp.exe');
        
        const ytdlp = spawn(ytdlpPath, [
            '--dump-json',
            '--no-warnings',
            '--skip-download',
            `https://www.youtube.com/watch?v=${videoId}`
        ]);

        let jsonData = '';
        let errorMsg = '';

        ytdlp.stdout.on('data', (data) => {
            jsonData += data.toString();
        });

        ytdlp.stderr.on('data', (data) => {
            errorMsg += data.toString();
        });

        ytdlp.on('close', (code) => {
            if (code === 0 && jsonData) {
                try {
                    const videoData = JSON.parse(jsonData);
                    
                    // Extract available resolutions with detailed info
                    const formats = videoData.formats || [];
                    const resolutionDetails = {
                        '8k': { available: false, height: 4320 },
                        '4k': { available: false, height: 2160 },
                        'fhd': { available: false, height: 1080 },
                        'hd': { available: false, height: 720 },
                        'sd': { available: false, height: 480 }
                    };
                    
                    let maxHeight = 0;
                    
                    formats.forEach(fmt => {
                        if (fmt.height) {
                            maxHeight = Math.max(maxHeight, fmt.height);
                            
                            // Check all resolutions (not else-if, so 8K video gets marked as having 8K, 4K, FHD, HD, SD)
                            if (fmt.height >= 4320) {
                                resolutionDetails['8k'].available = true;
                                resolutionDetails['4k'].available = true;
                                resolutionDetails['fhd'].available = true;
                                resolutionDetails['hd'].available = true;
                                resolutionDetails['sd'].available = true;
                            } else if (fmt.height >= 2160) {
                                resolutionDetails['4k'].available = true;
                                resolutionDetails['fhd'].available = true;
                                resolutionDetails['hd'].available = true;
                                resolutionDetails['sd'].available = true;
                            } else if (fmt.height >= 1080) {
                                resolutionDetails['fhd'].available = true;
                                resolutionDetails['hd'].available = true;
                                resolutionDetails['sd'].available = true;
                            } else if (fmt.height >= 720) {
                                resolutionDetails['hd'].available = true;
                                resolutionDetails['sd'].available = true;
                            } else if (fmt.height >= 480) {
                                resolutionDetails['sd'].available = true;
                            }
                        }
                    });

                    const availableQualities = Object.keys(resolutionDetails)
                        .filter(key => resolutionDetails[key].available);

                    res.json({
                        success: true,
                        videoId: videoId,
                        title: videoData.title || 'Unknown',
                        duration: videoData.duration || 0,
                        author: videoData.uploader || videoData.channel || 'Unknown',
                        thumbnail: videoData.thumbnail || '',
                        availableQualities: availableQualities,
                        maxResolution: maxHeight,
                        resolutionDetails: resolutionDetails
                    });
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    res.json({
                        success: true,
                        videoId: videoId,
                        title: 'Unknown',
                        message: 'Video ID extracted successfully'
                    });
                }
            } else {
                console.error('yt-dlp error:', errorMsg);
                // Fallback to basic response
                res.json({
                    success: true,
                    videoId: videoId,
                    title: 'Unknown',
                    message: 'Video ID extracted successfully'
                });
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process video URL' });
    }
});

// Download video endpoint - server-side download using yt-dlp
app.post('/api/download', async (req, res) => {
    // Use /tmp for Vercel serverless environment, fallback to downloads for local
    const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'downloads');
    let tempFile = null;

    try {
        const { url, quality } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Create downloads directory if it doesn't exist
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Map quality to yt-dlp format - simplified to work with actual YouTube formats
        const qualityMap = {
            '8k-hdr': 'bestvideo[height>=2160]+bestaudio/best',
            '8k': 'bestvideo[height>=2160]+bestaudio/best',
            '4k-hdr': 'bestvideo[height>=1440][height<=2160]+bestaudio/best',
            '4k': 'bestvideo[height>=1440][height<=2160]+bestaudio/best',
            'fhd': 'bestvideo[height>=1080][height<=1440]+bestaudio/best',
            'hd': 'bestvideo[height>=720][height<=1080]+bestaudio/best',
            'sd': 'bestvideo[height>=360][height<=720]+bestaudio/best',
            'audio': 'bestaudio/best'
        };

        const format = qualityMap[quality] || 'bestvideo+bestaudio/best';
        tempFile = path.join(tempDir, `${videoId}_${quality}_${Date.now()}.mp4`);

        const ytdlpPath = path.join(__dirname, '..', 'yt-dlp.exe');
        const ffmpegPath = path.join(__dirname, '..', 'ffmpeg.exe');
        
        console.log(`Starting download for ${videoId} with quality ${quality}`);
        console.log(`Format string: ${format}`);
        console.log(`Temp file: ${tempFile}`);
        
        const ytdlp = spawn(ytdlpPath, [
            '--format', format,
            '--merge-output-format', 'mp4',
            '--ffmpeg-location', ffmpegPath,
            '--no-warnings',
            '--no-playlist',
            '--output', tempFile,
            '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            '--no-check-certificates',
            '--concurrent-fragments', '4',
            `https://www.youtube.com/watch?v=${videoId}`
        ]);

        let errorMsg = '';
        let progressOutput = '';

        ytdlp.stdout.on('data', (data) => {
            progressOutput += data.toString();
            console.log('Progress:', data.toString().trim());
        });

        ytdlp.stderr.on('data', (data) => {
            const msg = data.toString();
            errorMsg += msg;
            console.log('yt-dlp:', msg.trim());
        });

        ytdlp.on('close', async (code) => {
            if (code === 0 && fs.existsSync(tempFile)) {
                try {
                    const stat = fs.statSync(tempFile);
                    console.log(`Download completed. File size: ${stat.size} bytes`);

                    if (stat.size === 0) {
                        throw new Error('Downloaded file is empty');
                    }

                    // Set response headers for download
                    const filename = `video_${videoId}_${quality}.mp4`;
                    res.setHeader('Content-Type', 'video/mp4');
                    res.setHeader('Content-Length', stat.size);
                    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                    res.setHeader('Access-Control-Allow-Origin', '*');

                    // Stream the file to response
                    const fileStream = fs.createReadStream(tempFile);
                    fileStream.pipe(res);

                    fileStream.on('end', () => {
                        // Delete temp file after streaming
                        fs.unlinkSync(tempFile);
                        console.log('Temp file deleted');
                    });

                    fileStream.on('error', (error) => {
                        console.error('Stream error:', error);
                        if (fs.existsSync(tempFile)) {
                            fs.unlinkSync(tempFile);
                        }
                    });

                } catch (error) {
                    console.error('Error reading file:', error);
                    if (fs.existsSync(tempFile)) {
                        fs.unlinkSync(tempFile);
                    }
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Failed to read downloaded file' });
                    }
                }
            } else {
                console.error('yt-dlp failed with code:', code);
                console.error('Error output:', errorMsg);
                
                if (tempFile && fs.existsSync(tempFile)) {
                    fs.unlinkSync(tempFile);
                }
                
                if (!res.headersSent) {
                    res.status(500).json({ 
                        error: 'Download failed',
                        details: errorMsg || 'Unknown error occurred'
                    });
                }
            }
        });

        ytdlp.on('error', (error) => {
            console.error('Spawn error:', error);
            if (tempFile && fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to start download process' });
            }
        });

    } catch (error) {
        console.error('Error in download endpoint:', error);
        if (tempFile && fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to process download request' });
        }
    }
});

// Helper function to extract video ID
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'YouTube Downloader API is running'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(port, host, () => {
    console.log(`\n=================================`);
    console.log(`YouTube Downloader Server Started`);
    console.log(`URL: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=================================\n`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`\n❌ Port ${port} is already in use!`);
        console.log('Set a different port: set PORT=3001 && npm start\n');
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = app;