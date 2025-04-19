// Datos de los mods
const mods = [
    {
        id: 'too-slow',
        name: 'Too Slow',
        image: 'images/Too_Slow_Artwork.png',
        gif: 'images/Boyfriend.gif',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1uPdwR8h8TxqN2JaNqncGaVdTFIeScHPg'
    },
    {
        id: 'you-cant-run',
        name: "You Can't Run",
        image: 'images/You-cant-runfp.png',
        gif: 'images/Boyfriend.gif',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1uSSMIWrP0vI-ASWAZ1eW6029jy0OBYEb'
    },
    {
        id: 'triple-trouble',
        name: 'Triple Trouble',
        image: 'images/Triple-troublefp.png',
        gif: 'images/Boyfriend.gif',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=1v2rb7sUDRCcpMVRjPM-khs7gqZNN3-GN'
    }
];

// Variables de estado
let currentModIndex = 0;
const DOM = {
    selectedImage: document.getElementById('selectedImage'),
    bfGif: document.querySelector('.bf-gif'),
    downloadButton: document.getElementById('downloadButton'),
    prevButton: document.getElementById('prevButton'),
    nextButton: document.getElementById('nextButton'),
    modCounter: document.getElementById('modCounter'),
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Función para actualizar la interfaz
function updateDisplay() {
    const currentMod = mods[currentModIndex];
    
    DOM.selectedImage.src = currentMod.image;
    DOM.selectedImage.alt = currentMod.name;
    DOM.bfGif.src = currentMod.gif;
    DOM.modCounter.textContent = `${currentModIndex + 1}/${mods.length}`;
}

// Función para manejar la descarga
async function downloadMod() {
    const currentMod = mods[currentModIndex];
    
    try {
        // Mostrar loading
        DOM.loadingOverlay.classList.remove('d-none');
        DOM.downloadButton.disabled = true;
        
        // Solución para Google Drive
        const response = await fetch(currentMod.downloadUrl);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Crear enlace de descarga
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sonic-exe-${currentMod.id}.zip`;
        document.body.appendChild(a);
        a.click();
        
        // Limpieza
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading mod. Please try again later.');
    } finally {
        DOM.loadingOverlay.classList.add('d-none');
        DOM.downloadButton.disabled = false;
    }
}

// Event Listeners
DOM.prevButton.addEventListener('click', () => {
    currentModIndex = (currentModIndex - 1 + mods.length) % mods.length;
    updateDisplay();
});

DOM.nextButton.addEventListener('click', () => {
    currentModIndex = (currentModIndex + 1) % mods.length;
    updateDisplay();
});

DOM.downloadButton.addEventListener('click', downloadMod);

// Navegación con teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        currentModIndex = (currentModIndex - 1 + mods.length) % mods.length;
        updateDisplay();
    }
    if (e.key === 'ArrowRight') {
        currentModIndex = (currentModIndex + 1) % mods.length;
        updateDisplay();
    }
});

// Inicialización
updateDisplay();