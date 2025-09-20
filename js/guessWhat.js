// Guess What - Coming Soon Page
// Detectar móvil y Android (evitar redeclaración)
const guessWhatMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const guessWhatAndroid = /Android/i.test(navigator.userAgent);

// Vibración táctil para Android
function guessWhatVibration() {
    if (guessWhatAndroid && navigator.vibrate) {
        navigator.vibrate(20);
    }
}

// Crear la página dinámicamente
function createGuessWhatPage() {
    // Limpiar body
    document.body.innerHTML = '';

    // Estilos CSS
    const styles = `
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Press Start 2P', cursive;
                background: url('BG/guesswhat.png') no-repeat center center fixed;
                background-size: cover;
                color: white;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                overflow: hidden;
            }
            
            .container {
                text-align: center;
                background: rgba(0, 0, 0, 0.8);
                border: 3px solid #ff6600;
                border-radius: 15px;
                padding: 25px;
                box-shadow: 0 0 30px #ff6600;
                max-width: 500px;
                animation: glow 2s ease-in-out infinite alternate;
            }
            
            @keyframes glow {
                from { box-shadow: 0 0 20px #ff6600; }
                to { box-shadow: 0 0 40px #ff6600, 0 0 60px #ff6600; }
            }
            
            .title {
                font-size: 2rem;
                color: #ff6600;
                text-shadow: 0 0 10px #ff6600;
                margin-bottom: 15px;
                animation: flicker 3s infinite;
            }
            
            @keyframes flicker {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
            
            .subtitle {
                font-size: 0.9rem;
                color: #ffaa44;
                margin-bottom: 20px;
                line-height: 1.4;
            }
            
            .date {
                font-size: 1rem;
                color: #ff3333;
                text-shadow: 0 0 8px #ff3333;
                margin: 15px 0;
                padding: 12px;
                border: 2px solid #ff3333;
                border-radius: 8px;
                background: rgba(255, 51, 51, 0.1);
            }
            
            .disclaimer {
                font-size: 0.7rem;
                color: #999;
                margin-top: 10px;
                font-style: italic;
            }
            
            .buttons {
                margin-top: 20px;
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .btn {
                padding: 12px 18px;
                font-family: 'Press Start 2P', cursive;
                font-size: 0.7rem;
                border: 2px solid #ff6600;
                background: transparent;
                color: #ff6600;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
            }
            
            .btn:hover {
                background: #ff6600;
                color: black;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255, 102, 0, 0.4);
            }
            
            .btn:active {
                transform: scale(0.95);
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background: #333;
                color: #666;
                border-color: #666;
            }
            
            .btn:disabled:hover {
                background: #333;
                color: #666;
                transform: none;
                box-shadow: none;
            }
            
            .countdown {
                font-size: 0.8rem;
                color: #ff9900;
                margin-top: 10px;
                text-shadow: 0 0 5px #ff9900;
            }
            
            .mystery-text {
                font-size: 0.8rem;
                color: #ffcc00;
                margin: 15px 0;
                text-shadow: 0 0 5px #ffcc00;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }
            
            @media (max-width: 600px) {
                .container {
                    padding: 25px;
                    margin: 10px;
                }
                
                .title {
                    font-size: 1.8rem;
                }
                
                .subtitle {
                    font-size: 0.8rem;
                }
                
                .date {
                    font-size: 1rem;
                }
                
                .btn {
                    font-size: 0.7rem;
                    padding: 12px 20px;
                }
                
                .buttons {
                    flex-direction: column;
                    align-items: center;
                }
            }
        </style>
    `;

    // HTML content
    const content = `
        ${styles}
        <div class="container">
            <h1 class="title">GUESS WHAT?</h1>
            <p class="subtitle">¡Una canción de broma se aproxima!</p>
            
            <div class="mystery-text">
                🎵 ¿Preparado para la sorpresa musical más divertida? 🎵
            </div>
            
            <div class="mystery-text" style="font-size: 0.8rem; color: #ff9900;">
                🤔 Una canción que te hará reír... ¿o llorar? 🤔
            </div>
            
            <div class="date">
                📅 Fecha Aproximada: 31 de Octubre
            </div>
            
            <p class="disclaimer">
                * Fecha no confirmada - Sujeta a cambios
            </p>
            
            <div class="buttons">
                <button class="btn" onclick="showPreview()">
                    👁️ Vista Previa
                </button>
                <button class="btn" id="downloadBtn" onclick="guessWhatDownload()">
                    📥 Descargar
                </button>
                <button class="btn" onclick="showHint()">
                    💡 Pista
                </button>
                <a href="index.html" class="btn">
                    🏠 Volver al Menú
                </a>
            </div>
            <div class="countdown" id="countdown"></div>
        </div>
    `;

    document.head.innerHTML += '<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">';
    document.body.innerHTML = content;
}

// Verificar si es 31 de octubre o después
function isReleaseDate() {
    const today = new Date();
    const releaseDate = new Date(today.getFullYear(), 9, 31); // Octubre = mes 9
    return today >= releaseDate;
}

// Actualizar estado del botón de descarga
function updateDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    const countdown = document.getElementById('countdown');

    if (isReleaseDate()) {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '📥 Descargar Ahora';
        countdown.innerHTML = '🎃 ¡Ya disponible!';
    } else {
        downloadBtn.disabled = true;
        const today = new Date();
        const releaseDate = new Date(today.getFullYear(), 9, 31);
        const timeDiff = releaseDate - today;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        countdown.innerHTML = `⏰ Faltan ${daysLeft} días para la descarga`;
    }
}

// Función para mostrar vista previa
function showPreview() {
    guessWhatVibration();

    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '👁️ Cargando...';
    btn.disabled = true;

    setTimeout(() => {
        alert('🎵 Vista Previa 🎵\n\n"Una melodía misteriosa..."\n"Ritmos inesperados..."\n"¿Será divertido o será... diferente?"\n\n🤫 ¡El resto es sorpresa!');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1500);
}

// Función para mostrar pista
function showHint() {
    guessWhatVibration();

    const hints = [
        '🎭 No todo es lo que parece...',
        '🎪 Prepárate para lo inesperado',
        '🎨 El arte de la sorpresa musical',
        '🎯 Apunta a reír, no a llorar',
        '🎲 Los dados están echados...'
    ];


    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    alert(`💡 Pista Misteriosa 💡\n\n${randomHint}\n\n🤔 ¿Entiendes la referencia?`);
}

// Función para intentar descarga
function guessWhatDownload() {
    if (!isReleaseDate()) {
        guessWhatVibration();
        alert('🚫 Descarga no disponible aún\n\n¡La canción de broma estará lista el 31 de Octubre! 🎃🎵\n\n🎭 "Guess What" será... ¡una experiencia única!');
        return;
    }

    guessWhatVibration();
    alert('🎃 ¡"Guess What" disponible para descargar!\n\n🎵 ¡Prepárate para una experiencia musical... diferente! 🎵\n\n🎭 ¿Será lo que esperas? ¡Descúbrelo!');
}

// Efectos especiales aleatorios
function addRandomEffects() {
    setInterval(() => {
        if (Math.random() < 0.3) {
            const container = document.querySelector('.container');
            if (container) {
                container.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    container.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }, 8000);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        createGuessWhatPage();
        setTimeout(updateDownloadButton, 100);
        addRandomEffects();
    });
} else {
    createGuessWhatPage();
    setTimeout(updateDownloadButton, 100);
    addRandomEffects();
}

// Navegación con teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.location.href = 'index.html';
    }
});