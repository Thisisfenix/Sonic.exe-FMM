// Auto reproducción de música de fondo
window.addEventListener('DOMContentLoaded', () => {
    const backgroundMusic = document.getElementById('backgroundMusic');
    // Verificar si el audio se puede reproducir
    if (backgroundMusic) {
        backgroundMusic.play().catch(error => {
            console.error("Error al intentar reproducir la música de fondo:", error);
        });
    }
});

// Sonido al seleccionar un botón
const menuButtons = document.querySelectorAll('.menu-button');
menuButtons.forEach(button => {
    button.addEventListener('click', () => {
        const selectSound = document.getElementById('selectSound');
        // Verificar si el sonido de selección se puede reproducir
        if (selectSound) {
            selectSound.currentTime = 0; // Reiniciar el sonido para que se reproduzca desde el inicio
            selectSound.play().catch(error => {
                console.error("Error al intentar reproducir el sonido de selección:", error);
            });
        }
    });
});
