const saiBabaImg = "https://res.cloudinary.com/dxwdhwacd/image/upload/v1778763177/Co_JEQZUsAAcusM_ek8q0t.jpg";


const allSongs = [
    { id: 1, title: "Aao Pyare Nayan Hamare", artist: "S Ravi Kumar", url: "https://res.cloudinary.com/dxwdhwacd/video/upload/v1778757913/Aao_Pyare_Nayan_Hamare___Sung_by_S_Ravi_Kumar_p2ifrl.mp3", album: "Sai Tunes Vol 1", duration: "3:00" },
    { id: 2, title: "Arunachala Shiva", artist: "Unknown", url: "https://res.cloudinary.com/dxwdhwacd/video/upload/v1778757912/arunachala_shiva_or1qnf.mp3", album: "Sai Tunes Vol 1", duration: "3:00" },
    { id: 3, title: "Adi Narayana Sai Narayana", artist: "S Ravi Kumar", url: "https://res.cloudinary.com/dxwdhwacd/video/upload/v1778757910/Adi_Narayana_Sai_Narayana_Sung_by_S_Ravi_Kumar_jupcnv.mp3", album: "Sai Tunes Vol 1", duration: "3:00" },
    { id: 4, title: "Vighneshwara Vinayaka", artist: "S Ravi Kumar", url: "https://res.cloudinary.com/dxwdhwacd/video/upload/v1778757909/Vighneshwara_Vinayaka___Sung_by_S_Ravi_Kumar_sjevb7.mp3", album: "Sai Tunes Vol 1", duration: "3:00" },
    { id: 5, title: "Aao Aao Sai Pyare", artist: "S Ravi Kumar", url: "https://res.cloudinary.com/dxwdhwacd/video/upload/v1778757897/Aao_Aao_Sai_Pyare_Sung_by_S_Ravi_Kumar_jimkri.mp3", album: "Sai Tunes Vol 2", duration: "3:00" },
    { id: 6, title: "Allah Sai Maula Sai", artist: "Unknown", url: "https://res.cloudinary.com/dxwdhwacd/video/upload/v1778757897/allah_sai_maula_sai_poy4zq.mp3", album: "Sai Tunes Vol 2", duration: "3:00" },
    { id: 7, title: "Aao Aao Nandalala", artist: "S Ravi Kumar", url: "https://res.cloudinary.com/dxwdhwacd/video/upload/v1778757895/Aao_Aao_Nandalala___Sung_by_S_Ravi_Kumar_l2gmjw.mp3", album: "Sai Tunes Vol 2", duration: "3:00" },
    { id: 8, title: "Aanandamey Sai Naamamey", artist: "S Ravi Kumar", url: "https://res.cloudinary.com/dxwdhwacd/video/upload/v1778757887/Aanandamey_Sai_Naamamey_Sung_by_S_Ravi_Kumar_hhrmnb.mp3", album: "Sai Tunes Vol 2", duration: "3:00" }
];

// STATE
let currentContextQueue = [...allSongs];
let currentSongIndex = 0;
let isPlaying = false;
let userPlaylists = JSON.parse(localStorage.getItem('melody_playlists')) || [];
let activePlaylistId = null;
let likedSongs = JSON.parse(localStorage.getItem('melody_liked_songs')) || [];

// THEMES
const themes = {
    purple: { base: '#0f0c20', elevated: '#1a1635', rgb: '15, 12, 32' },
    ocean: { base: '#001f3f', elevated: '#003366', rgb: '0, 31, 63' },
    forest: { base: '#001a00', elevated: '#003300', rgb: '0, 26, 0' },
    sunset: { base: '#3a0e04', elevated: '#5a1606', rgb: '58, 14, 4' },
    dark: { base: '#111111', elevated: '#222222', rgb: '17, 17, 17' }
};

// DOM ELEMENTS
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const mainPlayBtns = document.querySelectorAll('.main-play-action');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const volumeBar = document.getElementById('volume-bar');
const volumeContainer = document.getElementById('volume-container');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');
const currentCover = document.getElementById('current-cover');
const likeBtn = document.getElementById('like-btn');
const forward10Btn = document.getElementById('forward-10-btn');
const backward10Btn = document.getElementById('backward-10-btn');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');

// Views
const views = {
    home: document.getElementById('view-home'),
    search: document.getElementById('view-search'),
    library: document.getElementById('view-library'),
    playlist: document.getElementById('view-playlist')
};
const navItems = document.querySelectorAll('.nav-item');
const topSearchBar = document.getElementById('top-search-bar');
const searchInput = document.getElementById('search-input');

