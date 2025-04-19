// Variables globales
let currentSelection = -1; // -1 indica que no hay selección inicial
const menuItems = document.querySelectorAll('.menu-btn');
const bgMusic = document.getElementById('bgMusic');
const selectSound = document.getElementById('selectSound');
const hoverSound = document.getElementById('hoverSound');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Configurar audio
    setupAudio();
    
    // Configurar navegación del menú
    setupMenuNavigation();
    
    // Efecto de glitch aleatorio en el logo
    setupGlitchEffect();
});

// Configuración del sistema de audio
function setupAudio() {
    if (!bgMusic) return;
    
    // Configurar volumen
    bgMusic.volume = 0.7;
    if (selectSound) selectSound.volume = 0.8;
    if (hoverSound) hoverSound.volume = 0.4;
    
    // Intentar reproducción automática
    const tryPlay = () => {
        bgMusic.play()
            .then(() => {
                console.log('Música iniciada');
                bgMusic.muted = false;
            })
            .catch(error => {
                console.log('Autoplay bloqueado:', error);
                showPlayInstruction();
            });
    };
    
    // Mostrar instrucción de click
    const showPlayInstruction = () => {
        const startPrompt = document.querySelector('.start-prompt');
        if (startPrompt) {
            startPrompt.style.animation = 'pulse 1s infinite';
            startPrompt.style.cursor = 'pointer';
            
            startPrompt.addEventListener('click', () => {
                bgMusic.play().then(() => {
                    bgMusic.muted = false;
                    startPrompt.style.animation = 'pulse 2s infinite';
                });
            }, { once: true });
        }
    };
    
    // Intenta reproducir después de un breve retraso
    setTimeout(tryPlay, 500);
    
    // También intentar al hacer click en cualquier parte
    document.body.addEventListener('click', tryPlay, { once: true });
}

// Configuración de navegación del menú
function setupMenuNavigation() {
    if (menuItems.length === 0) return;
    
    // Seleccionar primer elemento por defecto
    currentSelection = 0;
    updateSelection();
    
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        const totalItems = menuItems.length;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                currentSelection = (currentSelection - 1 + totalItems) % totalItems;
                playSound(hoverSound);
                updateSelection();
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                currentSelection = (currentSelection + 1) % totalItems;
                playSound(hoverSound);
                updateSelection();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (menuItems[currentSelection]) {
                    selectMenuItem(menuItems[currentSelection]);
                }
                break;
        }
    });
    
    // Navegación con ratón
    menuItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            currentSelection = index;
            updateSelection();
            playSound(hoverSound);
        });
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            selectMenuItem(item);
        });
    });
}

// Seleccionar elemento del menú
function selectMenuItem(item) {
    playSound(selectSound);
    
    // Efecto visual
    item.classList.add('active');
    item.style.animation = 'btn-glitch 0.3s linear';
    
    // Redirigir después de la animación
    setTimeout(() => {
        window.location.href = item.href;
    }, 300);
}

// Actualizar selección visual
function updateSelection() {
    menuItems.forEach((item, index) => {
        if (index === currentSelection) {
            item.classList.add('selected');
            item.style.transform = 'scale(1.1)';
            item.style.filter = 'drop-shadow(0 0 20px #00ffff) brightness(1.2)';
        } else {
            item.classList.remove('selected');
            item.style.transform = 'scale(1)';
            item.style.filter = 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.7))';
        }
    });
}

// Efecto de glitch aleatorio
function setupGlitchEffect() {
    const logo = document.querySelector('.sonic-logo');
    if (!logo) return;
    
    setInterval(() => {
        if (Math.random() > 0.95) { // 5% de probabilidad cada intervalo
            logo.style.animation = 'glitch 0.5s linear';
            setTimeout(() => {
                logo.style.animation = '';
            }, 500);
        }
    }, 5000); // Cada 5 segundos
}

// Función para reproducir sonidos
function playSound(sound) {
    if (!sound) return;
    
    sound.currentTime = 0;
    sound.play().catch(e => {
        console.log("Error al reproducir sonido:", e);
    });
}