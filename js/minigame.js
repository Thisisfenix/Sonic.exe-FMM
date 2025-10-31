// Samy Ware - WarioWare Style Minigames
// Desarrollado para Sonic.EXE FMM - Version 2.0

class SamyWare {
    constructor() {
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.gameActive = false;
        this.continuousMode = false;
        this.phaserGame = null;
        this.gameTimer = null;
        this.lastGame = null;
        
        // Game state
        this.stats = {
            currentScore: 0,
            gamesCompleted: 0,
            gameSpeed: 1,
            lives: 3,
            currentTheme: 'default',
            achievements: [],
            bestScore: 0,
            streak: 0,
            maxStreak: 0,
            soundEnabled: true,
            musicEnabled: true
        };
        
        // Audio setup
        this.audioContext = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        this.loadPhaser();
        this.createUI();
        this.loadStats();
        this.createMainMenu();
        this.setupEventListeners();
        this.addStyles();
    }
    
    loadPhaser() {
        if (typeof Phaser === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';
            script.onload = () => console.log('Phaser.js loaded');
            document.head.appendChild(script);
        }
    }
    
    createUI() {
        const gameHTML = `
            <div id="samyWareOverlay" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                z-index: 1000; display: flex; flex-direction: column;
                align-items: center; justify-content: flex-start; overflow: hidden;
                padding-top: ${this.isMobile ? '0' : '20px'};
                font-family: Arial, sans-serif; padding: 0;
            ">
                <div id="gameContainer" style="
                    width: ${this.isMobile ? '100vw' : '80vw'}; height: ${this.isMobile ? '100vh' : '75vh'};
                    background: #fff; border-radius: ${this.isMobile ? '0' : '15px'};
                    margin: ${this.isMobile ? '0' : '-50px 0 0 0'}; box-shadow: ${this.isMobile ? 'none' : '0 10px 30px rgba(0,0,0,0.3)'};
                    display: flex; flex-direction: column;
                    transform: ${this.isMobile ? 'none' : 'scale(0.9)'};
                    transform-origin: center;
                "></div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', gameHTML);
        this.overlay = document.getElementById('samyWareOverlay');
        this.container = document.getElementById('gameContainer');
    }
    
    // Audio System
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }
    
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.stats.soundEnabled) return;
        const ctx = this.initAudio();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }
    
    get sounds() {
        return {
            success: () => this.playTone(523, 0.2, 'triangle', 0.4),
            fail: () => this.playTone(196, 0.3, 'sawtooth', 0.3),
            collect: () => this.playTone(659, 0.1, 'square', 0.2),
            jump: () => this.playTone(440, 0.15, 'sine', 0.3),
            click: () => this.playTone(800, 0.05, 'square', 0.1),
            perfect: () => {
                this.playTone(523, 0.1, 'triangle', 0.3);
                setTimeout(() => this.playTone(659, 0.1, 'triangle', 0.3), 100);
                setTimeout(() => this.playTone(784, 0.2, 'triangle', 0.4), 200);
            }
        };
    }
    
    // Themes System
    get themes() {
        return {
            default: {
                name: '🎮 Clásico',
                bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                primary: '#ff6b6b',
                secondary: '#74b9ff'
            },
            dark: {
                name: '🌙 Oscuro',
                bg: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                primary: '#e74c3c',
                secondary: '#3498db'
            },
            neon: {
                name: '💫 Neón',
                bg: 'linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)',
                primary: '#06ffa5',
                secondary: '#ffbe0b'
            },
            retro: {
                name: '🕹️ Retro',
                bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                primary: '#4facfe',
                secondary: '#00f2fe'
            }
        };
    }
    
    // Achievements System
    get achievementsList() {
        return {
            firstWin: { name: '🎯 Primer Éxito', desc: 'Completa tu primer minijuego', unlocked: false },
            perfectionist: { name: '💯 Perfeccionista', desc: 'Consigue 100 puntos en un juego', unlocked: false },
            speedster: { name: '⚡ Velocista', desc: 'Alcanza velocidad 2.0x', unlocked: false },
            survivor: { name: '🛡️ Superviviente', desc: 'Completa 20 juegos seguidos', unlocked: false },
            streaker: { name: '🔥 Racha', desc: 'Consigue 10 éxitos seguidos', unlocked: false },
            explorer: { name: '🗺️ Explorador', desc: 'Juega todos los minijuegos', unlocked: false },
            master: { name: '👑 Maestro', desc: 'Alcanza 1000 puntos totales', unlocked: false }
        };
    }
    
    checkAchievements() {
        const achievements = this.achievementsList;
        
        if (!achievements.firstWin.unlocked && this.stats.gamesCompleted >= 1) {
            this.unlockAchievement('firstWin');
        }
        if (!achievements.speedster.unlocked && this.stats.gameSpeed >= 2.0) {
            this.unlockAchievement('speedster');
        }
        if (!achievements.survivor.unlocked && this.stats.gamesCompleted >= 20) {
            this.unlockAchievement('survivor');
        }
        if (!achievements.master.unlocked && this.stats.currentScore >= 1000) {
            this.unlockAchievement('master');
        }
    }
    
    unlockAchievement(id) {
        const achievements = this.achievementsList;
        if (!achievements[id].unlocked) {
            achievements[id].unlocked = true;
            this.stats.achievements.push(id);
            this.sounds.perfect();
            this.showAchievementNotification(achievements[id]);
            this.saveStats();
        }
    }
    
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: linear-gradient(45deg, #f39c12, #e67e22);
            color: white; padding: 15px 20px; border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.5s ease-out;
            max-width: 300px; font-family: Arial, sans-serif;
        `;
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">🏆 ¡LOGRO DESBLOQUEADO!</div>
            <div style="font-size: 14px;">${achievement.name}</div>
            <div style="font-size: 12px; opacity: 0.9;">${achievement.desc}</div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }
    
