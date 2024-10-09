document.addEventListener("DOMContentLoaded", function() {
    const songs = [
        {
            title: "Sonic.exe 3.0 songs",
            image: "images/LogoV2.png",
            link: "mods/sonic.exe.html"
        },
        {
            title: "Sonic.exe rerun songs",
            image: "images/rerun_logo.png",
            link: "mods/video.html"
        },
        {
            title: "Canción 3 - Final Challenge",
            image: "images/mod-image3.png",
            link: "mod3.html"
        }
    ];

    let currentSongIndex = 0;

    const songDisplay = document.getElementById("modImage");
    const modLink = document.getElementById("modLink");
    const modTitle = document.getElementById("modTitle");
    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");

    function updateSong(direction) {
        modTitle.textContent = songs[currentSongIndex].title;
        modLink.href = songs[currentSongIndex].link;

        // Cambia la imagen dependiendo de la dirección
        if (direction === 'next') {
            songDisplay.classList.add('slide-left'); // Desliza hacia la izquierda
        } else {
            songDisplay.classList.add('slide-right'); // Desliza hacia la derecha
        }

        // Cambiar imagen después de un breve retraso
        setTimeout(() => {
            songDisplay.style.opacity = '0'; // Desvanecer la imagen
            songDisplay.src = songs[currentSongIndex].image;

            // Manejo de errores si la imagen no se carga
            songDisplay.onerror = () => {
                songDisplay.src = 'path/to/default-image.png'; // Ruta de una imagen por defecto
            };

            setTimeout(() => {
                songDisplay.style.opacity = '1'; // Mostrar la nueva imagen
                songDisplay.classList.remove('slide-left', 'slide-right'); // Elimina las clases de deslizamiento
            }, 300); // Tiempo para mostrar la nueva imagen
        }, 300); // Tiempo para deslizamiento
    }

    prevButton.addEventListener("click", () => {
        currentSongIndex = (currentSongIndex === 0) ? songs.length - 1 : currentSongIndex - 1;
        updateSong('prev');
    });

    nextButton.addEventListener("click", () => {
        currentSongIndex = (currentSongIndex === songs.length - 1) ? 0 : currentSongIndex + 1;
        updateSong('next');
    });

    updateSong(); // Inicializa la primera canción
});
