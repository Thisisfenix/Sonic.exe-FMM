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
                width: 100vw;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 10px;
                overflow-x: hidden;
                position: relative;
            }
            
            body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
                pointer-events: none;
                z-index: 1;
            }
            
            .floating-pumpkins {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2;
            }
            
            .pumpkin {
                position: absolute;
                font-size: 2rem;
                animation: float 6s ease-in-out infinite;
                opacity: 0.3;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                25% { transform: translateY(-20px) rotate(5deg); }
                50% { transform: translateY(-10px) rotate(-5deg); }
                75% { transform: translateY(-15px) rotate(3deg); }
            }
            
            .container {
                text-align: center;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 0, 20, 0.8));
                border: 3px solid #ff6600;
                border-radius: 20px;
                padding: 18px;
                box-shadow: 0 0 30px rgba(255, 102, 0, 0.5), inset 0 0 20px rgba(255, 102, 0, 0.1);
                width: min(80vw, 550px);
                animation: glow 3s ease-in-out infinite alternate;
                position: relative;
                z-index: 10;
            }
            
            .container::after {
                content: '🕷️';
                position: absolute;
                top: -10px;
                right: -10px;
                font-size: 1.2rem;
                animation: spiderFloat 4s ease-in-out infinite;
                z-index: 11;
            }
            
            @keyframes spiderFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10% { transform: translateX(-1px); }
                20% { transform: translateX(1px); }
                30% { transform: translateX(-1px); }
                40% { transform: translateX(1px); }
                50% { transform: translateX(0); }
            }
            
            @keyframes glow {
                from { 
                    box-shadow: 0 0 30px rgba(255, 102, 0, 0.5), inset 0 0 20px rgba(255, 102, 0, 0.1);
                }
                to { 
                    box-shadow: 0 0 40px rgba(255, 102, 0, 0.7), inset 0 0 25px rgba(255, 102, 0, 0.15);
                }
            }
            
            .title {
                font-size: 2.5rem;
                color: #ffffff;
                text-shadow: 0 0 10px #ff6600, 0 0 20px #ff3300, 0 0 30px #ff6600, 2px 2px 4px rgba(0,0,0,0.8);
                margin-bottom: 5px;
                animation: flicker 3s infinite, titleGlow 4s ease-in-out infinite;
                position: relative;
            }
            
            .title::after {
                content: '👻';
                position: absolute;
                right: -30px;
                top: 0;
                font-size: 1.3rem;
                animation: ghostFloat 3s ease-in-out infinite;
            }
            
            .title::before {
                content: '🎃';
                position: absolute;
                left: -30px;
                top: 0;
                font-size: 1.3rem;
                animation: pumpkinGlow 4s ease-in-out infinite;
            }
            
            @keyframes flicker {
                0%, 100% { opacity: 1; }
                25% { opacity: 0.8; }
                50% { opacity: 0.9; }
                75% { opacity: 0.7; }
            }
            
            @keyframes titleGlow {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes ghostFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
            }
            
            @keyframes pumpkinGlow {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
            }
            
            .subtitle {
                font-size: 1rem;
                color: #ffffff;
                text-shadow: 0 0 5px #ffaa44, 1px 1px 2px rgba(0,0,0,0.8);
                margin-bottom: 8px;
                line-height: 1.2;
            }
            
            .date {
                font-size: 1.1rem;
                color: #ffffff;
                text-shadow: 0 0 8px #ff3333, 0 0 15px #ff0000, 2px 2px 4px rgba(0,0,0,0.8);
                margin: 10px 0;
                padding: 10px;
                border: 2px solid #ff3333;
                border-radius: 8px;
                background: linear-gradient(135deg, rgba(255, 51, 51, 0.3), rgba(139, 0, 0, 0.4));
                animation: dateGlow 2s ease-in-out infinite alternate;
                position: relative;
                overflow: hidden;
            }
            
            .timezone-info {
                font-size: 0.8rem;
                color: #ffaa44;
                text-shadow: 0 0 5px #ffaa44, 1px 1px 2px rgba(0,0,0,0.8);
                margin: 10px 0;
                padding: 8px;
                border: 1px solid #ffaa44;
                border-radius: 6px;
                background: rgba(255, 170, 68, 0.1);
                line-height: 1.3;
            }
            
            .live-clock {
                font-size: 1rem;
                color: #00ff88;
                text-shadow: 0 0 8px #00ff88, 1px 1px 2px rgba(0,0,0,0.8);
                margin: 8px 0;
                padding: 8px;
                border: 1px solid #00ff88;
                border-radius: 6px;
                background: rgba(0, 255, 136, 0.1);
                font-family: 'Courier New', monospace;
                animation: clockGlow 2s ease-in-out infinite alternate;
            }
            
            .sophisticated-time {
                font-size: 0.9rem;
                color: #ff88dd;
                text-shadow: 0 0 8px #ff88dd, 1px 1px 2px rgba(0,0,0,0.8);
                margin: 8px 0;
                padding: 10px;
                border: 1px solid #ff88dd;
                border-radius: 8px;
                background: linear-gradient(135deg, rgba(255, 136, 221, 0.1), rgba(200, 100, 255, 0.1));
                font-family: 'Georgia', serif;
                animation: sophisticatedGlow 3s ease-in-out infinite alternate;
                line-height: 1.4;
            }
            
            @keyframes clockGlow {
                from { box-shadow: 0 0 5px rgba(0, 255, 136, 0.3); }
                to { box-shadow: 0 0 15px rgba(0, 255, 136, 0.6); }
            }
            
            @keyframes sophisticatedGlow {
                from { box-shadow: 0 0 8px rgba(255, 136, 221, 0.4); }
                to { box-shadow: 0 0 20px rgba(255, 136, 221, 0.7), inset 0 0 10px rgba(255, 136, 221, 0.2); }
            }
            
            .credits-panel {
                position: fixed;
                left: 20px;
                top: 20px;
                background: linear-gradient(135deg, rgba(139, 69, 19, 0.9), rgba(160, 82, 45, 0.8));
                border: 3px solid #ff6600;
                border-radius: 15px;
                padding: 12px 18px;
                font-size: 0.7rem;
                color: #ffaa44;
                text-shadow: 0 0 8px #ff6600, 2px 2px 4px rgba(0,0,0,0.8);
                z-index: 15;
                max-width: 180px;
                line-height: 1.3;
                box-shadow: 0 0 20px rgba(255, 102, 0, 0.6), inset 0 0 10px rgba(139, 69, 19, 0.5);
                transform: rotate(-2deg);
                animation: signSway 4s ease-in-out infinite;
            }
            
            @keyframes signSway {
                0%, 100% { transform: rotate(-2deg); }
                50% { transform: rotate(2deg); }
            }
            
            .credits-panel::before {
                content: '🎃';
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 1.2rem;
                animation: pumpkinBob 3s ease-in-out infinite;
            }
            
            @keyframes pumpkinBob {
                0%, 100% { transform: translateX(-50%) translateY(0px); }
                50% { transform: translateX(-50%) translateY(-3px); }
            }
            
            .credits-link {
                color: #ff6600;
                text-decoration: none;
                border-bottom: 1px dotted #ff6600;
                transition: all 0.3s ease;
            }
            
            .credits-link:hover {
                color: #ff3300;
                border-bottom-color: #ff3300;
                text-shadow: 0 0 8px #ff3300;
            }
            

            
            .date::before {
                content: '🎃';
                position: absolute;
                left: 10px;
                animation: pumpkinBlink 3s infinite;
            }
            
            .date::after {
                content: '🦇';
                position: absolute;
                right: 10px;
                animation: batFly 4s ease-in-out infinite;
            }
            
            @keyframes dateGlow {
                from { box-shadow: 0 0 10px rgba(255, 51, 51, 0.5); }
                to { box-shadow: 0 0 20px rgba(255, 51, 51, 0.8), inset 0 0 10px rgba(255, 51, 51, 0.2); }
            }
            
            @keyframes pumpkinBlink {
                0%, 90%, 100% { opacity: 1; }
                95% { opacity: 0.3; }
            }
            
            @keyframes batFly {
                0%, 100% { transform: translateX(0px) rotate(0deg); }
                25% { transform: translateX(-5px) rotate(-10deg); }
                75% { transform: translateX(5px) rotate(10deg); }
            }
            
            .disclaimer {
                font-size: 0.8rem;
                color: #cccccc;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                margin-top: 3px;
                font-style: italic;
            }
            
            .buttons {
                margin-top: 8px;
                display: flex;
                gap: 8px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .btn {
                padding: 8px 12px;
                font-family: 'Press Start 2P', cursive;
                font-size: 0.6rem;
                border: 2px solid #ff6600;
                background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(20,0,0,0.6));
                color: #ffffff;
                text-shadow: 0 0 5px #ff6600, 1px 1px 2px rgba(0,0,0,0.8);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                position: relative;
                overflow: hidden;
            }
            
            .btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s;
            }
            
            .btn:hover::before {
                left: 100%;
            }
            
            .btn:hover {
                background: linear-gradient(135deg, #ff6600, #ff3300);
                color: #000000;
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 5px 15px rgba(255, 102, 0, 0.4), 0 0 20px rgba(255, 102, 0, 0.3);
                text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
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
                font-size: 1rem;
                color: #ffffff;
                text-shadow: 0 0 5px #ff9900, 1px 1px 2px rgba(0,0,0,0.8);
                margin-top: 5px;
            }
            
            .mystery-text {
                font-size: 0.9rem;
                color: #ffffff;
                text-shadow: 0 0 5px #ffcc00, 0 0 10px #ff9900, 1px 1px 2px rgba(0,0,0,0.8);
                margin: 3px 0;
                animation: pulse 2s infinite, mysterySway 4s ease-in-out infinite;
                position: relative;
            }
            
            .mystery-text::before {
                content: '🕷️';
                position: absolute;
                left: -25px;
                animation: spiderDangle 3s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }
            
            @keyframes mysterySway {
                0%, 100% { transform: translateX(0px); }
                25% { transform: translateX(2px); }
                75% { transform: translateX(-2px); }
            }
            
            @keyframes spiderDangle {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(5px) rotate(5deg); }
            }
            

            

            
            @media (max-width: 600px) {
                .container {
                    width: min(95vw, 450px);
                    padding: 15px;
                }
                
                .title::before,
                .title::after {
                    display: none;
                }
                
                .container::after {
                    top: -8px;
                    right: -8px;
                    font-size: 1rem;
                }
                
                .title {
                    font-size: 2rem;
                }
                
                .subtitle {
                    font-size: 0.9rem;
                }
                
                .date {
                    font-size: 1rem;
                }
                
                .btn {
                    font-size: 0.7rem;
                    padding: 12px 18px;
                    margin: 5px;
                }
                
                .buttons {
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                

                
                .mystery-text {
                    font-size: 0.8rem;
                }
            }
        </style>
    `;

    // HTML content
    const content = `
        ${styles}
        <div class="floating-pumpkins" id="pumpkins"></div>
        <div class="container">
            <h1 class="title">GUESS WHAT?</h1>
            <p class="subtitle">🎃 ¡Una canción de broma terrorífica se aproxima! 🎃</p>
            
            <div class="mystery-text">
                🎵 ¿Preparado para la sorpresa musical más espeluznante? 🎵
            </div>
            
            <div class="mystery-text" style="font-size: 0.8rem; color: #ff9900;">
                👻 Una canción que te hará temblar... ¿de risa o terror? 👻
            </div>
            
            <div class="mystery-text" style="font-size: 0.7rem; color: #cc6600;">
                🕸️ Los secretos más oscuros esperan ser revelados... 🕸️
            </div>
            
            <div class="date">
                🎃 Noche de Halloween: 31 de Octubre 🎃
            </div>
            
            <div class="sophisticated-time" id="sophisticatedTime">
                🎆 <span id="fullDateTime">Cargando fecha y hora...</span>
            </div>
            
            <div class="timezone-info" id="timezoneInfo">
                🌍 <span id="userTimezone">Detectando evento...</span>
            </div>
            
            <p class="disclaimer">
                ⚠️ * Fecha maldita confirmada - Los espíritus han hablado * ⚠️
            </p>
            
            <div class="buttons">
                <button class="btn" id="downloadBtn" onclick="guessWhatDownload()">
                    📥 Invocar Descarga
                </button>
            </div>
            <div class="countdown" id="countdown"></div>
        </div>
    `;

    // Crear link de fuente de manera eficiente
    if (!document.querySelector('link[href*="Press+Start+2P"]')) {
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
    }
    document.body.innerHTML = content;
    
    // Añadir panel de créditos
    const creditsPanel = document.createElement('div');
    creditsPanel.className = 'credits-panel';
    creditsPanel.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold; color: #ff6600;">💡 Inspirado de:</div>
        <a href="https://funkyatlas.abelitogamer.com/BodrioCountdown/countdown.html" 
           target="_blank" 
           class="credits-link"
           onclick="guessWhatVibration()">
            Bodrio Countdown<br>
            by AbelitoGamer
        </a>
        <div style="margin-top: 8px; font-size: 0.6rem; color: #999;">🔗 Click para visitar</div>
    `;
    document.body.appendChild(creditsPanel);
}

