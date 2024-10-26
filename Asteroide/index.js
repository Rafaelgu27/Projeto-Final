// Adiciona eventos de teclado
window.addEventListener('keydown', (e) => {
    if(e.keyCode === 27){
        window.location.href = "../inicio.html";
    }
});

document.querySelectorAll('.game').forEach(game => {
    game.addEventListener('mouseover', function(e) {
        for (let i = 0; i < 10; i++) { // Gera 10 faíscas
            const spark = document.createElement('div');
            spark.className = 'spark';
            document.body.appendChild(spark);
            const x = e.clientX + (Math.random() * 20 - 10); // Posição aleatória
            const y = e.clientY + (Math.random() * 20 - 10);
            spark.style.left = `${x}px`;
            spark.style.top = `${y}px`;
            spark.style.animation = 'sparkle 0.5s forwards'; // Animação de faíscas

            setTimeout(() => {
                spark.remove(); // Remove a faísca após a animação
            }, 500);
        }
    });
});
