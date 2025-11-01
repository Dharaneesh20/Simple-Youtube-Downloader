// YouTube Downloader - Client-Side (Direct Browser Downloads)
// No server storage - downloads directly to user's device

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const urlInput = document.getElementById('url-input');
    const fetchBtn = document.getElementById('fetch-btn');
    const formatSelection = document.getElementById('format-selection');
    const downloadProgress = document.getElementById('download-progress');
    const qualityCards = document.querySelectorAll('.quality-card');
    
    let selectedQuality = null;
    let currentVideoUrl = null;
    let currentVideoInfo = null;

    // Event Listeners
    fetchBtn.addEventListener('click', fetchVideoInfo);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchVideoInfo();
    });

    qualityCards.forEach(card => {
        card.addEventListener('click', () => selectQuality(card));
    });

    // Fetch video information
    async function fetchVideoInfo() {
        const url = urlInput.value.trim();
        
        if (!url) {
            showNotification('Please enter a YouTube URL', 'warning');
            return;
        }

        if (!isValidYouTubeUrl(url)) {
            showNotification('Please enter a valid YouTube URL', 'error');
            return;
        }

        try {
            fetchBtn.disabled = true;
            fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
            
            // Extract video ID
            const videoId = extractVideoId(url);
            currentVideoUrl = url;
            
            // Get video info from our backend (which uses yt-dlp)
            const response = await fetch('/api/video-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch video information');
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch video info');
            }
            
            currentVideoInfo = {
                videoId: data.videoId,
                title: data.title || 'Unknown Video',
                author: data.author || 'Unknown',
                thumbnail: data.thumbnail || '',
                availableQualities: data.availableQualities || [],
                maxResolution: data.maxResolution
            };
            
            // Show format selection
            displayVideoInfo(currentVideoInfo);
            formatSelection.classList.remove('hidden');
            
            showNotification('Video found! Select quality to download', 'success');
            
        } catch (error) {
            console.error('Error:', error);
            showNotification('Failed to fetch video info. Please check the URL.', 'error');
        } finally {
            fetchBtn.disabled = false;
            fetchBtn.innerHTML = '<i class="fas fa-search"></i> <span>Fetch Formats</span>';
        }
    }

    // Display video information
    function displayVideoInfo(info) {
        const maxResInfo = info.maxResolution ? `<span style="color: #ffa500; font-size: 0.95em;"><i class="fas fa-info-circle"></i> Max: ${info.maxResolution}p</span>` : '';
        const videoInfoHtml = `
            <div class="video-info">
                <div class="video-thumbnail-container">
                    <img src="${info.thumbnail || 'https://via.placeholder.com/320x180?text=No+Thumbnail'}" 
                         alt="${info.title}" 
                         class="video-thumbnail"
                         onerror="this.src='https://via.placeholder.com/320x180?text=No+Thumbnail'">
                </div>
                <div class="video-details">
                    <h3 class="video-title">${info.title}</h3>
                    <div class="video-meta">
                        <span><i class="fas fa-user"></i> ${info.author || 'Unknown'}</span>
                        ${maxResInfo}
                    </div>
                </div>
            </div>
        `;
        
        const existingInfo = formatSelection.querySelector('.video-info');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        formatSelection.insertAdjacentHTML('afterbegin', videoInfoHtml);
        
        // Update quality cards to show which are available
        updateQualityCards(info.availableQualities || [], info.resolutionDetails || {});
    }
    
    // Update quality cards based on available resolutions
    function updateQualityCards(availableQualities, resolutionDetails) {
        const allCards = document.querySelectorAll('.quality-card');
        
        allCards.forEach(card => {
            const quality = card.dataset.quality;
            const baseQuality = quality.replace('-hdr', '');
            const isAvailable = availableQualities.includes(baseQuality);
            
            if (!isAvailable) {
                card.classList.add('disabled');
                card.style.opacity = '0.4';
                card.style.pointerEvents = 'none';
                card.setAttribute('title', 'Not available for this video');
                
                // Add unavailable badge
                if (!card.querySelector('.unavailable-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'unavailable-badge';
                    badge.innerHTML = '<i class="fas fa-ban"></i> Not Available';
                    card.appendChild(badge);
                }
            } else {
                card.classList.remove('disabled');
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
                card.setAttribute('title', 'Click to download');
                
                // Remove unavailable badge if exists
                const badge = card.querySelector('.unavailable-badge');
                if (badge) badge.remove();
            }
        });
    }

    // Select quality
    function selectQuality(card) {
        qualityCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedQuality = card.dataset.quality;
        
        // Start download immediately
        startDirectDownload();
    }

    // Start direct browser download
    async function startDirectDownload() {
        if (!currentVideoUrl || !selectedQuality) {
            showNotification('Please select a quality', 'warning');
            return;
        }

        try {
            showNotification('Starting download...', 'info');
            
            // Show progress
            downloadProgress.classList.remove('hidden');
            updateProgress(10, 'Connecting to server...');
            
            // Create download URL
            const downloadUrl = `/api/download`;
            
            // Create a hidden form to trigger download
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = downloadUrl;
            form.style.display = 'none';
            
            // Add URL parameter
            const urlInput = document.createElement('input');
            urlInput.name = 'url';
            urlInput.value = currentVideoUrl;
            form.appendChild(urlInput);
            
            // Add quality parameter
            const qualityInput = document.createElement('input');
            qualityInput.name = 'quality';
            qualityInput.value = selectedQuality;
            form.appendChild(qualityInput);
            
            document.body.appendChild(form);
            
            updateProgress(30, 'Preparing download...');
            
            // Use fetch to download with progress tracking
            const response = await fetch(downloadUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: currentVideoUrl,
                    quality: selectedQuality
                })
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.statusText}`);
            }

            updateProgress(50, 'Downloading video...');

            // Get the blob
            const blob = await response.blob();
            
            updateProgress(90, 'Finalizing download...');

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentVideoInfo.title.replace(/[^a-z0-9]/gi, '_')}_${selectedQuality}.mp4`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                document.body.removeChild(form);
            }, 100);

            updateProgress(100, 'Download complete!');
            
            setTimeout(() => {
                downloadProgress.classList.add('hidden');
                showNotification('Download completed! Check your downloads folder', 'success');
                createCelebrationParticles();
            }, 1000);
            
        } catch (error) {
            console.error('Download error:', error);
            downloadProgress.classList.add('hidden');
            showNotification(`Download failed: ${error.message}`, 'error');
        }
    }

    // Get direct download link
    async function getDirectDownloadLink(videoId, quality) {
        try {
            // Call our backend API that uses yt-dlp to get the direct link
            const response = await fetch('/api/get-download-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    quality: quality
                })
            });

            const data = await response.json();
            
            if (data.success && data.downloadUrl) {
                return data.downloadUrl;
            } else {
                console.error('API error:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Failed to get download link:', error);
            return null;
        }
    }

    // Trigger browser download
    function triggerBrowserDownload(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'video.mp4';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Fallback: Open YouTube directly
    function openYouTubeDirectly() {
        showNotification('Opening YouTube... Use your browser extension or right-click to download', 'info');
        window.open(currentVideoUrl, '_blank');
        downloadProgress.classList.add('hidden');
    }

    // Helper Functions
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

    function isValidYouTubeUrl(url) {
        const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        return youtubePattern.test(url) || /^[a-zA-Z0-9_-]{11}$/.test(url);
    }

    function updateProgress(percent, stage) {
        const progressBar = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const progressContainer = downloadProgress.querySelector('.progress-container h2');
        
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressText) progressText.textContent = stage || (percent + '%');
        if (progressContainer) progressContainer.textContent = percent === 100 ? 'Complete!' : 'Processing...';
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    function createCelebrationParticles() {
        const colors = ['#ff0055', '#0066ff', '#00e676', '#ffab00'];
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }
    }
});