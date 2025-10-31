// Guess What - Modern Redesign
class GuessWhat {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isAndroid = /Android/i.test(navigator.userAgent);
        this.eventDate = new Date(Date.UTC(2025, 10, 2, 22, 0, 0)); // Nov 2, 2025 4PM Mexico
        this.init();
    }

    init() {
        this.createPage();
        this.setupEventListeners();
        this.startClock();
    }

    vibrate() {
        if (this.isAndroid && navigator.vibrate) {
            navigator.vibrate(20);
        }
    }

    createPage() {
        document.body.innerHTML = `
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body {
                    font-family: 'Creepster', 'Arial', sans-serif;
                    background: linear-gradient(135deg, #1a0a0a 0%, #2d1b1b 50%, #0a0a1a 100%);
                    color: #fff;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    position: relative;
                }

                body::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: 
                        radial-gradient(circle at 20% 80%, rgba(255, 102, 0, 0.2) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(139, 0, 139, 0.2) 0%, transparent 50%);
                    pointer-events: none;
                    animation: bgShift 10s ease-in-out infinite alternate;
                }

                @keyframes bgShift {
                    0% { opacity: 0.3; }
                    100% { opacity: 0.7; }
                }

                .container {
                    background: rgba(20, 0, 20, 0.9);
                    backdrop-filter: blur(20px);
                    border: 3px solid #ff6600;
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 
                        0 0 30px rgba(255, 102, 0, 0.5),
                        inset 0 0 20px rgba(255, 102, 0, 0.1);
                    position: relative;
                    z-index: 10;
                    animation: containerGlow 3s ease-in-out infinite alternate;
                }

                @keyframes containerGlow {
                    from { box-shadow: 0 0 30px rgba(255, 102, 0, 0.5), inset 0 0 20px rgba(255, 102, 0, 0.1); }
                    to { box-shadow: 0 0 40px rgba(255, 102, 0, 0.7), inset 0 0 25px rgba(255, 102, 0, 0.15); }
                }

                .title {
                    font-size: 3rem;
                    font-weight: 900;
                    color: #ff6600;
                    text-shadow: 
                        0 0 10px #ff6600, 
                        0 0 20px #ff3300, 
                        0 0 30px #ff6600,
                        2px 2px 4px rgba(0,0,0,0.8);
                    margin-bottom: 20px;
                    animation: titleFlicker 3s infinite;
                    position: relative;
                }

                .title::before {
                    content: '🎃';
                    position: absolute;
                    left: -50px;
                    top: 0;
                    font-size: 2rem;
                    animation: pumpkinFloat 3s ease-in-out infinite;
                }

                .title::after {
                    content: '👻';
                    position: absolute;
                    right: -50px;
                    top: 0;
                    font-size: 2rem;
                    animation: ghostFloat 4s ease-in-out infinite;
                }

                @keyframes titleFlicker {
                    0%, 100% { opacity: 1; }
                    25% { opacity: 0.8; }
                    50% { opacity: 0.9; }
                    75% { opacity: 0.7; }
                }

                @keyframes pumpkinFloat {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }

                @keyframes ghostFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }

                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                .subtitle {
                    font-size: 1.2rem;
                    color: #ffaa44;
                    text-shadow: 0 0 5px #ffaa44, 1px 1px 2px rgba(0,0,0,0.8);
                    margin-bottom: 30px;
                    opacity: 0.9;
                }

                .status-card {
                    background: rgba(139, 69, 19, 0.3);
                    border: 2px solid #ff6600;
                    border-radius: 15px;
                    padding: 20px;
                    margin: 20px 0;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 0 15px rgba(255, 102, 0, 0.3);
                }

                .countdown {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #ff3300;
                    margin: 20px 0;
                    text-shadow: 0 0 8px #ff3300, 0 0 15px #ff0000;
                    animation: countdownPulse 2s ease-in-out infinite alternate;
                }

                @keyframes countdownPulse {
                    from { transform: scale(1); }
                    to { transform: scale(1.05); }
                }

                .time-info {
                    font-size: 0.9rem;
                    color: #ffaa44;
                    margin: 10px 0;
                    font-family: 'Courier New', monospace;
                    text-shadow: 0 0 5px #ffaa44;
                }

                .btn {
                    background: linear-gradient(45deg, #ff6600, #ff3300);
                    border: 2px solid #ff6600;
                    color: white;
                    padding: 15px 30px;
                    font-size: 1rem;
                    font-weight: bold;
                    border-radius: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin: 10px;
                    position: relative;
                    overflow: hidden;
                    text-shadow: 0 0 5px rgba(0,0,0,0.8);
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
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(255, 102, 0, 0.4);
                    background: linear-gradient(45deg, #ff3300, #cc0000);
                }

                .btn:disabled {
                    background: #333;
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .btn:disabled:hover {
                    transform: none;
                    box-shadow: none;
                }

                .particles {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1;
                }

                .particle {
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    animation: float 6s linear infinite;
                }

                @keyframes float {
                    0% {
                        transform: translateY(100vh) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-10vh) rotate(360deg);
                        opacity: 0;
                    }
                }

                .credits {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.7);
                    padding: 10px 15px;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    color: #999;
                    z-index: 20;
                }

                .credits a {
                    color: #4ecdc4;
                    text-decoration: none;
                }

                .credits a:hover {
                    color: #45b7d1;
                }

                @media (max-width: 600px) {
                    .container {
                        padding: 30px 20px;
                        width: 95%;
                    }
                    
                    .title {
                        font-size: 2.5rem;
                    }
                    
                    .subtitle {
                        font-size: 1rem;
                    }
                    
                    .countdown {
                        font-size: 1.5rem;
                    }
                    
                    .btn {
                        padding: 12px 25px;
                        font-size: 0.9rem;
                    }
                }
            </style>

            <link href="https://fonts.googleapis.com/css2?family=Creepster&display=swap" rel="stylesheet">

            <div class="particles" id="particles"></div>

            <div class="container">
                <h1 class="title">GUESS WHAT?</h1>
                <p class="subtitle">🎃 Una experiencia musical terroríficamente misteriosa 🎃</p>

                <div class="status-card">
                    <div class="countdown" id="countdown">Calculando...</div>
                    <div class="time-info" id="currentTime">Cargando hora actual...</div>
                    <div class="time-info" id="eventTime">Evento: 2 de Noviembre 2025, 4:00 PM (México)</div>
                </div>

                <button class="btn" id="downloadBtn" onclick="guessWhat.handleDownload()">
                    📥 Descargar (Próximamente)
                </button>
            </div>

            <div class="credits">
                Inspirado por <a href="https://funkyatlas.abelitogamer.com/BodrioCountdown/countdown.html" target="_blank">Bodrio Countdown</a>
            </div>
        `;
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        
        setInterval(() => {
            if (particlesContainer.children.length < 50) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 2 + 's';
                particle.style.animationDuration = (4 + Math.random() * 4) + 's';
                particlesContainer.appendChild(particle);

                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }, 8000);
            }
        }, 200);
    }

    updateCountdown() {
        const now = new Date();
        const timeDiff = this.eventDate - now;

        const countdownEl = document.getElementById('countdown');
        const currentTimeEl = document.getElementById('currentTime');

        // Update current time
        const timeOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        currentTimeEl.textContent = `Ahora: ${now.toLocaleDateString('es-ES', timeOptions)}`;

        if (timeDiff > 0) {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
            countdownEl.textContent = '¡Evento Disponible!';
            this.updateDownloadButton(true);
        }
    }

    updateDownloadButton(available = false) {
        const btn = document.getElementById('downloadBtn');
        
        if (available) {
            btn.disabled = false;
            btn.textContent = '🎮 ¡Jugar Ahora!';
            btn.style.background = 'linear-gradient(45deg, #00ff88, #00cc66)';
        } else {
            btn.disabled = true;
            btn.textContent = '📥 Descargar (Próximamente)';
        }
    }

    handleDownload() {
        this.vibrate();
        
        const now = new Date();
        if (now >= this.eventDate) {
            // Redirect to actual download/game
            window.open('https://example.com/download', '_blank');
        } else {
            alert('🚫 Juego no disponible aún\n\n¡Espera hasta el 2 de Noviembre 2025! 🎃🎮');
        }
    }

    startClock() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    setupEventListeners() {
        // Create particles effect
        this.createParticles();
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            // Cleanup any intervals if needed
        });
    }
}

// Initialize
const guessWhat = new GuessWhat();