// --- THEME LOGIC ---
function applyTheme(themeName) {
    const theme = themes[themeName];
    if (theme) {
        document.documentElement.style.setProperty('--bg-base', theme.base);
        document.documentElement.style.setProperty('--bg-elevated', theme.elevated);
        document.documentElement.style.setProperty('--bg-base-rgb', theme.rgb);
        localStorage.setItem('saitunes_theme', themeName);
    }
}
const savedTheme = localStorage.getItem('saitunes_theme') || 'purple';
applyTheme(savedTheme);

document.getElementById('open-theme-btn').addEventListener('click', () => {
    document.getElementById('theme-modal').classList.remove('hidden');
});
document.getElementById('close-theme-btn').addEventListener('click', () => {
    document.getElementById('theme-modal').classList.add('hidden');
});
document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        applyTheme(e.target.dataset.theme);
        document.getElementById('theme-modal').classList.add('hidden');
    });
});

// --- NAVIGATION LOGIC ---
function switchView(target) {
    Object.values(views).forEach(view => view.classList.add('hidden'));

    navItems.forEach(item => {
        if (item.dataset.target === target || (target === 'playlist' && item.dataset.target === 'library')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    if (views[target]) views[target].classList.remove('hidden');

    if (target === 'search') {
        topSearchBar.classList.remove('hidden');
        searchInput.focus();
    } else {
        topSearchBar.classList.add('hidden');
    }
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        switchView(item.dataset.target);
        if (item.dataset.target === 'library') renderLibraryGrid();
        sidebar.classList.remove('open'); // Close sidebar on mobile
    });
});

if(mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// --- RENDER HELPERS ---
function createSongRow(song, index, contextArray, isCustomPlaylist = false, playlistId = null) {
    const row = document.createElement('div');
    row.className = 'song-row';
    if (currentContextQueue[currentSongIndex] && currentContextQueue[currentSongIndex].id === song.id && audioPlayer.src.includes(song.url)) {
        row.classList.add('playing');
    }

    let actionBtnHTML = `<button class="add-btn" onclick="openAddModal(${song.id}, event)">Add</button>`;
    if (isCustomPlaylist) {
        actionBtnHTML = `<button class="remove-btn" title="Remove from playlist" onclick="removeFromPlaylist('${playlistId}', ${song.id}, event)"><i class="fas fa-times"></i></button>`;
    }

    row.innerHTML = `
        <div class="col col-num">
            <span class="num">${index + 1}</span>
            <i class="fas fa-play play-icon"></i>
        </div>
        <div class="col col-title">
            <div class="song-cover"><img src="${saiBabaImg}" alt="Cover" class="cover-img"></div>
            <div class="song-title-artist">
                <span class="song-name">${song.title}</span>
                <span class="song-artist">${song.artist}</span>
            </div>
        </div>
        <div class="col col-album">${song.album}</div>
        <div class="col col-actions">${actionBtnHTML}</div>
        <div class="col col-duration">${song.duration}</div>
    `;

    row.addEventListener('click', () => {
        currentContextQueue = [...contextArray];
        loadSong(index);
        playSong();
    });

    return row;
}

// --- HOME VIEW ---
function renderHome() {
    const container = document.getElementById('home-songs-container');
    container.innerHTML = '';
    document.getElementById('home-song-count').textContent = allSongs.length;

    allSongs.forEach((song, index) => {
        container.appendChild(createSongRow(song, index, allSongs));
    });
}

// --- SEARCH VIEW ---
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const resultsContainer = document.getElementById('search-songs-container');
    const emptyState = document.getElementById('search-empty-state');
    const resultsList = document.getElementById('search-results-list');

    if (!query) {
        emptyState.classList.remove('hidden');
        resultsList.classList.add('hidden');
        return;
    }

    const filtered = allSongs.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );

    emptyState.classList.add('hidden');
    resultsList.classList.remove('hidden');
    resultsContainer.innerHTML = '';

    if (filtered.length === 0) {
        resultsContainer.innerHTML = '<div style="padding: 20px; color: var(--text-subdued);">No songs found.</div>';
    } else {
        filtered.forEach((song, index) => {
            resultsContainer.appendChild(createSongRow(song, index, filtered));
        });
    }
});

// --- PLAYLIST MANAGEMENT ---
function savePlaylists() {
    localStorage.setItem('melody_playlists', JSON.stringify(userPlaylists));
    renderSidebarPlaylists();
}

function renderSidebarPlaylists() {
    const list = document.getElementById('sidebar-playlists');
    list.innerHTML = '';
    userPlaylists.forEach(pl => {
        const li = document.createElement('li');
        li.textContent = pl.name;
        if (activePlaylistId === pl.id) li.classList.add('active');
        li.addEventListener('click', () => openPlaylistView(pl.id));
        list.appendChild(li);
    });
}