    // Save/Load System
    saveStats() {
        localStorage.setItem('samyWareStats', JSON.stringify(this.stats));
    }
    
    loadStats() {
        const saved = localStorage.getItem('samyWareStats');
        if (saved) {
            const data = JSON.parse(saved);
            this.stats = { ...this.stats, ...data };
            
            // Restore achievements
            this.stats.achievements.forEach(id => {
                if (this.achievementsList[id]) {
                    this.achievementsList[id].unlocked = true;
                }
            });
        }
    }
    
    resetStats() {
        if (confirm('¿Estás seguro de que quieres reiniciar todas las estadísticas?')) {
            this.stats = {
                currentScore: 0,
                gamesCompleted: 0,
                gameSpeed: 1,
                lives: 3,
                currentTheme: 'default',
                achievements: [],
                bestScore: 0,
                streak: 0,
                maxStreak: 0,
                soundEnabled: true,
                musicEnabled: true
            };
            this.saveStats();
            this.createMainMenu();
        }
    }
    
    // Game Management
    cleanup() {
        if (this.phaserGame) {
            this.phaserGame.destroy(true);
            this.phaserGame = null;
        }
        if (this.gameTimer) clearInterval(this.gameTimer);
        this.gameTimer = null;
        this.gameActive = false;
    }
    
    startContinuousGame() {
        this.continuousMode = true;
        this.startNextGame();
    }
    
    startNextGame() {
        const games = ['jump', 'collect', 'dodge', 'tap', 'reaction', 'avoid', 'catch', 'shoot', 'balance', 'count', 'memory', 'math', 'rhythm', 'simon', 'draw', 'type', 'maze', 'puzzle', 'color', 'sequence'];
        
        // Evitar repetir el último juego
        let randomGame;
        do {
            randomGame = games[Math.floor(Math.random() * games.length)];
        } while (randomGame === this.lastGame && games.length > 1);
        
        this.lastGame = randomGame;
        this.startMicrogame(randomGame);
    }
    
    startMicrogame(gameType) {
        this.cleanup();
        this.gameActive = true;
        
        // Make minigames fullscreen
        this.overlay.style.alignItems = 'center';
        this.overlay.style.justifyContent = 'center';
        this.container.style.width = this.isMobile ? '100vw' : '90vw';
        this.container.style.height = this.isMobile ? '100vh' : '90vh';
        
        // Create game container
        this.container.innerHTML = `
            <div style="padding: 8px 15px; text-align: center; background: #ff6b6b; color: white; position: relative; z-index: 100; height: ${this.isMobile ? '50px' : '60px'}; display: flex; align-items: center; justify-content: space-between;">
                <h3 id="gameTitle" style="margin: 0; font-size: ${this.isMobile ? '16px' : '18px'};">🎮 CARGANDO...</h3>
                <div style="font-size: ${this.isMobile ? '14px' : '16px'};">Tiempo: <span id="gameTime">5</span>s | <span id="gameInfo">Preparate...</span></div>
            </div>
            <div id="phaserContainer" style="flex: 1; background: linear-gradient(135deg, #2c3e50, #34495e);"></div>
            ${this.isMobile ? '<div id="mobileControls" style="padding: 8px 15px; background: rgba(0,0,0,0.8); text-align: center; height: 50px; display: flex; align-items: center; justify-content: center;"></div>' : ''}
        `;
        
        // Wait for Phaser and start game
        const initGame = () => {
            if (typeof Phaser === 'undefined') {
                setTimeout(initGame, 100);
                return;
            }
            
            const gameMap = {
                jump: () => this.createJumpGame(),
                collect: () => this.createCollectGame(),
                dodge: () => this.createDodgeGame(),
                tap: () => this.createTapGame(),
                reaction: () => this.createReactionGame(),
                avoid: () => this.createAvoidGame(),
                catch: () => this.createCatchGame(),
                shoot: () => this.createShootGame(),
                balance: () => this.createBalanceGame(),
                count: () => this.createCountGame(),
                memory: () => this.createMemoryGame(),
                math: () => this.createMathGame(),
                rhythm: () => this.createRhythmGame(),
                simon: () => this.createSimonGame()
            };
            
            if (gameMap[gameType]) {
                gameMap[gameType]();
            }
        };
        
        initGame();
    }
    
