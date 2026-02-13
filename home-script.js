// Personalization System with URL Parameters
let senderName, receiverName, visitorName, isSender;
let memories = {};
let emojis = {};

// Check if URL has parameters (shared link) or if it's a fresh visit
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('p')) {
        // Short page ID - load from backend
        loadFromBackend(urlParams.get('p'));
    } else if (urlParams.has('s')) {
        // Old long URL format - still supported
        loadFromURL(urlParams);
        showReceiverForm();
    } else {
        // Fresh visit - show customization form
        document.getElementById('sender-form').style.display = 'block';
        document.getElementById('receiver-form').style.display = 'none';
    }
});

// Load page data from backend using short ID
async function loadFromBackend(pageId) {
    try {
        const response = await fetch(`/api/save-page?id=${pageId}`);
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // Set all the data
            senderName = data.sender;
            receiverName = data.receiver;
            
            memories = {
                1: data.memories.text1,
                2: data.memories.text2,
                3: data.memories.text3,
                4: data.memories.text4
            };
            
            emojis = {
                1: data.emojis.emoji1,
                2: data.emojis.emoji2,
                3: data.emojis.emoji3,
                4: data.emojis.emoji4
            };
            
            window.songMessage = data.songMessage;
            window.playlist = data.playlist || [];
            window.photos = data.photos || [];
            window.bottleMessage = data.bottleMessage;
            
            showReceiverForm();
        } else {
            alert('This Valentine page could not be found! 💔');
        }
    } catch (error) {
        console.error('Failed to load page:', error);
        alert('Failed to load this page. Please check the link! 💕');
    }
}


// Load customization from URL parameters
function loadFromURL(params) {
    senderName = decodeURIComponent(params.get('s') || '');
    receiverName = decodeURIComponent(params.get('r') || '');
    
    memories = {
        1: decodeURIComponent(params.get('m1') || 'Our first movie night'),
        2: decodeURIComponent(params.get('m2') || 'Pizza at midnight'),
        3: decodeURIComponent(params.get('m3') || 'Watching the sunset'),
        4: decodeURIComponent(params.get('m4') || 'Dancing in the rain')
    };
    
    emojis = {
        1: decodeURIComponent(params.get('e1') || '🎬'),
        2: decodeURIComponent(params.get('e2') || '🍕'),
        3: decodeURIComponent(params.get('e3') || '🌅'),
        4: decodeURIComponent(params.get('e4') || '🎵')
    };
    
    // Load song data and playlist
    window.playlist = [];
    window.songMessage = params.get('sm') ? decodeURIComponent(params.get('sm')) : null;
    
    for (let i = 0; i < 5; i++) {
        const title = params.get(`st${i}`);
        const url = params.get(`su${i}`);
        if (title && url) {
            window.playlist.push({
                title: decodeURIComponent(title),
                url: decodeURIComponent(url)
            });
        }
    }
    
    // Load photos
    window.photos = [];
    for (let i = 0; i < 6; i++) {
        const url = params.get(`pu${i}`);
        const caption = params.get(`pc${i}`);
        if (url) {
            window.photos.push({
                url: decodeURIComponent(url),
                caption: caption ? decodeURIComponent(caption) : ''
            });
        }
    }
    
    // Load bottle message
    window.bottleMessage = params.get('bm') ? decodeURIComponent(params.get('bm')) : null;
}

// Show receiver form with greeting
function showReceiverForm() {
    document.getElementById('sender-form').style.display = 'none';
    document.getElementById('link-display').style.display = 'none';
    document.getElementById('receiver-form').style.display = 'block';
    document.querySelector('.greeting-text').textContent = 
        `${senderName} has created something special for ${receiverName}! ✨`;
}

