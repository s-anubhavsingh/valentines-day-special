    const emoji4 = extractEmoji(memory4) || '🎵';
    
    const text1 = removeEmojis(memory1) || 'Our first movie night';
    const text2 = removeEmojis(memory2) || 'Pizza at midnight';
    const text3 = removeEmojis(memory3) || 'Watching the sunset';
    const text4 = removeEmojis(memory4) || 'Dancing in the rain';
    
    // Get song info
    const songTitle = document.getElementById('song-title').value.trim();
    const songUrl = document.getElementById('song-url').value.trim();
    const songMessage = document.getElementById('song-message').value.trim();
    
    // Upload photos first, then build URL
    const btn = document.querySelector('.continue-btn');
    btn.textContent = 'Uploading photos... ⏳';
    btn.disabled = true;
    
    try {
        const uploadedPhotos = await uploadAllPhotos();
        window.uploadedPhotos = uploadedPhotos;
    } catch (error) {
        console.error('Photo upload failed:', error);
    }
    
    btn.textContent = 'Create & Get Shareable Link 💖';
    btn.disabled = false;
    
    // Get photo gallery - use uploaded image IDs stored in window.uploadedPhotos
    const photos = window.uploadedPhotos || [];
    
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
    
    // Build URL with parameters
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
        s: sender,
        r: receiver,
        m1: text1,
        m2: text2,
        m3: text3,
        m4: text4,
        e1: emoji1,
        e2: emoji2,
        e3: emoji3,
        e4: emoji4
    });
    
    // Add song message if provided
    if (songMessage) params.append('sm', songMessage);
    
    // Add playlist
    playlist.forEach((song, i) => {
        params.append(`st${i}`, song.title);
        params.append(`su${i}`, song.url);
    });
    
    // Add photos using their Vercel-stored URLs
    (window.uploadedPhotos || []).forEach((photo, i) => {
        const url = photo.url || photo.previewUrl; // fallback to preview if not uploaded
        params.append(`pu${i}`, url);
        params.append(`pc${i}`, photo.caption || '');
    });
    
    // Add bottle message
    if (bottleMessage) params.append('bm', bottleMessage);
    
    const shareableLink = `${baseUrl}?${params.toString()}`;
    
    // Show the link
    document.getElementById('sender-form').style.display = 'none';
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
                <div class="heart-shape" style="
                    --bg-image: url('${photo.url}');
                ">
                    <style>
                        .heart-shape:nth-child(${index + 1})::before,
                        .heart-shape:nth-child(${index + 1})::after {
                            background-image: url('${photo.url}');
                        }
                    </style>
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
window.uploadedPhotos = []; // { imageId, caption, previewUrl }

function handlePhotoUpload(event) {
    const files = Array.from(event.target.files);
    
    if (window.uploadedPhotos.length + files.length > 6) {
        alert('Maximum 6 photos allowed! 📸');
        return;
    }
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
