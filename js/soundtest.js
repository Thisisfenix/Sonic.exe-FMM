// Variables para los números de PGM y DA
let pgmNo = 1; // Número inicial de PGM
let daNo = 1;  // Número inicial de DA

// Música de fondo y sonidos
const backgroundMusic = document.getElementById('backgroundMusic'); // Elemento de música de fondo
const selectSound = document.getElementById('selectSound'); // Sonido de selección
const correctSound = document.getElementById('correct-sound'); // Sonido para respuestas correctas
const errorSound = document.getElementById('error-sound'); // Sonido para respuestas incorrectas

// Mapa de combinaciones correctas con enlaces a los archivos .fnmm
const fileLinks = {
    '09-09': 'https://www.youtube.com/watch?v=7Fpj-QH56yo&list=RD7Fpj-QH56yo&start_radio=1&ab_channel=PHO',
    '01-02': 'https://example.com/cancion2.fnmm',
    '05-07': 'https://example.com/cancion3.fnmm',
    // Agrega más combinaciones y enlaces aquí
};

// Reintentar reproducir música si fue bloqueada al cargar la página
window.onload = function() {
    backgroundMusic.play().catch(function(error) {
        console.log("Autoplay bloqueado. Se reproducirá al interactuar.");
    });
};

// Función para incrementar los números
function increment(type) {
    playSelectSound(); // Reproduce sonido de selección al incrementar
    if (type === 'pgm') {
        pgmNo = (pgmNo < 99) ? pgmNo + 1 : 1; // Incrementa PGM o reinicia a 1
        document.getElementById('pgm-no').textContent = formatNumber(pgmNo); // Actualiza el texto
    } else if (type === 'da') {
        daNo = (daNo < 99) ? daNo + 1 : 1; // Incrementa DA o reinicia a 1
        document.getElementById('da-no').textContent = formatNumber(daNo); // Actualiza el texto
    }
}

// Función para decrementar los números
function decrement(type) {
    playSelectSound(); // Reproduce sonido de selección al decrementar
    if (type === 'pgm') {
        pgmNo = (pgmNo > 1) ? pgmNo - 1 : 99; // Decrementa PGM o reinicia a 99
        document.getElementById('pgm-no').textContent = formatNumber(pgmNo); // Actualiza el texto
    } else if (type === 'da') {
        daNo = (daNo > 1) ? daNo - 1 : 99; // Decrementa DA o reinicia a 99
        document.getElementById('da-no').textContent = formatNumber(daNo); // Actualiza el texto
    }
}

// Función para formatear los números como dos dígitos
function formatNumber(num) {
    return num.toString().padStart(2, '0'); // Formatea el número a dos dígitos
}

// Función para reproducir el sonido de selección
function playSelectSound() {
    selectSound.play(); // Reproduce el sonido de selección
}

// Función que se llama al presionar "Descargar"
function playSound() {
    playSelectSound(); // Reproduce el sonido de selección al hacer clic en "Descargar"
    
    const code = formatNumber(pgmNo) + '-' + formatNumber(daNo); // Crea el código a partir de los números PGM y DA
    
    // Verificar si la combinación existe en el mapa de enlaces
    if (fileLinks[code]) {
        correctSound.play(); // Reproduce sonido de acierto
        window.location.href = fileLinks[code]; // Redirigir a la canción correcta
    } else {
        errorSound.play(); // Reproduce sonido de error
        alert('Código incorrecto. ¡Inténtalo de nuevo!'); // Alerta en caso de código incorrecto
    }
}

// Eventos para los botones de incrementar y decrementar
document.getElementById('increment-pgm').addEventListener('click', () => increment('pgm'));
document.getElementById('decrement-pgm').addEventListener('click', () => decrement('pgm'));
document.getElementById('increment-da').addEventListener('click', () => increment('da'));
document.getElementById('decrement-da').addEventListener('click', () => decrement('da'));
document.getElementById('play-button').addEventListener('click', playSound);