// Generate shareable link with all customization
async function generateShareableLink() {
    const sender = document.getElementById('sender-name').value.trim();
    const receiver = document.getElementById('receiver-name').value.trim();
    
    if (!sender || !receiver) {
        alert('Please enter both names! 💕');
        return;
    }
    
    // Get memories
    const memory1 = document.getElementById('memory1').value.trim();
    const memory2 = document.getElementById('memory2').value.trim();
    const memory3 = document.getElementById('memory3').value.trim();
    const memory4 = document.getElementById('memory4').value.trim();
    
    // Extract emojis and text
    const emoji1 = extractEmoji(memory1) || '🎬';
    const emoji2 = extractEmoji(memory2) || '🍕';
    const emoji3 = extractEmoji(memory3) || '🌅';
    const emoji4 = extractEmoji(memory4) || '🎵';
    
    const text1 = removeEmojis(memory1) || 'Our first movie night';
    const text2 = removeEmojis(memory2) || 'Pizza at midnight';
    const text3 = removeEmojis(memory3) || 'Watching the sunset';
    const text4 = removeEmojis(memory4) || 'Dancing in the rain';
    
    // Get song info
    const songTitle = document.getElementById('song-title').value.trim();
    const songUrl = document.getElementById('song-url').value.trim();
    const songMessage = document.getElementById('song-message').value.trim();
    
    // Upload photos first
    const btn = document.querySelector('.continue-btn');
    btn.textContent = 'Uploading photos... ⏳';
    btn.disabled = true;
    
    try {
        const uploadedPhotos = await uploadAllPhotos();
        window.uploadedPhotos = uploadedPhotos;
    } catch (error) {
        console.error('Photo upload failed:', error);
    }
    
    btn.textContent = 'Creating your page... 💖';
    
    // Get bottle message
    const bottleMessage = document.getElementById('bottle-message').value.trim();
    
    // Get playlist songs (including main song as song 1)
    const playlist = [];
    if (songTitle && songUrl) {
        playlist.push({ title: songTitle, url: songUrl });
    }
    for (let i = 2; i <= 5; i++) {
        const title = document.getElementById(`song${i}-title`).value.trim();
        const url = document.getElementById(`song${i}-url`).value.trim();
        if (title && url) {
            playlist.push({ title, url });
        }
    }
    
    // Build data object
    const pageData = {
        sender,
        receiver,
        memories: { text1, text2, text3, text4 },
        emojis: { emoji1, emoji2, emoji3, emoji4 },
        songMessage,
        playlist,
        photos: (window.uploadedPhotos || []).map(p => ({ url: p.url, caption: p.caption })),
        bottleMessage,
        createdAt: new Date().toISOString()
    };
    
    try {
        // Save to backend
        const response = await fetch('/api/save-page', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pageData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Create short URL
            const baseUrl = window.location.origin + window.location.pathname;
            const shareableLink = `${baseUrl}?p=${result.pageId}`;
            
            // Show the link
            document.getElementById('sender-form').style.display = 'none';
            document.getElementById('link-display').style.display = 'block';
            document.getElementById('shareable-link').value = shareableLink;
            
            // Store for preview
            senderName = sender;
            receiverName = receiver;
            memories = { 1: text1, 2: text2, 3: text3, 4: text4 };
            emojis = { 1: emoji1, 2: emoji2, 3: emoji3, 4: emoji4 };
            window.playlist = playlist;
            window.photos = pageData.photos;
            window.bottleMessage = bottleMessage;
            window.songMessage = songMessage;
            
            btn.textContent = 'Create & Get Shareable Link 💖';
            btn.disabled = false;
        } else {
            throw new Error(result.error || 'Failed to save page');
        }
    } catch (error) {
        console.error('Save error:', error);
        alert('Failed to create shareable link. Please try again! 💕');
        btn.textContent = 'Create & Get Shareable Link 💖';
        btn.disabled = false;
    }
}

    document.getElementById('link-display').style.display = 'block';
    document.getElementById('shareable-link').value = shareableLink;
    
    // Store for preview
    senderName = sender;
    receiverName = receiver;
    memories = { 1: text1, 2: text2, 3: text3, 4: text4 };
    emojis = { 1: emoji1, 2: emoji2, 3: emoji3, 4: emoji4 };
}

// Copy link to clipboard
function copyLink() {
    const linkInput = document.getElementById('shareable-link');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // For mobile
    
    navigator.clipboard.writeText(linkInput.value).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        alert('Link copied! You can now paste and share it! 💕');
    });
}

// Preview the customized page
function previewPage() {
    visitorName = senderName;
    isSender = true;
    hideWelcomeScreen();
    updatePersonalization();
}

