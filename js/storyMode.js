// Array para las imágenes de los mods, los archivos de mod correspondientes, y los GIFs de BF
const mods = [
    {
        modImage: 'images/Too_Slow_Artwork.png',     // URL de la imagen del mod
        bfGif: 'images/Boyfriend.gif',                // URL del GIF de BF para este mod
        mod: 'https://drive.usercontent.google.com/u/0/uc?id=1uPdwR8h8TxqN2JaNqncGaVdTFIeScHPg&export=download', // URL del archivo del mod
        alt: 'Mod 1 Image'
    },
    {
        modImage: 'images/You-cant-runfp.png',
        bfGif: 'images/Boyfriend.gif',
        mod: 'https://drive.usercontent.google.com/u/0/uc?id=1uSSMIWrP0vI-ASWAZ1eW6029jy0OBYEb&export=download',
        alt: 'Mod 2 Image'
    },
    {
        modImage: 'images/Triple-troublefp.png',
        bfGif: 'images/Boyfriend.gif',
        mod: 'https://drive.usercontent.google.com/u/0/id=1v2rb7sUDRCcpMVRjPM-khs7gqZNN3-GN&export=download',
        alt: 'Mod 3 Image'
    }
];

let currentModIndex = 0;

// Seleccionar elementos HTML
const selectedImage = document.getElementById('selectedImage');  // Imagen del mod
const bfGif = document.querySelector('.bf-gif');                 // GIF de BF
const downloadModButton = document.getElementById('downloadModButton');

// Función para actualizar la imagen, el GIF y el enlace de descarga del mod
function updateModContent() {
    // Actualizar la imagen del mod
    selectedImage.src = mods[currentModIndex].modImage;
    selectedImage.alt = mods[currentModIndex].alt;

    // Actualizar el GIF de BF
    bfGif.src = mods[currentModIndex].bfGif;

    // Establecer el enlace de descarga del mod
    downloadModButton.setAttribute('href', mods[currentModIndex].mod);
    downloadModButton.setAttribute('download', `mod${currentModIndex + 1}.zip`);
}

// Navegar entre mods
document.getElementById('prevButton').addEventListener('click', () => {
    currentModIndex = (currentModIndex === 0) ? mods.length - 1 : currentModIndex - 1;
    updateModContent();
});

document.getElementById('nextButton').addEventListener('click', () => {
    currentModIndex = (currentModIndex === mods.length - 1) ? 0 : currentModIndex + 1;
    updateModContent();
});

// Inicializar el contenido con el primer mod
updateModContent();
