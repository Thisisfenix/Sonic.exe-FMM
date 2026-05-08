// SamyWare - Standalone Minigame System
// Completely independent from external HTML/CSS
(function() {
    'use strict';

    class SamyWareStandalone {
        constructor() {
            this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            this.gameActive = false;
            this.continuousMode = false;
            this.gameTimer = null;
            this.lastGame = null;
            this.achievementSystem = new AchievementSystem();
            this.sessionStartTime = Date.now();
            
            this.stats = {
                currentScore: 0,
                gamesCompleted: 0,
                gameSpeed: 1,
                lives: 3,
                achievements: [],
                bestScore: 0,
                streak: 0,
                maxStreak: 0,
                soundEnabled: true,
                totalGamesPlayed: 0,
                perfectGames: 0,
                totalOvertakes: 0,
                totalTaps: 0,
                reactionPerfects: 0,
                memoryPerfects: 0,
                mathPerfects: 0,
                rhythmPerfects: 0,
                gameOvers: 0,
                comebacks: 0,
                totalPlayTime: 0,
                christmasGames: 0
            };
            
            this.audioContext = null;
            this.init();
        }
        
        init() {
            this.loadStats();
            this.createUI();
            this.addStyles();
            this.createMainMenu();
        }
        
        createUI() {
            // Remove any existing overlay
            const existing = document.getElementById('samyWareStandalone');
            if (existing) existing.remove();
            
            const overlay = document.createElement('div');
            overlay.id = 'samyWareStandalone';
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: linear-gradient(135deg, #2c5282 0%, #2a4365 100%);
                z-index: 10000; display: flex; align-items: center; justify-content: center;
                font-family: Arial, sans-serif; color: white;
            `;
            
            const container = document.createElement('div');
            container.id = 'gameContainer';
            container.style.cssText = `
                width: ${this.isMobile ? '100vw' : '90vw'}; 
                height: ${this.isMobile ? '100vh' : '90vh'};
                background: rgba(255,255,255,0.08); 
                border-radius: ${this.isMobile ? '0' : '15px'};
                display: flex; flex-direction: column; overflow: hidden;
                backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15);
            `;
            
            overlay.appendChild(container);
            document.body.appendChild(overlay);
            
            this.overlay = overlay;
            this.container = container;
        }
        
        addStyles() {
            if (document.getElementById('samyWareStyles')) return;
            
            const style = document.createElement('style');
            style.id = 'samyWareStyles';
            style.textContent = `
                @keyframes swBounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-10px) scale(1.05); } }
                @keyframes swPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                @keyframes swShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
                .sw-bounce { animation: swBounce 2s infinite; }
                .sw-pulse { animation: swPulse 2s infinite; }
                .sw-shake { animation: swShake 0.5s ease-in-out; }
            `;
            document.head.appendChild(style);
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
            try {
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
            } catch (e) {
                console.log('Audio not available');
            }
        }
        
        get sounds() {
            return {
                success: () => this.playTone(523, 0.2, 'triangle', 0.4),
                fail: () => this.playTone(196, 0.3, 'sawtooth', 0.3),
                click: () => this.playTone(800, 0.05, 'square', 0.1)
            };
        }
        
        // Save/Load System
        saveStats() {
            localStorage.setItem('samyWareStandaloneStats', JSON.stringify(this.stats));
        }
        
        loadStats() {
            const saved = localStorage.getItem('samyWareStandaloneStats');
            if (saved) {
                this.stats = { ...this.stats, ...JSON.parse(saved) };
            }
        }
        
        // Main Menu
        createMainMenu() {
            this.cleanup();
            
            const isDecember = new Date().getMonth() === 11;
            const samyImage = isDecember ? 'images/samyholaholanavideña.png' : 'images/samyholahola.png';
            
            this.container.innerHTML = `
                <div style="flex: 1; display: ${this.isMobile ? 'flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center;' : 'grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 40px; align-items: center;'}">
                    
                    <!-- Lado izquierdo: Título y logo -->
                    <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: ${this.isMobile ? '32px' : '48px'}; 
                            text-shadow: 4px 4px 8px rgba(0,0,0,0.7); font-weight: bold;" class="sw-pulse">
                            🎮 SAMY WARE
                        </h1>
                        
                        <p style="color: #f8f9fa; margin: 0 0 30px 0; font-size: ${this.isMobile ? '16px' : '20px'}; 
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                            ¡Minijuegos Rápidos!
                        </p>
                        
                        <div style="margin: ${this.isMobile ? '20px 0' : '0'};" class="sw-bounce">
                            <img src="${samyImage}" alt="Samy" style="${isDecember ? 'max-width: 100px; max-height: 100px;' : 'width: 100px; height: 100px;'} object-fit: contain; 
                                filter: drop-shadow(0 0 15px rgba(255,255,255,0.3));" 
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <div style="width: 100px; height: 100px; background: linear-gradient(45deg, #4ecdc4, #44a08d); 
                                border-radius: 50%; display: none; align-items: center; justify-content: center; 
                                font-size: 40px; margin: 0 auto;">🎮</div>
                        </div>
                    </div>
                    
                    <!-- Lado derecho: Estadísticas y botones -->
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                        ${this.createStatsPanel()}
                        
                        <button onclick="window.samyWareStandalone.startGame()" style="
                            padding: ${this.isMobile ? '20px 40px' : '20px 50px'}; 
                            font-size: ${this.isMobile ? '20px' : '22px'}; 
                            background: linear-gradient(45deg, #3182ce, #2c5282); 
                            color: white; border: none; border-radius: 10px; cursor: pointer; 
                            transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
                            font-weight: bold; width: 100%;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            🎲 ¡JUGAR!
                        </button>
                        
                        <button onclick="window.samyWareStandalone.showAchievements()" style="
                            padding: ${this.isMobile ? '15px 30px' : '15px 40px'}; 
                            font-size: ${this.isMobile ? '16px' : '18px'}; 
                            background: linear-gradient(45deg, #ffd700, #ffed4e); color: #333; border: none; 
                            border-radius: 8px; cursor: pointer; transition: all 0.3s ease; 
                            width: 100%; font-weight: bold;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            🏆 LOGROS
                        </button>
                        
                        <button onclick="window.location.href='index.html'" style="
                            padding: ${this.isMobile ? '15px 30px' : '15px 40px'}; 
                            font-size: ${this.isMobile ? '16px' : '18px'}; 
                            background: rgba(255,255,255,0.12); color: white; border: 1px solid rgba(255,255,255,0.25); 
                            border-radius: 8px; cursor: pointer; transition: all 0.3s ease; 
                            width: 100%;
                        " onmouseover="this.style.background='rgba(255,255,255,0.18)'" onmouseout="this.style.background='rgba(255,255,255,0.12)'">
                            🏠 VOLVER AL INICIO
                        </button>
                    </div>
                </div>
            `;
        }
        
        createStatsPanel() {
            return `
                <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 15px; 
                    margin: 15px 0; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                    
                    <div style="color: #ffffff; font-size: 16px; margin-bottom: 10px; font-weight: bold;">📊 ESTADÍSTICAS</div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; max-width: 300px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">${this.stats.currentScore}</div>
                            <div style="font-size: 12px; opacity: 0.8;">Puntos</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">${this.stats.gamesCompleted}</div>
                            <div style="font-size: 12px; opacity: 0.8;">Juegos</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">${this.stats.lives}</div>
                            <div style="font-size: 12px; opacity: 0.8;">Vidas</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">${this.stats.bestScore}</div>
                            <div style="font-size: 12px; opacity: 0.8;">Mejor</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">${this.stats.achievements.length}</div>
                            <div style="font-size: 12px; opacity: 0.8;">Logros</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">${this.stats.maxStreak}</div>
                            <div style="font-size: 12px; opacity: 0.8;">Racha</div>
                        </div>
                    </div>
                    
                    <button onclick="window.samyWareStandalone.showAchievements()" style="
                        margin-top: 10px; padding: 8px 16px; font-size: 14px;
                        background: rgba(255,215,0,0.2); color: #ffd700; border: 1px solid #ffd700;
                        border-radius: 6px; cursor: pointer; width: 100%;
                    ">🏆 VER LOGROS</button>
                </div>
            `;
        }
        
        // Game Management
        startGame() {
            this.continuousMode = true;
            this.startNextGame();
        }
        
        startNextGame() {
            const games = ['tap', 'reaction', 'memory', 'math', 'rhythm', 'cube3d', 'shooter3d', 'racing3d'];
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
            
            // Show loading screen
            this.showLoadingScreen(gameType);
            
            const gameMap = {
                tap: () => this.createTapGame(),
                reaction: () => this.createReactionGame(),
                memory: () => this.createMemoryGame(),
                math: () => this.createMathGame(),
                rhythm: () => this.createRhythmGame(),
                cube3d: () => this.createCube3DGame(),
                shooter3d: () => this.createShooter3DGame(),
                racing3d: () => this.createRacing3DGame()
            };
            
            if (gameMap[gameType]) {
                // Simulate loading time
                setTimeout(() => {
                    gameMap[gameType]();
                }, 1500 + Math.random() * 1000); // 1.5-2.5 seconds
            }
        }
        
        showLoadingScreen(gameType) {
            const gameNames = {
                tap: '👆 TAP GAME',
                reaction: '⚡ REACTION',
                memory: '🧠 MEMORY',
                math: '🔢 MATH',
                rhythm: '🎵 RHYTHM',
                cube3d: '🎲 CUBE 3D',
                shooter3d: '🔫 SHOOTER 3D',
                racing3d: '🏎️ CAR RACING 3D'
            };
            
            this.container.innerHTML = `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; 
                    background: linear-gradient(135deg, #2c3e50, #34495e); color: white; text-align: center;">
                    
                    <div style="font-size: 64px; margin-bottom: 30px;" class="sw-pulse">🎮</div>
                    
                    <h2 style="font-size: 32px; margin: 0 0 20px 0; color: #3182ce;">
                        ${gameNames[gameType] || 'CARGANDO'}
                    </h2>
                    
                    <div style="width: 200px; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden; margin: 20px 0;">
                        <div id="loadingBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #3182ce, #63b3ed); 
                            border-radius: 4px; transition: width 0.1s ease;"></div>
                    </div>
                    
                    <div style="font-size: 16px; opacity: 0.8; margin-top: 10px;">
                        <span id="loadingText">Inicializando...</span>
                    </div>
                </div>
            `;
            
            // Animate loading bar
            let progress = 0;
            const loadingTexts = ['Inicializando...', 'Cargando recursos...', 'Preparando juego...', '¡Listo!'];
            let textIndex = 0;
            
            const loadingInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress > 100) progress = 100;
                
                const loadingBar = document.getElementById('loadingBar');
                const loadingText = document.getElementById('loadingText');
                
                if (loadingBar) loadingBar.style.width = progress + '%';
                
                if (progress > 25 * (textIndex + 1) && textIndex < loadingTexts.length - 1) {
                    textIndex++;
                    if (loadingText) loadingText.textContent = loadingTexts[textIndex];
                }
                
                if (progress >= 100) {
                    clearInterval(loadingInterval);
                }
            }, 100);
        }
        
        startGameTimer(onComplete, customTime = 5) {
            let timeLeft = customTime;
            this.gameTimer = setInterval(() => {
                timeLeft--;
                const timeEl = document.getElementById('gameTime');
                if (timeEl) timeEl.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(this.gameTimer);
                    onComplete();
                }
            }, 1000);
        }
        
        endMicrogame(score) {
            this.cleanup();
            
            this.stats.currentScore += score;
            this.stats.gamesCompleted++;
            this.stats.totalGamesPlayed++;
            
            if (score === 100) this.stats.perfectGames++;
            
            if (this.stats.lives === 1 && score >= 50) {
                this.stats.comebacks++;
            }
            
            if (score < 50) {
                this.stats.lives--;
                this.stats.streak = 0;
                if (this.stats.lives <= 0) {
                    this.gameOver();
                    return;
                }
            } else {
                this.stats.streak++;
                if (this.stats.streak > this.stats.maxStreak) {
                    this.stats.maxStreak = this.stats.streak;
                }
                this.sounds.success();
            }
            
            if (this.stats.currentScore > this.stats.bestScore) {
                this.stats.bestScore = this.stats.currentScore;
            }
            
            this.checkAchievements();
            
            this.saveStats();
            this.showResult(score);
        }
        
        showResult(score) {
            const isSuccess = score >= 50;
            this.container.innerHTML = `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; 
                    background: ${isSuccess ? 'linear-gradient(135deg, #00b894, #00cec9)' : 'linear-gradient(135deg, #e17055, #d63031)'};
                    color: white; text-align: center;">
                    
                    <div style="font-size: 80px; margin-bottom: 20px;" class="${isSuccess ? 'sw-bounce' : 'sw-shake'}">
                        ${isSuccess ? '🎉' : '💥'}
                    </div>
                    
                    <h1 style="font-size: 48px; margin: 0; text-shadow: 4px 4px 8px rgba(0,0,0,0.7);">
                        ${isSuccess ? '¡ÉXITO!' : '¡FALLO!'}
                    </h1>
                    
                    <div style="font-size: 32px; margin: 20px 0; background: rgba(255,255,255,0.2); 
                        padding: 10px 20px; border-radius: 10px;">
                        +${score} PUNTOS
                    </div>
                    
                    <div style="font-size: 20px;">
                        📊 Total: ${this.stats.currentScore} | ❤️ Vidas: ${this.stats.lives}
                    </div>
                    
                    <div style="position: absolute; bottom: 20px; font-size: 14px; opacity: 0.7;">
                        Continuando en 2 segundos...
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                if (this.continuousMode && this.stats.lives > 0) {
                    this.startNextGame();
                } else {
                    this.continuousMode = false;
                    this.createMainMenu();
                }
            }, 2000);
        }
        
        gameOver() {
            this.container.innerHTML = `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; 
                    background: linear-gradient(135deg, #e17055, #d63031); color: white; text-align: center;">
                    
                    <div style="font-size: 100px; margin-bottom: 20px;" class="sw-shake">💀</div>
                    <h1 style="font-size: 48px; margin: 0;">¡GAME OVER!</h1>
                    <div style="font-size: 24px; margin: 20px 0;">Puntuación Final: ${this.stats.currentScore}</div>
                    
                    <button onclick="window.samyWareStandalone.resetGame()" style="
                        padding: 15px 30px; font-size: 18px; background: rgba(255,255,255,0.2); 
                        color: white; border: 2px solid white; border-radius: 10px; cursor: pointer; 
                        margin: 20px;
                    ">🔄 JUGAR DE NUEVO</button>
                </div>
            `;
            
            this.stats.currentScore = 0;
            this.stats.gamesCompleted = 0;
            this.stats.gameSpeed = 1;
            this.stats.lives = 3;
            this.saveStats();
        }
        
        resetGame() {
            this.createMainMenu();
        }
        
        checkAchievements() {
            this.stats.totalPlayTime += Date.now() - this.sessionStartTime;
            this.sessionStartTime = Date.now();
            
            const newAchievements = this.achievementSystem.checkAchievements(this.stats, this.stats.achievements);
            
            newAchievements.forEach(achievement => {
                this.stats.achievements.push(achievement.key);
                this.achievementSystem.showAchievementNotification(achievement);
            });
        }
        
        showAchievementNotification(achievements) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 20000;
                background: linear-gradient(45deg, #ffd700, #ffed4e);
                color: #333; padding: 15px; border-radius: 10px;
                box-shadow: 0 4px 20px rgba(255,215,0,0.5);
                font-family: Arial, sans-serif; font-weight: bold;
                animation: swBounce 2s infinite;
                max-width: 250px;
            `;
            
            notification.innerHTML = `
                <div style="font-size: 16px; margin-bottom: 5px;">🏆 ¡LOGRO DESBLOQUEADO!</div>
                ${achievements.map(ach => `<div style="font-size: 14px;">${ach}</div>`).join('')}
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 4000);
        }
        
        // Minigames
        createTapGame() {
            this.container.innerHTML = `
                <div style="padding: 15px; text-align: center; background: rgba(255,107,107,0.8); color: white;">
                    <h3 id="gameTitle" style="margin: 0; font-size: 18px;">👆 ¡TOCA 10 VECES!</h3>
                    <div style="font-size: 14px;">Tiempo: <span id="gameTime">10</span>s | <span id="gameInfo">Toques: 0/10</span></div>
                </div>
                <div id="gameArea" style="flex: 1; display: flex; align-items: center; justify-content: center; 
                    background: linear-gradient(135deg, #2c3e50, #34495e);"></div>
            `;
            
            let taps = 0;
            const gameArea = document.getElementById('gameArea');
            
            gameArea.innerHTML = `
                <div id="tapButton" style="width: 200px; height: 200px; border-radius: 50%; 
                    background: linear-gradient(45deg, #e17055, #ee5a52); display: flex; 
                    align-items: center; justify-content: center; font-size: 32px; color: white; 
                    cursor: pointer; transition: all 0.1s; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                    TAP!
                </div>
            `;
            
            document.getElementById('tapButton').onclick = () => {
                taps++;
                this.stats.totalTaps++;
                document.getElementById('gameInfo').textContent = `Toques: ${taps}/10`;
                this.sounds.click();
                if (taps >= 10) this.endMicrogame(100);
            };
            
            this.startGameTimer(() => this.endMicrogame(taps >= 7 ? 50 : 0), 10);
        }
        
        createReactionGame() {
            this.container.innerHTML = `
                <div style="padding: 15px; text-align: center; background: rgba(255,107,107,0.8); color: white;">
                    <h3 id="gameTitle" style="margin: 0; font-size: 18px;">⚡ ¡CUANDO CAMBIE!</h3>
                    <div style="font-size: 14px;">Tiempo: <span id="gameTime">8</span>s | <span id="gameInfo">Espera...</span></div>
                </div>
                <div id="gameArea" style="flex: 1; display: flex; align-items: center; justify-content: center; 
                    background: linear-gradient(135deg, #2c3e50, #34495e);"></div>
            `;
            
            let reacted = false;
            const gameArea = document.getElementById('gameArea');
            
            gameArea.innerHTML = `
                <div id="reactionBox" style="width: 250px; height: 250px; background: #ff6b6b; 
                    border-radius: 20px; cursor: pointer; display: flex; align-items: center; 
                    justify-content: center; font-size: 24px; color: white; font-weight: bold;">
                    ESPERA...
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
            
            this.startGameTimer(() => this.endMicrogame(0), 8);
        }
        
        createMemoryGame() {
            this.container.innerHTML = `
                <div style="padding: 15px; text-align: center; background: rgba(255,107,107,0.8); color: white;">
                    <h3 id="gameTitle" style="margin: 0; font-size: 18px;">🧠 ¡MEMORIZA!</h3>
                    <div style="font-size: 14px;">Tiempo: <span id="gameTime">12</span>s | <span id="gameInfo">Observa la secuencia...</span></div>
                </div>
                <div id="gameArea" style="flex: 1; display: flex; align-items: center; justify-content: center; 
                    background: linear-gradient(135deg, #2c3e50, #34495e);"></div>
            `;
            
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
            let sequence = [];
            let playerSequence = [];
            let showingSequence = false;
            
            for (let i = 0; i < 3; i++) {
                sequence.push(Math.floor(Math.random() * 4));
            }
            
            const gameArea = document.getElementById('gameArea');
            gameArea.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    ${colors.map((color, i) => `
                        <div id="memoryBtn${i}" onclick="window.samyWareStandalone.memoryClick(${i})" style="
                            width: 100px; height: 100px; background: ${color}; border-radius: 10px; 
                            cursor: pointer; display: flex; align-items: center; justify-content: center;
                            font-size: 20px; color: white; font-weight: bold;
                        ">${i + 1}</div>
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
                    this.sounds.click();
                    setTimeout(() => {
                        btn.style.transform = 'scale(1)';
                        btn.style.boxShadow = 'none';
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
                
                if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
                    this.endMicrogame(0);
                    return;
                }
                
                if (playerSequence.length === sequence.length) {
                    this.endMicrogame(100);
                }
            };
            
            this.startGameTimer(() => this.endMicrogame(0), 8);
        }
        
        createMathGame() {
            this.container.innerHTML = `
                <div style="padding: 15px; text-align: center; background: rgba(255,107,107,0.8); color: white;">
                    <h3 id="gameTitle" style="margin: 0; font-size: 18px;">🔢 ¡CALCULA RÁPIDO!</h3>
                    <div style="font-size: 14px;">Tiempo: <span id="gameTime">8</span>s | <span id="gameInfo">Resuelve la operación</span></div>
                </div>
                <div id="gameArea" style="flex: 1; display: flex; align-items: center; justify-content: center; 
                    background: linear-gradient(135deg, #2c3e50, #34495e);"></div>
            `;
            
            const a = Math.floor(Math.random() * 20) + 1;
            const b = Math.floor(Math.random() * 20) + 1;
            const correctAnswer = a + b;
            
            const wrongAnswers = [
                correctAnswer + Math.floor(Math.random() * 10) + 1,
                correctAnswer - Math.floor(Math.random() * 10) - 1,
                correctAnswer + Math.floor(Math.random() * 20) - 10
            ].filter(x => x !== correctAnswer && x > 0);
            
            const allAnswers = [correctAnswer, ...wrongAnswers.slice(0, 3)]
                .sort(() => Math.random() - 0.5);

            
            const gameArea = document.getElementById('gameArea');
            gameArea.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                    <div style="font-size: 36px; color: white; font-weight: bold;">${a} + ${b} = ?</div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        ${allAnswers.map(answer => `
                            <button onclick="window.samyWareStandalone.mathAnswer(${answer})" style="
                                padding: 15px 25px; font-size: 20px; background: #74b9ff;
                                color: white; border: none; border-radius: 10px; cursor: pointer;
                            ">${answer}</button>
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
            this.container.innerHTML = `
                <div style="padding: 15px; text-align: center; background: rgba(255,107,107,0.8); color: white;">
                    <h3 id="gameTitle" style="margin: 0; font-size: 18px;">🎵 ¡SIGUE EL RITMO!</h3>
                    <div style="font-size: 14px;">Tiempo: <span id="gameTime">15</span>s | <span id="gameInfo">Toca cuando brille...</span></div>
                </div>
                <div id="gameArea" style="flex: 1; display: flex; align-items: center; justify-content: center; 
                    background: linear-gradient(135deg, #2c3e50, #34495e);"></div>
            `;
            
            let score = 0;
            let beats = 0;
            const maxBeats = 6;
            let gameEnded = false;
            
            const gameArea = document.getElementById('gameArea');
            gameArea.innerHTML = `
                <div id="rhythmCircle" onclick="window.samyWareStandalone.rhythmTap()" style="
                    width: 150px; height: 150px; border-radius: 50%; 
                    background: linear-gradient(45deg, #ff6b6b, #ee5a52);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 32px; color: white; cursor: pointer;
                ">TAP!</div>
            `;
            
            let isActive = false;
            let startTime = 0;
            
            const nextBeat = () => {
                if (beats >= maxBeats || gameEnded) {
                    if (!gameEnded) {
                        gameEnded = true;
                        const finalScore = Math.floor((score / (maxBeats * 2)) * 100);
                        this.endMicrogame(finalScore);
                    }
                    return;
                }
                
                setTimeout(() => {
                    if (gameEnded) return;
                    const circle = document.getElementById('rhythmCircle');
                    if (!circle) return;
                    
                    circle.style.background = 'linear-gradient(45deg, #00b894, #00cec9)';
                    circle.style.boxShadow = '0 0 50px rgba(0,206,201,0.8)';
                    
                    isActive = true;
                    startTime = Date.now();
                    this.sounds.click();
                    
                    setTimeout(() => {
                        if (isActive && !gameEnded) {
                            isActive = false;
                            const circle = document.getElementById('rhythmCircle');
                            if (circle) {
                                circle.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a52)';
                                circle.style.boxShadow = 'none';
                            }
                            beats++;
                            nextBeat();
                        }
                    }, 1200);
                }, 1000 + Math.random() * 1000);
            };
            
            this.rhythmTap = () => {
                if (isActive && !gameEnded) {
                    const timing = Date.now() - startTime;
                    let points = 0;
                    if (timing < 200) points = 2;
                    else if (timing < 400) points = 1;
                    
                    score += points;
                    
                    isActive = false;
                    const circle = document.getElementById('rhythmCircle');
                    if (circle) {
                        circle.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a52)';
                        circle.style.boxShadow = 'none';
                    }
                    
                    this.sounds.success();
                    beats++;
                    document.getElementById('gameInfo').textContent = `Puntos: ${score}/${maxBeats * 2}`;
                    
                    if (beats >= maxBeats) {
                        gameEnded = true;
                        const finalScore = Math.floor((score / (maxBeats * 2)) * 100);
                        this.endMicrogame(finalScore);
                    } else {
                        nextBeat();
                    }
                }
            };
            
            nextBeat();
            this.startGameTimer(() => {
                if (!gameEnded) {
                    gameEnded = true;
                    const finalScore = Math.floor((score / (maxBeats * 2)) * 100);
                    this.endMicrogame(finalScore);
                }
            }, 15);
        }
        
        createCube3DGame() {
            this.container.innerHTML = `
                <div style="padding: 15px; text-align: center; background: rgba(255,107,107,0.8); color: white;">
                    <h3 id="gameTitle" style="margin: 0; font-size: 18px;">🎲 ¡ROTA EL CUBO!</h3>
                    <div style="font-size: 14px;">Tiempo: <span id="gameTime">12</span>s | <span id="gameInfo">Haz clic y arrastra para rotar</span></div>
                </div>
                <div id="gameArea" style="flex: 1; display: flex; align-items: center; justify-content: center; 
                    background: linear-gradient(135deg, #2c3e50, #34495e);"></div>
            `;
            
            if (typeof THREE === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                script.onload = () => this.init3DGame();
                document.head.appendChild(script);
            } else {
                this.init3DGame();
            }
        }
        
        init3DGame() {
            const gameArea = document.getElementById('gameArea');
            gameArea.innerHTML = '<div id="threejs-container" style="width: 100%; height: 100%; background: #000;"></div>';
            
            const threeContainer = document.getElementById('threejs-container');
            const width = threeContainer.clientWidth;
            const height = threeContainer.clientHeight;
            
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(width, height);
            renderer.setClearColor(0x222222);
            threeContainer.appendChild(renderer.domElement);
            
            const geometry = new THREE.BoxGeometry(2, 2, 2);
            const materials = [
                new THREE.MeshBasicMaterial({ color: 0xff0000 }),
                new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
                new THREE.MeshBasicMaterial({ color: 0x0000ff }),
                new THREE.MeshBasicMaterial({ color: 0xffff00 }),
                new THREE.MeshBasicMaterial({ color: 0xff00ff }),
                new THREE.MeshBasicMaterial({ color: 0x00ffff })
            ];
            const cube = new THREE.Mesh(geometry, materials);
            scene.add(cube);
            
            camera.position.z = 5;
            
            let isRotating = false;
            let previousMousePosition = { x: 0, y: 0 };
            let rotationCount = 0;
            const targetRotations = 5;
            
            const onMouseDown = (event) => {
                isRotating = true;
                const clientX = event.clientX || (event.touches && event.touches[0].clientX);
                const clientY = event.clientY || (event.touches && event.touches[0].clientY);
                previousMousePosition = { x: clientX, y: clientY };
            };
            
            const onMouseMove = (event) => {
                if (!isRotating) return;
                
                const clientX = event.clientX || (event.touches && event.touches[0].clientX);
                const clientY = event.clientY || (event.touches && event.touches[0].clientY);
                
                const deltaMove = {
                    x: clientX - previousMousePosition.x,
                    y: clientY - previousMousePosition.y
                };
                
                cube.rotation.x += deltaMove.y * 0.01;
                cube.rotation.y += deltaMove.x * 0.01;
                
                if (Math.abs(deltaMove.x) > 10 || Math.abs(deltaMove.y) > 10) {
                    rotationCount++;
                    this.sounds.click();
                    document.getElementById('gameInfo').textContent = `Rotaciones: ${rotationCount}/${targetRotations}`;
                    
                    if (rotationCount >= targetRotations) {
                        this.endMicrogame(100);
                        return;
                    }
                }
                
                previousMousePosition = { x: clientX, y: clientY };
            };
            
            const onMouseUp = () => {
                isRotating = false;
            };
            
            renderer.domElement.addEventListener('mousedown', onMouseDown);
            renderer.domElement.addEventListener('mousemove', onMouseMove);
            renderer.domElement.addEventListener('mouseup', onMouseUp);
            renderer.domElement.addEventListener('touchstart', onMouseDown, { passive: false });
            renderer.domElement.addEventListener('touchmove', onMouseMove, { passive: false });
            renderer.domElement.addEventListener('touchend', onMouseUp, { passive: false });
            
            const animate = () => {
                if (!this.gameActive) return;
                requestAnimationFrame(animate);
                
                if (!isRotating) {
                    cube.rotation.x += 0.005;
                    cube.rotation.y += 0.005;
                }
                
                renderer.render(scene, camera);
            };
            
            animate();
            
            this.threeScene = scene;
            this.threeRenderer = renderer;
            
            this.startGameTimer(() => {
                const score = rotationCount >= 3 ? 50 : rotationCount >= 1 ? 25 : 0;
                this.endMicrogame(score);
            }, 8);
        }
        
        createShooter3DGame() {
            this.container.innerHTML = `
                <div style="padding: 15px; text-align: center; background: rgba(255,107,107,0.8); color: white;">
                    <h3 id="gameTitle" style="margin: 0; font-size: 18px;">🔫 ¡DISPARA A SAMY!</h3>
                    <div style="font-size: 14px;">Tiempo: <span id="gameTime">15</span>s | <span id="gameInfo">Haz clic para disparar</span></div>
                </div>
                <div id="gameArea" style="flex: 1; display: flex; align-items: center; justify-content: center; 
                    background: linear-gradient(135deg, #2c3e50, #34495e);"></div>
            `;
            
            if (typeof THREE === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                script.onload = () => this.initShooter3D();
                document.head.appendChild(script);
            } else {
                this.initShooter3D();
            }
        }
        
        initShooter3D() {
            const gameArea = document.getElementById('gameArea');
            gameArea.innerHTML = '<div id="shooter-container" style="width: 100%; height: 100%; background: #001122; position: relative;"></div>';
            
            const container = document.getElementById('shooter-container');
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(width, height);
            renderer.setClearColor(0x001122);
            container.appendChild(renderer.domElement);
            
            // Crosshair
            const crosshair = document.createElement('div');
            crosshair.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: red; font-size: 30px; pointer-events: none; z-index: 100;';
            crosshair.textContent = '+';
            container.appendChild(crosshair);
            
            // Flying Samys
            const samys = [];
            let hits = 0;
            const targetHits = 5;
            
            const createSamy = () => {
                const geometry = new THREE.PlaneGeometry(1, 1);
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 64;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(0, 0, 64, 64);
                ctx.fillStyle = 'white';
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🐰', 32, 45);
                
                const texture = new THREE.CanvasTexture(canvas);
                const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
                const samy = new THREE.Mesh(geometry, material);
                
                samy.position.set(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 10,
                    -Math.random() * 10 - 5
                );
                
                samy.userData = {
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.1,
                        (Math.random() - 0.5) * 0.1,
                        Math.random() * 0.05 + 0.02
                    ),
                    hit: false
                };
                
                scene.add(samy);
                samys.push(samy);
            };
            
            // Create initial Samys
            for (let i = 0; i < 3; i++) {
                setTimeout(() => createSamy(), i * 1000);
            }
            
            // Shooting
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            
            const shoot = (event) => {
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(samys.filter(s => !s.userData.hit));
                
                if (intersects.length > 0) {
                    const hitSamy = intersects[0].object;
                    hitSamy.userData.hit = true;
                    hitSamy.material.color.setHex(0x00ff00);
                    hits++;
                    this.sounds.success();
                    document.getElementById('gameInfo').textContent = `Disparos: ${hits}/${targetHits}`;
                    
                    if (hits >= targetHits) {
                        this.endMicrogame(100);
                        return;
                    }
                    
                    // Remove hit Samy and create new one
                    setTimeout(() => {
                        scene.remove(hitSamy);
                        const index = samys.indexOf(hitSamy);
                        if (index > -1) samys.splice(index, 1);
                        createSamy();
                    }, 500);
                } else {
                    this.sounds.fail();
                }
            };
            
            renderer.domElement.addEventListener('click', shoot);
            
            const animate = () => {
                if (!this.gameActive) return;
                requestAnimationFrame(animate);
                
                samys.forEach(samy => {
                    if (!samy.userData.hit) {
                        samy.position.add(samy.userData.velocity);
                        samy.rotation.z += 0.02;
                        
                        // Reset position if too close
                        if (samy.position.z > 2) {
                            samy.position.set(
                                (Math.random() - 0.5) * 20,
                                (Math.random() - 0.5) * 10,
                                -Math.random() * 10 - 5
                            );
                        }
                    }
                });
                
                renderer.render(scene, camera);
            };
            
            animate();
            
            this.threeScene = scene;
            this.threeRenderer = renderer;
            
            this.startGameTimer(() => {
                const score = hits >= 3 ? 50 : hits >= 1 ? 25 : 0;
                this.endMicrogame(score);
            }, 10);
        }
        
        cleanup() {
            if (this.gameTimer) {
                clearInterval(this.gameTimer);
                this.gameTimer = null;
            }
            this.gameActive = false;
            
            // Clear Three.js resources
            if (this.threeRenderer) {
                this.threeRenderer.dispose();
                this.threeRenderer = null;
            }
            if (this.threeScene) {
                this.threeScene = null;
            }
            
            // Clear method references
            this.memoryClick = null;
            this.mathAnswer = null;
            this.rhythmTap = null;
            
            // Clear racing cleanup
            if (this.raceCleanup) {
                this.raceCleanup();
                this.raceCleanup = null;
            }
        }
        
        createRacing3DGame() {
            this.container.innerHTML = `
                <div style="padding: 15px; text-align: center; background: rgba(255,107,107,0.8); color: white;">
                    <h3 id="gameTitle" style="margin: 0; font-size: 18px;">🏎️ ¡CARRERA 3D!</h3>
                    <div style="font-size: 14px;">Tiempo: <span id="gameTime">20</span>s | <span id="gameInfo">WASD o Flechas para mover</span></div>
                </div>
                <div id="gameArea" style="flex: 1; display: flex; align-items: center; justify-content: center; 
                    background: linear-gradient(135deg, #2c3e50, #34495e);"></div>
            `;
            
            if (typeof THREE === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                script.onload = () => this.initRacing3D();
                document.head.appendChild(script);
            } else {
                this.initRacing3D();
            }
        }
        
        initRacing3D() {
            const gameArea = document.getElementById('gameArea');
            gameArea.innerHTML = '<div id="racing-container" style="width: 100%; height: 100%; background: #87CEEB; position: relative;"></div>';
            
            const container = document.getElementById('racing-container');
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            const scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x87CEEB, 100, 300);
            
            const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(width, height);
            renderer.setClearColor(0x87CEEB);
            container.appendChild(renderer.domElement);
            
            // Highway (3 lanes)
            const highwayGeometry = new THREE.PlaneGeometry(12, 500);
            const highwayMaterial = new THREE.MeshBasicMaterial({ color: 0x2a2a2a });
            const highway = new THREE.Mesh(highwayGeometry, highwayMaterial);
            highway.rotation.x = -Math.PI / 2;
            scene.add(highway);
            
            // Optimized lane dividers with instanced geometry
            const yellowMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const lineGeometry = new THREE.PlaneGeometry(0.2, 4);
            const dividerGeometry = new THREE.PlaneGeometry(0.15, 3);
            
            const roadLines = new THREE.Group();
            
            for (let i = -100; i < 100; i += 8) {
                // Center lines (reuse geometry)
                const centerLine1 = new THREE.Mesh(lineGeometry, yellowMaterial);
                centerLine1.rotation.x = -Math.PI / 2;
                centerLine1.position.set(-0.3, 0.01, i);
                roadLines.add(centerLine1);
                
                const centerLine2 = new THREE.Mesh(lineGeometry, yellowMaterial);
                centerLine2.rotation.x = -Math.PI / 2;
                centerLine2.position.set(0.3, 0.01, i);
                roadLines.add(centerLine2);
                
                // Lane dividers (reduced frequency)
                if (i % 16 === 0) {
                    const leftDivider = new THREE.Mesh(dividerGeometry, whiteMaterial);
                    leftDivider.rotation.x = -Math.PI / 2;
                    leftDivider.position.set(-4, 0.01, i);
                    roadLines.add(leftDivider);
                    
                    const rightDivider = new THREE.Mesh(dividerGeometry, whiteMaterial);
                    rightDivider.rotation.x = -Math.PI / 2;
                    rightDivider.position.set(4, 0.01, i);
                    roadLines.add(rightDivider);
                }
            }
            scene.add(roadLines);
            
            // Player car
            const carGeometry = new THREE.BoxGeometry(1.5, 0.6, 3);
            const carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const car = new THREE.Mesh(carGeometry, carMaterial);
            car.position.set(0, 0.3, 0);
            scene.add(car);
            
            // Optimized AI Cars with shared geometry
            const aiCars = [];
            const carColors = [0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff, 0x8B4513, 0x800080];
            const aiCarGeometry = new THREE.BoxGeometry(1.4, 0.5, 2.8);
            
            for (let i = 0; i < 8; i++) { // Reduced from 12 to 8 for performance
                const aiCarMaterial = new THREE.MeshBasicMaterial({ 
                    color: carColors[i % carColors.length] 
                });
                const aiCar = new THREE.Mesh(aiCarGeometry, aiCarMaterial);
                
                const lanes = [-4, 0, 4];
                aiCar.position.set(
                    lanes[Math.floor(Math.random() * 3)],
                    0.25,
                    -30 - i * 30
                );
                
                aiCar.userData = {
                    speed: 0.12 + Math.random() * 0.08,
                    overtaken: false,
                    type: Math.random() > 0.7 ? 'truck' : 'car'
                };
                
                // Make trucks bigger and slower
                if (aiCar.userData.type === 'truck') {
                    aiCar.scale.set(1.2, 1.5, 1.4);
                    aiCar.userData.speed *= 0.6;
                    aiCar.material.color.setHex(0x8B4513);
                }
                
                scene.add(aiCar);
                aiCars.push(aiCar);
            }
            
            // Environment objects (optimized)
            const envObjects = new THREE.Group();
            for (let i = 0; i < 20; i++) {
                if (Math.random() > 0.5) {
                    // Buildings
                    const building = new THREE.Mesh(
                        new THREE.BoxGeometry(3, 8 + Math.random() * 10, 3),
                        new THREE.MeshBasicMaterial({ color: 0x666666 })
                    );
                    building.position.set(
                        (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 5),
                        4,
                        -i * 40
                    );
                    envObjects.add(building);
                } else {
                    // Trees
                    const tree = new THREE.Mesh(
                        new THREE.ConeGeometry(1, 4),
                        new THREE.MeshBasicMaterial({ color: 0x228B22 })
                    );
                    tree.position.set(
                        (Math.random() > 0.5 ? 1 : -1) * (7 + Math.random() * 3),
                        2,
                        -i * 25
                    );
                    envObjects.add(tree);
                }
            }
            scene.add(envObjects);
            
            // Enhanced HUD
            const hud = document.createElement('div');
            hud.style.cssText = 'position: absolute; top: 10px; left: 10px; color: white; font-family: Arial; font-size: 14px; z-index: 100; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 8px; min-width: 200px;';
            container.appendChild(hud);
            
            // Nitro bar
            const nitroBar = document.createElement('div');
            nitroBar.style.cssText = 'position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 200px; height: 20px; background: rgba(0,0,0,0.7); border: 2px solid #fff; border-radius: 10px; z-index: 100;';
            const nitroFill = document.createElement('div');
            nitroFill.style.cssText = 'width: 100%; height: 100%; background: linear-gradient(90deg, #ff6b00, #ffaa00); border-radius: 8px; transition: width 0.3s;';
            nitroBar.appendChild(nitroFill);
            container.appendChild(nitroBar);
            
            // Camera position
            camera.position.set(0, 6, 12);
            camera.lookAt(car.position);
            
            // Game variables
            const keys = { w: false, a: false, s: false, d: false, shift: false };
            let speed = 0;
            let overtakes = 0;
            let currentLane = 1;
            const lanes = [-4, 0, 4];
            let laneChangeTime = 0;
            let nitro = 100;
            let combo = 0;
            let distance = 0;
            let engineSound = 0.1;
            
            const onKeyDown = (event) => {
                const key = event.key.toLowerCase();
                if (key in keys) keys[key] = true;
                if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key)) {
                    event.preventDefault();
                    if (event.key === 'ArrowUp') keys.w = true;
                    if (event.key === 'ArrowDown') keys.s = true;
                    if (event.key === 'ArrowLeft') keys.a = true;
                    if (event.key === 'ArrowRight') keys.d = true;
                }
            };
            
            const onKeyUp = (event) => {
                const key = event.key.toLowerCase();
                if (key in keys) keys[key] = false;
                if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key)) {
                    event.preventDefault();
                    if (event.key === 'ArrowUp') keys.w = false;
                    if (event.key === 'ArrowDown') keys.s = false;
                    if (event.key === 'ArrowLeft') keys.a = false;
                    if (event.key === 'ArrowRight') keys.d = false;
                }
            };
            
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
            
            // Mobile controls
            if (this.isMobile) {
                const controls = document.createElement('div');
                controls.style.cssText = 'position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: grid; grid-template-columns: repeat(3, 60px); grid-template-rows: repeat(2, 60px); gap: 10px; z-index: 100;';
                controls.innerHTML = `
                    <div></div>
                    <button id="upBtn" style="background: rgba(255,255,255,0.8); border: none; border-radius: 10px; font-size: 20px;">↑</button>
                    <div></div>
                    <button id="leftBtn" style="background: rgba(255,255,255,0.8); border: none; border-radius: 10px; font-size: 20px;">←</button>
                    <button id="downBtn" style="background: rgba(255,255,255,0.8); border: none; border-radius: 10px; font-size: 20px;">↓</button>
                    <button id="rightBtn" style="background: rgba(255,255,255,0.8); border: none; border-radius: 10px; font-size: 20px;">→</button>
                `;
                container.appendChild(controls);
                
                document.getElementById('upBtn').addEventListener('touchstart', () => keys.w = true);
                document.getElementById('upBtn').addEventListener('touchend', () => keys.w = false);
                document.getElementById('downBtn').addEventListener('touchstart', () => keys.s = true);
                document.getElementById('downBtn').addEventListener('touchend', () => keys.s = false);
                document.getElementById('leftBtn').addEventListener('touchstart', () => keys.a = true);
                document.getElementById('leftBtn').addEventListener('touchend', () => keys.a = false);
                document.getElementById('rightBtn').addEventListener('touchstart', () => keys.d = true);
                document.getElementById('rightBtn').addEventListener('touchend', () => keys.d = false);
            }
            
            const animate = () => {
                if (!this.gameActive) return;
                requestAnimationFrame(animate);
                
                // Enhanced car movement with nitro
                const maxSpeed = keys.shift && nitro > 0 ? 0.6 : 0.4;
                const acceleration = keys.shift && nitro > 0 ? 0.015 : 0.008;
                
                if (keys.w) {
                    speed = Math.min(speed + acceleration, maxSpeed);
                    if (keys.shift && nitro > 0) {
                        nitro = Math.max(nitro - 0.5, 0);
                    }
                } else if (keys.s) {
                    speed = Math.max(speed - 0.015, 0.05);
                } else {
                    speed = Math.max(speed - 0.002, 0.1);
                }
                
                // Nitro regeneration
                if (!keys.shift && nitro < 100) {
                    nitro = Math.min(nitro + 0.1, 100);
                }
                
                // Lane changing with sound
                if (laneChangeTime <= 0) {
                    if (keys.a && currentLane > 0) {
                        currentLane--;
                        laneChangeTime = 25;
                        this.playTone(600, 0.1, 'square', 0.2);
                    }
                    if (keys.d && currentLane < 2) {
                        currentLane++;
                        laneChangeTime = 25;
                        this.playTone(600, 0.1, 'square', 0.2);
                    }
                }
                
                // Smooth lane transition
                const targetX = lanes[currentLane];
                car.position.x += (targetX - car.position.x) * 0.12;
                
                if (laneChangeTime > 0) laneChangeTime--;
                distance += speed;
                
                // Move AI cars
                aiCars.forEach(aiCar => {
                    aiCar.position.z += speed - aiCar.userData.speed;
                    
                    // Reset AI car position
                    if (aiCar.position.z > car.position.z + 30) {
                        aiCar.position.z = car.position.z - 200 - Math.random() * 100;
                        const lanes = [-4, 0, 4];
                        aiCar.position.x = lanes[Math.floor(Math.random() * 3)];
                        aiCar.userData.overtaken = false;
                    }
                    
                    // Enhanced overtaking with combo system
                    if (!aiCar.userData.overtaken && aiCar.position.z > car.position.z - 5 && 
                        Math.abs(aiCar.position.x - car.position.x) < 2.5) {
                        overtakes++;
                        combo++;
                        aiCar.userData.overtaken = true;
                        
                        // Different sounds for different vehicle types
                        if (aiCar.userData.type === 'truck') {
                            this.playTone(300, 0.3, 'sawtooth', 0.3);
                        } else {
                            this.playTone(523, 0.2, 'triangle', 0.4);
                        }
                        
                        document.getElementById('gameInfo').textContent = `Adelantamientos: ${overtakes}/15`;
                        
                        if (overtakes >= 15) {
                            this.endMicrogame(100);
                            return;
                        }
                    }
                    
                    // Reset combo if no overtaking for a while
                    if (combo > 0 && Math.random() < 0.001) combo = Math.max(0, combo - 1);
                    
                    // Collision detection
                    const distance = car.position.distanceTo(aiCar.position);
                    if (distance < 2.5) {
                        this.sounds.fail();
                        this.endMicrogame(0);
                        return;
                    }
                });
                
                // Update HUD with enhanced info
                const speedKmh = Math.floor(speed * 200);
                hud.innerHTML = `
                    <div style="color: ${speedKmh > 160 ? '#ff6b00' : '#fff'}">🏎️ ${speedKmh} km/h</div>
                    <div>🏁 Adelantamientos: ${overtakes}/15</div>
                    <div>🔥 Combo: x${combo}</div>
                    <div>📏 ${Math.floor(distance * 10)}m</div>
                    <div style="font-size: 12px; color: ${nitro < 20 ? '#ff4444' : '#44ff44'}">⚡ Nitro: ${Math.floor(nitro)}%</div>
                `;
                
                // Update nitro bar
                nitroFill.style.width = nitro + '%';
                nitroFill.style.background = nitro > 50 ? 'linear-gradient(90deg, #44ff44, #88ff88)' : 'linear-gradient(90deg, #ff4444, #ff8888)';
                
                // Update camera
                camera.position.set(0, 6, car.position.z + 12);
                camera.lookAt(0, 0, car.position.z - 10);
                
                renderer.render(scene, camera);
            };
            
            animate();
            
            this.threeScene = scene;
            this.threeRenderer = renderer;
            this.raceCleanup = () => {
                document.removeEventListener('keydown', onKeyDown);
                document.removeEventListener('keyup', onKeyUp);
            };
            
            this.startGameTimer(() => {
                const baseScore = overtakes >= 10 ? 75 : overtakes >= 5 ? 50 : overtakes >= 1 ? 25 : 0;
                const comboBonus = Math.min(combo * 2, 25);
                const distanceBonus = Math.min(Math.floor(distance / 10), 15);
                const finalScore = Math.min(baseScore + comboBonus + distanceBonus, 100);
                this.endMicrogame(finalScore);
            }, 45);
        }
        
        showAchievements() {
            const achievementList = {
                'first_game': '🎮 Primer Juego - Juega tu primer minijuego',
                'perfect': '⭐ Perfecto - Consigue 100 puntos en un juego',
                'streak_5': '🔥 Racha x5 - Gana 5 juegos seguidos',
                'streak_10': '🔥 Racha x10 - Gana 10 juegos seguidos',
                'score_500': '💯 500 Puntos - Alcanza 500 puntos totales',
                'score_1000': '💯 1000 Puntos - Alcanza 1000 puntos totales',
                'games_50': '🎯 50 Juegos - Juega 50 minijuegos',
                'perfect_10': '⭐ 10 Perfectos - Consigue 10 juegos perfectos'
            };
            
            this.container.innerHTML = `
                <div style="flex: 1; padding: 20px; background: linear-gradient(135deg, #2c5282, #2a4365); color: white;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="font-size: 36px; margin: 0; color: #ffd700;">🏆 LOGROS</h1>
                        <p style="margin: 10px 0; opacity: 0.8;">${this.stats.achievements.length}/${Object.keys(achievementList).length} desbloqueados</p>
                    </div>
                    
                    <div style="display: grid; gap: 15px; max-width: 600px; margin: 0 auto;">
                        ${Object.entries(achievementList).map(([key, desc]) => {
                            const unlocked = this.stats.achievements.includes(key);
                            return `
                                <div style="
                                    background: ${unlocked ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)'};
                                    border: 2px solid ${unlocked ? '#ffd700' : 'rgba(255,255,255,0.2)'};
                                    padding: 15px; border-radius: 10px;
                                    opacity: ${unlocked ? '1' : '0.5'};
                                ">
                                    <div style="font-size: 16px; font-weight: bold; color: ${unlocked ? '#ffd700' : '#ccc'};">
                                        ${unlocked ? '✅' : '🔒'} ${desc}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="window.samyWareStandalone.createMainMenu()" style="
                            padding: 15px 30px; font-size: 18px;
                            background: rgba(255,255,255,0.12); color: white;
                            border: 1px solid rgba(255,255,255,0.25); border-radius: 8px;
                            cursor: pointer;
                        ">🏠 VOLVER</button>
                    </div>
                </div>
            `;
        }
        
        close() {
            this.cleanup();
            if (this.overlay) {
                this.overlay.remove();
            }
            const styles = document.getElementById('samyWareStyles');
            if (styles) styles.remove();
            delete window.samyWareStandalone;
        }
    }
    
    // Initialize and expose globally
    window.samyWareStandalone = new SamyWareStandalone();
})();