// Sistema de Logros para SamyWare
// Sistema independiente de achievements con notificaciones y progreso
(function() {
    'use strict';

    class AchievementSystem {
        constructor() {
            this.achievements = {
                // Logros básicos
                'first_game': {
                    name: '🎮 Primer Juego',
                    description: 'Juega tu primer minijuego',
                    condition: (stats) => stats.totalGamesPlayed >= 1,
                    rarity: 'common'
                },
                'perfect': {
                    name: '⭐ Perfecto',
                    description: 'Consigue 100 puntos en un juego',
                    condition: (stats) => stats.perfectGames >= 1,
                    rarity: 'uncommon'
                },
                
                // Logros de racha
                'streak_3': {
                    name: '🔥 Racha x3',
                    description: 'Gana 3 juegos seguidos',
                    condition: (stats) => stats.maxStreak >= 3,
                    rarity: 'common'
                },
                'streak_5': {
                    name: '🔥 Racha x5',
                    description: 'Gana 5 juegos seguidos',
                    condition: (stats) => stats.maxStreak >= 5,
                    rarity: 'uncommon'
                },
                'streak_10': {
                    name: '🔥 Racha x10',
                    description: 'Gana 10 juegos seguidos',
                    condition: (stats) => stats.maxStreak >= 10,
                    rarity: 'rare'
                },
                'streak_20': {
                    name: '🔥 Racha x20',
                    description: 'Gana 20 juegos seguidos',
                    condition: (stats) => stats.maxStreak >= 20,
                    rarity: 'legendary'
                },
                
                // Logros de puntuación
                'score_100': {
                    name: '💯 Centenario',
                    description: 'Alcanza 100 puntos totales',
                    condition: (stats) => stats.bestScore >= 100,
                    rarity: 'common'
                },
                'score_500': {
                    name: '💯 Quinientos',
                    description: 'Alcanza 500 puntos totales',
                    condition: (stats) => stats.bestScore >= 500,
                    rarity: 'uncommon'
                },
                'score_1000': {
                    name: '💯 Milenario',
                    description: 'Alcanza 1000 puntos totales',
                    condition: (stats) => stats.bestScore >= 1000,
                    rarity: 'rare'
                },
                'score_2000': {
                    name: '💯 Bimilenario',
                    description: 'Alcanza 2000 puntos totales',
                    condition: (stats) => stats.bestScore >= 2000,
                    rarity: 'epic'
                },
                
                // Logros de cantidad de juegos
                'games_10': {
                    name: '🎯 Decena',
                    description: 'Juega 10 minijuegos',
                    condition: (stats) => stats.totalGamesPlayed >= 10,
                    rarity: 'common'
                },
                'games_50': {
                    name: '🎯 Cincuentena',
                    description: 'Juega 50 minijuegos',
                    condition: (stats) => stats.totalGamesPlayed >= 50,
                    rarity: 'uncommon'
                },
                'games_100': {
                    name: '🎯 Centenar',
                    description: 'Juega 100 minijuegos',
                    condition: (stats) => stats.totalGamesPlayed >= 100,
                    rarity: 'rare'
                },
                'games_500': {
                    name: '🎯 Quinientos',
                    description: 'Juega 500 minijuegos',
                    condition: (stats) => stats.totalGamesPlayed >= 500,
                    rarity: 'legendary'
                },
                
                // Logros de perfección
                'perfect_5': {
                    name: '⭐ 5 Perfectos',
                    description: 'Consigue 5 juegos perfectos',
                    condition: (stats) => stats.perfectGames >= 5,
                    rarity: 'uncommon'
                },
                'perfect_10': {
                    name: '⭐ 10 Perfectos',
                    description: 'Consigue 10 juegos perfectos',
                    condition: (stats) => stats.perfectGames >= 10,
                    rarity: 'rare'
                },
                'perfect_25': {
                    name: '⭐ 25 Perfectos',
                    description: 'Consigue 25 juegos perfectos',
                    condition: (stats) => stats.perfectGames >= 25,
                    rarity: 'epic'
                },
                
                // Logros especiales
                'tap_master': {
                    name: '👆 Maestro del Tap',
                    description: 'Realiza 1000 taps totales',
                    condition: (stats) => stats.totalTaps >= 1000,
                    rarity: 'rare'
                },
                'speed_demon': {
                    name: '⚡ Demonio de Velocidad',
                    description: 'Completa 10 juegos de reacción perfectos',
                    condition: (stats) => stats.reactionPerfects >= 10,
                    rarity: 'epic'
                },
                'memory_master': {
                    name: '🧠 Maestro de la Memoria',
                    description: 'Completa 15 juegos de memoria perfectos',
                    condition: (stats) => stats.memoryPerfects >= 15,
                    rarity: 'epic'
                },
                'math_genius': {
                    name: '🔢 Genio Matemático',
                    description: 'Completa 20 juegos de matemáticas perfectos',
                    condition: (stats) => stats.mathPerfects >= 20,
                    rarity: 'epic'
                },
                'rhythm_god': {
                    name: '🎵 Dios del Ritmo',
                    description: 'Completa 25 juegos de ritmo perfectos',
                    condition: (stats) => stats.rhythmPerfects >= 25,
                    rarity: 'legendary'
                },
                'racing_legend': {
                    name: '🏎️ Leyenda de las Carreras',
                    description: 'Realiza 500 adelantamientos totales',
                    condition: (stats) => stats.totalOvertakes >= 500,
                    rarity: 'legendary'
                },
                
                // Logros de tiempo
                'marathon': {
                    name: '🏃 Maratonista',
                    description: 'Juega durante 1 hora total',
                    condition: (stats) => stats.totalPlayTime >= 3600000, // 1 hora en ms
                    rarity: 'rare'
                },
                'dedication': {
                    name: '💪 Dedicación',
                    description: 'Juega durante 5 horas totales',
                    condition: (stats) => stats.totalPlayTime >= 18000000, // 5 horas en ms
                    rarity: 'epic'
                },
                
                // Logros secretos
                'survivor': {
                    name: '💀 Superviviente',
                    description: 'Pierde todas las vidas 10 veces',
                    condition: (stats) => stats.gameOvers >= 10,
                    rarity: 'rare',
                    secret: true
                },
                'comeback_king': {
                    name: '👑 Rey del Regreso',
                    description: 'Gana después de tener solo 1 vida',
                    condition: (stats) => stats.comebacks >= 5,
                    rarity: 'epic',
                    secret: true
                },
                'christmas_spirit': {
                    name: '🎄 Espíritu Navideño',
                    description: 'Juega durante diciembre',
                    condition: (stats) => stats.christmasGames >= 1,
                    rarity: 'seasonal',
                    secret: true
                }
            };
            
            this.rarityColors = {
                'common': '#ffffff',
                'uncommon': '#1eff00',
                'rare': '#0070dd',
                'epic': '#a335ee',
                'legendary': '#ff8000',
                'seasonal': '#ff69b4'
            };
            
            this.rarityNames = {
                'common': 'Común',
                'uncommon': 'Poco Común',
                'rare': 'Raro',
                'epic': 'Épico',
                'legendary': 'Legendario',
                'seasonal': 'Estacional'
            };
        }
        
        checkAchievements(stats, unlockedAchievements = []) {
            const newAchievements = [];
            
            // Agregar estadísticas de navidad si es diciembre
            if (new Date().getMonth() === 11) {
                stats.christmasGames = (stats.christmasGames || 0) + 1;
            }
            
            Object.entries(this.achievements).forEach(([key, achievement]) => {
                if (!unlockedAchievements.includes(key) && achievement.condition(stats)) {
                    newAchievements.push({
                        key,
                        ...achievement
                    });
                }
            });
            
            return newAchievements;
        }
        
        showAchievementNotification(achievement) {
            const notification = document.createElement('div');
            const rarity = achievement.rarity || 'common';
            const color = this.rarityColors[rarity];
            
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 20000;
                background: linear-gradient(135deg, ${color}22, ${color}44);
                border: 2px solid ${color};
                color: white; padding: 20px; border-radius: 15px;
                box-shadow: 0 8px 32px ${color}44;
                font-family: Arial, sans-serif; font-weight: bold;
                animation: achievementSlide 0.5s ease-out, achievementGlow 2s ease-in-out infinite;
                max-width: 300px; min-width: 250px;
                backdrop-filter: blur(10px);
            `;
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 48px; filter: drop-shadow(0 0 10px ${color});">🏆</div>
                    <div>
                        <div style="font-size: 14px; opacity: 0.8; color: ${color};">
                            ¡LOGRO DESBLOQUEADO!
                        </div>
                        <div style="font-size: 18px; margin: 5px 0; color: ${color};">
                            ${achievement.name}
                        </div>
                        <div style="font-size: 12px; opacity: 0.9;">
                            ${achievement.description}
                        </div>
                        <div style="font-size: 11px; margin-top: 5px; color: ${color}; opacity: 0.7;">
                            ${this.rarityNames[rarity]}
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar estilos de animación si no existen
            if (!document.getElementById('achievementStyles')) {
                const style = document.createElement('style');
                style.id = 'achievementStyles';
                style.textContent = `
                    @keyframes achievementSlide {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes achievementGlow {
                        0%, 100% { box-shadow: 0 8px 32px ${color}44; }
                        50% { box-shadow: 0 8px 32px ${color}88; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(notification);
            
            // Sonido de logro
            this.playAchievementSound(rarity);
            
            // Auto-remove después de 5 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'achievementSlide 0.5s ease-in reverse';
                    setTimeout(() => notification.remove(), 500);
                }
            }, 5000);
            
            // Click para cerrar
            notification.addEventListener('click', () => {
                notification.style.animation = 'achievementSlide 0.3s ease-in reverse';
                setTimeout(() => notification.remove(), 300);
            });
        }
        
        playAchievementSound(rarity) {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const frequencies = {
                    'common': [523, 659, 784],
                    'uncommon': [523, 659, 784, 988],
                    'rare': [523, 659, 784, 988, 1175],
                    'epic': [392, 523, 659, 784, 988],
                    'legendary': [330, 392, 523, 659, 784, 988],
                    'seasonal': [523, 659, 523, 784, 659, 988]
                };
                
                const notes = frequencies[rarity] || frequencies.common;
                
                notes.forEach((freq, i) => {
                    setTimeout(() => {
                        const oscillator = ctx.createOscillator();
                        const gainNode = ctx.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(ctx.destination);
                        
                        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
                        oscillator.type = 'triangle';
                        
                        gainNode.gain.setValueAtTime(0, ctx.currentTime);
                        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                        
                        oscillator.start(ctx.currentTime);
                        oscillator.stop(ctx.currentTime + 0.3);
                    }, i * 100);
                });
            } catch (e) {
                console.log('Audio not available for achievements');
            }
        }
        
        getAchievementProgress(stats) {
            const progress = {};
            
            Object.entries(this.achievements).forEach(([key, achievement]) => {
                if (achievement.secret && !stats.achievements?.includes(key)) {
                    return; // No mostrar progreso de logros secretos no desbloqueados
                }
                
                progress[key] = {
                    unlocked: stats.achievements?.includes(key) || false,
                    ...achievement
                };
            });
            
            return progress;
        }
        
        getAchievementStats(stats) {
            const total = Object.keys(this.achievements).length;
            const unlocked = stats.achievements?.length || 0;
            const byRarity = {};
            
            Object.values(this.achievements).forEach(achievement => {
                const rarity = achievement.rarity;
                if (!byRarity[rarity]) byRarity[rarity] = { total: 0, unlocked: 0 };
                byRarity[rarity].total++;
                if (stats.achievements?.includes(achievement.key)) {
                    byRarity[rarity].unlocked++;
                }
            });
            
            return {
                total,
                unlocked,
                percentage: Math.round((unlocked / total) * 100),
                byRarity
            };
        }
    }
    
    // Exponer globalmente
    window.AchievementSystem = AchievementSystem;
})();