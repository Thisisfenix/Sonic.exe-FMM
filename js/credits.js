document.addEventListener('DOMContentLoaded', function() {
    const creditsData = [
        {
            icon: "icons/20240928_015106.png",
            name: "Just Fenix",
            role: "Director 1 y creador del sitio web"
        },
        {
            icon: "icons/20240928_015544.png",
            name: "Josias782",
            role: "Director 2"
        },
        {
            icon: "icons/Photoroom-20240920_221620.png",
            name: "Metal Sonic",
            role: "Colaborador 1 y subdirector (Carreo medio foro)"
        },
        {
            icon: "icons/291_sin_titulo_20240921014905.png",
            name: "j1a2g3r4tu",
            role: "Colaborador 2"
        },
        {
            icon: "icons/352_sin_titulo_20240917214204.png",
            name: "dani_a.y.t",
            role: "Colaborador 3"
        },
        {
            icon: "icons/103_sin_titulo_20240928004155.png",
            name: "Tails",
            role: "Colaborador 4"
        },
        {
            icon: "icons/iconos_FNF_20240928015602.png",
            name: "Samylol",
            role: "Colaborador 5"
        },
        {
            icon: "icons/346_sin_titulo_20240930232516.png",
            name: "Mart",
            role: "Colaborador 6"
        },
        {
            icon: "icons/Project_Capture_141.png",
            name: "Luis Leyends",
            role: "Colaborador 7"
        },
        {
            icon: "icons/215_sin_titulo_20240928080723.png",
            name: "Nogales",
            role: "Colaborador 8"
        }
    ];

    const prevCredit = document.getElementById('prevCredit');
    const currentCredit = document.getElementById('currentCredit');
    const nextCredit = document.getElementById('nextCredit');
    const positionIndicator = document.querySelector('.position-indicator');
    let currentIndex = 0;

    // Música de fondo
    const bgMusic = document.getElementById('backgroundMusic');
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("Autoplay prevented:", e));

    function updateCredits() {
        const prevIndex = (currentIndex - 1 + creditsData.length) % creditsData.length;
        const nextIndex = (currentIndex + 1) % creditsData.length;

        // Actualizar créditos visibles
        prevCredit.innerHTML = createCreditCard(creditsData[prevIndex]);
        currentCredit.innerHTML = createCreditCard(creditsData[currentIndex]);
        nextCredit.innerHTML = createCreditCard(creditsData[nextIndex]);

        // Actualizar clases activas
        document.querySelectorAll('.credit-item').forEach(item => item.classList.remove('active'));
        currentCredit.classList.add('active');

        // Actualizar indicador de posición
        positionIndicator.textContent = `${currentIndex + 1}/${creditsData.length}`;
    }

    function createCreditCard(credit) {
        return `
            <div class="credit-card">
                <img src="${credit.icon}" alt="${credit.name}" class="credit-icon">
                <div class="credit-name">${credit.name}</div>
                <div class="credit-role">${credit.role}</div>
            </div>
        `;
    }

    // Navegación
    document.getElementById('nextButton').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % creditsData.length;
        updateCredits();
    });

    document.getElementById('prevButton').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + creditsData.length) % creditsData.length;
        updateCredits();
    });

    // Teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') document.getElementById('nextButton').click();
        if (e.key === 'ArrowLeft') document.getElementById('prevButton').click();
    });

    // Inicializar
    updateCredits();
});