// Start over to create a new page
function startOver() {
    window.location.href = window.location.origin + window.location.pathname;
}

// Receiver enters their name
function saveReceiverInfo() {
    const visitor = document.getElementById('visitor-name').value.trim();
    
    if (!visitor) {
        alert('Please enter your name! 💕');
        return;
    }
    
    visitorName = visitor;
    isSender = false;
    
    hideWelcomeScreen();
    updatePersonalization();
}

// Hide welcome screen
function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    welcomeScreen.classList.add('hidden');
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
    }, 500);
}

// Update page with personalization
function updatePersonalization() {
    // Update hero section
    document.getElementById('hero-name').textContent = visitorName;
    
    if (isSender) {
        document.getElementById('hero-from').textContent = `from you to ${receiverName}`;
    } else {
        document.getElementById('hero-from').textContent = `from ${senderName}`;
    }
    
    // Update memories
    for (let i = 1; i <= 4; i++) {
        if (memories[i]) {
            document.getElementById(`memory-text-${i}`).textContent = memories[i];
        }
        if (emojis[i]) {
            document.getElementById(`emoji${i}`).textContent = emojis[i];
        }
    }
    
    // Show and update music/playlist section if songs exist
    if (window.playlist && window.playlist.length > 0) {
        if (window.playlist.length === 1) {
            // Show cassette tape for single song
            document.getElementById('music-section').style.display = 'block';
            document.getElementById('cassette-song-title').textContent = window.playlist[0].title;
            
            if (window.songMessage) {
                document.getElementById('song-message-display').textContent = window.songMessage;
            } else {
                document.getElementById('song-message-display').textContent = `${senderName} chose this song just for you 💕`;
            }
            
            window.youtubeVideoId = extractYouTubeID(window.playlist[0].url);
        } else {
            // Show playlist for multiple songs
            document.getElementById('playlist-section').style.display = 'block';
            initPlaylist();
        }
    }
    
    // Show and update photo gallery if photos exist
    if (window.photos && window.photos.length > 0) {
        document.getElementById('photo-gallery-section').style.display = 'block';
        const heartGallery = document.getElementById('heart-gallery');
        heartGallery.innerHTML = '';
        
        const flowers = ['🌸', '🌺', '🌼', '🌻'];
        window.photos.forEach((photo, index) => {
            const heartPhoto = document.createElement('div');
            heartPhoto.className = 'heart-photo';
            heartPhoto.innerHTML = `
                <div class="flower-decoration">${flowers[0]}</div>
                <div class="flower-decoration">${flowers[1]}</div>
                <div class="flower-decoration">${flowers[2]}</div>
                <div class="flower-decoration">${flowers[3]}</div>
                <div class="heart-shape-wrapper">
                    <img src="${photo.url}" alt="${photo.caption || 'Love'}" class="heart-image">
                </div>
                <div class="heart-caption">${photo.caption || 'A special moment'}</div>
            `;
            heartGallery.appendChild(heartPhoto);
        });
    }
    
    // Show and update bottle message if exists
    if (window.bottleMessage) {
        document.getElementById('bottle-section').style.display = 'block';
        document.getElementById('bottle-message-text').textContent = window.bottleMessage;
    }
    
    // Show love calculator
    document.getElementById('love-calculator-section').style.display = 'block';
    setTimeout(() => calculateLove(), 1000);
}

// Extract YouTube video ID from URL
function extractYouTubeID(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// Music player functionality
let player;
let isPlaying = false;

function togglePlay() {
    if (!window.youtubeVideoId) {
        alert('No song URL provided! 🎵');
        return;
    }
    
    if (!player) {
        // Create YouTube player
        loadYouTubePlayer();
    } else {
        if (isPlaying) {
            player.pauseVideo();
            stopReels();
            document.getElementById('play-icon').textContent = '▶️';
            isPlaying = false;
        } else {
            player.playVideo();
            spinReels();
            document.getElementById('play-icon').textContent = '⏸️';
            isPlaying = true;
        }
    }
}

function loadYouTubePlayer() {
    // Load YouTube API
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = createPlayer;
    } else {
        createPlayer();
    }
}