function renderLibraryGrid() {
    const grid = document.getElementById('library-playlists-grid');
    const emptyState = document.getElementById('library-empty-state');

    grid.innerHTML = '';
    if (userPlaylists.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        userPlaylists.forEach(pl => {
            const card = document.createElement('div');
            card.className = 'playlist-card';
            card.innerHTML = `
                <div class="card-cover" style="overflow: hidden;"><img src="${saiBabaImg}" alt="Cover" class="cover-img"></div>
                <div class="card-title">${pl.name}</div>
                <div class="card-desc">${pl.songs.length} songs</div>
            `;
            card.addEventListener('click', () => openPlaylistView(pl.id));
            grid.appendChild(card);
        });
    }
}

function openPlaylistView(id) {
    activePlaylistId = id;
    const pl = userPlaylists.find(p => p.id === id);
    if (!pl) return;

    document.getElementById('custom-playlist-title').textContent = pl.name;
    document.getElementById('custom-playlist-count').textContent = pl.songs.length;

    const container = document.getElementById('custom-playlist-songs-container');
    const emptyState = document.getElementById('playlist-empty-state');
    container.innerHTML = '';

    if (pl.songs.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        const plSongs = pl.songs.map(songId => allSongs.find(s => s.id === songId)).filter(Boolean);
        plSongs.forEach((song, index) => {
            container.appendChild(createSongRow(song, index, plSongs, true, pl.id));
        });
    }

    switchView('playlist');
    renderSidebarPlaylists();
}

window.removeFromPlaylist = function (playlistId, songId, event) {
    event.stopPropagation();
    const pl = userPlaylists.find(p => p.id === playlistId);
    if (pl) {
        pl.songs = pl.songs.filter(id => id !== songId);
        savePlaylists();
        openPlaylistView(playlistId);
    }
}

// Modals Setup
const createModal = document.getElementById('create-playlist-modal');
const addModal = document.getElementById('add-to-playlist-modal');
let songToAddId = null;

document.getElementById('create-playlist-btn').addEventListener('click', () => {
    createModal.classList.remove('hidden');
    document.getElementById('new-playlist-name').focus();
});

document.getElementById('cancel-create-btn').addEventListener('click', () => {
    createModal.classList.add('hidden');
    document.getElementById('new-playlist-name').value = '';
});

document.getElementById('confirm-create-btn').addEventListener('click', () => {
    const name = document.getElementById('new-playlist-name').value.trim();
    if (name) {
        const newPl = {
            id: 'pl_' + Date.now(),
            name: name,
            songs: []
        };
        userPlaylists.push(newPl);
        savePlaylists();
        createModal.classList.add('hidden');
        document.getElementById('new-playlist-name').value = '';
        if (views.library.classList.contains('hidden') === false) renderLibraryGrid();
    }
});

window.openAddModal = function (songId, event) {
    event.stopPropagation();
    songToAddId = songId;
    const song = allSongs.find(s => s.id === songId);
    document.getElementById('add-song-title-display').textContent = song.title;

    const list = document.getElementById('modal-playlist-list');
    list.innerHTML = '';

    if (userPlaylists.length === 0) {
        list.innerHTML = '<li style="text-align:center; color:#a09bba;">No playlists created yet.</li>';
    } else {
        userPlaylists.forEach(pl => {
            const li = document.createElement('li');
            li.textContent = pl.name;
            li.addEventListener('click', () => {
                if (!pl.songs.includes(songId)) {
                    pl.songs.push(songId);
                    savePlaylists();
                }
                addModal.classList.add('hidden');
                if (views.playlist.classList.contains('hidden') === false && activePlaylistId === pl.id) openPlaylistView(pl.id);
            });
            list.appendChild(li);
        });
    }

    addModal.classList.remove('hidden');
};

document.getElementById('cancel-add-btn').addEventListener('click', () => {
    addModal.classList.add('hidden');
});

document.getElementById('delete-playlist-btn').addEventListener('click', () => {
    if (confirm("Are you sure you want to delete this playlist?")) {
        userPlaylists = userPlaylists.filter(pl => pl.id !== activePlaylistId);
        savePlaylists();
        switchView('library');
        renderLibraryGrid();
    }
});

// --- AUDIO PLAYER LOGIC ---
function loadSong(index) {
    if (!currentContextQueue.length) return;
    currentSongIndex = index;
    const song = currentContextQueue[currentSongIndex];
    audioPlayer.src = song.url;

    currentTitle.textContent = song.title;
    currentArtist.textContent = song.artist;
    currentCover.innerHTML = `<img src="${saiBabaImg}" alt="Cover" class="cover-img">`;

    progressBar.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    
    // Update like button state
    if (likedSongs.includes(song.id)) {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = '<i class="far fa-heart"></i>';
    }

    updateActiveRowsUI();
}

