document.addEventListener("DOMContentLoaded", function() {
    // Configuración de canciones con estilo Sonic.exe
    const songs = [
        {
            title: "TOO SLOW",
            image: "images/Too_Slow_Artwork.png",
            link: "mods/too_slow.zip",
            color: "#FF00FF",
            bgColor: "rgba(106, 0, 244, 0.3)"
        },
        {
            title: "YOU CAN'T RUN",
            image: "images/cant_run_artwork.png",
            link: "mods/cant_run.zip",
            color: "#FF0000",
            bgColor: "rgba(139, 0, 0, 0.3)"
        },
        {
            title: "FATAL ERROR",
            image: "images/fatal_error_artwork.png",
            link: "mods/fatal_error.zip",
            color: "#00FFFF",
            bgColor: "rgba(0, 139, 139, 0.3)"
        }
    ];

    let currentSongIndex = 0;
    let isTransitioning = false;

    // Elementos del DOM - CORRECCIÓN AQUÍ
    const elements = {
        songDisplay: document.getElementById("songImage"),
        modLink: document.getElementById("downloadButton"),
        modTitle: document.getElementById("songTitle"),
        prevButton: document.getElementById("prevButton"),
        nextButton: document.getElementById("nextButton"), // Este era el error (antes estaba downloadButton)
        difficultyBadge: document.querySelector(".difficulty-badge"),
        songContainer: document.querySelector(".song-container"),
        progressBar: document.getElementById("songProgress")
    };

    // Efectos de sonido (opcional)
    const sounds = {
        select: new Audio('sounds/select.ogg'),
        confirm: new Audio('sounds/confirm.ogg'),
        scroll: new Audio('sounds/scroll.ogg')
    };

    // Función para actualizar la canción con efectos
    function updateSong() {
        if (isTransitioning) return;
        isTransitioning = true;

        // Efecto de desvanecimiento
        elements.songContainer.style.animation = 'fadeOut 0.3s forwards';
        if (sounds.scroll) sounds.scroll.play();

        setTimeout(() => {
            // Actualizar contenido
            const currentSong = songs[currentSongIndex];
            
            elements.modTitle.textContent = currentSong.title;
            elements.songDisplay.src = currentSong.image;
            elements.modLink.href = currentSong.link;
            elements.difficultyBadge.textContent = currentSong.difficulty;
            elements.difficultyBadge.style.color = currentSong.color;
            elements.songContainer.style.borderColor = currentSong.color;
            elements.progressBar.style.backgroundColor = currentSong.color;
            
            // Efecto de entrada
            elements.songContainer.style.animation = 'fadeIn 0.3s forwards';
            
            // Resetear barra de progreso
            animateProgressBar();
            
            isTransitioning = false;
        }, 300);
    }

    // Animación de la barra de progreso
    function animateProgressBar() {
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
            } else {
                width++;
                elements.progressBar.style.width = width + '%';
            }
        }, 30);
    }

    // Navegación entre canciones
    elements.prevButton.addEventListener("click", () => {
        if (isTransitioning) return;
        currentSongIndex = (currentSongIndex === 0) ? songs.length - 1 : currentSongIndex - 1;
        updateSong();
    });

    elements.nextButton.addEventListener("click", () => {
        if (isTransitioning) return;
        currentSongIndex = (currentSongIndex === songs.length - 1) ? 0 : currentSongIndex + 1;
        updateSong();
    });

    // Navegación por teclado
    document.addEventListener("keydown", (e) => {
        if (isTransitioning) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                currentSongIndex = (currentSongIndex === 0) ? songs.length - 1 : currentSongIndex - 1;
                updateSong();
                break;
            case 'ArrowRight':
                currentSongIndex = (currentSongIndex === songs.length - 1) ? 0 : currentSongIndex + 1;
                updateSong();
                break;
            case 'Enter':
                if (sounds.confirm) sounds.confirm.play();
                break;
        }
    });

    // Efecto hover en botones
    const buttons = document.querySelectorAll('.nav-button, .download-button, .menu-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (sounds.select) sounds.select.play();
            button.style.transform = 'scale(1.1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });

    // Inicialización
    updateSong();
    animateProgressBar();

    // Efecto CRT aleatorio
    setInterval(() => {
        if (Math.random() > 0.7) {
            document.querySelector('.crt-overlay').classList.add('glitch');
            setTimeout(() => {
                document.querySelector('.crt-overlay').classList.remove('glitch');
            }, 100);
        }
    }, 3000);
});