function createPlayer() {
    player = new YT.Player('yt-player', {
        height: '0',
        width: '0',
        videoId: window.youtubeVideoId,
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    
    // Add hidden player div if not exists
    if (!document.getElementById('yt-player')) {
        const playerDiv = document.createElement('div');
        playerDiv.id = 'yt-player';
        playerDiv.style.display = 'none';
        document.body.appendChild(playerDiv);
    }
}

function onPlayerReady(event) {
    event.target.playVideo();
    spinReels();
    document.getElementById('play-icon').textContent = '⏸️';
    isPlaying = true;
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        spinReels();
        document.getElementById('play-icon').textContent = '⏸️';
        isPlaying = true;
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        stopReels();
        document.getElementById('play-icon').textContent = '▶️';
        isPlaying = false;
    }
}

function spinReels() {
    document.getElementById('left-reel').classList.add('spinning');
    document.getElementById('right-reel').classList.add('spinning');
}

function stopReels() {
    document.getElementById('left-reel').classList.remove('spinning');
    document.getElementById('right-reel').classList.remove('spinning');
}

// Bottle Message Functions
let bottleOpened = false;

function openBottle() {
    if (bottleOpened) return;
    
    const bottle = document.getElementById('bottle');
    const btn = document.getElementById('open-bottle-btn');
    const messageDisplay = document.getElementById('bottle-message-display');
    
    // Animate bottle cork popping
    bottle.style.animation = 'shake 0.5s';
    
    setTimeout(() => {
        bottleOpened = true;
        btn.style.display = 'none';
        messageDisplay.style.display = 'block';
        
        // Confetti effect
        for (let i = 0; i < 30; i++) {
            createConfetti();
        }
    }, 500);
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = ['#FF6B9D', '#FFB3BA', '#FFDFBA', '#4682B4'][Math.floor(Math.random() * 4)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-20px';
    confetti.style.zIndex = '1000';
    confetti.style.borderRadius = '50%';
    
    document.body.appendChild(confetti);
    
    const animation = confetti.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], {
        duration: 2000 + Math.random() * 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    animation.onfinish = () => confetti.remove();
}

// Photo Upload System
if (typeof window.uploadedPhotos === 'undefined') {
    window.uploadedPhotos = []; // { imageId, caption, previewUrl }
}

// Make function globally accessible
window.handlePhotoUpload = function(event) {
    console.log('handlePhotoUpload called', event);
    
    if (!event || !event.target || !event.target.files) {
        console.error('Invalid event object');
        alert('Error: Could not access files. Please try again!');
        return;
    }
    
    const files = Array.from(event.target.files);
    console.log('Files selected:', files.length);
    
    if (files.length === 0) {
        alert('No files selected!');
        return;
    }
    
    if (!window.uploadedPhotos) {
        window.uploadedPhotos = [];
    }
    
    if (window.uploadedPhotos.length + files.length > 6) {
        alert('Maximum 6 photos allowed! 📸');
        return;
    }
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            console.log('Skipping non-image file:', file.name);
            return;
        }
        
        console.log('Processing image:', file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewUrl = e.target.result;
            addPhotoPreview(previewUrl, file);
        };
        reader.onerror = (e) => {
            console.error('FileReader error:', e);
            alert('Error reading file. Please try a different image!');
        };
        reader.readAsDataURL(file);
    });
    
    // Reset input so same file can be selected again
    event.target.value = '';
}

function addPhotoPreview(previewUrl, file) {
    console.log('addPhotoPreview called', file.name);
    
    const previews = document.getElementById('photo-previews');
    if (!previews) {
        console.error('photo-previews element not found!');
        return;
    }
    
    const index = window.uploadedPhotos.length;
    window.uploadedPhotos.push({ previewUrl, caption: '', imageId: null, file });
    
    const item = document.createElement('div');
    item.className = 'photo-preview-item';
    item.id = `preview-${index}`;
    item.innerHTML = `
        <img src="${previewUrl}" alt="Photo ${index + 1}">
        <input type="text" placeholder="Add a caption..." 
               onchange="updateCaption(${index}, this.value)"
               value="">
        <button class="remove-photo" onclick="removePhoto(${index})">✕</button>
    `;
    previews.appendChild(item);
    
    console.log('Preview added, total photos:', window.uploadedPhotos.length);
    
    // Show upload count
    updateUploadStatus();
}

