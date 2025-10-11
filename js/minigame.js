// Samy Ware - WarioWare Style Minigames with Phaser
// Desarrollado para Sonic.EXE FMM

// Load Phaser.js if not already loaded
if (typeof Phaser === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';
    script.onload = () => console.log('Phaser.js loaded');
    document.head.appendChild(script);
}

(function() {
    'use strict';
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    let gameActive = false;
    let currentScore = 0;
    let gamesCompleted = 0;
    let gameSpeed = 1;
    let lives = 3;
    let currentTheme = 'default';
    let achievements = [];
    let bestScore = 0;
    let streak = 0;
    let maxStreak = 0;
    
    // Web Audio API setup
    let audioContext = null;
    let soundEnabled = true;
    let musicEnabled = true;
    
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }
    
    function playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!soundEnabled) return;
        const ctx = initAudio();
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
    
    const sounds = {
        success: () => playTone(523, 0.2, 'triangle', 0.4),
        fail: () => playTone(196, 0.3, 'sawtooth', 0.3),
        collect: () => playTone(659, 0.1, 'square', 0.2),
        jump: () => playTone(440, 0.15, 'sine', 0.3),
        click: () => playTone(800, 0.05, 'square', 0.1),
        perfect: () => {
            playTone(523, 0.1, 'triangle', 0.3);
            setTimeout(() => playTone(659, 0.1, 'triangle', 0.3), 100);
            setTimeout(() => playTone(784, 0.2, 'triangle', 0.4), 200);
        }
    };
    
    // Themes
    const themes = {
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
    
    // Achievements system
    const achievementsList = {
        firstWin: { name: '🎯 Primer Éxito', desc: 'Completa tu primer minijuego', unlocked: false },
        perfectionist: { name: '💯 Perfeccionista', desc: 'Consigue 100 puntos en un juego', unlocked: false },
        speedster: { name: '⚡ Velocista', desc: 'Alcanza velocidad 2.0x', unlocked: false },
        survivor: { name: '🛡️ Superviviente', desc: 'Completa 20 juegos seguidos', unlocked: false },
        streaker: { name: '🔥 Racha', desc: 'Consigue 10 éxitos seguidos', unlocked: false },
        explorer: { name: '🗺️ Explorador', desc: 'Juega todos los minijuegos', unlocked: false },
        master: { name: '👑 Maestro', desc: 'Alcanza 1000 puntos totales', unlocked: false }
    };
    
    function checkAchievements() {
        if (!achievementsList.firstWin.unlocked && gamesCompleted >= 1) {
            unlockAchievement('firstWin');
        }
        if (!achievementsList.speedster.unlocked && gameSpeed >= 2.0) {
            unlockAchievement('speedster');
        }
        if (!achievementsList.survivor.unlocked && gamesCompleted >= 20) {
            unlockAchievement('survivor');
        }
        if (!achievementsList.master.unlocked && currentScore >= 1000) {
            unlockAchievement('master');
        }
    }
    
    function unlockAchievement(id) {
        if (!achievementsList[id].unlocked) {
            achievementsList[id].unlocked = true;
            achievements.push(id);
            sounds.perfect();
            showAchievementNotification(achievementsList[id]);
            saveStats();
        }
    }
    
    function showAchievementNotification(achievement) {
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
    
    // Phaser game instance
    let phaserGame = null;
    let gameTimer = null;

    const gameHTML = `
        <div id="samyWareOverlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            font-family: Arial, sans-serif;
            padding: ${isMobile ? '0' : '20px'};
        ">
            <div id="gameContainer" style="
                width: ${isMobile ? '100vw' : '600px'};
                height: ${isMobile ? '100vh' : '500px'};
                background: #fff;
                border-radius: ${isMobile ? '0' : '15px'};
                margin: 0;
                box-shadow: ${isMobile ? 'none' : '0 10px 30px rgba(0,0,0,0.3)'};
                display: flex;
                flex-direction: column;
            "></div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHTML);
    
    const overlay = document.getElementById('samyWareOverlay');
    const container = document.getElementById('gameContainer');

    // Save/Load stats
    function saveStats() {
        localStorage.setItem('samyWareStats', JSON.stringify({
            currentScore, gamesCompleted, gameSpeed, lives, currentTheme,
            achievements, bestScore, maxStreak, soundEnabled, musicEnabled
        }));
    }

    function loadStats() {
        const saved = localStorage.getItem('samyWareStats');
        if (saved) {
            const data = JSON.parse(saved);
            currentScore = data.currentScore || 0;
            gamesCompleted = data.gamesCompleted || 0;
            gameSpeed = data.gameSpeed || 1;
            lives = data.lives || 3;
            currentTheme = data.currentTheme || 'default';
            achievements = data.achievements || [];
            bestScore = data.bestScore || 0;
            maxStreak = data.maxStreak || 0;
            soundEnabled = data.soundEnabled !== false;
            musicEnabled = data.musicEnabled !== false;
            
            // Restore achievements
            achievements.forEach(id => {
                if (achievementsList[id]) {
                    achievementsList[id].unlocked = true;
                }
            });
        }
    }

    // Clean up function
    function cleanup() {
        if (phaserGame) {
            phaserGame.destroy(true);
            phaserGame = null;
        }
        if (gameTimer) clearInterval(gameTimer);
        gameTimer = null;
        gameActive = false;
        window.submitCount = null;
    }

    // Main menu
    function createMainMenu() {
        cleanup();
        // Center main menu
        const overlay = document.getElementById('samyWareOverlay');
        if (overlay) {
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
        }
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.width = isMobile ? '100vw' : '500px';
            gameContainer.style.height = isMobile ? '100vh' : '600px';
        }
        
        container.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; background: ${themes[currentTheme].bg};">
                <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: ${isMobile ? '36px' : '28px'}; text-shadow: 4px 4px 8px rgba(0,0,0,0.7); animation: pulse 2s infinite; font-family: 'Arial Black', Arial, sans-serif;">🎮 SAMY WARE</h1>
                <p style="color: #f8f9fa; margin: 0 0 ${isMobile ? '30px' : '20px'} 0; font-size: ${isMobile ? '18px' : '14px'}; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); font-weight: bold;">¡Minijuegos Rápidos!</p>
                
                <div style="position: relative; margin: ${isMobile ? '20px 0' : '15px 0'};">
                    <img src="images/samyholahola.png" alt="Samy" style="width: ${isMobile ? '150px' : '120px'}; height: ${isMobile ? '150px' : '120px'}; object-fit: contain; animation: bounce 2s infinite; filter: drop-shadow(0 0 15px rgba(255,255,255,0.3)); display: block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div style="width: ${isMobile ? '150px' : '120px'}; height: ${isMobile ? '150px' : '120px'}; background: linear-gradient(45deg, #4ecdc4, #44a08d); border-radius: 50%; display: none; align-items: center; justify-content: center; font-size: ${isMobile ? '60px' : '48px'}; animation: bounce 2s infinite; margin: 0 auto;">🎮</div>
                </div>
                
                <div style="background: rgba(255,255,255,0.25); padding: ${isMobile ? '25px' : '12px'}; border-radius: 20px; margin: ${isMobile ? '20px 0' : '8px 0'}; backdrop-filter: blur(15px); border: 2px solid rgba(255,255,255,0.2); box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                    <div style="color: #ffffff; font-size: ${isMobile ? '20px' : '14px'}; margin-bottom: ${isMobile ? '15px' : '8px'}; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">📊 STATS</div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: ${isMobile ? '20px' : '8px'}; max-width: ${isMobile ? '450px' : '300px'};">
                        <div style="color: #ffffff; text-align: center;">
                            <div style="font-size: ${isMobile ? '24px' : '28px'}; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${currentScore}</div>
                            <div style="font-size: ${isMobile ? '14px' : '16px'}; opacity: 0.9; font-weight: bold;">Puntos</div>
                        </div>
                        <div style="color: #ffffff; text-align: center;">
                            <div style="font-size: ${isMobile ? '24px' : '28px'}; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${gamesCompleted}</div>
                            <div style="font-size: ${isMobile ? '14px' : '16px'}; opacity: 0.9; font-weight: bold;">Juegos</div>
                        </div>
                        <div style="color: #ffffff; text-align: center;">
                            <div style="font-size: ${isMobile ? '24px' : '28px'}; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${lives}</div>
                            <div style="font-size: ${isMobile ? '14px' : '16px'}; opacity: 0.9; font-weight: bold;">Vidas</div>
                        </div>
                        <div style="color: #ffffff; text-align: center;">
                            <div style="font-size: ${isMobile ? '24px' : '28px'}; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${maxStreak}</div>
                            <div style="font-size: ${isMobile ? '14px' : '16px'}; opacity: 0.9; font-weight: bold;">Mejor Racha</div>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: ${isMobile ? '20px' : '8px'}; max-width: ${isMobile ? '450px' : '300px'}; margin-top: 10px;">
                        <div style="color: #ffffff; text-align: center;">
                            <div style="font-size: ${isMobile ? '20px' : '24px'}; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${bestScore}</div>
                            <div style="font-size: ${isMobile ? '12px' : '14px'}; opacity: 0.9; font-weight: bold;">Mejor</div>
                        </div>
                        <div style="color: #ffffff; text-align: center;">
                            <div style="font-size: ${isMobile ? '20px' : '24px'}; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${gameSpeed.toFixed(1)}x</div>
                            <div style="font-size: ${isMobile ? '12px' : '14px'}; opacity: 0.9; font-weight: bold;">Velocidad</div>
                        </div>
                    </div>
                </div>
                
                <button onclick="startContinuousGame()" style="padding: ${isMobile ? '25px 50px' : '15px 25px'}; font-size: ${isMobile ? '24px' : '18px'}; background: linear-gradient(45deg, ${themes[currentTheme].primary}, ${themes[currentTheme].secondary}); color: white; border: none; border-radius: 20px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 8px 25px rgba(255,107,107,0.5); margin: ${isMobile ? '15px' : '5px'}; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); transform: scale(1); animation: pulse 2s infinite; width: ${isMobile ? 'auto' : '90%'};" onmouseover="this.style.transform='scale(1.05)'; sounds.click()" onmouseout="this.style.transform='scale(1)'">
                    🎲 ${isMobile ? '¡JUGAR INFINITO!' : '¡JUGAR!'}
                </button>
                
                <div style="display: flex; gap: ${isMobile ? '10px' : '10px'}; margin-top: ${isMobile ? '25px' : '15px'}; flex-wrap: wrap; justify-content: center; width: 100%;">
                    <button onclick="showSettings()" style="padding: ${isMobile ? '12px 20px' : '10px 15px'}; font-size: ${isMobile ? '14px' : '12px'}; background: linear-gradient(45deg, #74b9ff, #0984e3); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(116,185,255,0.4); font-weight: bold;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        ⚙️ CONFIG
                    </button>
                    <button onclick="showAchievements()" style="padding: ${isMobile ? '12px 20px' : '10px 15px'}; font-size: ${isMobile ? '14px' : '12px'}; background: linear-gradient(45deg, #f39c12, #e67e22); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(243,156,18,0.4); font-weight: bold;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🏆 LOGROS
                    </button>
                    <button onclick="showThemes()" style="padding: ${isMobile ? '12px 20px' : '10px 15px'}; font-size: ${isMobile ? '14px' : '12px'}; background: linear-gradient(45deg, #9b59b6, #8e44ad); color: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(155,89,182,0.4); font-weight: bold;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        🎨 TEMAS
                    </button>
                    <button onclick="resetStats()" style="padding: ${isMobile ? '12px 20px' : '10px 15px'}; font-size: ${isMobile ? '14px' : '12px'}; background: rgba(255,255,255,0.25); color: white; border: 2px solid rgba(255,255,255,0.4); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px); font-weight: bold;" onmouseover="this.style.transform='scale(1.05)'; this.style.background='rgba(255,255,255,0.35)'" onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(255,255,255,0.25)'">
                        🔄 RESET
                    </button>
                </div>
            </div>
        `;
    }

    // Continuous game mode
    let continuousMode = false;
    
    window.startContinuousGame = function() {
        continuousMode = true;
        startNextGame();
    };
    
    function startNextGame() {
        const games = ['jump', 'collect', 'dodge', 'tap', 'reaction', 'avoid', 'catch', 'shoot', 'balance', 'count', 'memory', 'math', 'rhythm', 'simon'];
        const randomGame = games[Math.floor(Math.random() * games.length)];
        startMicrogame(randomGame);
    }

    window.resetStats = function() {
        if (confirm('¿Estás seguro de que quieres reiniciar todas las estadísticas?')) {
            currentScore = 0;
            gamesCompleted = 0;
            gameSpeed = 1;
            lives = 3;
            saveStats();
            createMainMenu();
        }
    };

    // Start specific microgame
    function startMicrogame(gameType) {
        cleanup();
        gameActive = true;
        
        // Make minigames fullscreen
        const overlay = document.getElementById('samyWareOverlay');
        if (overlay) {
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
        }
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.width = isMobile ? '100vw' : '90vw';
            gameContainer.style.height = isMobile ? '100vh' : '90vh';
        }
        
        // Create Phaser game container
        container.innerHTML = `
            <div style="padding: 15px; text-align: center; background: #ff6b6b; color: white;">
                <h3 id="gameTitle">🎮 CARGANDO...</h3>
                <div>Tiempo: <span id="gameTime">5</span>s | <span id="gameInfo">Preparate...</span></div>
            </div>
            <div id="phaserContainer" style="flex: 1; display: flex; justify-content: center; align-items: center; background: linear-gradient(135deg, #2c3e50, #34495e); width: 100%;"></div>
            ${isMobile ? '<div id="mobileControls" style="padding: 15px; background: rgba(0,0,0,0.8); text-align: center;"></div>' : ''}
        `;
        
        // Wait for Phaser to be available
        const initGame = () => {
            if (typeof Phaser === 'undefined') {
                setTimeout(initGame, 100);
                return;
            }
            
            if (gameType === 'jump') createPhaserJumpGame();
            else if (gameType === 'collect') createPhaserCollectGame();
            else if (gameType === 'dodge') createPhaserDodgeGame();
            else if (gameType === 'tap') createPhaserTapGame();
            else if (gameType === 'reaction') createPhaserReactionGame();
            else if (gameType === 'avoid') createPhaserAvoidGame();
            else if (gameType === 'catch') createPhaserCatchGame();
            else if (gameType === 'shoot') createPhaserShootGame();
            else if (gameType === 'balance') createPhaserBalanceGame();
            else if (gameType === 'count') createPhaserCountGame();
            else if (gameType === 'memory') createMemoryGame();
            else if (gameType === 'math') createMathGame();
            else if (gameType === 'rhythm') createRhythmGame();
            else if (gameType === 'simon') createSimonGame();
        };
        
        initGame();
    }

    // Phaser Jump Game
    function createPhaserJumpGame() {
        document.getElementById('gameTitle').textContent = '🦘 ¡SALTA ALTO!';
        document.getElementById('gameInfo').textContent = 'Altura: 0m';
        
        const config = {
            type: Phaser.AUTO,
            width: Math.min(container.offsetWidth - 20, isMobile ? 580 : 800),
            height: Math.min(container.offsetHeight - 120, isMobile ? 380 : 600),
            parent: 'phaserContainer',
            physics: { default: 'arcade', arcade: { gravity: { y: 800 } } },
            scene: {
                preload: function() {
                    this.add.graphics().fillStyle(0x8B4513).fillRect(0, 0, 100, 15).generateTexture('platform', 100, 15);
                    this.load.image('samy', 'images/samyholahola.png');
                },
                create: function() {
                    this.maxHeight = 0;
                    this.platforms = this.physics.add.staticGroup();
                    
                    // Ground
                    const ground = this.add.rectangle(config.width/2, config.height - 20, config.width, 40, 0x654321);
                    this.physics.add.existing(ground, true);
                    this.platforms.add(ground);
                    
                    // Floating platforms
                    for (let i = 1; i <= 8; i++) {
                        const platform = this.add.rectangle(Math.random() * (config.width - 100) + 50, config.height - 80 - (i * 60), 100, 15, 0x8B4513);
                        this.physics.add.existing(platform, true);
                        this.platforms.add(platform);
                    }
                    
                    // Player
                    this.player = this.physics.add.sprite(config.width/2, config.height - 60, 'samy');
                    this.player.setScale(0.3);
                    this.player.setBounce(0.2);
                    this.player.setCollideWorldBounds(true);
                    this.physics.add.collider(this.player, this.platforms);
                    
                    // Controls
                    this.cursors = this.input.keyboard.createCursorKeys();
                    this.wasd = this.input.keyboard.addKeys('W,S,A,D,SPACE');
                    
                    // Mobile controls
                    if (isMobile) {
                        document.getElementById('mobileControls').innerHTML = `
                            <button id="jumpBtn" style="padding: 20px 40px; background: #4ecdc4; color: white; border: none; border-radius: 10px; font-size: 20px;">SALTAR</button>
                        `;
                        document.getElementById('jumpBtn').onclick = () => {
                            if (this.player && this.player.body && this.player.body.touching.down) {
                                this.player.setVelocityY(-600);
                            }
                        };
                    }
                },
                update: function() {
                    if (!gameActive || !this.player) return;
                    
                    // Movement
                    if (this.cursors.left.isDown || this.wasd.A.isDown) {
                        this.player.setVelocityX(-200);
                    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
                        this.player.setVelocityX(200);
                    } else {
                        this.player.setVelocityX(0);
                    }
                    
                    // Jumping
                    if ((this.cursors.up.isDown || this.cursors.space.isDown || this.wasd.W.isDown || this.wasd.SPACE.isDown) && this.player.body.touching.down) {
                        this.player.setVelocityY(-600);
                    }
                    
                    // Update height
                    const height = Math.max(0, Math.floor((config.height - this.player.y) / 20));
                    if (height > this.maxHeight) {
                        this.maxHeight = height;
                        const infoEl = document.getElementById('gameInfo');
                        if (infoEl) infoEl.textContent = `Altura: ${height}m`;
                    }
                }
            }
        };
        
        phaserGame = new Phaser.Game(config);
        startGameTimer(() => {
            const scene = phaserGame && phaserGame.scene && phaserGame.scene.scenes[0];
            const maxHeight = scene ? scene.maxHeight : 0;
            endMicrogame(maxHeight > 5 ? 100 : 50);
        });
    }

    // Phaser Collect Game
    function createPhaserCollectGame() {
        document.getElementById('gameTitle').textContent = '💎 ¡RECOGE 5!';
        document.getElementById('gameInfo').textContent = 'Gemas: 0/5';
        
        const config = {
            type: Phaser.AUTO,
            width: Math.min(container.offsetWidth, 600),
            height: Math.min(container.offsetHeight - 100, 400),
            parent: 'phaserContainer',
            scene: {
                preload: function() {
                    this.load.image('gem', 'images/samyholahola.png');
                },
                create: function() {
                    this.gemsCollected = 0;
                    
                    // Gems
                    this.gems = this.add.group();
                    for (let i = 0; i < 8; i++) {
                        const gem = this.add.sprite(
                            Math.random() * (config.width - 60) + 30,
                            Math.random() * (config.height - 60) + 30,
                            'gem'
                        );
                        gem.setScale(0.2);
                        gem.setTint(0xff6b6b);
                        gem.setInteractive();
                        gem.on('pointerdown', () => {
                            gem.setActive(false).setVisible(false);
                            this.gemsCollected++;
                            document.getElementById('gameInfo').textContent = `Gemas: ${this.gemsCollected}/5`;
                            if (this.gemsCollected >= 5) {
                                endMicrogame(100);
                            }
                        });
                        this.gems.add(gem);
                    }
                }
            }
        };
        
        // Add custom cursor CSS
        const cursorStyle = document.createElement('style');
        cursorStyle.textContent = `
            #phaserContainer {
                cursor: url('images/samyholahola.png') 25 25, auto !important;
            }
        `;
        document.head.appendChild(cursorStyle);
        
        phaserGame = new Phaser.Game(config);
        startGameTimer(() => endMicrogame(phaserGame.scene.scenes[0].gemsCollected >= 3 ? 50 : 0));
    }

    // Phaser Dodge Game
    function createPhaserDodgeGame() {
        document.getElementById('gameTitle').textContent = '🌪️ ¡SOBREVIVE!';
        document.getElementById('gameInfo').textContent = 'Vivo: ✅';
        
        const config = {
            type: Phaser.AUTO,
            width: Math.min(container.offsetWidth, 600),
            height: Math.min(container.offsetHeight - 100, 400),
            parent: 'phaserContainer',
            physics: { default: 'arcade' },
            scene: {
                preload: function() {
                    this.load.image('obstacle', 'images/samyholahola.png');
                },
                create: function() {
                    this.alive = true;
                    
                    // Obstacles group
                    this.obstacles = this.physics.add.group();
                    
                    // Spawn obstacles
                    this.obstacleTimer = this.time.addEvent({
                        delay: 600,
                        callback: () => {
                            if (!this.alive) return;
                            const obstacle = this.physics.add.sprite(
                                Math.random() * config.width,
                                -50,
                                'obstacle'
                            );
                            obstacle.setScale(0.2);
                            obstacle.setTint(0xff0000);
                            obstacle.setVelocityY(200 + Math.random() * 200);
                            // Remove click interaction - this is a dodge game, not click game
                            // Player should avoid obstacles, not click them
                            this.obstacles.add(obstacle);
                        },
                        loop: true
                    });
                }
            }
        };
        
        // Add custom cursor CSS
        const cursorStyle = document.createElement('style');
        cursorStyle.textContent = `
            #phaserContainer {
                cursor: url('images/samyholahola.png') 25 25, auto !important;
            }
        `;
        document.head.appendChild(cursorStyle);
        
        phaserGame = new Phaser.Game(config);
        startGameTimer(() => endMicrogame(phaserGame.scene.scenes[0].alive ? 100 : 0));
    }

    // Simple HTML games for the rest
    function createPhaserTapGame() {
        document.getElementById('gameTitle').textContent = '👆 ¡TOCA 10 VECES!';
        document.getElementById('gameInfo').textContent = 'Toques: 0/10';
        
        const config = {
            type: Phaser.AUTO,
            width: Math.min(container.offsetWidth, 600),
            height: Math.min(container.offsetHeight - 100, 400),
            parent: 'phaserContainer',
            scene: {
                create: function() {
                    this.taps = 0;
                    
                    // Background
                    this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0x667eea);
                    
                    // Create tap button
                    const button = this.add.circle(config.width/2, config.height/2, 100, 0xe17055);
                    button.setInteractive();
                    
                    const text = this.add.text(config.width/2, config.height/2, 'TAP!', {
                        fontSize: '32px',
                        fill: '#ffffff'
                    }).setOrigin(0.5);
                    
                    button.on('pointerdown', () => {
                        this.taps++;
                        document.getElementById('gameInfo').textContent = `Toques: ${this.taps}/10`;
                        button.setScale(0.9);
                        this.time.delayedCall(100, () => button.setScale(1));
                        if (this.taps >= 10) endMicrogame(100);
                    });
                }
            }
        };
        
        phaserGame = new Phaser.Game(config);
        startGameTimer(() => endMicrogame(phaserGame.scene.scenes[0].taps >= 7 ? 50 : 0));
    }

    // Simple implementations for remaining games
    function createPhaserReactionGame() {
        document.getElementById('gameTitle').textContent = '⚡ ¡CUANDO CAMBIE!';
        
        const config = {
            type: Phaser.AUTO,
            width: Math.min(container.offsetWidth, 600),
            height: Math.min(container.offsetHeight - 100, 400),
            parent: 'phaserContainer',
            scene: {
                create: function() {
                    this.reacted = false;
                    
                    // Background
                    this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0x2c3e50);
                    
                    const box = this.add.rectangle(config.width/2, config.height/2, 200, 200, 0xff6b6b);
                    box.setInteractive();
                    
                    this.time.delayedCall(2000 + Math.random() * 2000, () => {
                        box.setFillStyle(0x4ecdc4);
                        const startTime = Date.now();
                        
                        box.on('pointerdown', () => {
                            if (!this.reacted) {
                                this.reacted = true;
                                const reactionTime = Date.now() - startTime;
                                endMicrogame(reactionTime < 500 ? 100 : reactionTime < 1000 ? 50 : 25);
                            }
                        });
                    });
                }
            }
        };
        
        phaserGame = new Phaser.Game(config);
        startGameTimer(() => endMicrogame(0));
    }

    function createPhaserAvoidGame() {
        document.getElementById('gameTitle').textContent = '🚫 ¡NO TOQUES NADA!';
        document.getElementById('gameInfo').textContent = 'Estado: ✅';
        
        const config = {
            type: Phaser.AUTO,
            width: Math.min(container.offsetWidth, 600),
            height: Math.min(container.offsetHeight - 100, 400),
            parent: 'phaserContainer',
            scene: {
                preload: function() {
                    this.load.image('danger', 'images/samyholahola.png');
                },
                create: function() {
                    this.touched = false;
                    
                    // Background
                    this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0x34495e);
                    
                    // Create danger zones
                    for (let i = 0; i < 6; i++) {
                        const zone = this.add.sprite(
                            Math.random() * config.width,
                            Math.random() * config.height,
                            'danger'
                        );
                        zone.setScale(0.2);
                        zone.setTint(0xff0000);
                        zone.setInteractive();
                        zone.on('pointerdown', () => {
                            if (!this.touched) {
                                this.touched = true;
                                document.getElementById('gameInfo').textContent = 'Estado: 💀';
                            }
                        });
                    }
                }
            }
        };
        
        phaserGame = new Phaser.Game(config);
        startGameTimer(() => endMicrogame(phaserGame.scene.scenes[0].touched ? 0 : 100));
    }

    function createPhaserCatchGame() {
        document.getElementById('gameTitle').textContent = '🎯 ¡ATRAPA LA ESTRELLA!';
        
        const config = {
            type: Phaser.AUTO,
            width: Math.min(container.offsetWidth, 600),
            height: Math.min(container.offsetHeight - 100, 400),
            parent: 'phaserContainer',
            scene: {
                preload: function() {
                    this.load.image('star', 'images/samyholahola.png');
                },
                create: function() {
                    this.caught = false;
                    
                    // Background
                    this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0x667eea);
                    
                    // Star
                    this.star = this.add.sprite(
                        Math.random() * config.width,
                        Math.random() * config.height,
                        'star'
                    );
                    this.star.setScale(0.3);
                    this.star.setTint(0xffd700);
                    this.star.setInteractive();
                    
                    // Move star periodically
                    this.time.addEvent({
                        delay: 800,
                        callback: () => {
                            this.star.x = Math.random() * config.width;
                            this.star.y = Math.random() * config.height;
                        },
                        loop: true
                    });
                    
                    this.star.on('pointerdown', () => {
                        if (!this.caught) {
                            this.caught = true;
                            endMicrogame(100);
                        }
                    });
                }
            }
        };
        
        // Add custom cursor CSS
        const cursorStyle = document.createElement('style');
        cursorStyle.textContent = `
            #phaserContainer {
                cursor: url('images/samyholahola.png') 25 25, auto !important;
            }
        `;
        document.head.appendChild(cursorStyle);
        
        phaserGame = new Phaser.Game(config);
        startGameTimer(() => endMicrogame(0));
    }

    function createPhaserShootGame() {
        document.getElementById('gameTitle').textContent = '🎯 ¡DISPARA 5 ENEMIGOS!';
        document.getElementById('gameInfo').textContent = 'Eliminados: 0/5';
        
        const config = {
            type: Phaser.AUTO,
            width: Math.min(container.offsetWidth, 600),
            height: Math.min(container.offsetHeight - 100, 400),
            parent: 'phaserContainer',
            scene: {
                preload: function() {
                    this.load.image('enemy', 'images/samyholahola.png');
                },
                create: function() {
                    this.kills = 0;
                    this.enemies = this.add.group();
                    
                    // Background
                    this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0x2c3e50);
                    
                    // Spawn enemies
                    for (let i = 0; i < 8; i++) {
                        const enemy = this.add.sprite(
                            Math.random() * config.width,
                            Math.random() * config.height,
                            'enemy'
                        );
                        enemy.setScale(0.25);
                        enemy.setTint(0xff0000);
                        enemy.setInteractive();
                        enemy.on('pointerdown', () => {
                            enemy.destroy();
                            this.kills++;
                            document.getElementById('gameInfo').textContent = `Eliminados: ${this.kills}/5`;
                            if (this.kills >= 5) endMicrogame(100);
                        });
                        this.enemies.add(enemy);
                    }
                }
            }
        };
        
        phaserGame = new Phaser.Game(config);
        startGameTimer(() => endMicrogame(phaserGame.scene.scenes[0].kills >= 3 ? 50 : 0));
    }

    function createPhaserBalanceGame() {
        document.getElementById('gameTitle').textContent = '⚖️ ¡MANTÉN EL EQUILIBRIO!';
        document.getElementById('gameInfo').textContent = 'Equilibrio: 50%';
        
        const config = {
            type: Phaser.AUTO,
            width: Math.min(container.offsetWidth, 600),
            height: Math.min(container.offsetHeight - 100, 400),
            parent: 'phaserContainer',
            scene: {
                preload: function() {
                    this.load.image('balanceIndicator', 'images/samyholahola.png');
                },
                create: function() {
                    this.balance = 50;
                    this.balanceVelocity = 0;
                    
                    // Background
                    this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0x34495e);
                    
                    // Balance bar
                    this.balanceBar = this.add.rectangle(config.width/2, config.height/2, 400, 20, 0x666666);
                    this.balanceIndicator = this.add.sprite(config.width/2, config.height/2, 'balanceIndicator');
                    this.balanceIndicator.setScale(0.2);
                    this.balanceIndicator.setTint(0xff6b6b);
                    
                    this.input.on('pointermove', (pointer) => {
                        const mouseX = (pointer.x / config.width) * 100;
                        this.balanceVelocity += (mouseX - this.balance) * 0.02;
                    });
                    
                    // Update balance
                    this.time.addEvent({
                        delay: 50,
                        callback: () => {
                            this.balanceVelocity += (Math.random() - 0.5) * 0.5;
                            this.balance += this.balanceVelocity;
                            this.balanceVelocity *= 0.95;
                            this.balance = Phaser.Math.Clamp(this.balance, 0, 100);
                            
                            this.balanceIndicator.x = (this.balance / 100) * 400 + (config.width/2 - 200);
                            document.getElementById('gameInfo').textContent = `Equilibrio: ${Math.round(this.balance)}%`;
                        },
                        loop: true
                    });
                }
            }
        };
        
        phaserGame = new Phaser.Game(config);
        startGameTimer(() => {
            const balance = phaserGame.scene.scenes[0].balance;
            endMicrogame(balance > 30 && balance < 70 ? 100 : 25);
        });
    }

    function createPhaserCountGame() {
        document.getElementById('gameTitle').textContent = '🔢 ¡CUENTA LAS ESTRELLAS!';
        
        const config = {
            type: Phaser.AUTO,
            width: Math.min(container.offsetWidth, 600),
            height: Math.min(container.offsetHeight - 100, 400),
            parent: 'phaserContainer',
            scene: {
                preload: function() {
                    this.load.image('countStar', 'images/samyholahola.png');
                },
                create: function() {
                    this.correctCount = 3 + Math.floor(Math.random() * 5);
                    
                    // Background
                    this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0x667eea);
                    
                    // Show stars briefly
                    const stars = [];
                    for (let i = 0; i < this.correctCount; i++) {
                        const star = this.add.sprite(
                            Math.random() * config.width,
                            Math.random() * config.height,
                            'countStar'
                        );
                        star.setScale(0.15);
                        star.setTint(0xffd700);
                        stars.push(star);
                    }
                    
                    // Hide stars after 2 seconds
                    this.time.delayedCall(2000, () => {
                        stars.forEach(star => star.destroy());
                        
                        // Show number buttons
                        for (let i = 1; i <= 8; i++) {
                            const button = this.add.rectangle(
                                (i - 1) * 70 + 50,
                                config.height - 50,
                                60,
                                40,
                                0x74b9ff
                            );
                            button.setInteractive();
                            
                            const text = this.add.text(button.x, button.y, i.toString(), {
                                fontSize: '20px',
                                fill: '#ffffff'
                            }).setOrigin(0.5);
                            
                            button.on('pointerdown', () => {
                                endMicrogame(i === this.correctCount ? 100 : 0);
                            });
                        }
                    });
                }
            }
        };
        
        phaserGame = new Phaser.Game(config);
        startGameTimer(() => endMicrogame(0));
    }

    // Game timer helper with speed scaling
    function startGameTimer(onComplete) {
        let timeLeft = Math.max(3, Math.floor(5 / gameSpeed));
        const interval = Math.max(500, Math.floor(1000 / gameSpeed));
        
        gameTimer = setInterval(() => {
            timeLeft--;
            const timeEl = document.getElementById('gameTime');
            if (timeEl) timeEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(gameTimer);
                onComplete();
            }
        }, interval);
    }

    // End microgame
    function endMicrogame(score) {
        cleanup();
        
        currentScore += score;
        gamesCompleted++;
        
        if (score < 50) {
            lives--;
            if (lives <= 0) {
                alert(`¡Game Over! Puntuación final: ${currentScore}`);
                currentScore = 0;
                gamesCompleted = 0;
                gameSpeed = 1;
                lives = 3;
                saveStats();
                createMainMenu();
                return;
            }
        }
        
        // Update best score and streak
        if (currentScore > bestScore) {
            bestScore = currentScore;
        }
        
        if (score >= 50) {
            streak++;
            if (streak > maxStreak) {
                maxStreak = streak;
            }
            if (score === 100) {
                unlockAchievement('perfectionist');
            }
            if (streak >= 10 && !achievementsList.streaker.unlocked) {
                unlockAchievement('streaker');
            }
            sounds.success();
        } else {
            streak = 0;
            sounds.fail();
        }
        
        checkAchievements();
        saveStats();
        
        // Show result with enhanced design
        container.innerHTML = `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${score >= 50 ? 'linear-gradient(135deg, #00b894, #00cec9, #55a3ff)' : 'linear-gradient(135deg, #e17055, #d63031, #fd79a8)'}; color: white; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: ${score >= 50 ? 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)' : 'radial-gradient(circle at 30% 20%, rgba(0,0,0,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.1) 0%, transparent 50%)'};"></div>
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: ${score >= 50 ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' : 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)'};"></div>
                <div style="position: relative; z-index: 2;">
                    <div style="font-size: ${isMobile ? '80px' : '120px'}; margin-bottom: 20px; animation: ${score >= 50 ? 'bounce' : 'shake'} 0.6s ease-in-out; filter: drop-shadow(0 0 20px ${score >= 50 ? 'rgba(0,206,201,0.8)' : 'rgba(214,48,49,0.8)'});">${score >= 50 ? '🎉' : '💥'}</div>
                    <h1 style="font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; font-size: ${isMobile ? '56px' : '84px'}; margin: 0; text-shadow: 6px 6px 12px rgba(0,0,0,0.7), 0 0 30px ${score >= 50 ? 'rgba(0,206,201,0.6)' : 'rgba(214,48,49,0.6)'}; animation: ${score >= 50 ? 'glow-success' : 'glow-fail'} 1.2s ease-in-out infinite alternate; letter-spacing: 2px;">${score >= 50 ? '¡ÉXITO!' : '¡FALLO!'}</h1>
                    <div style="font-family: 'Arial Black', Arial, sans-serif; font-weight: bold; font-size: ${isMobile ? '32px' : '48px'}; margin: 25px 0; text-shadow: 3px 3px 6px rgba(0,0,0,0.5); background: linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); padding: 10px 20px; border-radius: 15px; backdrop-filter: blur(10px);">+${score} PUNTOS</div>
                    <div style="font-family: 'Arial', sans-serif; font-weight: bold; font-size: ${isMobile ? '24px' : '32px'}; opacity: 0.95; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); margin: 15px 0;">📊 Total: ${currentScore}</div>
                    <div style="font-family: 'Arial', sans-serif; font-size: ${isMobile ? '18px' : '24px'}; margin-top: 15px; opacity: 0.9; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">❤️ Vidas: ${lives} | 🎮 Juegos: ${gamesCompleted}</div>
                </div>
                <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); font-size: 14px; opacity: 0.7;">Continuando en 2 segundos...</div>
            </div>
        `;
        
        setTimeout(() => {
            if (continuousMode && lives > 0) {
                if (gamesCompleted % 5 === 0) {
                    gameSpeed = Math.min(gameSpeed + 0.1, 2.0);
                }
                startNextGame();
            } else {
                continuousMode = false;
                createMainMenu();
            }
        }, 1500);
    }

    // New Minigames
    function createMemoryGame() {
        document.getElementById('gameTitle').textContent = '🧠 ¡MEMORIZA!';
        document.getElementById('gameInfo').textContent = 'Observa la secuencia...';
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
        let sequence = [];
        let playerSequence = [];
        let showingSequence = false;
        let sequenceLength = 3;
        
        container.querySelector('#phaserContainer').innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 50px; height: 100%; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                ${colors.map((color, i) => `
                    <div id="memoryBtn${i}" style="
                        width: ${isMobile ? '80px' : '100px'}; height: ${isMobile ? '80px' : '100px'}; background: ${color};
                        border-radius: 15px; cursor: pointer; transition: all 0.2s;
                        display: flex; align-items: center; justify-content: center;
                        font-size: ${isMobile ? '20px' : '24px'}; color: white; font-weight: bold;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    " onclick="memoryClick(${i})">${i + 1}</div>
                `).join('')}
            </div>
        `;
        
        // Generate sequence
        for (let i = 0; i < sequenceLength; i++) {
            sequence.push(Math.floor(Math.random() * 6));
        }
        
        // Show sequence
        showingSequence = true;
        let index = 0;
        const showNext = () => {
            if (index < sequence.length) {
                const btn = document.getElementById(`memoryBtn${sequence[index]}`);
                btn.style.transform = 'scale(1.2)';
                btn.style.boxShadow = '0 0 30px rgba(255,255,255,0.8)';
                sounds.collect();
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
        
        window.memoryClick = (btnIndex) => {
            if (showingSequence) return;
            sounds.click();
            playerSequence.push(btnIndex);
            
            const btn = document.getElementById(`memoryBtn${btnIndex}`);
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => btn.style.transform = 'scale(1)', 100);
            
            if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
                endMicrogame(0);
                return;
            }
            
            if (playerSequence.length === sequence.length) {
                endMicrogame(100);
            }
        };
        
        startGameTimer(() => endMicrogame(0));
    }
    
    function createMathGame() {
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
        
        container.querySelector('#phaserContainer').innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="font-size: ${isMobile ? '36px' : '48px'}; color: white; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    ${a} ${op} ${b} = ?
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    ${allAnswers.map(answer => `
                        <button onclick="mathAnswer(${answer})" style="
                            padding: ${isMobile ? '15px 25px' : '20px 30px'}; font-size: ${isMobile ? '20px' : '24px'}; background: #74b9ff;
                            color: white; border: none; border-radius: 15px; cursor: pointer;
                            transition: all 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            ${answer}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        window.mathAnswer = (answer) => {
            sounds.click();
            endMicrogame(answer === correctAnswer ? 100 : 0);
        };
        
        startGameTimer(() => endMicrogame(0));
    }
    
    function createRhythmGame() {
        document.getElementById('gameTitle').textContent = '🎵 ¡SIGUE EL RITMO!';
        document.getElementById('gameInfo').textContent = 'Toca cuando brille...';
        
        let score = 0;
        let beats = 0;
        const maxBeats = 8;
        
        container.querySelector('#phaserContainer').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div id="rhythmCircle" style="
                    width: ${isMobile ? '150px' : '200px'}; height: ${isMobile ? '150px' : '200px'}; border-radius: 50%;
                    background: linear-gradient(45deg, #ff6b6b, #ee5a52);
                    display: flex; align-items: center; justify-content: center;
                    font-size: ${isMobile ? '32px' : '48px'}; color: white; cursor: pointer;
                    transition: all 0.1s; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                " onclick="rhythmTap()">TAP!</div>
            </div>
        `;
        
        let isActive = false;
        let startTime = 0;
        
        const nextBeat = () => {
            if (beats >= maxBeats) {
                endMicrogame(Math.floor((score / maxBeats) * 100));
                return;
            }
            
            setTimeout(() => {
                const circle = document.getElementById('rhythmCircle');
                circle.style.background = 'linear-gradient(45deg, #00b894, #00cec9)';
                circle.style.boxShadow = '0 0 50px rgba(0,206,201,0.8)';
                circle.style.transform = 'scale(1.1)';
                
                isActive = true;
                startTime = Date.now();
                sounds.collect();
                
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
        
        window.rhythmTap = () => {
            if (isActive) {
                const timing = Date.now() - startTime;
                if (timing < 200) score += 3;
                else if (timing < 400) score += 2;
                else score += 1;
                
                isActive = false;
                const circle = document.getElementById('rhythmCircle');
                circle.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a52)';
                circle.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                circle.style.transform = 'scale(1)';
                
                sounds.success();
                beats++;
                document.getElementById('gameInfo').textContent = `Puntos: ${score}/${maxBeats * 3}`;
                nextBeat();
            }
        };
        
        nextBeat();
        startGameTimer(() => endMicrogame(Math.floor((score / (maxBeats * 3)) * 100)));
    }
    
    function createSimonGame() {
        document.getElementById('gameTitle').textContent = '🗣️ ¡SIMON DICE!';
        document.getElementById('gameInfo').textContent = 'Espera la orden...';
        
        const commands = [
            { text: 'TOCA ARRIBA', key: 'ArrowUp', emoji: '⬆️' },
            { text: 'TOCA ABAJO', key: 'ArrowDown', emoji: '⬇️' },
            { text: 'TOCA IZQUIERDA', key: 'ArrowLeft', emoji: '⬅️' },
            { text: 'TOCA DERECHA', key: 'ArrowRight', emoji: '➡️' },
            { text: 'PRESIONA ESPACIO', key: 'Space', emoji: '🚀' }
        ];
        
        let currentCommand = null;
        let commandGiven = false;
        let responded = false;
        
        container.querySelector('#phaserContainer').innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div id="simonCommand" style="font-size: ${isMobile ? '28px' : '36px'}; color: white; font-weight: bold; text-align: center; min-height: 100px; display: flex; align-items: center; justify-content: center;">Preparate...</div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; max-width: ${isMobile ? '250px' : '300px'};">
                    <div></div>
                    <div id="upBtn" style="padding: ${isMobile ? '15px' : '20px'}; background: #74b9ff; border-radius: 10px; text-align: center; font-size: ${isMobile ? '20px' : '24px'}; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">⬆️</div>
                    <div></div>
                    <div id="leftBtn" style="padding: ${isMobile ? '15px' : '20px'}; background: #74b9ff; border-radius: 10px; text-align: center; font-size: ${isMobile ? '20px' : '24px'}; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">⬅️</div>
                    <div id="spaceBtn" style="padding: ${isMobile ? '15px' : '20px'}; background: #74b9ff; border-radius: 10px; text-align: center; font-size: ${isMobile ? '20px' : '24px'}; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">🚀</div>
                    <div id="rightBtn" style="padding: ${isMobile ? '15px' : '20px'}; background: #74b9ff; border-radius: 10px; text-align: center; font-size: ${isMobile ? '20px' : '24px'}; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">➡️</div>
                    <div></div>
                    <div id="downBtn" style="padding: ${isMobile ? '15px' : '20px'}; background: #74b9ff; border-radius: 10px; text-align: center; font-size: ${isMobile ? '20px' : '24px'}; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">⬇️</div>
                    <div></div>
                </div>
            </div>
        `;
        
        const giveCommand = () => {
            setTimeout(() => {
                currentCommand = commands[Math.floor(Math.random() * commands.length)];
                document.getElementById('simonCommand').innerHTML = `${currentCommand.emoji}<br>${currentCommand.text}`;
                document.getElementById('gameInfo').textContent = '¡Hazlo rápido!';
                commandGiven = true;
                responded = false;
                sounds.collect();
            }, 1000 + Math.random() * 2000);
        };
        
        const simonKeyHandler = (e) => {
            if (!commandGiven || responded) return;
            
            responded = true;
            document.removeEventListener('keydown', simonKeyHandler);
            
            if (e.key === currentCommand.key || e.code === currentCommand.key) {
                endMicrogame(100);
            } else {
                endMicrogame(0);
            }
        };
        
        document.addEventListener('keydown', simonKeyHandler);
        
        giveCommand();
        startGameTimer(() => {
            document.removeEventListener('keydown', simonKeyHandler);
            endMicrogame(0);
        });
    }
    
    // Additional menu functions
    window.showAchievements = function() {
        cleanup();
        const overlay = document.getElementById('samyWareOverlay');
        if (overlay) {
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
        }
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.width = isMobile ? '100vw' : '600px';
            gameContainer.style.height = isMobile ? '100vh' : '500px';
        }
        
        const achievementsEntries = Object.entries(achievementsList).map(([id, achievement]) => `
            <div style="display: flex; align-items: center; padding: 15px; margin: 10px 0; background: ${achievement.unlocked ? 'rgba(46, 204, 113, 0.2)' : 'rgba(149, 165, 166, 0.2)'}; border-radius: 10px; border-left: 4px solid ${achievement.unlocked ? '#2ecc71' : '#95a5a6'};">
                <div style="font-size: 24px; margin-right: 15px;">${achievement.unlocked ? '✅' : '🔒'}</div>
                <div>
                    <div style="font-weight: bold; color: ${achievement.unlocked ? '#2ecc71' : '#95a5a6'};">${achievement.name}</div>
                    <div style="font-size: 14px; color: #666; margin-top: 5px;">${achievement.desc}</div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `
            <div style="flex: 1; padding: 20px; background: ${themes[currentTheme].bg}; overflow-y: auto;">
                <div style="max-width: 500px; margin: 0 auto; background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px;">
                    <h2 style="text-align: center; color: #333; margin: 0 0 20px 0;">🏆 LOGROS</h2>
                    <div style="text-align: center; margin-bottom: 20px; color: #666;">
                        ${achievements.length}/${Object.keys(achievementsList).length} desbloqueados
                    </div>
                    ${achievementsEntries}
                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="createMainMenu()" style="padding: 15px 30px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">← VOLVER</button>
                    </div>
                </div>
            </div>
        `;
    };
    
    window.showThemes = function() {
        cleanup();
        const overlay = document.getElementById('samyWareOverlay');
        if (overlay) {
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
        }
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.width = isMobile ? '100vw' : '600px';
            gameContainer.style.height = isMobile ? '100vh' : '500px';
        }
        
        const themesList = Object.entries(themes).map(([id, theme]) => `
            <div onclick="selectTheme('${id}')" style="
                padding: 20px; margin: 10px 0; background: ${theme.bg};
                border-radius: 15px; cursor: pointer; transition: all 0.3s;
                border: 3px solid ${currentTheme === id ? '#fff' : 'transparent'};
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                <div style="color: white; font-weight: bold; font-size: 18px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    ${theme.name} ${currentTheme === id ? '✓' : ''}
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <div style="width: 30px; height: 30px; background: ${theme.primary}; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
                    <div style="width: 30px; height: 30px; background: ${theme.secondary}; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `
            <div style="flex: 1; padding: 20px; background: ${themes[currentTheme].bg}; overflow-y: auto;">
                <div style="max-width: 500px; margin: 0 auto; background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px;">
                    <h2 style="text-align: center; color: #333; margin: 0 0 20px 0;">🎨 TEMAS</h2>
                    ${themesList}
                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="createMainMenu()" style="padding: 15px 30px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">← VOLVER</button>
                    </div>
                </div>
            </div>
        `;
    };
    
    window.selectTheme = function(themeId) {
        currentTheme = themeId;
        sounds.click();
        saveStats();
        showThemes();
    };
    
    // Make createMainMenu globally accessible
    window.createMainMenu = createMainMenu;

    // Settings menu
    window.showSettings = function() {
        cleanup();
        // Center settings menu
        const overlay = document.getElementById('samyWareOverlay');
        if (overlay) {
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
        }
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.width = isMobile ? '100vw' : '600px';
            gameContainer.style.height = isMobile ? '100vh' : '500px';
        }
        
        container.innerHTML = `
            <div style="flex: 1; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); overflow-y: auto;">
                <div style="max-width: 500px; margin: 0 auto; background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px;">
                    <h2 style="text-align: center; color: #333; margin: 0 0 20px 0;">⚙️ CONFIGURACIÓN</h2>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #555; margin-bottom: 10px;">🎮 Juego</h3>
                        <label style="display: block; margin-bottom: 10px; color: #666;">
                            <input type="checkbox" id="soundEnabled" ${soundEnabled ? 'checked' : ''} onchange="toggleSound()" style="margin-right: 8px;"> Sonido activado
                        </label>
                        <label style="display: block; margin-bottom: 10px; color: #666;">
                            <input type="checkbox" id="musicEnabled" ${musicEnabled ? 'checked' : ''} onchange="toggleMusic()" style="margin-right: 8px;"> Música activada
                        </label>
                        <label style="display: block; margin-bottom: 10px; color: #666;">
                            <input type="checkbox" id="vibrationEnabled" ${isMobile ? 'checked' : ''} style="margin-right: 8px;"> Vibración (móvil)
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #555; margin-bottom: 10px;">👁️ Visual</h3>
                        <label style="display: block; margin-bottom: 10px; color: #666;">
                            <input type="checkbox" id="particleEffects" checked style="margin-right: 8px;"> Efectos de partículas
                        </label>
                        <label style="display: block; margin-bottom: 10px; color: #666;">
                            <input type="checkbox" id="screenShake" checked style="margin-right: 8px;"> Vibración de pantalla
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #555; margin-bottom: 10px;">🎯 Dificultad</h3>
                        <select id="difficultySelect" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;">
                            <option value="easy">🟢 Fácil (6 segundos)</option>
                            <option value="normal" selected>🟡 Normal (5 segundos)</option>
                            <option value="hard">🔴 Difícil (4 segundos)</option>
                        </select>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="saveSettings()" style="padding: 15px 30px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 0 10px;">✅ GUARDAR</button>
                        <button onclick="createMainMenu()" style="padding: 15px 30px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 0 10px;">❌ CANCELAR</button>
                    </div>
                </div>
            </div>
        `;
    };
    
    window.toggleSound = function() {
        soundEnabled = document.getElementById('soundEnabled').checked;
        sounds.click();
    };
    
    window.toggleMusic = function() {
        musicEnabled = document.getElementById('musicEnabled').checked;
        sounds.click();
    };
    
    window.saveSettings = function() {
        soundEnabled = document.getElementById('soundEnabled').checked;
        musicEnabled = document.getElementById('musicEnabled').checked;
        saveStats();
        sounds.success();
        createMainMenu();
    };

    // Add CSS animations
    if (!document.getElementById('gameAnimations')) {
        const style = document.createElement('style');
        style.id = 'gameAnimations';
        style.textContent = `
            @keyframes bounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.1); } }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
            @keyframes float { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-50px) scale(0.5); opacity: 0; } }
            @keyframes shake { 0%, 100% { transform: translateX(0) rotate(0deg); } 25% { transform: translateX(-8px) rotate(-2deg); } 75% { transform: translateX(8px) rotate(2deg); } }
            @keyframes glow-success { 0% { text-shadow: 6px 6px 12px rgba(0,0,0,0.7), 0 0 25px rgba(0,184,148,0.9), 0 0 35px rgba(0,206,201,0.7); } 100% { text-shadow: 6px 6px 12px rgba(0,0,0,0.7), 0 0 40px rgba(0,206,201,1), 0 0 60px rgba(85,163,255,0.9), 0 0 80px rgba(0,184,148,0.6); } }
            @keyframes glow-fail { 0% { text-shadow: 6px 6px 12px rgba(0,0,0,0.7), 0 0 25px rgba(225,112,85,0.9), 0 0 35px rgba(214,48,49,0.7); } 100% { text-shadow: 6px 6px 12px rgba(0,0,0,0.7), 0 0 40px rgba(214,48,49,1), 0 0 60px rgba(253,121,168,0.9), 0 0 80px rgba(225,112,85,0.6); } }
            @keyframes slideIn { 0% { transform: translateX(100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
            @keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
            .particle { position: absolute; pointer-events: none; border-radius: 50%; animation: particleFloat 2s ease-out forwards; }
            @keyframes particleFloat { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-100px) scale(0); opacity: 0; } }
            .screen-shake { animation: screenShake 0.5s ease-in-out; }
            @keyframes screenShake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); } 20%, 40%, 60%, 80% { transform: translateX(2px); } }
        `;
        document.head.appendChild(style);
    }

    // Particle effects
    function createParticles(success) {
        const colors = success ? ['#00b894', '#00cec9', '#55a3ff', '#ffd700'] : ['#e17055', '#d63031', '#fd79a8'];
        const container = document.getElementById('gameContainer');
        if (!container) return;
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.cssText = `
                    left: ${Math.random() * 100}%;
                    top: 80%;
                    width: ${Math.random() * 8 + 4}px;
                    height: ${Math.random() * 8 + 4}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    animation-delay: ${Math.random() * 0.5}s;
                    animation-duration: ${1.5 + Math.random()}s;
                `;
                container.appendChild(particle);
                setTimeout(() => particle.remove(), 3000);
            }, i * 50);
        }
    }
    
    // Initialize
    loadStats();
    createMainMenu();
    
    // Auto-save every 30 seconds
    setInterval(saveStats, 30000);
    
    // Initialize audio on first user interaction
    document.addEventListener('click', () => {
        if (!audioContext) initAudio();
    }, { once: true });
    
})();