function updateActiveRowsUI() {
    if (!views.home.classList.contains('hidden')) renderHome();
    if (!views.playlist.classList.contains('hidden') && activePlaylistId) openPlaylistView(activePlaylistId);
    document.querySelectorAll('.song-row').forEach(row => {
        row.classList.remove('playing');
        const playIcon = row.querySelector('.play-icon');
        if (playIcon) {
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        }
    });

    if (audioPlayer.src) {
        document.querySelectorAll('.song-row').forEach(row => {
            const nameEl = row.querySelector('.song-name');
            if (nameEl && nameEl.textContent === currentTitle.textContent) {
                row.classList.add('playing');
                const playIcon = row.querySelector('.play-icon');
                if (playIcon && isPlaying) {
                    playIcon.classList.remove('fa-play');
                    playIcon.classList.add('fa-pause');
                }
            }
        });
    }
}

function playSong() {
    if (!audioPlayer.src) return;
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playPauseBtn.classList.add('playing');
    audioPlayer.play();
    updateActiveRowsUI();
}

function pauseSong() {
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    playPauseBtn.classList.remove('playing');
    audioPlayer.pause();
    updateActiveRowsUI();
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Controls
playPauseBtn.addEventListener('click', () => {
    if (!audioPlayer.src) {
        currentContextQueue = [...allSongs];
        loadSong(0);
        playSong();
        return;
    }
    isPlaying ? pauseSong() : playSong();
});

mainPlayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.id === 'custom-playlist-play-btn') {
            const pl = userPlaylists.find(p => p.id === activePlaylistId);
            if (pl && pl.songs.length > 0) {
                const plSongs = pl.songs.map(songId => allSongs.find(s => s.id === songId)).filter(Boolean);
                currentContextQueue = [...plSongs];
                loadSong(0);
                playSong();
            }
        } else {
            currentContextQueue = [...allSongs];
            loadSong(0);
            playSong();
        }
    });
});

prevBtn.addEventListener('click', () => {
    if (!currentContextQueue.length) return;
    currentSongIndex--;
    if (currentSongIndex < 0) currentSongIndex = currentContextQueue.length - 1;
    loadSong(currentSongIndex);
    playSong();
});

nextBtn.addEventListener('click', () => {
    if (!currentContextQueue.length) return;
    currentSongIndex++;
    if (currentSongIndex > currentContextQueue.length - 1) currentSongIndex = 0;
    loadSong(currentSongIndex);
    playSong();
});

if(forward10Btn) {
    forward10Btn.addEventListener('click', () => {
        if(audioPlayer.src) {
            audioPlayer.currentTime += 10;
        }
    });
}

if(backward10Btn) {
    backward10Btn.addEventListener('click', () => {
        if(audioPlayer.src) {
            audioPlayer.currentTime -= 10;
        }
    });
}

if(likeBtn) {
    likeBtn.addEventListener('click', () => {
        if (!currentContextQueue.length || !audioPlayer.src) return;
        const song = currentContextQueue[currentSongIndex];
        if (likedSongs.includes(song.id)) {
            likedSongs = likedSongs.filter(id => id !== song.id);
            likeBtn.classList.remove('liked');
            likeBtn.innerHTML = '<i class="far fa-heart"></i>';
        } else {
            likedSongs.push(song.id);
            likeBtn.classList.add('liked');
            likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
        }
        localStorage.setItem('melody_liked_songs', JSON.stringify(likedSongs));
    });
}

audioPlayer.addEventListener('ended', () => nextBtn.click());

audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('timeupdate', () => {
    const { currentTime, duration } = audioPlayer;
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
    }
});

progressContainer.addEventListener('click', (e) => {
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    if (duration) {
        audioPlayer.currentTime = (clickX / width) * duration;
    }
});

volumeContainer.addEventListener('click', (e) => {
    const width = volumeContainer.clientWidth;
    const clickX = e.offsetX;
    const volume = clickX / width;
    audioPlayer.volume = volume;
    volumeBar.style.width = `${volume * 100}%`;

    const volIcon = document.getElementById('volume-icon');
    if (volume === 0) volIcon.className = 'fas fa-volume-mute icon-btn small';
    else if (volume < 0.5) volIcon.className = 'fas fa-volume-down icon-btn small';
    else volIcon.className = 'fas fa-volume-up icon-btn small';
});

// --- INIT ---
renderHome();
renderSidebarPlaylists();
audioPlayer.volume = 1;
volumeBar.style.width = '100%';