function updateCaption(index, value) {
    if (window.uploadedPhotos[index]) {
        window.uploadedPhotos[index].caption = value;
    }
}

function removePhoto(index) {
    window.uploadedPhotos.splice(index, 1);
    
    // Re-render all previews
    const previews = document.getElementById('photo-previews');
    previews.innerHTML = '';
    const temp = [...window.uploadedPhotos];
    window.uploadedPhotos = [];
    temp.forEach(photo => addPhotoPreview(photo.previewUrl, photo.file));
    
    updateUploadStatus();
}

function updateUploadStatus() {
    const count = window.uploadedPhotos.length;
    const status = document.getElementById('upload-status');
    if (count === 0) {
        status.textContent = '';
    } else {
        status.textContent = `✓ ${count} photo${count > 1 ? 's' : ''} ready to upload`;
        status.className = 'upload-status success';
    }
}

async function uploadAllPhotos() {
    const photosToUpload = window.uploadedPhotos.filter(p => !p.url);
    
    if (photosToUpload.length === 0) return window.uploadedPhotos;
    
    const status = document.getElementById('upload-status');
    status.textContent = '⏳ Uploading photos...';
    status.className = 'upload-status uploading';
    
    const uploadPromises = window.uploadedPhotos.map(async (photo, index) => {
        if (photo.url) return photo; // Already uploaded
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageData: photo.previewUrl,
                    fileName: `photo_${index}`
                })
            });
            
            const data = await response.json();
            if (data.success) {
                // Vercel Blob returns a direct public URL
                photo.url = data.url;
                return photo;
            } else {
                console.error('Upload failed:', data.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
        return photo;
    });
    
    const results = await Promise.all(uploadPromises);
    
    const successCount = results.filter(p => p.url).length;
    status.textContent = `✅ ${successCount} photo${successCount > 1 ? 's' : ''} uploaded successfully!`;
    status.className = 'upload-status success';
    
    return results;
}

// Setup drag and drop
document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-area');
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            handlePhotoUpload({ target: { files, value: '' } });
        }
    });
});

// Love Calculator Functions
let loveCalculated = false;

function calculateLove() {
    if (loveCalculated) {
        // Reset and recalculate
        document.getElementById('calculating').style.display = 'block';
        document.getElementById('love-result').style.display = 'none';
        loveCalculated = false;
        setTimeout(() => calculateLove(), 500);
        return;
    }
    
    // Generate percentage between 90-100
    const percentage = Math.floor(Math.random() * 11) + 90;
    
    setTimeout(() => {
        document.getElementById('calculating').style.display = 'none';
        document.getElementById('love-result').style.display = 'block';
        
        // Animate circle
        const circle = document.getElementById('progress-circle');
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (percentage / 100) * circumference;
        
        circle.style.transition = 'stroke-dashoffset 2s ease-out';
        circle.style.strokeDashoffset = offset;
        
        // Animate percentage text
        animatePercentage(percentage);
        
        // Set messages based on percentage
        let title, message;
        if (percentage >= 98) {
            title = '💕 Soulmates! 💕';
            message = 'You two are absolutely perfect for each other! A match made in heaven! ✨';
        } else if (percentage >= 95) {
            title = '💖 Perfect Match! 💖';
            message = 'Your love is incredibly strong! You complete each other beautifully! 🌟';
        } else if (percentage >= 92) {
            title = '💗 Amazing Connection! 💗';
            message = 'You have something truly special! Your bond is unbreakable! 💫';
        } else {
            title = '💝 Beautiful Love! 💝';
            message = 'Your love is genuine and wonderful! Keep cherishing each other! 🌹';
        }
        
        document.getElementById('result-title').textContent = title;
        document.getElementById('result-message').textContent = message;
        
        loveCalculated = true;
    }, 2000);
}

function animatePercentage(target) {
    const element = document.getElementById('percentage-text');
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const steps = 50;
    const stepDuration = duration / steps;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '%';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '%';
        }
    }, stepDuration);
}

