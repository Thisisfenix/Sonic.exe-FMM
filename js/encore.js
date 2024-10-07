// encore.js

// Seleccionamos los elementos necesarios
const songs = document.querySelectorAll('.song');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

let currentIndex = 0;

// Función para mostrar la canción actual
function showSong(index) {
    songs.forEach((song, i) => {
        song.style.display = i === index ? 'block' : 'none';
    });
}

// Mover hacia la izquierda
function prevSong() {
    currentIndex = (currentIndex === 0) ? songs.length - 1 : currentIndex - 1;
    showSong(currentIndex);
}

// Mover hacia la derecha
function nextSong() {
    currentIndex = (currentIndex === songs.length - 1) ? 0 : currentIndex + 1;
    showSong(currentIndex);
}

// Asignamos eventos a las flechas para móviles
leftArrow.addEventListener('click', prevSong);
rightArrow.addEventListener('click', nextSong);

// Asignamos eventos a las teclas de flecha en PC
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        prevSong();
    } else if (event.key === 'ArrowRight') {
        nextSong();
    }
});

// Mostrar la primera canción al cargar la página
showSong(currentIndex);