// Cache para fechas
let cachedToday = null;
let cachedReleaseDate = null;
let lastCacheTime = 0;

// Obtener fechas con cache
function getCachedDates() {
    const now = Date.now();
    if (!cachedToday || now - lastCacheTime > 60000) { // Cache por 1 minuto
        cachedToday = new Date();
        cachedReleaseDate = new Date(cachedToday.getFullYear(), 9, 31);
        lastCacheTime = now;
    }
    return { today: cachedToday, releaseDate: cachedReleaseDate };
}

// Verificar si es 31 de octubre o después
function isReleaseDate() {
    if (playUnlocked) return true;
    const { today, releaseDate } = getCachedDates();
    return today >= releaseDate;
}

// Actualizar estado del botón de descarga
function updateDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    const countdown = document.getElementById('countdown');

    if (isReleaseDate()) {
        if (playUnlocked) {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '🎮 Jugar Ahora';
            downloadBtn.style.borderColor = '#00ff80';
            downloadBtn.style.color = '#00ff80';
            countdown.innerHTML = '🎃 ¡Juego disponible!';
        } else {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '📥 Descargar Ahora';
            countdown.innerHTML = '🎃 ¡Ya disponible!';
        }
        if (specialMode) {
            activateSpecialMode();
        }
    } else {
        downloadBtn.disabled = true;
        const { today, releaseDate } = getCachedDates();
        const timeDiff = releaseDate - today;
        
        // Si falta exactamente 1 minuto (60000 ms), iniciar countdown
        if (timeDiff <= 60000 && timeDiff > 0) {
            startRealCountdown();
        } else {
            const daysLeft = Math.ceil(timeDiff / 86400000);
            countdown.innerHTML = `⏰ Faltan ${daysLeft} días para la descarga`;
        }
    }
}