// Playlist Functions
let currentSongIndex = 0;
let playlistPlayer = null;
let isPlaylistPlaying = false;

function initPlaylist() {
    document.getElementById('total-songs').textContent = window.playlist.length;
    
    const songList = document.getElementById('song-list');
    songList.innerHTML = '';
    
    window.playlist.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item' + (index === 0 ? ' active' : '');
        songItem.onclick = () => selectSong(index);
        songItem.innerHTML = `
            <div class="song-number">${index + 1}</div>
            <div class="song-info">
                <div class="song-name">${song.title}</div>
            </div>
        `;
        songList.appendChild(songItem);
    });
    
    selectSong(0);
}

function selectSong(index) {
    currentSongIndex = index;
    const song = window.playlist[index];
    
    document.getElementById('current-song-title').textContent = song.title;
    document.getElementById('current-song-number').textContent = `Track ${index + 1} of ${window.playlist.length}`;
    
    // Update active state
    document.querySelectorAll('.song-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
    
    // Update YouTube video ID
    window.currentPlaylistVideoId = extractYouTubeID(song.url);
    
    // If currently playing, load new song
    if (isPlaylistPlaying && playlistPlayer) {
        playlistPlayer.loadVideoById(window.currentPlaylistVideoId);
    }
}

function togglePlaylistPlay() {
    if (!window.currentPlaylistVideoId) {
        alert('No song URL provided! 🎵');
        return;
    }
    
    if (!playlistPlayer) {
        loadPlaylistPlayer();
    } else {
        if (isPlaylistPlaying) {
            playlistPlayer.pauseVideo();
            stopVinyl();
            document.getElementById('play-icon-playlist').textContent = '▶️';
            isPlaylistPlaying = false;
        } else {
            playlistPlayer.playVideo();
            spinVinyl();
            document.getElementById('play-icon-playlist').textContent = '⏸️';
            isPlaylistPlaying = true;
        }
    }
}

function loadPlaylistPlayer() {
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = createPlaylistPlayer;
    } else {
        createPlaylistPlayer();
    }
}

function createPlaylistPlayer() {
    // Add hidden player div if not exists
    if (!document.getElementById('yt-player-playlist')) {
        const playerDiv = document.createElement('div');
        playerDiv.id = 'yt-player-playlist';
        playerDiv.style.display = 'none';
        document.body.appendChild(playerDiv);
    }
    
    playlistPlayer = new YT.Player('yt-player-playlist', {
        height: '0',
        width: '0',
        videoId: window.currentPlaylistVideoId,
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onPlaylistPlayerReady,
            'onStateChange': onPlaylistPlayerStateChange
        }
    });
}

function onPlaylistPlayerReady(event) {
    event.target.playVideo();
    spinVinyl();
    document.getElementById('play-icon-playlist').textContent = '⏸️';
    isPlaylistPlaying = true;
}

function onPlaylistPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        spinVinyl();
        document.getElementById('play-icon-playlist').textContent = '⏸️';
        isPlaylistPlaying = true;
    } else if (event.data === YT.PlayerState.PAUSED) {
        stopVinyl();
        document.getElementById('play-icon-playlist').textContent = '▶️';
        isPlaylistPlaying = false;
    } else if (event.data === YT.PlayerState.ENDED) {
        // Auto-play next song
        nextSong();
    }
}

function previousSong() {
    if (currentSongIndex > 0) {
        selectSong(currentSongIndex - 1);
        if (isPlaylistPlaying && playlistPlayer) {
            playlistPlayer.playVideo();
        }
    }
}

function nextSong() {
    if (currentSongIndex < window.playlist.length - 1) {
        selectSong(currentSongIndex + 1);
        if (isPlaylistPlaying && playlistPlayer) {
            playlistPlayer.playVideo();
        }
    } else {
        // Loop back to first song
        selectSong(0);
        if (isPlaylistPlaying && playlistPlayer) {
            playlistPlayer.playVideo();
        }
    }
}

function spinVinyl() {
    document.getElementById('vinyl-record').classList.add('spinning');
}

function stopVinyl() {
    document.getElementById('vinyl-record').classList.remove('spinning');
}


