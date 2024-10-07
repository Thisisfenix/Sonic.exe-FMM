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

    function updateSong() {
        modTitle.textContent = songs[currentSongIndex].title;
        songDisplay.src = songs[currentSongIndex].image;

        // Actualiza el evento de clic para el enlace
        modLink.onclick = () => {
            window.location.href = songs[currentSongIndex].link;
        };
    }

    prevButton.addEventListener("click", () => {
        currentSongIndex = (currentSongIndex === 0) ? songs.length - 1 : currentSongIndex - 1;
        updateSong();
    });

    nextButton.addEventListener("click", () => {
        currentSongIndex = (currentSongIndex === songs.length - 1) ? 0 : currentSongIndex + 1;
        updateSong();
    });

    updateSong();
});
