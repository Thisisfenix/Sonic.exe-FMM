// Christmas Effects Lite - Para otras páginas sin música
class ChristmasEffectsLite {
    constructor() {
        this.isDecember = new Date().getMonth() === 11;
        this.snowflakeInterval = null;
        this.currentPage = this.detectCurrentPage();
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('freeplay')) return 'freeplay';
        if (path.includes('extras')) return 'extras';
        if (path.includes('credits')) return 'credits';
        if (path.includes('encore')) return 'encore';
        if (path.includes('soundtest')) return 'soundtest';
        if (path.includes('storyMode')) return 'storymode';
        return 'default';
    }

    init() {
        if (!this.isDecember) return;
        
        this.createSnowflakes();
        this.addChristmasLights();
        this.applyChristmasTheme();
    }

    createSnowflakes() {
        // Ajustar intensidad según la página
        let interval = 300;
        let maxSnowflakes = 15;
        
        if (this.currentPage === 'extras') {
            interval = 500; // Menos copos para no interferir con el reproductor
            maxSnowflakes = 8;
        } else if (this.currentPage === 'soundtest') {
            interval = 600; // Mínimos copos para no distraer
            maxSnowflakes = 5;
        }
        
        let activeSnowflakes = 0;
        
        const createSnowflake = () => {
            if (activeSnowflakes >= maxSnowflakes) return;
            
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            
            // Usar diferentes símbolos navideños
            const symbols = ['❄', '❅', '✦', '✧', '❆'];
            snowflake.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
            
            snowflake.style.position = 'fixed';
            snowflake.style.top = '-10px';
            snowflake.style.left = Math.random() * 100 + 'vw';
            snowflake.style.color = 'white';
            snowflake.style.userSelect = 'none';
            snowflake.style.pointerEvents = 'none';
            snowflake.style.zIndex = '1';
            snowflake.style.fontSize = Math.random() * 8 + 8 + 'px';
            snowflake.style.opacity = Math.random() * 0.6 + 0.3;
            
            const duration = Math.random() * 6 + 8; // Más lento: 8-14 segundos
            snowflake.style.animation = `snowfall ${duration}s linear infinite`;
            
            document.body.appendChild(snowflake);
            activeSnowflakes++;
            
            setTimeout(() => {
                if (snowflake.parentNode) {
                    snowflake.remove();
                    activeSnowflakes--;
                }
            }, duration * 1000);
        };
        
        this.snowflakeInterval = setInterval(createSnowflake, interval);
        
        // Agregar CSS para la animación
        if (!document.getElementById('snowfall-css')) {
            const style = document.createElement('style');
            style.id = 'snowfall-css';
            style.textContent = `
                @keyframes snowfall {
                    0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(calc(100vh + 100px)) rotate(180deg); opacity: 0; }
                }
                @media (max-width: 600px) {
                    .snowflake { font-size: 0.7em !important; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    addChristmasLights() {
        // Evitar luces en páginas con interfaces complejas
        if (this.currentPage === 'extras' || this.currentPage === 'soundtest') {
            return;
        }
        
        const lights = document.createElement('div');
        lights.className = 'christmas-lights';
        
        // Ajustar posición según la página
        let topPosition = '0';
        let zIndex = '2';
        
        if (this.currentPage === 'credits') {
            topPosition = 'calc(15px + env(safe-area-inset-top))';
            zIndex = '19';
        }
        
        lights.style.cssText = `
            position: fixed; top: ${topPosition}; left: 0; width: 100%; height: 20px; z-index: ${zIndex};
            display: flex; justify-content: space-around; align-items: center;
            pointer-events: none;
        `;
        
        const lightCount = window.innerWidth < 600 ? 6 : 8;
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        for (let i = 0; i < lightCount; i++) {
            const light = document.createElement('div');
            const color = colors[i % colors.length];
            light.className = 'light';
            light.style.cssText = `
                width: ${window.innerWidth < 600 ? '8px' : '12px'};
                height: ${window.innerWidth < 600 ? '8px' : '12px'};
                border-radius: 50%;
                background: ${color};
                box-shadow: 0 0 10px ${color};
                animation: twinkle ${2 + Math.random()}s infinite alternate;
                animation-delay: ${Math.random() * 2}s;
            `;
            lights.appendChild(light);
        }
        
        document.body.appendChild(lights);
        
        // CSS para luces
        if (!document.getElementById('lights-css')) {
            const style = document.createElement('style');
            style.id = 'lights-css';
            style.textContent = `
                @keyframes twinkle { 0% { opacity: 0.3; } 100% { opacity: 1; } }
                @media (max-width: 600px) {
                    .christmas-lights { height: 15px !important; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    applyChristmasTheme() {
        const style = document.createElement('style');
        style.id = 'christmas-theme-lite';
        
        let themeCSS = '';
        
        switch(this.currentPage) {
            case 'freeplay':
                themeCSS = `
                    .btn { box-shadow: 0 0 10px #00ff00 !important; color: #00ff00 !important; border-color: #00ff00 !important; }
                    .btn:hover { background: #00ff00 !important; color: #000 !important; }
                    .title { color: #ff0000 !important; text-shadow: 0 0 15px #ff0000, 0 0 30px #00ff00 !important; }
                    .mod-card { border-color: #00ff00 !important; }
                    .mod-card:hover { box-shadow: 0 0 20px #ff0000 !important; }
                    .layout-btn { border-color: #00ff00 !important; color: #00ff00 !important; }
                    .layout-btn:hover { background: #00ff00 !important; color: #000 !important; }
                `;
                break;
                
            case 'extras':
                themeCSS = `
                    .player-btn { border-color: #00ff00 !important; box-shadow: 0 0 10px #00ff00 !important; }
                    .player-btn:hover { background: #00ff00 !important; color: #000 !important; }
                    .control-btn { border-color: #ff0000 !important; box-shadow: 0 0 8px #ff0000 !important; }
                    .control-btn:hover { background: #ff0000 !important; }
                    .player-title { text-shadow: 0 0 15px #00ff00 !important; }
                    .playlist-item:hover { background-color: #001a00 !important; color: #00ff00 !important; }
                `;
                break;
                
            case 'credits':
                themeCSS = `
                    .credits-btn { border-color: #ff0000 !important; box-shadow: 0 0 10px #ff0000 !important; }
                    .credits-btn:hover { background: #ff0000 !important; box-shadow: 0 0 20px #ff0000 !important; }
                    .category-tab { border-color: #00ff00 !important; color: #00ff00 !important; }
                    .category-tab.active { background: #00ff00 !important; color: #000 !important; }
                    .credit-card { border-color: #ff0000 !important; box-shadow: 0 0 15px #ff0000 !important; }
                    .credits-title { text-shadow: 0 0 20px #ff0000, 0 0 40px #00ff00 !important; }
                `;
                break;
                
            case 'encore':
                themeCSS = `
                    .nav-btn { border-color: #ff0000 !important; box-shadow: 0 0 10px #ff0000 !important; }
                    .nav-btn:hover { background: #ff0000 !important; color: #fff !important; }
                    .action-btn { border-color: #00ff00 !important; box-shadow: 0 0 10px #00ff00 !important; }
                    .action-btn:hover { background: #00ff00 !important; color: #000 !important; }
                    .mod-title { text-shadow: 0 0 15px #ff0000, 0 0 25px #00ff00 !important; }
                `;
                break;
                
            case 'soundtest':
                themeCSS = `
                    .control-btn { background: #00ff00 !important; border: 2px solid #ff0000 !important; }
                    .control-btn:hover { background: #ff0000 !important; color: #fff !important; }
                    .action-btn { background: #00ff00 !important; border: 2px solid #ff0000 !important; }
                    .action-btn:hover { background: #ff0000 !important; color: #fff !important; }
                    .title { color: #ff0000 !important; text-shadow: 0 0 15px #ff0000, 0 0 25px #00ff00 !important; }
                    .number-display { color: #00ff00 !important; text-shadow: 0 0 10px #00ff00 !important; }
                `;
                break;
                
            case 'storymode':
                themeCSS = `
                    .nav-btn { border-color: #00ff00 !important; box-shadow: 0 0 10px #00ff00 !important; }
                    .nav-btn:hover { background: #00ff00 !important; color: #000 !important; }
                    .play-btn { background-color: #00ff00 !important; color: #000 !important; }
                    .play-btn:hover { background-color: #ff0000 !important; color: #fff !important; }
                    .menu-btn { border-color: #ff0000 !important; color: #ff0000 !important; }
                    .menu-btn:hover { background-color: #ff0000 !important; color: #fff !important; }
                    .mod-title { text-shadow: 0 0 15px #00ff00, 0 0 25px #ff0000 !important; }
                `;
                break;
                
            default:
                themeCSS = `
                    .btn { box-shadow: 0 0 10px #ff0000 !important; color: #ff0000 !important; border-color: #ff0000 !important; }
                    .btn:hover { background: #ff0000 !important; color: #fff !important; }
                    .title { color: #00ff00 !important; text-shadow: 0 0 10px #00ff00 !important; }
                `;
        }
        
        style.textContent = themeCSS;
        document.head.appendChild(style);
    }

    cleanup() {
        if (this.snowflakeInterval) {
            clearInterval(this.snowflakeInterval);
        }
        document.querySelectorAll('.snowflake').forEach(flake => flake.remove());
        document.querySelectorAll('.christmas-lights').forEach(lights => lights.remove());
        const themeStyle = document.getElementById('christmas-theme-lite');
        if (themeStyle) themeStyle.remove();
        const snowfallCSS = document.getElementById('snowfall-css');
        if (snowfallCSS) snowfallCSS.remove();
        const lightsCSS = document.getElementById('lights-css');
        if (lightsCSS) lightsCSS.remove();
    }
}

// Auto-inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para asegurar que la página esté completamente cargada
    setTimeout(() => {
        window.christmasEffectsLite = new ChristmasEffectsLite();
        window.christmasEffectsLite.init();
    }, 100);
});

// También inicializar si el DOM ya está cargado
if (document.readyState === 'loading') {
    // DOM aún se está cargando
} else {
    // DOM ya está cargado
    setTimeout(() => {
        window.christmasEffectsLite = new ChristmasEffectsLite();
        window.christmasEffectsLite.init();
    }, 100);
}