// Samy Jump Minigame v1.0.0
// Desarrollado para Sonic.EXE FMM
// Fecha: 2024
(function() {
    'use strict';
    
    // Configuración del juego
    const GAME_CONFIG = {
        VERSION: '1.0.0',
        DEBUG: false,
        SAVE_KEY: 'sonicJumpV1',
        MAX_HEIGHT: 50000, // Límite de altura para evitar overflow
        PERFORMANCE_MODE: window.innerWidth < 800 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };
    // Crear HTML del minijuego
    const gameHTML = `
        <div id="miniGameOverlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        ">
            <div id="phaserGame" style="
                border: 2px solid #ff6b00;
                box-shadow: 0 0 20px #ff6b00;
            "></div>
        </div>
    `;
    
    // Cargar Phaser desde CDN
    const phaserScript = document.createElement('script');
    phaserScript.src = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';
    document.head.appendChild(phaserScript);
    
    phaserScript.onload = function() {
        // Insertar HTML en el body
        document.body.insertAdjacentHTML('beforeend', gameHTML);
        
        // Relentizar y apagar música
        const bgMusic = document.getElementById('bgMusic');
        let musicSpeed = 1;
        const slowDown = setInterval(() => {
            musicSpeed -= 0.1;
            if (musicSpeed <= 0) {
                bgMusic.pause();
                clearInterval(slowDown);
            } else {
                bgMusic.playbackRate = musicSpeed;
            }
        }, 100);
        
        const overlay = document.getElementById('miniGameOverlay');
        let game;
        let score = 0;
        let gameData = loadGameData();
        let highScore = gameData.highScore || 0;
        
        // Función para cargar datos del juego
        function loadGameData() {
            try {
                const saved = localStorage.getItem(GAME_CONFIG.SAVE_KEY);
                return saved ? JSON.parse(saved) : {
                    highScore: 0,
                    totalGames: 0,
                    totalTime: 0,
                    bossesDefeated: [],
                    version: GAME_CONFIG.VERSION
                };
            } catch (e) {
                console.warn('Error cargando datos:', e);
                return { highScore: 0, totalGames: 0, totalTime: 0, bossesDefeated: [], version: GAME_CONFIG.VERSION };
            }
        }
        
        // Función para guardar datos del juego
        function saveGameData() {
            try {
                gameData.version = GAME_CONFIG.VERSION;
                localStorage.setItem(GAME_CONFIG.SAVE_KEY, JSON.stringify(gameData));
            } catch (e) {
                console.warn('Error guardando datos:', e);
            }
        }
    
        // Configuración de Phaser
        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'phaserGame',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 800 },
                    debug: false
                }
            },
            scene: {
                preload: preload,
                create: create,
                update: update
            }
        };
        
        let player;
        let platforms;
        let cursors;
        let scoreText;
        let gameOverText;
        let startText;
        let gameStarted = false;
        let gameOver = false;
        let maxHeight = 0;
        let deathZone = 0;
        let particles;
        let lastPlatformY = 0;
        let currentX = 0;
        let boss;
        let bossActive = false;
        let bossHealth = 100;
        let bombs;
        let activeBombs;
        let bossText;
        let healthBar;
        let healthBarBg;
        let miniGameActive = false;
        let lastMiniGameHeight = 0;
        let bossFloor;
        let bossDefeated = false;
        let stormActive = false;
        let glitchActive = false;
        let gravityInverted = false;
        let timeWarpActive = false;
        let lightnings = [];
        let glitchOverlay;
        let stormTimer;
        let gravityTimer;
        let gameStartTime = 0;
        let lastBossType = 0;
        let performanceMode = GAME_CONFIG.PERFORMANCE_MODE;
    
        function exitGame() {
            if (game) {
                game.destroy(true);
            }
            overlay.remove();
            bgMusic.playbackRate = 1;
            bgMusic.play();
        }
    
        function preload() {
            // Pantalla de carga
            const loadingText = this.add.text(config.width/2, config.height/2, 'Cargando...', 
                { fontSize: '32px', fill: '#ff6b00', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
            
            const progressBar = this.add.graphics();
            const progressBox = this.add.graphics();
            progressBox.fillStyle(0x222222);
            progressBox.fillRect(config.width/2 - 160, config.height/2 + 50, 320, 50);
            
            // Eventos de carga
            this.load.on('progress', (value) => {
                progressBar.clear();
                progressBar.fillStyle(0xff6b00);
                progressBar.fillRect(config.width/2 - 150, config.height/2 + 60, 300 * value, 30);
                loadingText.setText(`Cargando... ${Math.round(value * 100)}%`);
            });
            
            this.load.on('complete', () => {
                progressBar.destroy();
                progressBox.destroy();
                loadingText.destroy();
            });
            
            // Sistema de recarga de recursos
            this.load.on('loaderror', (file) => {
                console.warn('Error cargando:', file.src);
                loadingText.setText('Error de carga, reintentando...');
                this.time.delayedCall(1000, () => {
                    this.load.image(file.key, file.src);
                    this.load.start();
                });
            });
            
            // Cargar imagen de mango con fallback
            this.load.image('mango', 'images/mango.png');
            
            // Cargar imagen del jugador con fallback
            this.load.image('player', 'images/samyholahola.png');
            
            // Cargar imagen de Sonic.EXE para plataformas
            this.load.image('sonicexe', 'images/sonic.exe.jpeg');
            
            // Cargar imagen del boss
            this.load.image('boss', 'images/sonic.exeboss.png');
            
            // Crear texturas de respaldo si fallan las imágenes
            this.load.on('complete', () => {
                // Verificar si las imágenes se cargaron correctamente
                if (!this.textures.exists('mango')) {
                    const mangoFallback = this.add.graphics();
                    mangoFallback.fillStyle(0xFFA500);
                    mangoFallback.fillRoundedRect(0, 0, 100, 20, 10);
                    mangoFallback.generateTexture('mango', 100, 20);
                    mangoFallback.destroy(); // Liberar memoria
                }
                
                if (!this.textures.exists('player')) {
                    const playerFallback = this.add.graphics();
                    playerFallback.fillStyle(0x0066FF);
                    playerFallback.fillCircle(25, 25, 20);
                    playerFallback.generateTexture('player', 50, 50);
                    playerFallback.destroy(); // Liberar memoria
                }
                
                if (!this.textures.exists('sonicexe')) {
                    const sonicexeFallback = this.add.graphics();
                    sonicexeFallback.fillStyle(0x000000);
                    sonicexeFallback.fillRoundedRect(0, 0, 120, 30, 5);
                    sonicexeFallback.generateTexture('sonicexe', 120, 30);
                    sonicexeFallback.destroy(); // Liberar memoria
                }
                
                if (!this.textures.exists('boss')) {
                    const bossFallback = this.add.graphics();
                    bossFallback.fillStyle(0x000000);
                    bossFallback.fillCircle(50, 50, 40);
                    bossFallback.fillStyle(0xff0000);
                    bossFallback.fillCircle(35, 40, 8);
                    bossFallback.fillCircle(65, 40, 8);
                    bossFallback.generateTexture('boss', 100, 100);
                    bossFallback.destroy(); // Liberar memoria
                }
            });
            
            // Crear texturas optimizadas
            const bombGraphics = this.add.graphics();
            bombGraphics.fillStyle(0x333333);
            bombGraphics.fillCircle(15, 15, 12);
            bombGraphics.fillStyle(0xff6600);
            bombGraphics.fillRect(12, 5, 6, 8);
            bombGraphics.generateTexture('bomb', 30, 30);
            bombGraphics.destroy();
            
            const activeBombGraphics = this.add.graphics();
            activeBombGraphics.fillStyle(0xff0000);
            activeBombGraphics.fillCircle(15, 15, 12);
            activeBombGraphics.fillStyle(0xffff00);
            activeBombGraphics.fillRect(12, 5, 6, 8);
            activeBombGraphics.generateTexture('activeBomb', 30, 30);
            activeBombGraphics.destroy();
                
            const normalPlatform = this.add.graphics();
            normalPlatform.fillStyle(0xFFD700);
            normalPlatform.fillRoundedRect(0, 0, 200, 40, 8);
            normalPlatform.lineStyle(3, 0xFF8C00);
            normalPlatform.strokeRoundedRect(0, 0, 200, 40, 8);
            normalPlatform.generateTexture('ground', 200, 40);
            normalPlatform.destroy();
            
            const stonePlatform = this.add.graphics();
            stonePlatform.fillStyle(0xC0C0C0);
            stonePlatform.fillRoundedRect(0, 0, 150, 36, 6);
            stonePlatform.lineStyle(3, 0x808080);
            stonePlatform.strokeRoundedRect(0, 0, 150, 36, 6);
            stonePlatform.generateTexture('stone', 150, 36);
            stonePlatform.destroy();
            
            const crystalPlatform = this.add.graphics();
            crystalPlatform.fillStyle(0x00FFFF);
            crystalPlatform.fillRoundedRect(0, 0, 120, 32, 12);
            crystalPlatform.lineStyle(3, 0x0080FF);
            crystalPlatform.strokeRoundedRect(0, 0, 120, 32, 12);
            crystalPlatform.generateTexture('crystal', 120, 32);
            crystalPlatform.destroy();
                
            const cloudGraphics = this.add.graphics();
            cloudGraphics.fillStyle(0xffffff);
            cloudGraphics.fillCircle(20, 15, 15);
            cloudGraphics.fillCircle(35, 15, 12);
            cloudGraphics.fillCircle(50, 15, 10);
            cloudGraphics.generateTexture('cloud', 70, 30);
            cloudGraphics.destroy();
                
            const starGraphics = this.add.graphics();
            starGraphics.fillStyle(0xffff00);
            starGraphics.fillCircle(8, 8, 3);
            starGraphics.generateTexture('star', 16, 16);
            starGraphics.destroy();
                
            const mountainGraphics = this.add.graphics();
            mountainGraphics.fillStyle(0x4a4a4a);
            mountainGraphics.fillTriangle(0, 60, 30, 0, 60, 60);
            mountainGraphics.generateTexture('mountain', 60, 60);
            mountainGraphics.destroy();
                
            const tree = this.add.graphics();
            tree.fillStyle(0x8B4513);
            tree.fillRect(18, 30, 4, 20);
            tree.fillStyle(0x228B22);
            tree.fillCircle(20, 25, 15);
            tree.generateTexture('tree', 40, 50);
            tree.destroy();
        }
    
        function create() {
            // Crear capas de fondo por altura
            createBackgroundLayers.call(this);
            
            // Variables de control
            this.leftPressed = false;
            this.rightPressed = false;
            
            // Crear plataformas random
            platforms = this.physics.add.staticGroup();
            generateRandomPlatforms.call(this);
            
            // Crear jugador
            player = this.physics.add.sprite(config.width/2, config.height - 100, 'player');
            player.setBounce(0.2);
            player.setScale(1.5); // Agrandar más la imagen del jugador
            
            // Inicializar zona de muerte
            maxHeight = config.height - 100;
            deathZone = config.height + 300;
            
            // Crear partículas para efectos
            particles = this.add.particles(0, 0, 'star', {
                scale: { start: 0.3, end: 0 },
                speed: { min: 50, max: 100 },
                lifespan: 600,
                emitting: false
            });
            
            // Crear grupos de bombas
            bombs = this.physics.add.group();
            activeBombs = this.physics.add.group();
            
            // Colisiones solo desde arriba
            this.physics.add.collider(player, platforms, null, (player, platform) => {
                return player.body.velocity.y > 0 && player.y < platform.y;
            });
            
            // Colisiones con bombas
            this.physics.add.overlap(player, bombs, collectBomb, null, this);
            this.physics.add.overlap(player, activeBombs, playerHitByBomb, null, this);
            
            // Funciones de colisión con bombas
            function collectBomb(player, bomb) {
                bomb.destroy();
                particles.emitParticleAt(bomb.x, bomb.y, 10);
            }
            
            function playerHitByBomb(player, bomb) {
                bomb.destroy();
                player.setTint(0xff0000);
                this.time.delayedCall(200, () => {
                    player.clearTint();
                });
                player.setVelocityY(-300);
            }
            

            
            // Controles (flechas + WASD + espacio)
            cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,S,A,D');
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            
            // Crear menú de configuraciones
            createSettingsMenu(this);
            
            // Botón de configuraciones adaptativo
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const settingsBtn = this.add.rectangle(
                config.width - (isMobile ? 50 : 60), 
                isMobile ? 50 : 30, 
                isMobile ? 80 : 60, 
                isMobile ? 80 : 40, 
                0x333333, 0.8
            ).setScrollFactor(0).setInteractive();
            
            settingsBtn.setStrokeStyle(2, 0x00ff00);
            
            const settingsIcon = this.add.text(
                config.width - (isMobile ? 50 : 60), 
                isMobile ? 50 : 30, 
                '⚙️', {
                fontSize: isMobile ? '32px' : '24px',
                fill: '#ffffff'
            }).setOrigin(0.5).setScrollFactor(0);
            
            settingsBtn.on('pointerdown', () => toggleSettings(this));
            settingsIcon.setInteractive().on('pointerdown', () => toggleSettings(this));
            
            // Textos
            scoreText = this.add.text(16, 16, 'Altura: 0', { fontSize: '24px', fill: '#ffffff', stroke: '#000000', strokeThickness: 2 });
            scoreText.setScrollFactor(0);
            const controlsText = isMobile ? 
                'SAMY JUMP\nToca para jugar | Botón ⚙️: Configuraciones' :
                'SAMY JUMP\nToca para jugar | WASD/Flechas: Mover | Espacio: Saltar | ESC: Configuraciones';
            
            startText = this.add.text(config.width/2, config.height/2, controlsText, 
                { fontSize: isMobile ? '16px' : '18px', fill: '#ffffff', align: 'center', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
            
            // Controles táctiles
            this.leftZone = this.add.rectangle(config.width * 0.25, config.height/2, config.width * 0.5, config.height, 0x000000, 0);
            this.leftZone.setInteractive();
            this.leftZone.setScrollFactor(0);
            
            this.rightZone = this.add.rectangle(config.width * 0.75, config.height/2, config.width * 0.5, config.height, 0x000000, 0);
            this.rightZone.setInteractive();
            this.rightZone.setScrollFactor(0);
            
            // Eventos táctiles con sensibilidad
            this.leftZone.on('pointerdown', () => {
                if (!settingsOpen) this.leftPressed = true;
            });
            this.leftZone.on('pointerup', () => this.leftPressed = false);
            this.leftZone.on('pointerout', () => this.leftPressed = false);
            
            this.rightZone.on('pointerdown', () => {
                if (!settingsOpen) this.rightPressed = true;
            });
            this.rightZone.on('pointerup', () => this.rightPressed = false);
            this.rightZone.on('pointerout', () => this.rightPressed = false);
            
            // Toque para iniciar/reiniciar (evitar conflicto con configuraciones)
            this.input.on('pointerdown', (pointer) => {
                // Verificar si no se tocó el botón de configuraciones
                const btnArea = {
                    x: config.width - (isMobile ? 90 : 90),
                    y: isMobile ? 10 : 10,
                    width: isMobile ? 80 : 80,
                    height: isMobile ? 80 : 60
                };
                
                const inButtonArea = pointer.x >= btnArea.x && pointer.x <= btnArea.x + btnArea.width &&
                                   pointer.y >= btnArea.y && pointer.y <= btnArea.y + btnArea.height;
                
                if (!inButtonArea && !settingsOpen) {
                    if (!gameStarted && !gameOver) {
                        startGame.call(this);
                    } else if (gameOver) {
                        resetGame.call(this);
                    }
                }
            });
            
            // Función para crear capas de fondo
            function createBackgroundLayers() {
                // Cielo con gradiente por altura
                for (let y = -4000; y < config.height; y += 500) {
                    const skyLayer = this.add.graphics();
                    const topColor = y < -2000 ? 0x000033 : y < -1000 ? 0x1e3c72 : 0x87CEEB;
                    const bottomColor = y < -2000 ? 0x1e3c72 : y < -1000 ? 0x87CEEB : 0xffffff;
                    skyLayer.fillGradientStyle(topColor, topColor, bottomColor, bottomColor, 1);
                    skyLayer.fillRect(0, y, config.width, 500);
                    skyLayer.setScrollFactor(0.1);
                }
                
                // Montañas de fondo
                for (let i = 0; i < 8; i++) {
                    const mountain = this.add.image(
                        Phaser.Math.Between(0, config.width),
                        Phaser.Math.Between(config.height - 200, config.height),
                        'mountain'
                    );
                    mountain.setScrollFactor(0.2);
                    mountain.setTint(0x666666);
                }
                
                // Árboles en el suelo
                for (let i = 0; i < 10; i++) {
                    const tree = this.add.image(
                        Phaser.Math.Between(0, config.width),
                        Phaser.Math.Between(config.height - 100, config.height - 50),
                        'tree'
                    );
                    tree.setScrollFactor(0.3);
                }
                
                // Nubes por capas de altura
                for (let y = -3000; y < config.height; y += 300) {
                    for (let i = 0; i < 3; i++) {
                        const cloud = this.add.image(
                            Phaser.Math.Between(0, config.width),
                            y + Phaser.Math.Between(-50, 50),
                            'cloud'
                        );
                        cloud.setAlpha(y < -1500 ? 0.3 : 0.6);
                        cloud.setScrollFactor(Phaser.Math.FloatBetween(0.2, 0.4));
                    }
                }
                
                // Estrellas en el cielo alto
                for (let i = 0; i < 50; i++) {
                    const star = this.add.image(
                        Phaser.Math.Between(0, config.width),
                        Phaser.Math.Between(-4000, -1000),
                        'star'
                    );
                    star.setAlpha(Phaser.Math.FloatBetween(0.3, 0.9));
                    star.setScrollFactor(0.05);
                }
            }
            
            // Controles de teclado (solo PC)
            if (!isMobile) {
                this.input.keyboard.on('keydown-ESC', () => toggleSettings(this));
                this.input.keyboard.on('keydown-P', () => this.scene.pause());
            }
        }
        
        function generateRandomPlatforms() {
            // Plataforma inicial con mango estirado horizontalmente y más grande
            const basePlatform = platforms.create(config.width/2, config.height - 50, 'mango');
            basePlatform.setScale(6, 0.8).refreshBody(); // Más ancha y más grande
            
            // Segunda plataforma inicial (más cerca)
            const secondPlatform = platforms.create(config.width/2 + 80, config.height - 140, 'mango');
            secondPlatform.setScale(4.5, 0.8).refreshBody(); // Más ancha y más grande
            
            // Inicializar variables para generación infinita
            lastPlatformY = config.height - 200;
            currentX = config.width/2 + 80;
            
            // Generar plataformas iniciales
            generateMorePlatforms.call(this, 20);
        }
        
        function generateMorePlatforms(count) {
            const platformTypes = ['ground', 'stone', 'crystal'];
            const verticalSpacing = 120;
            
            for (let i = 0; i < count; i++) {
                lastPlatformY -= verticalSpacing;
                
                // Variar posición horizontal pero mantener alcanzable
                const maxMove = 150;
                const newX = currentX + Phaser.Math.Between(-maxMove, maxMove);
                currentX = Phaser.Math.Clamp(newX, 100, config.width - 100);
                
                // Calcular altura actual
                const currentHeight = Math.max(0, Math.floor((config.height - lastPlatformY) / 5));
                
                // Usar mango como plataforma hasta altura 1000m
                if (currentHeight < 1000) {
                    const platform = platforms.create(currentX, lastPlatformY, 'mango');
                    platform.setScale(5, 0.7).refreshBody(); // Más ancha y más grande
                } else if (currentHeight >= 1000 && currentHeight < 2000) {
                    // Del 1000 al 2000 usar Sonic.EXE
                    const platform = platforms.create(currentX, lastPlatformY, 'sonicexe');
                    platform.setScale(3, 0.5).refreshBody(); // Escalar apropiadamente
                } else if (currentHeight >= 2000 && currentHeight < 2200 && !bossDefeated) {
                    // En el 2000m crear suelo grande para el boss
                    if (!bossFloor) {
                        bossFloor = platforms.create(config.width/2, lastPlatformY, 'sonicexe');
                        bossFloor.setScale(config.width/120, 1).refreshBody(); // Suelo completo
                    }
                } else if (currentHeight >= 2500 && currentHeight < 3000) {
                    // Zona de tormenta - plataformas de cristal
                    const platform = platforms.create(currentX, lastPlatformY, 'crystal');
                    platform.setScale(Phaser.Math.FloatBetween(1.0, 1.5), 1).refreshBody();
                } else if (currentHeight >= 3000 && currentHeight < 3500) {
                    // Zona glitch - plataformas que cambian
                    const platformType = Phaser.Utils.Array.GetRandom(platformTypes);
                    const platform = platforms.create(currentX, lastPlatformY, platformType);
                    platform.setScale(Phaser.Math.FloatBetween(0.8, 1.5), 1).refreshBody();
                    platform.setTint(Phaser.Math.Between(0x000000, 0xffffff));
                } else if (currentHeight >= 3500 && currentHeight < 4000) {
                    // Zona gravedad - plataformas arriba y abajo
                    const platformType = Phaser.Utils.Array.GetRandom(platformTypes);
                    const platform = platforms.create(currentX, lastPlatformY, platformType);
                    platform.setScale(Phaser.Math.FloatBetween(1.0, 1.3), 1).refreshBody();
                    // Crear plataforma espejo en el techo
                    if (Math.random() < 0.3) {
                        const mirrorPlatform = platforms.create(currentX, lastPlatformY - 400, platformType);
                        mirrorPlatform.setScale(Phaser.Math.FloatBetween(1.0, 1.3), 1).refreshBody();
                    }
                } else {
                    // Después de 4000m usar plataformas normales
                    const platformType = Phaser.Utils.Array.GetRandom(platformTypes);
                    const platform = platforms.create(currentX, lastPlatformY, platformType);
                    platform.setScale(Phaser.Math.FloatBetween(1.0, 1.3), 1).refreshBody();
                }
            }
        }
    
        function startGame() {
            gameStarted = true;
            gameOver = false;
            score = 0;
            gameStartTime = Date.now();
            gameData.totalGames++;
            startText.setVisible(false);
            if (gameOverText) gameOverText.setVisible(false);
            
            // Modo rendimiento para dispositivos lentos
            if (performanceMode) {
                this.physics.world.gravity.y = 600; // Gravedad reducida
                particles.setConfig({ lifespan: 300 }); // Partículas más cortas
            }
        }
        
        function resetGame() {
            gameStarted = false;
            gameOver = false;
            score = 0;
            bossActive = false;
            bossHealth = 100;
            miniGameActive = false;
            lastMiniGameHeight = 0;
            bossDefeated = false;
            stormActive = false;
            glitchActive = false;
            gravityInverted = false;
            timeWarpActive = false;
            lastBossType = 0;
            gameStartTime = 0;
            
            // Limpiar efectos especiales de forma segura
            const elementsToClean = [bossFloor, stormTimer, gravityTimer, glitchOverlay];
            elementsToClean.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            
            bossFloor = null;
            stormTimer = null;
            gravityTimer = null;
            glitchOverlay = null;
            
            // Resetear física de forma segura
            if (this.physics && this.physics.world) {
                this.physics.world.gravity.y = performanceMode ? 600 : 800;
                this.physics.world.timeScale = 1;
            }
            
            // Limpiar boss y bombas
            if (boss) boss.destroy();
            if (bossText) bossText.destroy();
            if (healthBar) healthBar.destroy();
            if (healthBarBg) healthBarBg.destroy();
            bombs.clear(true, true);
            activeBombs.clear(true, true);
            
            // Limpiar todas las plataformas existentes completamente
            platforms.children.entries.forEach(platform => {
                if (platform && platform.destroy) {
                    platform.destroy();
                }
            });
            platforms.clear(true, true);
            
            // Regenerar plataformas
            generateRandomPlatforms.call(this);
            
            player.setPosition(config.width/2, config.height - 100);
            player.setVelocity(0, 0);
            player.setRotation(0);
            scoreText.setText('Altura: 0m');
            this.cameras.main.scrollY = 0;
            maxHeight = config.height - 100;
            deathZone = config.height + 300;
            if (this.dangerOverlay) this.dangerOverlay.setAlpha(0);
            startText.setVisible(true);
            if (gameOverText) gameOverText.setVisible(false);
        }
    
        function jump() {
            if (player.body.touching.down && gameStarted && !gameOver) {
                player.setVelocityY(-600);
                score += 10;
                scoreText.setText('Altura: ' + Math.max(0, Math.floor((config.height - player.y) / 10)));
            }
        }
    
        function update() {
            if (!gameStarted || gameOver) return;
            
            // Contador de altura en tiempo real con límite de seguridad
            const currentHeight = Math.max(0, Math.min(GAME_CONFIG.MAX_HEIGHT, Math.floor((config.height - player.y) / 5)));
            scoreText.setText(`Altura: ${currentHeight}m | v${GAME_CONFIG.VERSION}`);
            
            // Verificación de límite de altura
            if (currentHeight >= GAME_CONFIG.MAX_HEIGHT) {
                endGame.call(this, 'MAX_HEIGHT_REACHED');
                return;
            }
            
            // Activar minijuegos cada 500m
            if (currentHeight >= lastMiniGameHeight + 500 && !miniGameActive && !bossActive && currentHeight < 2000) {
                activateMiniGame.call(this, currentHeight);
            }
            
            // Activar zonas especiales
            if (currentHeight >= 2500 && currentHeight < 3000 && !stormActive) {
                activateStormZone.call(this);
            } else if (currentHeight >= 3000 && currentHeight < 3500 && !glitchActive) {
                activateGlitchZone.call(this);
            } else if (currentHeight >= 3500 && currentHeight < 4000) {
                updateGravityZone.call(this);
            } else if (currentHeight >= 4500 && currentHeight < 5000 && !timeWarpActive) {
                activateTimeWarp.call(this);
            }
            
            // Activar bosses en diferentes alturas con validación
            const bossHeights = [2000, 5000, 8000, 12000];
            for (let i = 0; i < bossHeights.length; i++) {
                const bossHeight = bossHeights[i];
                const bossType = i + 1;
                
                if (currentHeight >= bossHeight && currentHeight < bossHeight + 200 && 
                    !bossActive && lastBossType < bossType) {
                    activateBoss.call(this, bossType);
                    lastBossType = bossType;
                    break;
                }
            }
            
            // Controles de movimiento
            let moveLeft = cursors.left.isDown || this.wasd.A.isDown || this.leftPressed;
            let moveRight = cursors.right.isDown || this.wasd.D.isDown || this.rightPressed;
            
            if (moveLeft) {
                player.setVelocityX(-250 * gameSettings.controls.touchSensitivity);
            } else if (moveRight) {
                player.setVelocityX(250 * gameSettings.controls.touchSensitivity);
            } else {
                player.setVelocityX(0);
            }
            
            // Actualizar altura máxima y zona de muerte
            if (player.y < maxHeight) {
                maxHeight = player.y;
                deathZone = maxHeight + 400;
                
                // Generar más plataformas cuando el jugador sube
                if (player.y < lastPlatformY + 1000) {
                    generateMorePlatforms.call(this, 10);
                }
            }
            
            // Actualizar boss
            if (bossActive && boss) {
                updateBoss.call(this);
            }
            
            // Limpiar plataformas muy abajo para optimizar rendimiento
            platforms.children.entries.forEach(platform => {
                if (platform.y > player.y + 800) {
                    platform.destroy();
                }
            });
            
            // Salto manual con espacio, W o flecha arriba
            if ((this.spaceKey.isDown || cursors.up.isDown || this.wasd.W.isDown) && player.body.touching.down) {
                player.setVelocityY(-600);
                particles.emitParticleAt(player.x, player.y + 16, 5);
            }
            
            // Auto-salto al tocar plataforma
            if (player.body.touching.down && player.body.velocity.y >= 0 && !this.spaceKey.isDown && !cursors.up.isDown && !this.wasd.W.isDown) {
                player.setVelocityY(-500);
                particles.emitParticleAt(player.x, player.y + 16, 3);
            }
            
            // Cámara sigue al jugador verticalmente
            if (player.y < config.height - 200) {
                this.cameras.main.scrollY = player.y - config.height + 200;
            }
            
            // Game over si cae en la zona de muerte
            if (player.y > deathZone) {
                endGame.call(this, 'FALL');
            }
        }
        
        function endGame(reason = 'FALL') {
            if (gameOver) return; // Evitar múltiples llamadas
            
            gameOver = true;
            const finalScore = Math.max(0, Math.floor((config.height - maxHeight) / 5));
            const gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
            
            // Actualizar estadísticas
            gameData.totalTime += gameTime;
            if (finalScore > gameData.highScore) {
                gameData.highScore = finalScore;
                highScore = finalScore;
            }
            
            saveGameData();
            
            // Mensaje personalizado según la razón
            let message = '';
            switch(reason) {
                case 'MAX_HEIGHT_REACHED':
                    message = `¡LÍMITE ALCANZADO!\nAltura: ${finalScore}m\nRecord: ${highScore}m\n¡Felicidades!`;
                    break;
                default:
                    message = `GAME OVER\nAltura: ${finalScore}m\nRecord: ${highScore}m\nTiempo: ${gameTime}s\nToca para reiniciar`;
            }
            
            if (!gameOverText) {
                gameOverText = this.add.text(config.width/2, config.height/2, message, 
                    { fontSize: '18px', fill: '#ff0000', align: 'center', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
                gameOverText.setScrollFactor(0);
            } else {
                gameOverText.setText(message);
                gameOverText.setVisible(true);
            }
            
            // Indicador visual de zona de muerte
            if (gameStarted && !gameOver) {
                const dangerZone = deathZone - 100;
                if (player.y > dangerZone) {
                    const danger = Math.min(0.3, (player.y - dangerZone) / 100);
                    if (!this.dangerOverlay) {
                        this.dangerOverlay = this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0xff0000, danger);
                        this.dangerOverlay.setScrollFactor(0);
                    } else {
                        this.dangerOverlay.setAlpha(danger);
                    }
                } else if (this.dangerOverlay) {
                    this.dangerOverlay.setAlpha(0);
                }
            }
        }
        
        function activateBoss(bossType = 1) {
            bossActive = true;
            bossHealth = 100;
            
            // Crear suelo del boss
            if (!bossFloor) {
                bossFloor = platforms.create(config.width/2, player.y + 100, 'sonicexe');
                bossFloor.setScale(config.width/120, 1).refreshBody();
            }
            
            // Configuración por tipo de boss
            const bossNames = ['', 'SONIC.EXE', 'TAILS DOLL', 'KNUCKLES.EXE', 'SHADOW.EXE'];
            const bossColors = ['', '#ff0000', '#ff6600', '#ff0066', '#9900ff'];
            
            // Crear boss
            boss = this.physics.add.sprite(config.width/2, player.y - 200, 'boss');
            boss.setScale(bossType === 4 ? 3 : 2);
            boss.body.setImmovable(true);
            boss.setVelocityX(100 + bossType * 20);
            boss.bossType = bossType;
            
            // Textos del boss
            bossText = this.add.text(config.width/2, 50, `${bossNames[bossType]} FIGHT!\nEsquiva y ataca!`, 
                { fontSize: '20px', fill: bossColors[bossType], align: 'center', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
            bossText.setScrollFactor(0);
            
            // Barra de vida del boss
            healthBarBg = this.add.rectangle(config.width/2, 100, 300, 20, 0x000000);
            healthBarBg.setScrollFactor(0);
            healthBar = this.add.rectangle(config.width/2, 100, 300, 20, 0xff0000);
            healthBar.setScrollFactor(0);
            
            // Colisión bombas activas con boss
            this.physics.add.overlap(activeBombs, boss, (bomb, boss) => {
                bomb.destroy();
                bossHealth -= bossType === 4 ? 10 : 20;
                boss.setTint(0xff0000);
                this.time.delayedCall(200, () => {
                    boss.clearTint();
                });
                particles.emitParticleAt(boss.x, boss.y, 15);
            }, null, this);
            
            // Ataques según el boss
            if (bossType <= 1) {
                this.time.addEvent({
                    delay: 1000,
                    callback: spawnBombs,
                    callbackScope: this,
                    loop: true
                });
            } else {
                this.time.addEvent({
                    delay: 1500 - bossType * 100,
                    callback: () => spawnSpecialAttack.call(this, bossType),
                    callbackScope: this,
                    loop: true
                });
            }
        }
        
        function spawnSpecialAttack(bossType) {
            if (!bossActive) return;
            
            if (bossType === 2) {
                // Tails Doll - Láseres
                const laser = this.add.rectangle(0, player.y, config.width, 15, 0xff6600);
                laser.setAlpha(0.8);
                this.tweens.add({
                    targets: laser,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        if (Math.abs(laser.y - player.y) < 30) {
                            player.setVelocityY(-300);
                        }
                        laser.destroy();
                    }
                });
            } else if (bossType === 3) {
                // Knuckles.EXE - Puños
                const fist = this.add.rectangle(
                    Phaser.Math.Between(100, config.width - 100),
                    player.y - 300, 50, 50, 0xff0066
                );
                this.tweens.add({
                    targets: fist,
                    y: player.y + 100,
                    duration: 1500,
                    onComplete: () => {
                        if (Math.abs(fist.x - player.x) < 60) {
                            player.setVelocityY(-400);
                        }
                        fist.destroy();
                    }
                });
            } else if (bossType === 4) {
                // Shadow.EXE - Caos
                for (let i = 0; i < 3; i++) {
                    const chaos = this.add.rectangle(
                        Phaser.Math.Between(0, config.width),
                        player.y - 400, 30, 30, 0x9900ff
                    );
                    this.tweens.add({
                        targets: chaos,
                        y: player.y + 100,
                        duration: 1800,
                        delay: i * 300,
                        onComplete: () => {
                            if (Math.abs(chaos.x - player.x) < 50) {
                                player.setVelocityY(-200);
                            }
                            chaos.destroy();
                        }
                    });
                }
            }
        }
        
        function updateBoss() {
            if (!boss) return;
            
            // Movimiento del boss
            if (boss.x <= 50 || boss.x >= config.width - 50) {
                boss.setVelocityX(-boss.body.velocity.x);
            }
            
            // Actualizar barra de vida
            const healthPercent = bossHealth / 100;
            healthBar.scaleX = healthPercent;
            
            // Boss derrotado
            if (bossHealth <= 0) {
                defeatBoss.call(this);
            }
        }
        
        function spawnBombs() {
            if (!bossActive) return;
            
            // Generar 3-5 bombas
            const bombCount = Phaser.Math.Between(3, 5);
            
            for (let i = 0; i < bombCount; i++) {
                const x = Phaser.Math.Between(50, config.width - 50);
                const isActive = Math.random() < 0.3; // 30% de probabilidad de ser activa
                
                const bomb = this.physics.add.sprite(x, player.y - 600, isActive ? 'activeBomb' : 'bomb');
                bomb.setVelocityY(200);
                bomb.setBounce(0.3);
                
                if (isActive) {
                    activeBombs.add(bomb);
                    bomb.setTint(0xff0000);
                } else {
                    bombs.add(bomb);
                }
                
                // Destruir bomba después de un tiempo
                this.time.delayedCall(5000, () => {
                    if (bomb && bomb.active) {
                        bomb.destroy();
                    }
                });
            }
        }
        
        function defeatBoss() {
            if (!bossActive || !boss) return; // Validación de seguridad
            
            const bossType = boss.bossType || 1;
            bossActive = false;
            bossDefeated = true;
            
            // Registrar boss derrotado
            if (!gameData.bossesDefeated.includes(bossType)) {
                gameData.bossesDefeated.push(bossType);
            }
            
            // Limpiar elementos del boss de forma segura
            if (boss && boss.active) boss.destroy();
            if (bossText && bossText.active) bossText.destroy();
            if (healthBar && healthBar.active) healthBar.destroy();
            if (healthBarBg && healthBarBg.active) healthBarBg.destroy();
            
            // Limpiar bombas
            bombs.clear(true, true);
            activeBombs.clear(true, true);
            
            // Destruir el suelo del boss para continuar escalando
            if (bossFloor && bossFloor.active) {
                bossFloor.destroy();
                bossFloor = null;
            }
            
            // Mensaje de victoria
            const bossNames = ['', 'SONIC.EXE', 'TAILS DOLL', 'KNUCKLES.EXE', 'SHADOW.EXE'];
            const victoryText = this.add.text(config.width/2, config.height/2, 
                `${bossNames[bossType]} DERROTADO!\n¡Continúa subiendo!`, 
                { fontSize: '20px', fill: '#00ff00', align: 'center', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
            victoryText.setScrollFactor(0);
            
            this.time.delayedCall(3000, () => {
                if (victoryText && victoryText.active) {
                    victoryText.destroy();
                }
            });
        }
        
        function activateMiniGame(height) {
            miniGameActive = true;
            lastMiniGameHeight = height;
            const gameType = Math.floor(height / 500) % 3;
            
            player.setVelocity(0, 0);
            
            switch(gameType) {
                case 1:
                    startCollectGame.call(this);
                    break;
                case 2:
                    startDodgeGame.call(this);
                    break;
                default:
                    startSpeedGame.call(this);
                    break;
            }
        }
        
        function startCollectGame() {
            const gameText = this.add.text(config.width/2, 100, 'MINIJUEGO: Recolecta 5 estrellas\nTiempo: 10s', 
                { fontSize: '18px', fill: '#ffff00', align: 'center', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
            gameText.setScrollFactor(0);
            
            let collected = 0;
            let timeLeft = 10;
            const stars = this.physics.add.group();
            
            for(let i = 0; i < 5; i++) {
                const star = stars.create(
                    Phaser.Math.Between(100, config.width - 100),
                    player.y - Phaser.Math.Between(50, 200),
                    'star'
                );
                star.setScale(2);
            }
            
            this.physics.add.overlap(player, stars, (player, star) => {
                star.destroy();
                collected++;
                particles.emitParticleAt(star.x, star.y, 10);
                
                if(collected >= 5) {
                    completeMiniGame.call(this, gameText, true);
                    stars.clear(true, true);
                }
            });
            
            const timer = this.time.addEvent({
                delay: 1000,
                callback: () => {
                    timeLeft--;
                    gameText.setText(`MINIJUEGO: Recolecta 5 estrellas\nRecolectadas: ${collected}/5\nTiempo: ${timeLeft}s`);
                    
                    if(timeLeft <= 0) {
                        completeMiniGame.call(this, gameText, collected >= 5);
                        stars.clear(true, true);
                        timer.destroy();
                    }
                },
                repeat: 9
            });
        }
        
        function startDodgeGame() {
            const gameText = this.add.text(config.width/2, 100, 'MINIJUEGO: Esquiva los obstáculos\nTiempo: 8s', 
                { fontSize: '18px', fill: '#ff0000', align: 'center', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
            gameText.setScrollFactor(0);
            
            let timeLeft = 8;
            let failed = false;
            const obstacles = this.physics.add.group();
            
            const obstacleTimer = this.time.addEvent({
                delay: 800,
                callback: () => {
                    const obstacle = obstacles.create(
                        Phaser.Math.Between(50, config.width - 50),
                        player.y - 300,
                        'bomb'
                    );
                    obstacle.setVelocityY(300);
                    obstacle.setScale(1.5);
                },
                repeat: 10
            });
            
            this.physics.add.overlap(player, obstacles, () => {
                if(!failed) {
                    failed = true;
                    completeMiniGame.call(this, gameText, false);
                    obstacles.clear(true, true);
                    obstacleTimer.destroy();
                }
            });
            
            const timer = this.time.addEvent({
                delay: 1000,
                callback: () => {
                    timeLeft--;
                    gameText.setText(`MINIJUEGO: Esquiva los obstáculos\nTiempo: ${timeLeft}s`);
                    
                    if(timeLeft <= 0 && !failed) {
                        completeMiniGame.call(this, gameText, true);
                        obstacles.clear(true, true);
                        obstacleTimer.destroy();
                    }
                },
                repeat: 7
            });
        }
        
        function startSpeedGame() {
            const gameText = this.add.text(config.width/2, 100, 'MINIJUEGO: Salta 10 veces rápido\nSaltos: 0/10', 
                { fontSize: '18px', fill: '#00ff00', align: 'center', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
            gameText.setScrollFactor(0);
            
            let jumps = 0;
            let timeLeft = 8;
            let wasOnGround = true;
            
            const timer = this.time.addEvent({
                delay: 1000,
                callback: () => {
                    timeLeft--;
                    gameText.setText(`MINIJUEGO: Salta 10 veces rápido\nSaltos: ${jumps}/10\nTiempo: ${timeLeft}s`);
                    
                    if(timeLeft <= 0) {
                        completeMiniGame.call(this, gameText, jumps >= 10);
                    }
                },
                repeat: 7
            });
            
            const jumpCheck = this.time.addEvent({
                delay: 50,
                callback: () => {
                    if(player.body.touching.down && !wasOnGround) {
                        jumps++;
                        particles.emitParticleAt(player.x, player.y + 20, 5);
                        
                        if(jumps >= 10) {
                            completeMiniGame.call(this, gameText, true);
                            jumpCheck.destroy();
                            timer.destroy();
                        }
                    }
                    wasOnGround = player.body.touching.down;
                },
                loop: true
            });
        }
        
        function completeMiniGame(gameText, success) {
            miniGameActive = false;
            
            if (!gameText || !gameText.active) return;
            
            const resultText = success ? 
                'MINIJUEGO COMPLETADO!\n+100 puntos' : 
                'MINIJUEGO FALLADO\nIntenta de nuevo';
            
            const color = success ? '#00ff00' : '#ff0000';
            
            try {
                gameText.setText(resultText);
                gameText.setFill(color);
            } catch (e) {
                console.warn('Error actualizando texto del minijuego:', e);
                return;
            }
            
            if(success) {
                particles.emitParticleAt(player.x, player.y, 20);
            }
            
            this.time.delayedCall(2000, () => {
                if (gameText && gameText.active) {
                    gameText.destroy();
                }
            });
        }
        
        function activateStormZone() {
            stormActive = true;
            
            // Crear overlay de tormenta
            const stormOverlay = this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0x000033, 0.3);
            stormOverlay.setScrollFactor(0);
            
            // Generar rayos
            stormTimer = this.time.addEvent({
                delay: 2000,
                callback: () => {
                    const lightning = this.add.rectangle(
                        Phaser.Math.Between(0, config.width),
                        player.y - 400,
                        20, 800,
                        0xffff00
                    );
                    lightning.setAlpha(0.8);
                    
                    // Efecto de rayo
                    this.tweens.add({
                        targets: lightning,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => lightning.destroy()
                    });
                    
                    // Daño si está cerca del jugador
                    if (Math.abs(lightning.x - player.x) < 50) {
                        player.setVelocityY(-400);
                        player.setTint(0xffff00);
                        this.time.delayedCall(200, () => player.clearTint());
                    }
                },
                loop: true
            });
        }
        
        function activateGlitchZone() {
            glitchActive = true;
            
            // Crear overlay de glitch
            glitchOverlay = this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0xff00ff, 0.1);
            glitchOverlay.setScrollFactor(0);
            
            // Efecto glitch aleatorio
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    // Cambiar color del overlay
                    const colors = [0xff00ff, 0x00ffff, 0xff0000, 0x00ff00];
                    glitchOverlay.setFillStyle(Phaser.Utils.Array.GetRandom(colors), 0.2);
                    
                    // Efecto en el jugador
                    if (Math.random() < 0.3) {
                        player.setTint(Phaser.Math.Between(0x000000, 0xffffff));
                        this.time.delayedCall(300, () => player.clearTint());
                    }
                    
                    // Teletransportar plataformas
                    platforms.children.entries.forEach(platform => {
                        if (Math.random() < 0.1 && platform.y > player.y - 200 && platform.y < player.y + 200) {
                            platform.x = Phaser.Math.Between(100, config.width - 100);
                        }
                    });
                },
                loop: true
            });
        }
        
        function updateGravityZone() {
            if (!gravityTimer) {
                gravityTimer = this.time.addEvent({
                    delay: 8000,
                    callback: () => {
                        gravityInverted = !gravityInverted;
                        this.physics.world.gravity.y = gravityInverted ? -800 : 800;
                        
                        // Mensaje visual
                        const gravityText = this.add.text(config.width/2, 150, 
                            gravityInverted ? 'GRAVEDAD INVERTIDA!' : 'GRAVEDAD NORMAL', 
                            { fontSize: '20px', fill: '#ff00ff', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
                        gravityText.setScrollFactor(0);
                        
                        this.time.delayedCall(2000, () => {
                            if (gravityText && gravityText.active) {
                                gravityText.destroy();
                            }
                        });
                    },
                    loop: true
                });
            }
        }
        
        function activateTimeWarp() {
            timeWarpActive = true;
            
            // Crear overlay temporal
            const timeOverlay = this.add.rectangle(config.width/2, config.height/2, config.width, config.height, 0x9900ff, 0.2);
            timeOverlay.setScrollFactor(0);
            
            // Efectos de tiempo
            this.time.addEvent({
                delay: 3000,
                callback: () => {
                    const timeEffect = Math.random();
                    
                    if (timeEffect < 0.33) {
                        // Ralentizar tiempo
                        this.physics.world.timeScale = 0.5;
                        this.time.delayedCall(2000, () => {
                            this.physics.world.timeScale = 1;
                        });
                    } else if (timeEffect < 0.66) {
                        // Acelerar tiempo
                        this.physics.world.timeScale = 1.5;
                        this.time.delayedCall(2000, () => {
                            this.physics.world.timeScale = 1;
                        });
                    } else {
                        // Crear fantasma del jugador
                        const ghost = this.add.sprite(player.x, player.y, 'player');
                        ghost.setScale(1.5);
                        ghost.setAlpha(0.5);
                        ghost.setTint(0x9900ff);
                        
                        this.time.delayedCall(3000, () => {
                            if (ghost && ghost.active) {
                                ghost.destroy();
                            }
                        });
                    }
                },
                loop: true
            });
        }
    
        // Sistema de configuraciones
        const gameSettings = {
            audio: { musicVolume: 70, effectsVolume: 80, audioQuality: 'medium' },
            gameplay: { difficulty: 'normal', scrollSpeed: 1.0, audioOffset: 0, ghostMode: false },
            display: { layout: 'horizontal', noteSize: 'medium', visualEffects: true, darkMode: false },
            controls: { touchSensitivity: 1.0, vibration: true }
        };
        
        let settingsMenu = null;
        let settingsOpen = false;
        
        function createSettingsMenu(scene) {
            if (settingsMenu) return;
            
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const menuWidth = isMobile ? Math.min(350, config.width - 40) : 400;
            const menuHeight = isMobile ? Math.min(450, config.height - 80) : 500;
            
            settingsMenu = scene.add.container(config.width/2, config.height/2);
            settingsMenu.setScrollFactor(0).setDepth(1000);
            
            const bg = scene.add.rectangle(0, 0, menuWidth, menuHeight, 0x000000, 0.9);
            bg.setStrokeStyle(2, 0x00ff00);
            settingsMenu.add(bg);
            
            const title = scene.add.text(0, -Math.floor(menuHeight/2) + 30, 'CONFIGURACIONES', {
                fontSize: isMobile ? '20px' : '24px', fill: '#00ff00', fontFamily: 'Arial'
            }).setOrigin(0.5);
            settingsMenu.add(title);
            
            const musicVol = scene.add.text(0, -150, `Música: ${gameSettings.audio.musicVolume}%`, {
                fontSize: '14px', fill: '#ffffff'
            }).setOrigin(0.5).setInteractive();
            settingsMenu.add(musicVol);
            
            const difficulty = scene.add.text(0, -70, `Dificultad: ${gameSettings.gameplay.difficulty}`, {
                fontSize: '14px', fill: '#ffffff'
            }).setOrigin(0.5).setInteractive();
            settingsMenu.add(difficulty);
            
            const speed = scene.add.text(0, -40, `Velocidad: ${gameSettings.gameplay.scrollSpeed}x`, {
                fontSize: '14px', fill: '#ffffff'
            }).setOrigin(0.5).setInteractive();
            settingsMenu.add(speed);
            
            const layout = scene.add.text(0, 40, `Layout: ${gameSettings.display.layout}`, {
                fontSize: '14px', fill: '#ffffff'
            }).setOrigin(0.5).setInteractive();
            settingsMenu.add(layout);
            
            const effects = scene.add.text(0, 70, `Efectos: ${gameSettings.display.visualEffects ? 'ON' : 'OFF'}`, {
                fontSize: '14px', fill: '#ffffff'
            }).setOrigin(0.5).setInteractive();
            settingsMenu.add(effects);
            
            const sensitivity = scene.add.text(0, 150, `Sensibilidad: ${gameSettings.controls.touchSensitivity}x`, {
                fontSize: '14px', fill: '#ffffff'
            }).setOrigin(0.5).setInteractive();
            settingsMenu.add(sensitivity);
            
            const closeBtn = scene.add.rectangle(0, Math.floor(menuHeight/2) - 40, isMobile ? 120 : 100, isMobile ? 50 : 40, 0x330000);
            closeBtn.setStrokeStyle(2, 0xff0000).setInteractive();
            settingsMenu.add(closeBtn);
            
            const closeBtnText = scene.add.text(0, Math.floor(menuHeight/2) - 40, 'CERRAR', {
                fontSize: isMobile ? '18px' : '16px', fill: '#ff0000'
            }).setOrigin(0.5);
            settingsMenu.add(closeBtnText);
            
            musicVol.on('pointerdown', () => {
                gameSettings.audio.musicVolume = (gameSettings.audio.musicVolume + 10) % 110;
                musicVol.setText(`Música: ${gameSettings.audio.musicVolume}%`);
            });
            
            difficulty.on('pointerdown', () => {
                const difficulties = ['easy', 'normal', 'hard', 'expert'];
                const current = difficulties.indexOf(gameSettings.gameplay.difficulty);
                gameSettings.gameplay.difficulty = difficulties[(current + 1) % difficulties.length];
                difficulty.setText(`Dificultad: ${gameSettings.gameplay.difficulty}`);
            });
            
            speed.on('pointerdown', () => {
                gameSettings.gameplay.scrollSpeed = Math.round((gameSettings.gameplay.scrollSpeed + 0.25) * 100) / 100;
                if (gameSettings.gameplay.scrollSpeed > 2) gameSettings.gameplay.scrollSpeed = 0.5;
                speed.setText(`Velocidad: ${gameSettings.gameplay.scrollSpeed}x`);
            });
            
            layout.on('pointerdown', () => {
                gameSettings.display.layout = gameSettings.display.layout === 'horizontal' ? 'vertical' : 'horizontal';
                layout.setText(`Layout: ${gameSettings.display.layout}`);
            });
            
            effects.on('pointerdown', () => {
                gameSettings.display.visualEffects = !gameSettings.display.visualEffects;
                effects.setText(`Efectos: ${gameSettings.display.visualEffects ? 'ON' : 'OFF'}`);
            });
            
            sensitivity.on('pointerdown', () => {
                gameSettings.controls.touchSensitivity = Math.round((gameSettings.controls.touchSensitivity + 0.25) * 100) / 100;
                if (gameSettings.controls.touchSensitivity > 2) gameSettings.controls.touchSensitivity = 0.5;
                sensitivity.setText(`Sensibilidad: ${gameSettings.controls.touchSensitivity}x`);
            });
            
            closeBtn.on('pointerdown', () => toggleSettings(scene));
            closeBtnText.setInteractive().on('pointerdown', () => toggleSettings(scene));
            settingsMenu.setVisible(false);
        }
        
        function toggleSettings(scene) {
            if (!settingsMenu) createSettingsMenu(scene);
            settingsOpen = !settingsOpen;
            settingsMenu.setVisible(settingsOpen);
            settingsOpen ? scene.physics.pause() : scene.physics.resume();
        }
        
        // Validación final antes de iniciar
        if (typeof Phaser === 'undefined') {
            console.error('Phaser no se cargó correctamente');
            return;
        }
        
        // Iniciar Phaser con manejo de errores
        try {
            game = new Phaser.Game(config);
            
            // Log de inicio para debugging
            if (GAME_CONFIG.DEBUG) {
                console.log(`Samy Jump v${GAME_CONFIG.VERSION} iniciado`);
                console.log('Datos del juego:', gameData);
            }
        } catch (error) {
            console.error('Error iniciando el juego:', error);
            document.getElementById('miniGameOverlay').innerHTML = 
                '<div style="color: white; text-align: center; padding: 50px;">Error cargando el juego. Recarga la página.</div>';
        }
    };
})();
    
