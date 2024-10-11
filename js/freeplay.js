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
        // Ocultar la imagen actual
        songDisplay.style.display = 'none';

        // Actualizar el índice de la canción
        currentSongIndex = (direction === 'left') 
            ? (currentSongIndex === songs.length - 1 ? 0 : currentSongIndex + 1)
            : (currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1);

        // Actualizar los datos de la canción
        modTitle.textContent = songs[currentSongIndex].title;
        modLink.href = songs[currentSongIndex].link;
        songDisplay.src = songs[currentSongIndex].image;

        // Mostrar la nueva imagen
        songDisplay.style.display = 'block'; // Hacer visible la nueva imagen
    }

    prevButton.addEventListener("click", () => {
        updateSong('left'); // Mover imagen hacia la izquierda
    });

    nextButton.addEventListener("click", () => {
        updateSong('right'); // Mover imagen hacia la derecha
    });

    // Inicializar la primera canción
    songDisplay.src = songs[currentSongIndex].image;
    songDisplay.style.display = 'block'; // Asegurarse de que la primera imagen sea visible
});
