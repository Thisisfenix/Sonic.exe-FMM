// Samy Ware Settings System
(function() {
    'use strict';
    
    // Default settings
    const defaultSettings = {
        // Game settings
        gameSpeed: 1.0,
        gameDifficulty: 'normal', // easy, normal, hard
        gameTime: 5, // seconds per microgame
        soundEnabled: true,
        musicVolume: 0.1,
        vibrationEnabled: true, // for mobile
        
        // Visual settings
        particleEffects: true,
        screenShake: true,
        colorBlindMode: false,
        highContrast: false,
        
        // Control settings
        touchSensitivity: 1.0, // for mobile
        mouseSensitivity: 1.0,
        leftHanded: false, // swap controls for mobile
        
        // Accessibility
        largeText: false,
        reducedMotion: false,
        autoPlay: false,
        
        // Game modes
        endlessMode: false,
        practiceMode: false,
        selectedGames: ['jump', 'collect', 'dodge', 'reaction', 'tap', 'avoid', 'catch'] // which games to include
    };
    
    let currentSettings = { ...defaultSettings };
    
    // Load settings from localStorage
    function loadSettings() {
        const saved = localStorage.getItem('samyWareSettings');
        if (saved) {
            currentSettings = { ...defaultSettings, ...JSON.parse(saved) };
        }
        applySettings();
    }
    
    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem('samyWareSettings', JSON.stringify(currentSettings));
        applySettings();
    }
    
    // Apply settings to the game
    function applySettings() {
        // Apply visual settings
        document.documentElement.style.setProperty('--text-size', currentSettings.largeText ? '1.2em' : '1em');
        document.documentElement.style.setProperty('--motion-reduce', currentSettings.reducedMotion ? 'none' : 'all');
        
        // Apply to global game variables if they exist
        if (window.gameSettings) {
            window.gameSettings = currentSettings;
        }
    }
    
    // Create settings menu
    function createSettingsMenu() {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        return `
            <div style="flex: 1; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); overflow-y: auto;">
                <div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px;">
                    <h2 style="text-align: center; color: #333; margin: 0 0 30px 0;">⚙️ CONFIGURACIÓN</h2>
                    
                    <!-- Game Settings -->
                    <div class="settings-section">
                        <h3>🎮 Juego</h3>
                        <div class="setting-item">
                            <label>Dificultad:</label>
                            <select id="difficulty" onchange="updateSetting('gameDifficulty', this.value)">
                                <option value="easy">Fácil (7s)</option>
                                <option value="normal">Normal (5s)</option>
                                <option value="hard">Difícil (3s)</option>
                            </select>
                        </div>
                        <div class="setting-item">
                            <label>Velocidad del juego:</label>
                            <input type="range" id="gameSpeed" min="0.5" max="2" step="0.1" value="${currentSettings.gameSpeed}" onchange="updateSetting('gameSpeed', parseFloat(this.value))">
                            <span id="speedValue">${currentSettings.gameSpeed}x</span>
                        </div>
                        <div class="setting-item">
                            <label><input type="checkbox" id="endlessMode" ${currentSettings.endlessMode ? 'checked' : ''} onchange="updateSetting('endlessMode', this.checked)"> Modo Infinito</label>
                        </div>
                    </div>
                    
                    <!-- Audio Settings -->
                    <div class="settings-section">
                        <h3>🔊 Audio</h3>
                        <div class="setting-item">
                            <label><input type="checkbox" id="soundEnabled" ${currentSettings.soundEnabled ? 'checked' : ''} onchange="updateSetting('soundEnabled', this.checked)"> Sonido activado</label>
                        </div>
                        <div class="setting-item">
                            <label>Volumen música:</label>
                            <input type="range" id="musicVolume" min="0" max="0.5" step="0.05" value="${currentSettings.musicVolume}" onchange="updateSetting('musicVolume', parseFloat(this.value))">
                            <span id="volumeValue">${Math.round(currentSettings.musicVolume * 200)}%</span>
                        </div>
                    </div>
                    
                    <!-- Visual Settings -->
                    <div class="settings-section">
                        <h3>👁️ Visual</h3>
                        <div class="setting-item">
                            <label><input type="checkbox" id="particleEffects" ${currentSettings.particleEffects ? 'checked' : ''} onchange="updateSetting('particleEffects', this.checked)"> Efectos de partículas</label>
                        </div>
                        <div class="setting-item">
                            <label><input type="checkbox" id="screenShake" ${currentSettings.screenShake ? 'checked' : ''} onchange="updateSetting('screenShake', this.checked)"> Vibración de pantalla</label>
                        </div>
                        <div class="setting-item">
                            <label><input type="checkbox" id="highContrast" ${currentSettings.highContrast ? 'checked' : ''} onchange="updateSetting('highContrast', this.checked)"> Alto contraste</label>
                        </div>
                        <div class="setting-item">
                            <label><input type="checkbox" id="largeText" ${currentSettings.largeText ? 'checked' : ''} onchange="updateSetting('largeText', this.checked)"> Texto grande</label>
                        </div>
                    </div>
                    
                    ${isMobile ? `
                    <!-- Mobile Settings -->
                    <div class="settings-section">
                        <h3>📱 Móvil</h3>
                        <div class="setting-item">
                            <label><input type="checkbox" id="vibrationEnabled" ${currentSettings.vibrationEnabled ? 'checked' : ''} onchange="updateSetting('vibrationEnabled', this.checked)"> Vibración</label>
                        </div>
                        <div class="setting-item">
                            <label>Sensibilidad táctil:</label>
                            <input type="range" id="touchSensitivity" min="0.5" max="2" step="0.1" value="${currentSettings.touchSensitivity}" onchange="updateSetting('touchSensitivity', parseFloat(this.value))">
                            <span id="touchValue">${currentSettings.touchSensitivity}x</span>
                        </div>
                        <div class="setting-item">
                            <label><input type="checkbox" id="leftHanded" ${currentSettings.leftHanded ? 'checked' : ''} onchange="updateSetting('leftHanded', this.checked)"> Modo zurdo</label>
                        </div>
                    </div>
                    ` : `
                    <!-- PC Settings -->
                    <div class="settings-section">
                        <h3>🖱️ PC</h3>
                        <div class="setting-item">
                            <label>Sensibilidad ratón:</label>
                            <input type="range" id="mouseSensitivity" min="0.5" max="2" step="0.1" value="${currentSettings.mouseSensitivity}" onchange="updateSetting('mouseSensitivity', parseFloat(this.value))">
                            <span id="mouseValue">${currentSettings.mouseSensitivity}x</span>
                        </div>
                    </div>
                    `}
                    
                    <!-- Game Selection -->
                    <div class="settings-section">
                        <h3>🎯 Minijuegos</h3>
                        <div class="game-selection">
                            ${['jump', 'collect', 'dodge', 'reaction', 'tap', 'avoid', 'catch'].map(game => {
                                const names = {
                                    jump: '🦘 Plataformas',
                                    collect: '💎 Recolector', 
                                    dodge: '🌪️ Esquivar',
                                    reaction: '⚡ Reacción',
                                    tap: '👆 Tocar',
                                    avoid: '🚫 Evitar',
                                    catch: '🎯 Atrapar'
                                };
                                return `<label class="game-checkbox"><input type="checkbox" ${currentSettings.selectedGames.includes(game) ? 'checked' : ''} onchange="toggleGame('${game}', this.checked)"> ${names[game]}</label>`;
                            }).join('')}
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="resetSettings()" style="padding: 12px 25px; margin: 0 10px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer;">🔄 Restablecer</button>
                        <button onclick="closeSettings()" style="padding: 12px 25px; margin: 0 10px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer;">✅ Guardar</button>
                    </div>
                </div>
            </div>
            
            <style>
                .settings-section { margin-bottom: 25px; }
                .settings-section h3 { color: #2c3e50; margin: 0 0 15px 0; font-size: 18px; }
                .setting-item { margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
                .setting-item label { flex: 1; color: #34495e; }
                .setting-item input, .setting-item select { margin-left: 10px; }
                .game-selection { display: grid; grid-template-columns: repeat(${isMobile ? '1' : '2'}, 1fr); gap: 10px; }
                .game-checkbox { display: flex; align-items: center; padding: 8px; background: #f8f9fa; border-radius: 5px; }
                .game-checkbox input { margin-right: 8px; }
            </style>
        `;
    }
    
    // Update setting function
    window.updateSetting = function(key, value) {
        currentSettings[key] = value;
        saveSettings();
        
        // Update display values
        if (key === 'gameSpeed') {
            document.getElementById('speedValue').textContent = value + 'x';
        } else if (key === 'musicVolume') {
            document.getElementById('volumeValue').textContent = Math.round(value * 200) + '%';
        } else if (key === 'touchSensitivity') {
            const el = document.getElementById('touchValue');
            if (el) el.textContent = value + 'x';
        } else if (key === 'mouseSensitivity') {
            const el = document.getElementById('mouseValue');
            if (el) el.textContent = value + 'x';
        }
    };
    
    // Toggle game in selection
    window.toggleGame = function(game, enabled) {
        if (enabled && !currentSettings.selectedGames.includes(game)) {
            currentSettings.selectedGames.push(game);
        } else if (!enabled) {
            currentSettings.selectedGames = currentSettings.selectedGames.filter(g => g !== game);
        }
        
        // Ensure at least one game is selected
        if (currentSettings.selectedGames.length === 0) {
            currentSettings.selectedGames = ['reaction'];
            document.querySelector(`input[onchange*="reaction"]`).checked = true;
        }
        
        saveSettings();
    };
    
    // Reset settings
    window.resetSettings = function() {
        if (confirm('¿Restablecer todas las configuraciones?')) {
            currentSettings = { ...defaultSettings };
            saveSettings();
            if (window.showSettings) window.showSettings();
        }
    };
    
    // Close settings
    window.closeSettings = function() {
        if (window.createMainMenu) window.createMainMenu();
    };
    
    // Show settings menu
    window.showSettings = function() {
        const container = document.getElementById('gameContainer');
        if (container) {
            container.innerHTML = createSettingsMenu();
            // Set current values
            document.getElementById('difficulty').value = currentSettings.gameDifficulty;
        }
    };
    
    // Export settings for use in main game
    window.gameSettings = currentSettings;
    window.getSettings = () => currentSettings;
    window.loadGameSettings = loadSettings;
    
    // Initialize
    loadSettings();
    
})();