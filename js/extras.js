document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración del audio de fondo
    const extraMusic = document.getElementById('extraMusic');
    extraMusic.volume = 0.3; // Volumen reducido al 30%
    
    // 2. Elementos del DOM
    const mediaContent = document.getElementById('media');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const mediaCounter = document.getElementById('mediaCounter');

    // Media list (your original list)
    const mediaList = [
        { type: 'image', src: 'media/20240917_205432.jpg' },
        { type: 'video', src: 'media/extra1.mp4' },
        { type: 'image', src: 'media/8.png' },
        { type: 'image', src: 'media/9.png' },
        { type: 'image', src: 'media/24_sin_titulo_20240827222439.jpg' },
        { type: 'image', src: 'media/3925f6d152ebef68aa875047fac7b3a3.png' },
        { type: 'image', src: 'media/6083cdd824fc0.jpg' },
        { type: 'image', src: 'media/185147d041aba4192d9c9cb5372d36f6.png' },
        { type: 'image', src: 'media/20240908_201402.jpg' },
        { type: 'image', src: 'media/20240918_222046.jpg' },
        { type: 'image', src: 'media/72210124d6011c99b3877aaa53c40a72.png' },
        { type: 'image', src: 'media/eace54203fd68ce616c61d3ce3adf070.png' },
        { type: 'video', src: 'media/estoy_en_tu_Cerro_Never_Krakenmemes_humor_xd__Never_Krakencerro (1).mp4' },
        { type: 'image', src: 'media/images_5.jpg' },
        { type: 'image', src: 'media/IMG_20240805_095255-2.jpg' },
        { type: 'video', src: 'media/lv_0_20240814162522.mp4' },
        { type: 'image', src: 'media/NSBF3DStatic.jpg' },
        { type: 'image', src: 'media/Screenshot_2024-09-18-15-27-21-377_com.kingamescreator.fnmm.jpg' },
        { type: 'image', src: 'media/Screenshot_20240911_121303_Discord.jpg' },
        { type: 'image', src: 'media/Screenshot_20240918_215959.jpg' },
        { type: 'image', src: 'media/send-me-your-mario-madness-v2-memes-and-reaction-images-v0-nrl911159qpc1.jpg' },
        { type: 'image', src: 'media/Untitled185_20240824113318.jpg' },
        { type: 'image', src: 'media/Untitled202_20240917213207.jpg' },
        { type: 'video', src: 'media/yt1s.com_-_Tu_papa_usa_gacha_life_Leer_el_comentario_fijado_porfavor_360p.mp4' },
        { type: 'video', src: 'media/starved_eggman_and_tails_dwp360P.mp4' },
        { type: 'image', src: 'media/100_sin_titulo.png' },
        { type: 'image', src: 'media/1192_sin_titulo_20240920002549.png' },
        { type: 'image', src: 'media/1193_sin_titulo_20240920002844.png' },
        { type: 'image', src: 'media/Untitled204_20240919205703.jpg' },
        { type: 'image', src: 'media/Untitled203_20240919211434.jpg' },
        { type: 'image', src: 'media/descarga_27.png' }
    ].filter(media => {
        // Filtramos medios con rutas válidas (opcional)
        return media.src && media.src.trim() !== '';
    });
    
     // 4. Variables de estado
     let currentIndex = 0;
     let isFirstInteraction = true;
 
     // 5. Función principal para cargar medios
     const loadMedia = (index) => {
         // Validación de índice
         if (index < 0 || index >= mediaList.length) return;
         
         mediaContent.innerHTML = '';
         const media = mediaList[index];
 
         try {
             let mediaElement;
             const isVideo = media.type === 'video';
             
             // Crear elemento adecuado
             mediaElement = document.createElement(isVideo ? 'video' : 'img');
             mediaElement.src = media.src;
             mediaElement.alt = `Media ${index + 1}`;
             mediaElement.className = 'media-item';
             
             // Configuración específica para videos
             if (isVideo) {
                 mediaElement.controls = true;
                 mediaElement.autoplay = true;
                 mediaElement.muted = true; // Necesario para autoplay
                 mediaElement.playsInline = true; // Para iOS
             }
             
             // Manejo de errores
             mediaElement.onerror = () => handleMediaError(index, media.src);
             mediaElement.onload = () => updateMediaCounter(index);
             
             mediaContent.appendChild(mediaElement);
             
         } catch (error) {
             console.error('Error loading media:', error);
             handleMediaError(index, media.src);
         }
     };
 
     // 6. Manejo de errores mejorado
     const handleMediaError = (index, src) => {
         mediaContent.innerHTML = `
             <div class="media-error text-center p-4">
                 <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                 <h5 class="text-danger">Error loading media</h5>
                 <p class="text-muted">Position: ${index + 1}/${mediaList.length}</p>
                 <small class="text-truncate d-block">${src || 'Unknown source'}</small>
             </div>
         `;
         updateMediaCounter(index);
     };
 
     // 7. Actualización del contador
     const updateMediaCounter = (index) => {
         mediaCounter.textContent = `${index + 1}/${mediaList.length}`;
         mediaCounter.title = `Current: ${mediaList[index].src}`;
     };
 
     // 8. Navegación
     const showPrev = () => {
         currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
         loadMedia(currentIndex);
     };
 
     const showNext = () => {
         currentIndex = (currentIndex + 1) % mediaList.length;
         loadMedia(currentIndex);
     };
 
     // 9. Configuración de eventos
     const setupEventListeners = () => {
         // Botones de navegación
         prevBtn.addEventListener('click', showPrev);
         nextBtn.addEventListener('click', showNext);
         
         // Navegación por teclado
         document.addEventListener('keydown', (e) => {
             if (e.key === 'ArrowLeft') showPrev();
             if (e.key === 'ArrowRight') showNext();
         });
         
         // Audio (requiere interacción del usuario)
         const handleFirstInteraction = () => {
             if (isFirstInteraction) {
                 extraMusic.play().catch(e => console.warn('Audio playback prevented:', e));
                 isFirstInteraction = false;
             }
         };
         
         document.addEventListener('click', handleFirstInteraction, { once: true });
         document.addEventListener('keydown', handleFirstInteraction, { once: true });
     };
 
     // 10. Inicialización
     const init = () => {
         if (mediaList.length === 0) {
             mediaContent.innerHTML = `
                 <div class="alert alert-warning text-center">
                     No media files found. Please check your media directory.
                 </div>
             `;
             prevBtn.disabled = true;
             nextBtn.disabled = true;
             mediaCounter.textContent = '0/0';
             return;
         }
         
         setupEventListeners();
         loadMedia(0);
     };
 
     // Iniciar la aplicación
     init();
 });