// Variables globales
let clockInterval = null;
let effectsInterval = null;
let colorInterval = null;
let realCountdownInterval = null;
let specialMode = false;
let gameAudio = null;
let isMuted = false;
let playUnlocked = false;

// URL de descarga (cambiar cuando esté listo)
const DOWNLOAD_URL = 'https://example.com/download'; // Cambiar por el link real

// Función para intentar descarga/jugar
function guessWhatDownload() {
    if (!isReleaseDate()) {
        guessWhatVibration();
        alert('🚫 Juego no disponible aún\n\n¡Espera al 31 de Octubre! 🎃🎮\n\n🎭 "Guess What" será... ¡una experiencia única!');
        return;
    }

    guessWhatVibration();
    // Redirigir al link de descarga/juego
    window.open(DOWNLOAD_URL, '_blank');
}

// Crear calabazas flotantes
function createFloatingPumpkins() {
    const pumpkinsContainer = document.getElementById('pumpkins');
    if (!pumpkinsContainer) return;
    
    const pumpkinEmojis = ['🎃', '👻', '🦇', '🕷️', '💀'];
    
    for (let i = 0; i < 8; i++) {
        const pumpkin = document.createElement('div');
        pumpkin.className = 'pumpkin';
        pumpkin.textContent = pumpkinEmojis[Math.floor(Math.random() * pumpkinEmojis.length)];
        pumpkin.style.left = Math.random() * 100 + '%';
        pumpkin.style.top = Math.random() * 100 + '%';
        pumpkin.style.animationDelay = Math.random() * 6 + 's';
        pumpkin.style.animationDuration = (4 + Math.random() * 4) + 's';
        pumpkinsContainer.appendChild(pumpkin);
    }
}

