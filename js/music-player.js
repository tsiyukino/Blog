// static/js/music-player.js
document.addEventListener('DOMContentLoaded', function() {
  // Standard player elements
  const playButton = document.getElementById('play-button');
  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');
  const progressBar = document.getElementById('progress-bar');
  const progressCurrent = document.getElementById('progress-current');
  const currentTime = document.getElementById('current-time');
  const duration = document.getElementById('duration');
  const volumeSlider = document.getElementById('volume-slider');
  const playlist = document.getElementById('playlist');
  const currentTrackInfo = document.getElementById('current-track-info');
  
  // Positioning control elements
  const playerContainer = document.querySelector('.player-container');
  const minimizeButton = document.getElementById('minimize-button');
  const maximizeButton = document.getElementById('maximize-button');
  const foldButton = document.getElementById('fold-button');
  const playerHeader = document.querySelector('.player-header');
  
  // Only initialize if player elements exist on the page
  if (!playButton || !playlist) return;
  
  let audio = new Audio();
  let currentTrackIndex = 0;
  let isPlaying = false;
  
  // The siteID is used to prevent localStorage conflicts with other sites
  const siteID = document.querySelector('meta[name="site-id"]')?.content || 'hugo-music-player';
  
  // Local storage keys
  const STORAGE_KEYS = {
    CURRENT_TRACK: `${siteID}_current_track`,
    CURRENT_TIME: `${siteID}_current_time`,
    VOLUME: `${siteID}_volume`,
    IS_PLAYING: `${siteID}_is_playing`,
    IS_MINIMIZED: `${siteID}_is_minimized`,
    IS_FOLDED: `${siteID}_is_folded`
  };
  
  // Format time in minutes and seconds
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  // Update progress bar based on current audio time
  function updateProgressBar() {
    if (audio.duration) {
      const percentage = (audio.currentTime / audio.duration) * 100;
      progressCurrent.style.width = `${percentage}%`;
      currentTime.textContent = formatTime(audio.currentTime);
      duration.textContent = formatTime(audio.duration);
    } else {
      progressCurrent.style.width = '0%';
      currentTime.textContent = '0:00';
      duration.textContent = '0:00';
    }
  }
  
  // Load a track
  function loadTrack(index) {
    if (index >= 0 && index < tracks.length) {
      const track = tracks[index];
      audio.src = track.src;
      audio.load();
      
      currentTrackInfo.textContent = `${track.title} - ${track.artist}`;
      currentTrackIndex = index;
      
      // Update active track in playlist
      const playlistItems = playlist.querySelectorAll('.playlist-item');
      playlistItems.forEach((item, i) => {
        if (i === index) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      
      saveCurrentState();
    }
  }
  
  // Play or pause the current track
  function togglePlay() {
    if (audio.paused) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isPlaying = true;
          updatePlayButton();
          saveCurrentState(); // Save playing state
        }).catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    } else {
      audio.pause();
      isPlaying = false;
      updatePlayButton();
      saveCurrentState(); // Save paused state
    }
  }
  
  // Update play button icon based on playing state
  function updatePlayButton() {
    if (isPlaying) {
      playButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      `;
    } else {
      playButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
    }
  }
  
  // Play previous track
  function playPrevTrack() {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = tracks.length - 1;
    }
    loadTrack(prevIndex);
    if (isPlaying) {
      audio.play();
    }
  }
  
  // Play next track
  function playNextTrack() {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= tracks.length) {
      nextIndex = 0;
    }
    loadTrack(nextIndex);
    if (isPlaying) {
      audio.play();
    }
  }
  
  // Minimize player to just an icon
  function minimizePlayer() {
    console.log("Minimizing player");
    playerContainer.classList.add('minimized');
    localStorage.setItem(STORAGE_KEYS.IS_MINIMIZED, 'true');
  }
  
  // Maximize player from icon state
  function maximizePlayer() {
    console.log("Maximizing player");
    playerContainer.classList.remove('minimized');
    localStorage.setItem(STORAGE_KEYS.IS_MINIMIZED, 'false');
  }
  
  // Toggle playlist folding
  function toggleFold() {
    console.log("Toggling fold");
    const isCurrentlyFolded = playerContainer.classList.toggle('folded');
    localStorage.setItem(STORAGE_KEYS.IS_FOLDED, isCurrentlyFolded);
    updateFoldButton(isCurrentlyFolded);
  }

  
  // Update fold button icon
  function updateFoldButton(isFolded) {
    if (isFolded) {
      foldButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 15 12 9 18 15"></polyline>
        </svg>
      `;
      foldButton.title = "Show Playlist";
    } else {
      foldButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `;
      foldButton.title = "Hide Playlist";
    }
  }
  
  // Load saved state from localStorage
  function loadSavedState() {
    try {
      const savedTrackIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_TRACK);
      const savedTime = localStorage.getItem(STORAGE_KEYS.CURRENT_TIME);
      const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
      const wasPlaying = localStorage.getItem(STORAGE_KEYS.IS_PLAYING) === 'true';
      const isMinimized = localStorage.getItem(STORAGE_KEYS.IS_MINIMIZED) === 'true';
      const isFolded = localStorage.getItem(STORAGE_KEYS.IS_FOLDED) === 'true';
      
      if (savedVolume !== null) {
        const volume = parseFloat(savedVolume);
        if (!isNaN(volume)) {
          audio.volume = volume;
          volumeSlider.value = volume;
        }
      } else {
        audio.volume = 0.7; // Default volume
      }
      
      if (isMinimized) {
        playerContainer.classList.add('minimized');
      }
      
      if (isFolded) {
        playerContainer.classList.add('folded');
        updateFoldButton(true);
      }
      
      if (tracks.length > 0) {
        const trackIndex = savedTrackIndex !== null ? parseInt(savedTrackIndex) : 0;
        loadTrack(trackIndex >= 0 && trackIndex < tracks.length ? trackIndex : 0);
        
        if (savedTime !== null) {
          const time = parseFloat(savedTime);
          if (!isNaN(time)) {
            audio.currentTime = time;
            updateProgressBar();
          }
        }
        
        // Resume playback if it was playing before
        if (wasPlaying) {
          setTimeout(() => {
            audio.play().then(() => {
              isPlaying = true;
              updatePlayButton();
            }).catch(err => console.error("Error resuming playback:", err));
          }, 100);
        }
      }
    } catch (e) {
      console.error('Error loading saved state:', e);
      // If there's an error, reset to defaults
      if (tracks.length > 0) {
        loadTrack(0);
      }
    }
  }
  
  // Save current state to localStorage
  function saveCurrentState() {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TRACK, currentTrackIndex);
      localStorage.setItem(STORAGE_KEYS.CURRENT_TIME, audio.currentTime);
      localStorage.setItem(STORAGE_KEYS.VOLUME, audio.volume);
      localStorage.setItem(STORAGE_KEYS.IS_PLAYING, isPlaying);
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }
  
  // Initialize playlist
  function initPlaylist() {
    playlist.innerHTML = '';
    
    if (!tracks || tracks.length === 0) {
      playlist.innerHTML = '<div class="playlist-empty">No tracks available</div>';
      return;
    }
    
    tracks.forEach((track, index) => {
      const item = document.createElement('div');
      item.className = 'playlist-item';
      if (index === currentTrackIndex) {
        item.classList.add('active');
      }
      
      item.innerHTML = `
        <div class="track-number">${index + 1}</div>
        <div class="track-info">
          <div class="track-title">${track.title}</div>
          <div class="track-artist">${track.artist}</div>
        </div>
        <div class="track-duration" data-src="${track.src}">--:--</div>
      `;
      
      item.addEventListener('click', () => {
        loadTrack(index);
        if (isPlaying) {
          audio.play();
        } else {
          togglePlay();
        }
      });
      
      playlist.appendChild(item);
    });
    
    // Load durations for tracks
    loadTrackDurations();
  }
  
  // Load track durations (optimized to load on demand)
  function loadTrackDurations() {
    // Using a single Audio element to load metadata
    const metadataLoader = new Audio();
    let currentIndex = 0;
    const durationElements = Array.from(document.querySelectorAll('.track-duration'));
    
    function loadNext() {
      if (currentIndex >= durationElements.length) return;
      
      const element = durationElements[currentIndex];
      const src = element.getAttribute('data-src');
      
      metadataLoader.onloadedmetadata = () => {
        element.textContent = formatTime(metadataLoader.duration);
        currentIndex++;
        loadNext();
      };
      
      metadataLoader.onerror = () => {
        element.textContent = '--:--';
        currentIndex++;
        loadNext();
      };
      
      metadataLoader.src = src;
      metadataLoader.preload = 'metadata';
    }
    
    loadNext();
  }
  
  // Set up event listeners
  playButton.addEventListener('click', togglePlay);
  prevButton.addEventListener('click', playPrevTrack);
  nextButton.addEventListener('click', playNextTrack);
  
  // Set up additional button listeners for folding/minimizing
  if (minimizeButton) {
    minimizeButton.addEventListener('click', function(e) {
      e.stopPropagation();
      minimizePlayer();
    });
  }
  
  if (maximizeButton) {
    maximizeButton.addEventListener('click', function(e) {
      e.stopPropagation();
      maximizePlayer();
    });
  }
  
  if (foldButton) {
    foldButton.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleFold();
    });
  }
  
  progressBar.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
    updateProgressBar();
    saveCurrentState();
  });
  
  volumeSlider.addEventListener('input', function() {
    audio.volume = this.value;
    saveCurrentState();
  });
  
  audio.addEventListener('timeupdate', () => {
    updateProgressBar();
    // Save state periodically (throttled to avoid too many writes)
    if (Math.floor(audio.currentTime) % 5 === 0) {
      saveCurrentState();
    }
  });
  
  audio.addEventListener('ended', playNextTrack);
  
  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveCurrentState();
    }
  });
  
  // Save state when page is unloaded
  window.addEventListener('beforeunload', saveCurrentState);
  
  // Initialize player
  initPlaylist();
  loadSavedState();
  updatePlayButton();
});