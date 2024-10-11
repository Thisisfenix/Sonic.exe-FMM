document.addEventListener('DOMContentLoaded', () => {
    const extraMusic = document.getElementById('extraMusic');
    const mediaContent = document.getElementById('media');
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
    ];
    let currentIndex = 0;

    function loadMedia(index) {
        mediaContent.innerHTML = ''; // Limpiar contenido actual

        const media = mediaList[index];

        if (media.type === 'image') {
            const img = document.createElement('img');
            img.src = media.src;
            img.alt = `Extra ${index + 1}`;
            mediaContent.appendChild(img);
        } else if (media.type === 'video') {
            const video = document.createElement('video');
            video.src = media.src;
            video.controls = true;
            video.autoplay = true; // Auto reproducir el video cuando se carga
            mediaContent.appendChild(video);
        }
    }

    function updateMedia() {
        loadMedia(currentIndex);
    }

    document.getElementById('prevBtn').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
        updateMedia();
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % mediaList.length;
        updateMedia();
    });

    // Cargar el primer medio
    updateMedia();
});