// Efectos especiales aleatorios mejorados
function addRandomEffects() {
    // Limpiar intervalos previos
    if (effectsInterval) clearInterval(effectsInterval);
    if (colorInterval) clearInterval(colorInterval);
    
    // Efecto de temblor ocasional
    effectsInterval = setInterval(() => {
        try {
            if (Math.random() < 0.2) {
                const container = document.querySelector('.container');
                if (container) {
                    container.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        if (container) {
                            container.style.animation = 'glow 2s ease-in-out infinite alternate';
                        }
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error in shake effect:', error);
        }
    }, 10000);
    
    // Cambio de color de fondo ocasional
    colorInterval = setInterval(() => {
        try {
            if (Math.random() < 0.15) {
                document.body.style.filter = 'hue-rotate(30deg)';
                setTimeout(() => {
                    document.body.style.filter = 'none';
                }, 1000);
            }
        } catch (error) {
            console.error('Error in color effect:', error);
        }
    }, 15000);
}

// Actualizar reloj en tiempo real
function updateLiveClock() {
    try {
        updateSophisticatedTime();
    } catch (error) {
        console.error('Error updating live clock:', error);
    }
}

// Actualizar hora sofisticada
function updateSophisticatedTime() {
    try {
        const now = new Date();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        
        const formattedTime = now.toLocaleDateString('en-US', options);
        
        const fullDateTimeEl = document.getElementById('fullDateTime');
        if (fullDateTimeEl) {
            fullDateTimeEl.textContent = `Current time in ${timezone}: ${formattedTime}`;
        }
    } catch (error) {
        console.error('Error updating sophisticated time:', error);
        const fullDateTimeEl = document.getElementById('fullDateTime');
        if (fullDateTimeEl) {
            fullDateTimeEl.textContent = 'Error loading time';
        }
    }
}

// Detectar zona horaria del usuario
function detectUserTimezone() {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Crear fecha del evento: 31 de octubre a las 4 PM México (UTC-6)
        // Convertir 4 PM México a UTC: 4 PM + 6 horas = 10 PM UTC
        const eventDateUTC = new Date(Date.UTC(2025, 9, 31, 22, 0, 0)); // 10 PM UTC = 4 PM México
        
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: timezone
        };
        
        const formattedEventTime = eventDateUTC.toLocaleDateString('en-US', options);
        
        const userTimezoneEl = document.getElementById('userTimezone');
        if (userTimezoneEl) {
            userTimezoneEl.innerHTML = `Event starts in your timezone: ${formattedEventTime}`;
        }
    } catch (error) {
        const userTimezoneEl = document.getElementById('userTimezone');
        if (userTimezoneEl) {
            userTimezoneEl.innerHTML = 'Event time: October 31, 2025 at 04:00:00 PM (Mexico Time)';
        }
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        createGuessWhatPage();
        setTimeout(() => {
            updateDownloadButton();
            createFloatingPumpkins();
            addRandomEffects();
            detectUserTimezone();
            updateLiveClock();
            // Actualizar reloj cada segundo
            if (clockInterval) clearInterval(clockInterval);
            clockInterval = setInterval(updateLiveClock, 1000);
        }, 100);
    });
} else {
    createGuessWhatPage();
    setTimeout(() => {
        updateDownloadButton();
        createFloatingPumpkins();
        addRandomEffects();
        detectUserTimezone();
        updateLiveClock();
        // Actualizar reloj cada segundo
        if (clockInterval) clearInterval(clockInterval);
        clockInterval = setInterval(updateLiveClock, 1000);
    }, 100);
}

