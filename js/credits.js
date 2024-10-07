// Obtener referencias a los elementos
const backgroundMusic = document.getElementById('backgroundMusic');
const creditsContent = document.querySelector('.credits-content');
const creditItems = document.querySelectorAll('.credit-item');
let currentCreditIndex = 0;

// Mostrar música de fondo
window.onload = () => {
    backgroundMusic.play();
    updateCreditsView();
};

// Función para actualizar la vista de créditos
function updateCreditsView() {
    // Mostrar solo el crédito actual
    creditItems.forEach((item, index) => {
        item.style.display = index === currentCreditIndex ? 'flex' : 'none';
    });
}

// Funciones para manejar la navegación
document.getElementById('prevButton').onclick = () => {
    if (currentCreditIndex > 0) {
        currentCreditIndex--;
    }
    updateCreditsView();
};

document.getElementById('nextButton').onclick = () => {
    if (currentCreditIndex < creditItems.length - 1) {
        currentCreditIndex++;
    }
    updateCreditsView();
};