// Dark Mode Toggle
let isDarkMode = false;

function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.body;
    const btn = document.getElementById('theme-toggle');
    
    if (isDarkMode) {
        body.classList.add('dark-mode');
        btn.textContent = '☀️ Light Mode';
    } else {
        body.classList.remove('dark-mode');
        btn.textContent = '🌙 Night Mode';
    }
    
    // Save preference
    localStorage.setItem('darkMode', isDarkMode);
}

// Load dark mode preference on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        isDarkMode = false; // Set to false so toggle makes it true
        toggleTheme();
    }
});


// Helper function to extract first emoji from string
function extractEmoji(text) {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    const match = text.match(emojiRegex);
    return match ? match[0] : null;
}

// Helper function to remove emojis from string
function removeEmojis(text) {
    return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
}


// Love Quotes
const quotes = [
    {
        text: "You are my today and all of my tomorrows",
        author: "Leo Christopher"
    },
    {
        text: "In all the world, there is no heart for me like yours",
        author: "Maya Angelou"
    },
    {
        text: "I love you not only for what you are, but for what I am when I am with you",
        author: "Roy Croft"
    },
    {
        text: "You know you're in love when you can't fall asleep because reality is finally better than your dreams",
        author: "Dr. Seuss"
    },
    {
        text: "The best thing to hold onto in life is each other",
        author: "Audrey Hepburn"
    },
    {
        text: "I wish there was a word more than 'love' itself to convey what I feel for you",
        author: "Faraaz Kazi"
    }
];

let currentQuoteIndex = 0;

function showQuote(index) {
    const quoteCards = document.querySelectorAll('.quote-card');
    quoteCards.forEach(card => card.classList.remove('active'));
    
    // Remove existing cards
    const carousel = document.querySelector('.quotes-carousel');
    carousel.innerHTML = '';
    
    // Create and show new quote
    const quoteCard = document.createElement('div');
    quoteCard.className = 'quote-card active';
    quoteCard.innerHTML = `
        <p class="quote-text">"${quotes[index].text}"</p>
        <p class="quote-author">- ${quotes[index].author}</p>
    `;
    carousel.appendChild(quoteCard);
}

function nextQuote() {
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    showQuote(currentQuoteIndex);
}

function previousQuote() {
    currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
    showQuote(currentQuoteIndex);
}

// Auto-rotate quotes every 8 seconds
setInterval(nextQuote, 8000);

// Countdown Timer
let specialDate = localStorage.getItem('specialDate');

function updateCountdown() {
    if (!specialDate) {
        document.getElementById('days').textContent = '---';
        document.getElementById('hours').textContent = '--';
        document.getElementById('minutes').textContent = '--';
        return;
    }
    
    const start = new Date(specialDate);
    const now = new Date();
    const diff = now - start;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
}

function setDate() {
    const dateInput = prompt("Enter our special date (YYYY-MM-DD):", "2024-02-14");
    if (dateInput) {
        specialDate = dateInput;
        localStorage.setItem('specialDate', specialDate);
        updateCountdown();
    }
}

// Update countdown every minute
updateCountdown();
setInterval(updateCountdown, 60000);

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add more floating hearts dynamically
function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.style.position = 'fixed';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.bottom = '-50px';
    heart.style.fontSize = '30px';
    heart.style.opacity = '0.3';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '0';
    heart.textContent = ['💕', '💖', '💗', '💘', '💝'][Math.floor(Math.random() * 5)];
    
    document.body.appendChild(heart);
    
    const duration = 15000 + Math.random() * 10000;
    const animation = heart.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 0 },
        { opacity: 0.3, offset: 0.1 },
        { opacity: 0.3, offset: 0.9 },
        { transform: `translateY(-${window.innerHeight + 100}px) rotate(360deg)`, opacity: 0 }
    ], {
        duration: duration,
        easing: 'linear'
    });
    
    animation.onfinish = () => heart.remove();
}

// Create floating hearts periodically
setInterval(createFloatingHeart, 3000);

// Initial hearts
for (let i = 0; i < 5; i++) {
    setTimeout(createFloatingHeart, i * 600);
}