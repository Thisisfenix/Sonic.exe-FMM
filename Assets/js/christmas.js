// Christmas Effects - Solo activo en Diciembre
class ChristmasEffects {
    constructor() {
        this.isDecember = new Date().getMonth() === 11;
        this.snowflakeInterval = null;
        this.christmasMusic = null;
        this.bgMusic = null;
    }

    init() {
        if (!this.isDecember) return;
        
        this.setupMusic();
        this.createSnowflakes();
        this.addChristmasLights();
        this.updateVersionButton();
        this.addChristmasNews();
        this.applyChristmasTheme();
    }
    
    updateSamyImage() {
        // Find Samy images and update to Christmas version
        const samyImages = document.querySelectorAll('img[src*="samyholahola.png"]');
        samyImages.forEach(img => {
            const originalWidth = img.style.width || img.width;
            const originalHeight = img.style.height || img.height;
            img.src = 'images/samyholaholanavideña.png';
            // Preserve original dimensions
            if (originalWidth) img.style.width = originalWidth;
            if (originalHeight) img.style.height = originalHeight;
        });
    }

    setupMusic() {
        this.christmasMusic = document.getElementById('christmasMusic');
        this.bgMusic = document.getElementById('bgMusic');
    }

    createSnowflakes() {
        const createSnowflake = () => {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            snowflake.innerHTML = '❄';
            snowflake.style.left = Math.random() * 100 + 'vw';
            const duration = Math.random() * 6 + 8; // Más lento: 8-14 segundos
            snowflake.style.animationDuration = duration + 's';
            snowflake.style.opacity = Math.random() * 0.7 + 0.3;
            snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
            
            document.body.appendChild(snowflake);
            
            setTimeout(() => {
                if (snowflake.parentNode) {
                    snowflake.remove();
                }
            }, duration * 1000);
        };
        
        this.snowflakeInterval = setInterval(createSnowflake, 300);
    }

    addChristmasLights() {
        // Crear luces navideñas parpadeantes
        const lights = document.createElement('div');
        lights.className = 'christmas-lights';
        lights.innerHTML = `
            <div class="light red"></div>
            <div class="light green"></div>
            <div class="light blue"></div>
            <div class="light yellow"></div>
        `;
        document.body.appendChild(lights);
    }

    updateVersionButton() {
        const updateBtn = document.getElementById('updateBtn');
        if (updateBtn) {
            const currentText = updateBtn.innerHTML;
            // Solo agregar "- Navidad" si no lo tiene ya
            if (!currentText.includes('Navidad')) {
                updateBtn.innerHTML = currentText.replace('</i>', '</i> 🎄') + ' - Navidad';
            }
        }
    }

    addChristmasNews() {
        const newsCarousel = document.getElementById('newsCarousel');
        if (newsCarousel) {
            const christmasNews = document.createElement('a');
            christmasNews.href = 'javascript:void(0)';
            christmasNews.className = 'mod-item';
            christmasNews.innerHTML = `
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='50' font-size='50'%3E🎄%3C/text%3E%3C/svg%3E" alt="Navidad" class="mod-thumbnail" loading="lazy">
                <div class="mod-info">
                    <p class="mod-name">🎄 ¡Llegó la Navidad!</p>
                    <p class="mod-date">Copos de nieve y música especial</p>
                </div>
            `;
            newsCarousel.insertBefore(christmasNews, newsCarousel.firstChild);
        }
    }

    applyChristmasTheme() {
        const style = document.createElement('style');
        style.id = 'christmas-theme';
        style.textContent = `
            .version-btn { box-shadow: 0 0 10px #ff0000 !important; }
            .version-btn button { color: #ff0000 !important; }
            .sonic-logo img { filter: drop-shadow(0 0 18px #00ff00) !important; }
            .menu-btn .btn-img { filter: drop-shadow(0 0 8px #ff0000) !important; }
            .menu-btn:hover .btn-img { filter: drop-shadow(0 0 18px #00ff00) !important; }
            .news-section { box-shadow: 0 0 10px #ff0000 !important; }
            .news-title { color: #ff0000 !important; }
            .news-toggle { color: #00ff00 !important; }
            .mod-name { color: #ff0000 !important; }
            .carousel-btn { background: rgba(255, 0, 0, 0.2) !important; color: #ff0000 !important; }
            .carousel-btn:hover { background: rgba(255, 0, 0, 0.4) !important; }
            .carousel-indicator.active { background: #ff0000 !important; }
            .update-panel { box-shadow: 0 0 30px #00ff00 !important; }
            .game-button img { filter: drop-shadow(0 0 8px #ff0000) drop-shadow(0 0 15px #00ff00) !important; animation: christmasPulse 2s infinite alternate !important; }
            .game-button:hover img { filter: drop-shadow(0 0 12px #ff0000) drop-shadow(0 0 20px #00ff00) !important; transform: scale(1.05) !important; }
            img[src*="samyholaholanavideña.png"] { width: 80px !important; height: 80px !important; max-width: none !important; max-height: none !important; object-fit: contain !important; }
            .game-button { width: 80px !important; height: 80px !important; }
            @media (max-width: 600px) {
                img[src*="samyholaholanavideña.png"] { width: 60px !important; height: 60px !important; }
                .game-button { width: 60px !important; height: 60px !important; }
            }
            @keyframes christmasPulse { 0% { filter: drop-shadow(0 0 8px #ff0000) drop-shadow(0 0 15px #00ff00) !important; } 100% { filter: drop-shadow(0 0 12px #ff0000) drop-shadow(0 0 20px #00ff00) !important; } }
        `;
        document.head.appendChild(style);
        
        // Update Samy image to Christmas version
        this.updateSamyImage();
    }

    getActiveMusic() {
        return this.isDecember && this.christmasMusic ? this.christmasMusic : this.bgMusic;
    }

    cleanup() {
        if (this.snowflakeInterval) {
            clearInterval(this.snowflakeInterval);
        }
        // Remover copos existentes
        document.querySelectorAll('.snowflake').forEach(flake => flake.remove());
        // Remover luces navideñas
        document.querySelectorAll('.christmas-lights').forEach(lights => lights.remove());
        // Restaurar botón de versión
        const updateBtn = document.getElementById('updateBtn');
        if (updateBtn) {
            const currentText = updateBtn.innerHTML;
            // Remover solo la parte navideña
            updateBtn.innerHTML = currentText.replace(' 🎄', '').replace(' - Navidad', '');
        }
        // Restaurar imagen de Samy
        const samyImages = document.querySelectorAll('img[src*="samyholaholanavideña.png"]');
        samyImages.forEach(img => {
            img.src = 'images/samyholahola.png';
        });
        // Remover noticia navideña
        document.querySelectorAll('.mod-item').forEach(item => {
            if (item.textContent.includes('Llegó la Navidad')) {
                item.remove();
            }
        });
        // Remover tema navideño
        const christmasTheme = document.getElementById('christmas-theme');
        if (christmasTheme) {
            christmasTheme.remove();
        }
    }
}

// Exportar para uso global
window.ChristmasEffects = ChristmasEffects;