// Función para iniciar countdown real de 1 minuto
function startRealCountdown() {
    try {
        if (realCountdownInterval) clearInterval(realCountdownInterval);
        
        let timeLeft = 60; // 1 minuto
        const countdown = document.getElementById('countdown');
        if (!countdown) return;
        
        realCountdownInterval = setInterval(() => {
            try {
                // Activar modo especial inmediatamente
                if (timeLeft === 60 && !specialMode) {
                    specialMode = true;
                    activateSpecialMode();
                    playGameMusic();
                }
                
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                countdown.innerHTML = `🎃 HALLOWEEN: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                timeLeft--;
                
                if (timeLeft < 0) {
                    clearInterval(realCountdownInterval);
                    realCountdownInterval = null;
                    playUnlocked = true;
                    updateDownloadButton();
                    showMuteButton();
                    return;
                }
            } catch (error) {
                console.error('Error in real countdown:', error);
                clearInterval(realCountdownInterval);
                realCountdownInterval = null;
            }
        }, 1000);
    } catch (error) {
        console.error('Error starting real countdown:', error);
    }
}

// Función para reproducir música del juego
function playGameMusic() {
    try {
        if (gameAudio) {
            gameAudio.pause();
            gameAudio = null;
        }
        
        gameAudio = new Audio('sounds/guess what inst.ogg');
        gameAudio.loop = true;
        gameAudio.volume = 0.5;
        gameAudio.play().catch((error) => {
            console.warn('No se pudo reproducir la música automáticamente:', error);
        });
    } catch (error) {
        console.warn('Archivo de música no encontrado:', error);
    }
}



// Función para mostrar botón de mute
function showMuteButton() {
    try {
        const buttonsContainer = document.querySelector('.buttons');
        if (!buttonsContainer) return;
        
        const muteBtn = document.createElement('button');
        muteBtn.className = 'btn';
        muteBtn.id = 'muteBtn';
        muteBtn.style.borderColor = '#9370db';
        muteBtn.style.color = '#9370db';
        muteBtn.innerHTML = '🔊 Mute';
        muteBtn.onclick = toggleMute;
        
        buttonsContainer.appendChild(muteBtn);
    } catch (error) {
        console.error('Error showing mute button:', error);
    }
}

// Función para toggle mute
function toggleMute() {
    try {
        const muteBtn = document.getElementById('muteBtn');
        if (!muteBtn || !gameAudio) return;
        
        if (isMuted) {
            gameAudio.volume = 0.5;
            muteBtn.innerHTML = '🔊 Mute';
            isMuted = false;
        } else {
            gameAudio.volume = 0;
            muteBtn.innerHTML = '🔇 Unmute';
            isMuted = true;
        }
        
        guessWhatVibration();
    } catch (error) {
        console.error('Error toggling mute:', error);
    }
}

// Función para activar modo especial
function activateSpecialMode() {
    try {
        const container = document.querySelector('.container');
        if (container) {
            container.style.background = 'linear-gradient(135deg, rgba(75, 0, 130, 0.9), rgba(25, 25, 112, 0.8))';
            container.style.borderColor = '#9370db';
            container.style.boxShadow = '0 0 40px rgba(147, 112, 219, 0.7), inset 0 0 25px rgba(147, 112, 219, 0.2)';
        }
        
        const title = document.querySelector('.title');
        if (title) {
            title.style.color = '#dda0dd';
            title.style.textShadow = '0 0 15px #9370db, 0 0 30px #8a2be2, 2px 2px 4px rgba(0,0,0,0.8)';
        }
        
        guessWhatVibration();
    } catch (error) {
        console.error('Error activating special mode:', error);
    }
}

// Limpiar intervalos al salir de la página
window.addEventListener('beforeunload', () => {
    if (clockInterval) clearInterval(clockInterval);
    if (effectsInterval) clearInterval(effectsInterval);
    if (colorInterval) clearInterval(colorInterval);
    if (realCountdownInterval) clearInterval(realCountdownInterval);
    if (gameAudio) {
        gameAudio.pause();
        gameAudio = null;
    }
});