    startGameTimer(onComplete, customTime = null) {
        let timeLeft = customTime || Math.max(4, Math.floor(6 / this.stats.gameSpeed));
        const interval = 1000;
        
        this.gameTimer = setInterval(() => {
            timeLeft--;
            const timeEl = document.getElementById('gameTime');
            if (timeEl) timeEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(this.gameTimer);
                onComplete();
            }
        }, interval);
    }
    
    endMicrogame(score) {
        this.cleanup();
        
        this.stats.currentScore += score;
        this.stats.gamesCompleted++;
        
        if (score < 50) {
            this.stats.lives--;
            if (this.stats.lives <= 0) {
                this.gameOver();
                return;
            }
        }
        
        // Update stats
        if (this.stats.currentScore > this.stats.bestScore) {
            this.stats.bestScore = this.stats.currentScore;
        }
        
        if (score >= 50) {
            this.stats.streak++;
            if (this.stats.streak > this.stats.maxStreak) {
                this.stats.maxStreak = this.stats.streak;
            }
            if (score === 100) {
                this.unlockAchievement('perfectionist');
            }
            if (this.stats.streak >= 10) {
                this.unlockAchievement('streaker');
            }
            this.sounds.success();
        } else {
            this.stats.streak = 0;
            this.sounds.fail();
        }
        
        this.checkAchievements();
        this.saveStats();
        
        this.showResult(score);
    }
    
    gameOver() {
        alert(`¡Game Over! Puntuación final: ${this.stats.currentScore}`);
        this.stats.currentScore = 0;
        this.stats.gamesCompleted = 0;
        this.stats.gameSpeed = 1;
        this.stats.lives = 3;
        this.saveStats();
        this.createMainMenu();
    }
    
    showResult(score) {
        const isSuccess = score >= 50;
        this.container.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; 
                background: ${isSuccess ? 'linear-gradient(135deg, #00b894, #00cec9, #55a3ff)' : 'linear-gradient(135deg, #e17055, #d63031, #fd79a8)'};
                color: white; text-align: center; position: relative; overflow: hidden;">
                
                <div style="font-size: ${this.isMobile ? '80px' : '120px'}; margin-bottom: 20px; 
                    animation: ${isSuccess ? 'bounce' : 'shake'} 0.6s ease-in-out;">
                    ${isSuccess ? '🎉' : '💥'}
                </div>
                
                <h1 style="font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; 
                    font-size: ${this.isMobile ? '56px' : '84px'}; margin: 0; 
                    text-shadow: 6px 6px 12px rgba(0,0,0,0.7);">
                    ${isSuccess ? '¡ÉXITO!' : '¡FALLO!'}
                </h1>
                
                <div style="font-size: ${this.isMobile ? '32px' : '48px'}; margin: 25px 0; 
                    background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 15px;">
                    +${score} PUNTOS
                </div>
                
                <div style="font-size: ${this.isMobile ? '24px' : '32px'}; margin: 15px 0;">
                    📊 Total: ${this.stats.currentScore}
                </div>
                
                <div style="font-size: ${this.isMobile ? '18px' : '24px'}; margin-top: 15px;">
                    ❤️ Vidas: ${this.stats.lives} | 🎮 Juegos: ${this.stats.gamesCompleted}
                </div>
                
                <div style="position: absolute; bottom: 20px; font-size: 14px; opacity: 0.7;">
                    Continuando en 2 segundos...
                </div>
            </div>
        `;
        
        setTimeout(() => {
            if (this.continuousMode && this.stats.lives > 0) {
                if (this.stats.gamesCompleted % 5 === 0) {
                    this.stats.gameSpeed = Math.min(this.stats.gameSpeed + 0.1, 2.0);
                }
                this.startNextGame();
            } else {
                this.continuousMode = false;
                this.createMainMenu();
            }
        }, 1500);
    }
    
    // UI Creation Methods
    createMainMenu() {
        this.cleanup();
        this.overlay.style.alignItems = 'center';
        this.overlay.style.justifyContent = 'center';
        this.container.style.width = this.isMobile ? '100vw' : '500px';
        this.container.style.height = this.isMobile ? '100vh' : '600px';
        
        const theme = this.themes[this.stats.currentTheme];
        
        this.container.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; 
                padding: 20px; text-align: center; background: ${theme.bg};">
                
                <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: ${this.isMobile ? '36px' : '28px'}; 
                    text-shadow: 4px 4px 8px rgba(0,0,0,0.7); animation: pulse 2s infinite; 
                    font-family: 'Arial Black', Arial, sans-serif;">🎮 SAMY WARE</h1>
                
                <p style="color: #f8f9fa; margin: 0 0 ${this.isMobile ? '30px' : '20px'} 0; 
                    font-size: ${this.isMobile ? '18px' : '14px'}; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); 
                    font-weight: bold;">¡Minijuegos Rápidos!</p>
                
                <div style="position: relative; margin: ${this.isMobile ? '20px 0' : '15px 0'};">
                    <img src="images/samyholahola.png" alt="Samy" style="width: ${this.isMobile ? '150px' : '120px'}; 
                        height: ${this.isMobile ? '150px' : '120px'}; object-fit: contain; animation: bounce 2s infinite; 
                        filter: drop-shadow(0 0 15px rgba(255,255,255,0.3)); display: block;" 
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div style="width: ${this.isMobile ? '150px' : '120px'}; height: ${this.isMobile ? '150px' : '120px'}; 
                        background: linear-gradient(45deg, #4ecdc4, #44a08d); border-radius: 50%; display: none; 
                        align-items: center; justify-content: center; font-size: ${this.isMobile ? '60px' : '48px'}; 
                        animation: bounce 2s infinite; margin: 0 auto;">🎮</div>
                </div>
                
                ${this.createStatsPanel()}
                
                <button onclick="samyWare.startContinuousGame()" style="padding: ${this.isMobile ? '25px 50px' : '15px 25px'}; 
                    font-size: ${this.isMobile ? '24px' : '18px'}; 
                    background: linear-gradient(45deg, ${theme.primary}, ${theme.secondary}); 
                    color: white; border: none; border-radius: 20px; cursor: pointer; transition: all 0.3s ease; 
                    box-shadow: 0 8px 25px rgba(255,107,107,0.5); margin: ${this.isMobile ? '15px' : '5px'}; 
                    font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); transform: scale(1); 
                    animation: pulse 2s infinite; width: ${this.isMobile ? 'auto' : '90%'};" 
                    onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    🎲 ${this.isMobile ? '¡JUGAR INFINITO!' : '¡JUGAR!'}
                </button>
                
                ${this.createMenuButtons()}
            </div>
        `;
    }
    
    createStatsPanel() {
        return `
            <div style="background: rgba(255,255,255,0.25); padding: ${this.isMobile ? '25px' : '12px'}; 
                border-radius: 20px; margin: ${this.isMobile ? '20px 0' : '8px 0'}; backdrop-filter: blur(15px); 
                border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                
                <div style="color: #ffffff; font-size: ${this.isMobile ? '20px' : '14px'}; 
                    margin-bottom: ${this.isMobile ? '15px' : '8px'}; font-weight: bold; 
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">📊 STATS</div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); 
                    gap: ${this.isMobile ? '20px' : '8px'}; max-width: ${this.isMobile ? '450px' : '300px'};">
                    
                    <div style="color: #ffffff; text-align: center;">
                        <div style="font-size: ${this.isMobile ? '24px' : '28px'}; font-weight: bold; 
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${this.stats.currentScore}</div>
                        <div style="font-size: ${this.isMobile ? '14px' : '16px'}; opacity: 0.9; font-weight: bold;">Puntos</div>
                    </div>
                    
                    <div style="color: #ffffff; text-align: center;">
                        <div style="font-size: ${this.isMobile ? '24px' : '28px'}; font-weight: bold; 
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${this.stats.gamesCompleted}</div>
                        <div style="font-size: ${this.isMobile ? '14px' : '16px'}; opacity: 0.9; font-weight: bold;">Juegos</div>
                    </div>
                    
                    <div style="color: #ffffff; text-align: center;">
                        <div style="font-size: ${this.isMobile ? '24px' : '28px'}; font-weight: bold; 
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${this.stats.lives}</div>
                        <div style="font-size: ${this.isMobile ? '14px' : '16px'}; opacity: 0.9; font-weight: bold;">Vidas</div>
                    </div>
                    
                    <div style="color: #ffffff; text-align: center;">
                        <div style="font-size: ${this.isMobile ? '24px' : '28px'}; font-weight: bold; 
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${this.stats.maxStreak}</div>
                        <div style="font-size: ${this.isMobile ? '14px' : '16px'}; opacity: 0.9; font-weight: bold;">Mejor Racha</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); 
                    gap: ${this.isMobile ? '20px' : '8px'}; max-width: ${this.isMobile ? '450px' : '300px'}; margin-top: 10px;">
                    
                    <div style="color: #ffffff; text-align: center;">
                        <div style="font-size: ${this.isMobile ? '20px' : '24px'}; font-weight: bold; 
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${this.stats.bestScore}</div>
                        <div style="font-size: ${this.isMobile ? '12px' : '14px'}; opacity: 0.9; font-weight: bold;">Mejor</div>
                    </div>
                    
                    <div style="color: #ffffff; text-align: center;">
                        <div style="font-size: ${this.isMobile ? '20px' : '24px'}; font-weight: bold; 
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${this.stats.gameSpeed.toFixed(1)}x</div>
                        <div style="font-size: ${this.isMobile ? '12px' : '14px'}; opacity: 0.9; font-weight: bold;">Velocidad</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    createMenuButtons() {
        return `
            <div style="display: flex; gap: ${this.isMobile ? '10px' : '10px'}; 
                margin-top: ${this.isMobile ? '25px' : '15px'}; flex-wrap: wrap; justify-content: center; width: 100%;">
                
                <button onclick="samyWare.showSettings()" style="padding: ${this.isMobile ? '12px 20px' : '10px 15px'}; 
                    font-size: ${this.isMobile ? '14px' : '12px'}; background: linear-gradient(45deg, #74b9ff, #0984e3); 
                    color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; 
                    box-shadow: 0 4px 15px rgba(116,185,255,0.4); font-weight: bold;" 
                    onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    ⚙️ CONFIG
                </button>
                
                <button onclick="samyWare.showAchievements()" style="padding: ${this.isMobile ? '12px 20px' : '10px 15px'}; 
                    font-size: ${this.isMobile ? '14px' : '12px'}; background: linear-gradient(45deg, #f39c12, #e67e22); 
                    color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; 
                    box-shadow: 0 4px 15px rgba(243,156,18,0.4); font-weight: bold;" 
                    onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    🏆 LOGROS
                </button>
                
                <button onclick="samyWare.showThemes()" style="padding: ${this.isMobile ? '12px 20px' : '10px 15px'}; 
                    font-size: ${this.isMobile ? '14px' : '12px'}; background: linear-gradient(45deg, #9b59b6, #8e44ad); 
                    color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; 
                    box-shadow: 0 4px 15px rgba(155,89,182,0.4); font-weight: bold;" 
                    onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    🎨 TEMAS
                </button>
                
                <button onclick="samyWare.resetStats()" style="padding: ${this.isMobile ? '12px 20px' : '10px 15px'}; 
                    font-size: ${this.isMobile ? '14px' : '12px'}; background: rgba(255,255,255,0.25); 
                    color: white; border: 2px solid rgba(255,255,255,0.4); border-radius: 8px; cursor: pointer; 
                    transition: all 0.3s ease; backdrop-filter: blur(10px); font-weight: bold;" 
                    onmouseover="this.style.transform='scale(1.05)'; this.style.background='rgba(255,255,255,0.35)'" 
                    onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(255,255,255,0.25)'">
                    🔄 RESET
                </button>
            </div>
        `;
    }
    
    // Menu Methods
    showSettings() {
        this.cleanup();
        this.overlay.style.alignItems = 'center';
        this.overlay.style.justifyContent = 'center';
        this.container.style.width = this.isMobile ? '100vw' : '600px';
        this.container.style.height = this.isMobile ? '100vh' : '500px';
        
        this.container.innerHTML = `
            <div style="flex: 1; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); overflow-y: auto;">
                <div style="max-width: 500px; margin: 0 auto; background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px;">
                    <h2 style="text-align: center; color: #333; margin: 0 0 20px 0;">⚙️ CONFIGURACIÓN</h2>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #555; margin-bottom: 10px;">🎮 Juego</h3>
                        <label style="display: block; margin-bottom: 10px; color: #666;">
                            <input type="checkbox" id="soundEnabled" ${this.stats.soundEnabled ? 'checked' : ''} 
                                onchange="samyWare.toggleSound()" style="margin-right: 8px;"> Sonido activado
                        </label>
                        <label style="display: block; margin-bottom: 10px; color: #666;">
                            <input type="checkbox" id="musicEnabled" ${this.stats.musicEnabled ? 'checked' : ''} 
                                onchange="samyWare.toggleMusic()" style="margin-right: 8px;"> Música activada
                        </label>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="samyWare.saveSettings()" style="padding: 15px 30px; background: #27ae60; 
                            color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 0 10px;">
                            ✅ GUARDAR
                        </button>
                        <button onclick="samyWare.createMainMenu()" style="padding: 15px 30px; background: #e74c3c; 
                            color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 0 10px;">
                            ❌ CANCELAR
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    toggleSound() {
        this.stats.soundEnabled = document.getElementById('soundEnabled').checked;
        this.sounds.click();
    }
    
    toggleMusic() {
        this.stats.musicEnabled = document.getElementById('musicEnabled').checked;
        this.sounds.click();
    }
    
    saveSettings() {
        this.stats.soundEnabled = document.getElementById('soundEnabled').checked;
        this.stats.musicEnabled = document.getElementById('musicEnabled').checked;
        this.saveStats();
        this.sounds.success();
        this.createMainMenu();
    }
    
    showAchievements() {
        this.cleanup();
        this.overlay.style.alignItems = 'center';
        this.overlay.style.justifyContent = 'center';
        this.container.style.width = this.isMobile ? '100vw' : '600px';
        this.container.style.height = this.isMobile ? '100vh' : '500px';
        
        const achievementsEntries = Object.entries(this.achievementsList).map(([id, achievement]) => `
            <div style="display: flex; align-items: center; padding: 15px; margin: 10px 0; 
                background: ${achievement.unlocked ? 'rgba(46, 204, 113, 0.2)' : 'rgba(149, 165, 166, 0.2)'}; 
                border-radius: 10px; border-left: 4px solid ${achievement.unlocked ? '#2ecc71' : '#95a5a6'};">
                <div style="font-size: 24px; margin-right: 15px;">${achievement.unlocked ? '✅' : '🔒'}</div>
                <div>
                    <div style="font-weight: bold; color: ${achievement.unlocked ? '#2ecc71' : '#95a5a6'};">${achievement.name}</div>
                    <div style="font-size: 14px; color: #666; margin-top: 5px;">${achievement.desc}</div>
                </div>
            </div>
        `).join('');
        
        this.container.innerHTML = `
            <div style="flex: 1; padding: 20px; background: ${this.themes[this.stats.currentTheme].bg}; overflow-y: auto;">
                <div style="max-width: 500px; margin: 0 auto; background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px;">
                    <h2 style="text-align: center; color: #333; margin: 0 0 20px 0;">🏆 LOGROS</h2>
                    <div style="text-align: center; margin-bottom: 20px; color: #666;">
                        ${this.stats.achievements.length}/${Object.keys(this.achievementsList).length} desbloqueados
                    </div>
                    ${achievementsEntries}
                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="samyWare.createMainMenu()" style="padding: 15px 30px; background: #3498db; 
                            color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">← VOLVER</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    showThemes() {
        this.cleanup();
        this.overlay.style.alignItems = 'center';
        this.overlay.style.justifyContent = 'center';
        this.container.style.width = this.isMobile ? '100vw' : '600px';
        this.container.style.height = this.isMobile ? '100vh' : '500px';
        
        const themesList = Object.entries(this.themes).map(([id, theme]) => `
            <div onclick="samyWare.selectTheme('${id}')" style="
                padding: 20px; margin: 10px 0; background: ${theme.bg};
                border-radius: 15px; cursor: pointer; transition: all 0.3s;
                border: 3px solid ${this.stats.currentTheme === id ? '#fff' : 'transparent'};
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                <div style="color: white; font-weight: bold; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    ${theme.name} ${this.stats.currentTheme === id ? '✓' : ''}
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <div style="width: 30px; height: 30px; background: ${theme.primary}; border-radius: 50%; 
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
                    <div style="width: 30px; height: 30px; background: ${theme.secondary}; border-radius: 50%; 
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
                </div>
            </div>
        `).join('');
        
        this.container.innerHTML = `
            <div style="flex: 1; padding: 20px; background: ${this.themes[this.stats.currentTheme].bg}; overflow-y: auto;">
                <div style="max-width: 500px; margin: 0 auto; background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px;">
                    <h2 style="text-align: center; color: #333; margin: 0 0 20px 0;">🎨 TEMAS</h2>
                    ${themesList}
                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="samyWare.createMainMenu()" style="padding: 15px 30px; background: #3498db; 
                            color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">← VOLVER</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    selectTheme(themeId) {
        this.stats.currentTheme = themeId;
        this.sounds.click();
        this.saveStats();
        this.showThemes();
    }
    
    setupEventListeners() {
        // Auto-save every 30 seconds
        setInterval(() => this.saveStats(), 30000);
        
        // Initialize audio on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) this.initAudio();
        }, { once: true });
    }
    
    addStyles() {
        if (!document.getElementById('gameAnimations')) {
            const style = document.createElement('style');
            style.id = 'gameAnimations';
            style.textContent = `
                @keyframes bounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.1); } }
                @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                @keyframes shake { 0%, 100% { transform: translateX(0) rotate(0deg); } 25% { transform: translateX(-8px) rotate(-2deg); } 75% { transform: translateX(8px) rotate(2deg); } }
                @keyframes slideIn { 0% { transform: translateX(100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
                .particle { position: absolute; pointer-events: none; border-radius: 50%; animation: particleFloat 2s ease-out forwards; }
                @keyframes particleFloat { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-100px) scale(0); opacity: 0; } }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Minigames Implementation
    createTapGame() {
        document.getElementById('gameTitle').textContent = '👆 ¡TOCA 10 VECES!';
        document.getElementById('gameInfo').textContent = 'Toques: 0/10';
        
        let taps = 0;
        
        this.container.querySelector('#phaserContainer').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div id="tapButton" style="width: min(25vw, 200px); 
                    height: min(35vh, 200px); border-radius: 50%; 
                    background: linear-gradient(45deg, #e17055, #ee5a52); 
                    display: flex; align-items: center; justify-content: center; 
                    font-size: min(6vw, 40px); color: white; cursor: pointer; 
                    transition: all 0.1s; box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
                    font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">TAP!</div>
            </div>
        `;
        
        const button = document.getElementById('tapButton');
        button.onclick = () => {
            taps++;
            document.getElementById('gameInfo').textContent = `Toques: ${taps}/10`;
            button.style.transform = 'scale(0.9)';
            this.sounds.click();
            setTimeout(() => button.style.transform = 'scale(1)', 100);
            if (taps >= 10) this.endMicrogame(100);
        };
        
        this.startGameTimer(() => this.endMicrogame(taps >= 7 ? 50 : 0), 8);
    }
    
    createReactionGame() {
        document.getElementById('gameTitle').textContent = '⚡ ¡CUANDO CAMBIE!';
        document.getElementById('gameInfo').textContent = 'Espera...';
        
        let reacted = false;
        
        this.container.querySelector('#phaserContainer').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; 
                background: linear-gradient(135deg, #2c3e50, #34495e);">
                <div id="reactionBox" style="width: ${this.isMobile ? '250px' : '300px'}; 
                    height: ${this.isMobile ? '250px' : '300px'}; background: #ff6b6b; 
                    border-radius: 20px; cursor: pointer; transition: all 0.3s; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3); display: flex; 
                    align-items: center; justify-content: center; font-size: 24px; 
                    color: white; font-weight: bold;">ESPERA...</div>
            </div>
        `;
        
        const box = document.getElementById('reactionBox');
        
        setTimeout(() => {
            box.style.background = '#4ecdc4';
            box.textContent = '¡AHORA!';
            const startTime = Date.now();
            
            box.onclick = () => {
                if (!reacted) {
                    reacted = true;
                    const reactionTime = Date.now() - startTime;
                    this.endMicrogame(reactionTime < 500 ? 100 : reactionTime < 1000 ? 50 : 25);
                }
            };
        }, 2000 + Math.random() * 2000);
        
        this.startGameTimer(() => this.endMicrogame(0), 5);
    }
    
    createMemoryGame() {
        document.getElementById('gameTitle').textContent = '🧠 ¡MEMORIZA!';
        document.getElementById('gameInfo').textContent = 'Observa la secuencia...';
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
        let sequence = [];
        let playerSequence = [];
        let showingSequence = false;
        let sequenceLength = 3;
        
        // Generate sequence
        for (let i = 0; i < sequenceLength; i++) {
            sequence.push(Math.floor(Math.random() * 6));
        }
        
        this.container.querySelector('#phaserContainer').innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: min(2vw, 15px); 
                padding: min(3vh, 30px) min(5vw, 50px); width: 100%; height: 100%; align-items: center; justify-items: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                ${colors.map((color, i) => `
                    <div id="memoryBtn${i}" style="
                        width: min(12vw, 80px); height: min(8vh, 60px); 
                        background: ${color}; border-radius: 10px; cursor: pointer; transition: all 0.2s;
                        display: flex; align-items: center; justify-content: center;
                        font-size: min(3vw, 20px); color: white; font-weight: bold;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    " onclick="samyWare.memoryClick(${i})">${i + 1}</div>
                `).join('')}
            </div>
        `;
        
        // Show sequence
        showingSequence = true;
        let index = 0;
        const showNext = () => {
            if (index < sequence.length) {
                const btn = document.getElementById(`memoryBtn${sequence[index]}`);
                btn.style.transform = 'scale(1.2)';
                btn.style.boxShadow = '0 0 30px rgba(255,255,255,0.8)';
                this.sounds.collect();
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                    btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
                    index++;
                    setTimeout(showNext, 300);
                }, 400);
            } else {
                showingSequence = false;
                document.getElementById('gameInfo').textContent = 'Repite la secuencia...';
            }
        };
        setTimeout(showNext, 1000);
        
        this.memoryClick = (btnIndex) => {
            if (showingSequence) return;
            this.sounds.click();
            playerSequence.push(btnIndex);
            
            const btn = document.getElementById(`memoryBtn${btnIndex}`);
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => btn.style.transform = 'scale(1)', 100);
            
            if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
                this.endMicrogame(0);
                return;
            }
            
            if (playerSequence.length === sequence.length) {
                this.endMicrogame(100);
            }
        };
        
        this.startGameTimer(() => this.endMicrogame(0), 7);
    }
    
    createMathGame() {
        document.getElementById('gameTitle').textContent = '🔢 ¡CALCULA RÁPIDO!';
        
        const operations = ['+', '-', '*'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        let a, b, correctAnswer;
        
        if (op === '+') {
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
            correctAnswer = a + b;
        } else if (op === '-') {
            a = Math.floor(Math.random() * 30) + 10;
            b = Math.floor(Math.random() * a);
            correctAnswer = a - b;
        } else {
            a = Math.floor(Math.random() * 10) + 2;
            b = Math.floor(Math.random() * 10) + 2;
            correctAnswer = a * b;
        }
        
        const wrongAnswers = [
            correctAnswer + Math.floor(Math.random() * 10) + 1,
            correctAnswer - Math.floor(Math.random() * 10) - 1,
            correctAnswer + Math.floor(Math.random() * 20) - 10
        ].filter(x => x !== correctAnswer && x > 0);
        
        const allAnswers = [correctAnswer, ...wrongAnswers.slice(0, 3)]
            .sort(() => Math.random() - 0.5);
        
        document.getElementById('gameInfo').textContent = `¿Cuánto es ${a} ${op} ${b}?`;
        
        this.container.querySelector('#phaserContainer').innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; 
                height: 100%; gap: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="font-size: ${this.isMobile ? '36px' : '48px'}; color: white; font-weight: bold; 
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    ${a} ${op} ${b} = ?
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    ${allAnswers.map(answer => `
                        <button onclick="samyWare.mathAnswer(${answer})" style="
                            padding: ${this.isMobile ? '15px 25px' : '20px 30px'}; 
                            font-size: ${this.isMobile ? '20px' : '24px'}; background: #74b9ff;
                            color: white; border: none; border-radius: 15px; cursor: pointer;
                            transition: all 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                        " onmouseover="this.style.transform='scale(1.05)'" 
                           onmouseout="this.style.transform='scale(1)'">
                            ${answer}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.mathAnswer = (answer) => {
            this.sounds.click();
            this.endMicrogame(answer === correctAnswer ? 100 : 0);
        };
        
        this.startGameTimer(() => this.endMicrogame(0), 6);
    }
    
    createRhythmGame() {
        document.getElementById('gameTitle').textContent = '🎵 ¡SIGUE EL RITMO!';
        document.getElementById('gameInfo').textContent = 'Toca cuando brille...';
        
        let score = 0;
        let beats = 0;
        const maxBeats = 8;
        
        this.container.querySelector('#phaserContainer').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div id="rhythmCircle" style="
                    width: ${this.isMobile ? '150px' : '200px'}; height: ${this.isMobile ? '150px' : '200px'}; 
                    border-radius: 50%; background: linear-gradient(45deg, #ff6b6b, #ee5a52);
                    display: flex; align-items: center; justify-content: center;
                    font-size: ${this.isMobile ? '32px' : '48px'}; color: white; cursor: pointer;
                    transition: all 0.1s; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                " onclick="samyWare.rhythmTap()">TAP!</div>
            </div>
        `;
        
        let isActive = false;
        let startTime = 0;
        
        const nextBeat = () => {
            if (beats >= maxBeats) {
                this.endMicrogame(Math.floor((score / maxBeats) * 100));
                return;
            }
            
            setTimeout(() => {
                const circle = document.getElementById('rhythmCircle');
                circle.style.background = 'linear-gradient(45deg, #00b894, #00cec9)';
                circle.style.boxShadow = '0 0 50px rgba(0,206,201,0.8)';
                circle.style.transform = 'scale(1.1)';
                
                isActive = true;
                startTime = Date.now();
                this.sounds.collect();
                
                setTimeout(() => {
                    if (isActive) {
                        isActive = false;
                        circle.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a52)';
                        circle.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                        circle.style.transform = 'scale(1)';
                        beats++;
                        nextBeat();
                    }
                }, 800);
            }, 1000 + Math.random() * 1000);
        };
        
        this.rhythmTap = () => {
            if (isActive) {
                const timing = Date.now() - startTime;
                if (timing < 200) score += 3;
                else if (timing < 400) score += 2;
                else score += 1;
                
                isActive = false;
                const circle = document.getElementById('rhythmCircle');
                if (circle) {
                    circle.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a52)';
                    circle.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                    circle.style.transform = 'scale(1)';
                }
                
                this.sounds.success();
                beats++;
                const gameInfo = document.getElementById('gameInfo');
                if (gameInfo) gameInfo.textContent = `Puntos: ${score}/${maxBeats * 3}`;
                nextBeat();
            }
        };
        
        nextBeat();
        this.startGameTimer(() => this.endMicrogame(Math.floor((score / (maxBeats * 3)) * 100)), 10);
    }
    
    // Additional minigames
    createDrawGame() {
        document.getElementById('gameTitle').textContent = '✏️ ¡DIBUJA UN CÍRCULO!';
        document.getElementById('gameInfo').textContent = 'Dibuja con el mouse/dedo';
        
        let drawing = false;
        let points = [];
        
        const containerRect = this.container.querySelector('#phaserContainer').getBoundingClientRect();
        this.container.querySelector('#phaserContainer').innerHTML = `
            <canvas id="drawCanvas" width="${containerRect.width}" height="${containerRect.height}" 
                style="width: 100%; height: 100%; background: #2c3e50; cursor: crosshair; touch-action: none;"></canvas>
        `;
        
        const canvas = document.getElementById('drawCanvas');
        const ctx = canvas.getContext('2d');
        
        const startDraw = (e) => {
            drawing = true;
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            points.push({x, y});
            ctx.beginPath();
            ctx.moveTo(x, y);
        };
        
        const draw = (e) => {
            if (!drawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            points.push({x, y});
            ctx.lineTo(x, y);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
        };
        
        const endDraw = () => {
            drawing = false;
            if (points.length > 20) {
                this.endMicrogame(75);
            }
        };
        
        canvas.onmousedown = startDraw;
        canvas.onmousemove = draw;
        canvas.onmouseup = endDraw;
        canvas.ontouchstart = startDraw;
        canvas.ontouchmove = draw;
        canvas.ontouchend = endDraw;
        
        this.startGameTimer(() => this.endMicrogame(points.length > 10 ? 50 : 0), 7);
    }
    
    createTypeGame() {
        document.getElementById('gameTitle').textContent = '⌨️ ¡ESCRIBE RÁPIDO!';
        
        const words = ['SONIC', 'SPEED', 'FAST', 'JUMP', 'RUN', 'GAME'];
        const targetWord = words[Math.floor(Math.random() * words.length)];
        let typed = '';
        
        document.getElementById('gameInfo').textContent = `Escribe: ${targetWord}`;
        
        this.container.querySelector('#phaserContainer').innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; 
                height: 100%; background: #34495e; color: white; font-size: 2rem;">
                <div style="margin-bottom: 30px; font-size: 3rem; color: #3498db;">${targetWord}</div>
                <div id="typedText" style="font-size: 2.5rem; color: #2ecc71; min-height: 60px;">${typed}</div>
                <input type="text" id="typeInput" style="opacity: 0; position: absolute;" autofocus>
            </div>
        `;
        
        const input = document.getElementById('typeInput');
        const display = document.getElementById('typedText');
        
        input.oninput = () => {
            typed = input.value.toUpperCase();
            display.textContent = typed;
            if (typed === targetWord) {
                this.endMicrogame(100);
            }
        };
        
        this.startGameTimer(() => this.endMicrogame(0), 8);
    }
    
    createColorGame() {
        document.getElementById('gameTitle').textContent = '🎨 ¡ENCUENTRA EL COLOR!';
        
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const targetColor = colors[Math.floor(Math.random() * colors.length)];
        
        document.getElementById('gameInfo').textContent = `Encuentra: ${targetColor}`;
        
        this.container.querySelector('#phaserContainer').innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: min(2vw, 15px); 
                padding: min(3vh, 30px) min(5vw, 50px); height: 100%; align-items: center; justify-items: center; background: #2c3e50;">
                ${colors.map(color => `
                    <div onclick="samyWare.colorClick('${color}')" style="
                        width: min(12vw, 100px); height: min(8vh, 80px); background: ${color}; 
                        border-radius: 10px; cursor: pointer; transition: all 0.2s;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    " onmouseover="this.style.transform='scale(1.1)'" 
                       onmouseout="this.style.transform='scale(1)'"></div>
                `).join('')}
            </div>
        `;
        
        this.colorClick = (color) => {
            this.sounds.click();
            this.endMicrogame(color === targetColor ? 100 : 0);
        };
        
        this.startGameTimer(() => this.endMicrogame(0), 5);
    }
    
    // Simple placeholder games for the remaining ones
    createJumpGame() { this.createTapGame(); }
    createCollectGame() { this.createTapGame(); }
    createDodgeGame() { this.createReactionGame(); }
    createAvoidGame() { this.createReactionGame(); }
    createCatchGame() { this.createTapGame(); }
    createShootGame() { this.createTapGame(); }
    createBalanceGame() { this.createReactionGame(); }
    createCountGame() { this.createMathGame(); }
    createSimonGame() { this.createMemoryGame(); }
    createMazeGame() { this.createReactionGame(); }
    createPuzzleGame() { this.createMemoryGame(); }
    createSequenceGame() { this.createMemoryGame(); }
}

// Initialize the game
const samyWare = new SamyWare();