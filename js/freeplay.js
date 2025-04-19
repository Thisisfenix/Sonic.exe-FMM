document.addEventListener("DOMContentLoaded", function() {
    const songs = [
        {
            title: "Sonic.exe 3.0 songs",
            image: "images/LogoV2.png",
            link: "mods/sonic.exe.html",
            bgColor: "#8B0000"
        },
        {
            title: "Sonic.exe rerun songs",
            image: "images/rerun_logo.png",
            link: "mods/video.html",
            bgColor: "#00008B"
        },
        {
            title: "Final Challenge",
            image: "images/mod-image3.png",
            link: "mods/final-challenge.html",
            bgColor: "#006400"
        }
    ];

    // DOM Elements
    const currentImage = document.getElementById("modImage");
    const nextImage = document.getElementById("nextImage");
    const modLink = document.getElementById("modLink");
    const modTitle = document.getElementById("modTitle");
    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");
    const songBox = document.querySelector(".song-box");
    
    let currentSongIndex = 0;
    let isAnimating = false;

    // Preload images
    function preloadImages() {
        songs.forEach(song => {
            const img = new Image();
            img.src = song.image;
        });
    }

    // Update song display with animation
    function updateSong(direction) {
        if (isAnimating) return;
        isAnimating = true;
        
        const nextIndex = direction === 'next' 
            ? (currentSongIndex + 1) % songs.length 
            : (currentSongIndex - 1 + songs.length) % songs.length;
        
        // Set next image
        nextImage.src = songs[nextIndex].image;
        nextImage.style.display = 'block';
        
        // Animation classes
        currentImage.classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');
        nextImage.classList.add(direction === 'next' ? 'slide-in-right' : 'slide-in-left');
        
        // After animation completes
        setTimeout(() => {
            // Update content
            currentSongIndex = nextIndex;
            modTitle.textContent = songs[currentSongIndex].title;
            modLink.href = songs[currentSongIndex].link;
            songBox.style.backgroundColor = songs[currentSongIndex].bgColor;
            
            // Reset images
            currentImage.src = songs[currentSongIndex].image;
            currentImage.classList.remove('slide-out-left', 'slide-out-right');
            nextImage.classList.remove('slide-in-right', 'slide-in-left');
            nextImage.style.display = 'none';
            
            isAnimating = false;
        }, 500);
    }

    // Event Listeners
    prevButton.addEventListener("click", () => updateSong('prev'));
    nextButton.addEventListener("click", () => updateSong('next'));

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (e.key === 'ArrowLeft') updateSong('prev');
        if (e.key === 'ArrowRight') updateSong('next');
    });

    // Touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    songBox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});
    
    songBox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            updateSong('next');
        } else if (touchEndX > touchStartX + threshold) {
            updateSong('prev');
        }
    }

    // Initialize
    function init() {
        preloadImages();
        modTitle.textContent = songs[currentSongIndex].title;
        modLink.href = songs[currentSongIndex].link;
        currentImage.src = songs[currentSongIndex].image;
        currentImage.style.display = 'block';
        songBox.style.backgroundColor = songs[currentSongIndex].bgColor;
    }

    init();
});