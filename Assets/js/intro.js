(() => {
    const STORAGE_KEY = 'sonicExeLastVisit';
    const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 horas

    const now = Date.now();
    const last = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);

    if (now - last < COOLDOWN_MS) return;
    localStorage.setItem(STORAGE_KEY, String(now));

    const init = () => {
        const style = document.createElement('style');
        style.textContent = `
            #intro-overlay {
                position: fixed;
                inset: 0;
                background: #000;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;
                touch-action: manipulation;
            }
            #intro-video {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: contain;
                background: #000;
            }
            #intro-pressstart {
                position: absolute;
                inset: 0;
                display: none;
                align-items: center;
                justify-content: center;
            }
            #intro-bg-gif {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: 0;
            }
            #intro-logo {
                position: absolute;
                width: min(1100px, 98vw);
                object-fit: contain;
                z-index: 1;
                opacity: 0.95;
            }
            #intro-main-gif {
                position: absolute;
                width: min(1200px, 100vw);
                object-fit: contain;
                z-index: 2;
            }
            #intro-exit-gif {
                position: absolute;
                width: min(1200px, 100vw);
                object-fit: contain;
                z-index: 2;
                display: none;
            }
            #intro-overlay.fade-out {
                animation: introFadeOut 1.2s ease-in forwards;
            }
            @keyframes introFadeOut {
                0%   { opacity: 1; }
                100% { opacity: 0; pointer-events: none; }
            }

            /* Móviles en portrait */
            @media (max-width: 600px) and (orientation: portrait) {
                #intro-logo {
                    width: 90vw;
                    max-height: 35vh;
                    top: 25%;
                    transform: translateY(-50%);
                }
                #intro-main-gif,
                #intro-exit-gif {
                    width: 100vw;
                    max-height: 100vh;
                }
            }

            /* Móviles en landscape */
            @media (max-height: 500px) and (orientation: landscape) {
                #intro-logo {
                    width: 50vw;
                    max-height: 40vh;
                }
                #intro-main-gif,
                #intro-exit-gif {
                    width: 90vw;
                    max-height: 90vh;
                }
            }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = 'intro-overlay';
        overlay.innerHTML = `
            <video id="intro-video" src="Assets/Videos/HaxeFlixelIntro.mp4"
                   autoplay playsinline></video>
            <div id="intro-pressstart">
                <img id="intro-bg-gif"   src="Assets/Gifs/ezgif.com-animated-gif-maker (2).gif" alt="">
                <img id="intro-logo"     src="Assets/logo.png" alt="Logo">
                <img id="intro-main-gif" src="Assets/Gifs/ezgif.com-animated-gif-maker.gif" alt="">
                <video id="intro-exit-gif" src="Assets/Gifs/ezgif.com-animated-gif-maker (1).gif"
                       muted playsinline preload="auto"></video>
            </div>
        `;
        document.body.appendChild(overlay);

        const video    = overlay.querySelector('#intro-video');
        const psScreen = overlay.querySelector('#intro-pressstart');
        const bgGif    = overlay.querySelector('#intro-bg-gif');
        const logo     = overlay.querySelector('#intro-logo');
        const mainGif  = overlay.querySelector('#intro-main-gif');
        const exitGif  = overlay.querySelector('#intro-exit-gif');

        let phase = 'video';
        let menuMusic = null;

        // En iOS el autoplay con audio requiere interacción del usuario
        // Mostramos un tap-to-start si el video no arranca solo
        const tryPlayVideo = () => {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay bloqueado — mostrar indicador de tap
                    const tapHint = document.createElement('div');
                    tapHint.id = 'intro-tap-hint';
                    tapHint.style.cssText = `
                        position:absolute; inset:0; display:flex;
                        align-items:center; justify-content:center;
                        color:#fff; font-family:sans-serif; font-size:clamp(14px,4vw,22px);
                        letter-spacing:2px; z-index:10; text-align:center; padding:20px;
                        animation: tapPulse 1.5s ease-in-out infinite;
                    `;
                    tapHint.textContent = 'TAP TO START';
                    // Añadir keyframe de pulso
                    const ks = document.createElement('style');
                    ks.textContent = `@keyframes tapPulse {
                        0%,100%{opacity:1} 50%{opacity:0.4}
                    }`;
                    document.head.appendChild(ks);
                    overlay.appendChild(tapHint);

                    const startOnTap = () => {
                        tapHint.remove();
                        ks.remove();
                        video.play().catch(() => showPressStart());
                    };
                    overlay.addEventListener('click',     startOnTap, { once: true });
                    overlay.addEventListener('touchstart', startOnTap, { once: true, passive: true });
                });
            }
        };

        // Solo pasa a press start cuando el video TERMINA
        const showPressStart = () => {
            if (phase !== 'video') return;
            phase = 'pressstart';
            video.style.display = 'none';
            psScreen.style.display = 'flex';

            // Ocultar logo y gif al inicio para el fade in
            logo.style.opacity    = '0';
            mainGif.style.opacity = '0';
            bgGif.style.opacity   = '0';

            // 1) Reproducir TitleLaugh primero
            const titleLaugh = new Audio('sounds/TitleLaugh.ogg');
            titleLaugh.play().catch(() => {});

            // 2) Cuando termina la risa → fade in del bg, logo y gif
            const doFadeIn = () => {
                bgGif.style.transition   = 'opacity 0.8s ease';
                logo.style.transition    = 'opacity 0.8s ease';
                mainGif.style.transition = 'opacity 0.8s ease';
                bgGif.style.opacity   = '1';
                logo.style.opacity    = '1';
                mainGif.style.opacity = '1';

                // MainMenuMusic empieza junto con el fade in
                menuMusic = new Audio('sounds/MainMenuMusic.ogg');
                menuMusic.loop = true;
                menuMusic.play().catch(() => {});
            };

            titleLaugh.addEventListener('ended', doFadeIn);
            // Fallback por si el audio falla
            titleLaugh.addEventListener('error', doFadeIn);
        };

        video.addEventListener('ended', showPressStart);
        video.addEventListener('error', showPressStart);

        // Intentar reproducir (maneja iOS/autoplay bloqueado)
        tryPlayVideo();

        // Fase 2: interacción → gif cambia, todo fade out, música para, index aparece
        const handleInteraction = () => {
            if (phase !== 'pressstart') return;
            phase = 'exiting';

            // Sonidos de click
            const click = new Audio('sounds/menumomentclick.ogg');
            const laugh = new Audio('sounds/menulaugh.ogg');
            click.play().catch(() => {});
            laugh.play().catch(() => {});

            // Cambiar gif principal por video de salida (una sola reproducción)
            mainGif.style.display = 'none';
            exitGif.style.display = 'block';
            exitGif.style.opacity = '1';
            exitGif.play().catch(() => {});

            // Pequeño delay para que el video sea visible antes del fade out
            setTimeout(() => {
                // Fade out lento de todo el contenido (~5s)
                bgGif.style.transition   = 'opacity 5s ease';
                logo.style.transition    = 'opacity 5s ease';
                exitGif.style.transition = 'opacity 5s ease';
                bgGif.style.opacity   = '0';
                logo.style.opacity    = '0';
                exitGif.style.opacity = '0';
            }, 100);

            // Fade out lento de la música del intro (~5s)
            if (menuMusic) {
                const steps = 100;
                const interval = 5000 / steps;
                const volumeStep = menuMusic.volume / steps;
                const fadeAudio = setInterval(() => {
                    if (menuMusic.volume > volumeStep) {
                        menuMusic.volume = Math.max(0, menuMusic.volume - volumeStep);
                    } else {
                        menuMusic.volume = 0;
                        menuMusic.pause();
                        menuMusic.src = '';
                        clearInterval(fadeAudio);
                    }
                }, interval);
            }

            // Después de 5s → overlay hace fade out → index aparece con su música
            setTimeout(() => {
                overlay.style.transition    = 'opacity 1s ease';
                overlay.style.opacity       = '0';
                overlay.style.pointerEvents = 'none';
                setTimeout(() => {
                    overlay.remove();
                    style.remove();
                    // Notificar que la intro terminó y luego iniciar música del index
                    document.dispatchEvent(new Event('introComplete'));
                    const bgMusic = document.getElementById('bgMusic');
                    if (bgMusic) {
                        bgMusic.currentTime = 0;
                        bgMusic.play().catch(() => {});
                    }
                }, 1000);
            }, 5000);
        };

        overlay.addEventListener('click',     handleInteraction);
        overlay.addEventListener('touchstart', handleInteraction, { passive: true });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') handleInteraction();
        }, { once: true });
    };

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
