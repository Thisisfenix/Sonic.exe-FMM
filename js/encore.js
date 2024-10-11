document.addEventListener("DOMContentLoaded", function() {
    const songs = [
        {
            title: "Canción 1",
            image: "images/Too_Slow_Artwork.png", // Cambia esto a la ruta de tu imagen
            link: "mod1.html" // Cambia esto a tu enlace de descarga
        },
        {
            title: "Canción 2",
            image: "images/cancion2.png", // Cambia esto a la ruta de tu imagen
            link: "mod2.html" // Cambia esto a tu enlace de descarga
        },
        {
            title: "Canción 3",
            image: "images/cancion3.png", // Cambia esto a la ruta de tu imagen
            link: "mod3.html" // Cambia esto a tu enlace de descarga
        }
    ];

    let currentSongIndex = 0;

    const songDisplay = document.getElementById("songImage");
    const modLink = document.getElementById("downloadButton");
    const modTitle = document.getElementById("songTitle");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");

    function updateSong() {
        modTitle.textContent = songs[currentSongIndex].title;
        songDisplay.src = songs[currentSongIndex].image;
        modLink.href = songs[currentSongIndex].link; // Actualiza el enlace de descarga
    }

    prevButton.addEventListener("click", () => {
        currentSongIndex = (currentSongIndex === 0) ? songs.length - 1 : currentSongIndex - 1;
        updateSong();
    });

    nextButton.addEventListener("click", () => {
        currentSongIndex = (currentSongIndex === songs.length - 1) ? 0 : currentSongIndex + 1;
        updateSong();
    });

    updateSong(); // Inicializa la primera canción
});
