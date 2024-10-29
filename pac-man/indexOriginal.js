const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const canvas = document.querySelector('canvas');
    canvas.width = 1500 * 0.9;
    canvas.height = canvas.width * 0.75; // Mantém a proporção de 4:3, por exemplo;
}

window.addEventListener('resize', resizeCanvas);

let gameState = 'playing'; // Estado inicial do jogo

let animationFrameId;
let vidas = 0;
let pontuacao = 0;
let highScore = 0; // Adiciona a variável para o high score
let podeMoverPacman = false;


function desenharVidas() {
    const vidaIcon = new Image();
    vidaIcon.src = "images/pac2.png"; // Substitua pelo caminho do ícone que representa a vida

    const iconSize = 40; // Tamanho do ícone para cada vida
    const margem = 10; // Margem entre os ícones das vidas
    const inicioX = 900; // Posição inicial X para desenhar as vidas
    const inicioY = 30; // Posição inicial Y para desenhar as vidas

    // Desenha o ícone da vida para cada vida restante
    for (let i = 0; i < vidas; i++) {
        // Ajusta a coordenada Y para desenhar cada ícone abaixo do anterior
        const posY = inicioY + i * (iconSize + margem);
        ctx.drawImage(vidaIcon, inicioX, posY, iconSize, iconSize);
    }
}


let piscar = false; // Controla se o texto deve piscar
let tempoUltimaMudanca = 0; // Marca o tempo da última mudança
let numeroPiscadas = 0; // Contador de piscadas
const intervaloPiscar = 100; // Intervalo de tempo para piscar (em milissegundos)
const totalPiscadas = 3; // Total de piscadas desejadas
const duracaoPiscar = 300; // Duração total do efeito de piscar (em milissegundos)


function desenharPontuacao() {
    // Configuração para o texto "Pontuação: "
    ctx.fillStyle = 'blue'; // Cor do texto
    ctx.font = '24px "Press Start 2P", cursive'; // Fonte e tamanho para o texto
    ctx.textAlign = 'left'; // Alinhamento do texto
    ctx.textBaseline = 'top'; // Base do texto
    
    ctx.shadowColor = 'black'; // Cor da sombra
    ctx.shadowBlur = 5; // Intensidade da sombra
    ctx.shadowOffsetX = 2; // Deslocamento horizontal da sombra
    ctx.shadowOffsetY = 2; // Deslocamento vertical da sombra

    // Desenhe o texto "Pontuação: "
    ctx.fillText('Pontuação:', 850, 400);

    // Configuração para a pontuação
    ctx.font = '48px "Press Start 2P", cursive'; // Fonte e tamanho para a pontuação

    // Se estiver piscando, mude a cor para branco; caso contrário, use azul
    ctx.fillStyle = piscar ? 'white' : 'blue';

    // Desenhe a pontuação
    ctx.fillText(pontuacao, 850, 440);

    // Configuração para o texto "Recorde: "
    ctx.font = '24px "Press Start 2P", cursive'; // Fonte e tamanho para o texto do high score
    ctx.fillStyle = 'blue'; // Cor do texto
    ctx.fillText('Recorde:', 850, 520);

    // Configuração para o high score
    ctx.font = '48px "Press Start 2P", cursive'; // Fonte e tamanho para o high score

    // Se estiver piscando, mude a cor para branco; caso contrário, use azul
    ctx.fillStyle = 'blue';

    // Desenhe o high score (mesmo valor da pontuação)
    ctx.fillText(highScore, 850, 560); 
}



function atualizarHighScore() {
    if (pontuacao > highScore) {
        highScore = pontuacao;
        localStorage.setItem('highScore', highScore); // Salva o novo high score no localStorage
    }

}


function carregarHighScore() {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore, 10);
    }
}


// Salvar o high score no armazenamento local
function salvarHighScore() {
    localStorage.setItem('highScore', highScore);
}



function atualizarPiscar() {
    const agora = Date.now(); // Obtém o tempo atual
    const intervalo = agora - tempoUltimaMudanca; // Tempo desde a última mudança

    // Verifica se a pontuação é um número redondo e se é hora de iniciar o efeito de piscar
    if (pontuacao % 50 === 0 && pontuacao > 0) {
        if (intervalo > intervaloPiscar) {
            if (numeroPiscadas < totalPiscadas) {
                piscar = !piscar; // Alterna a visibilidade
                tempoUltimaMudanca = agora; // Atualiza o tempo da última mudança
                if (!piscar) {
                    numeroPiscadas++; // Incrementa o contador de piscadas quando o texto se torna invisível
                }
            } else if (intervalo > duracaoPiscar) {
                // Depois do efeito de piscar, restaura a visibilidade e redefine o contador
                piscar = false;
                numeroPiscadas = 0;
            }
        }
    } else {
        piscar = false; // Não piscar se não for um número redondo
    }
}




let primeiroPasso = false; // Indica se o Pac-Man deu o primeiro passo
let fantasmasMovendo = false; // Controla se os fantasmas devem se mover


class Fantasma {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.image = new Image();
        this.image.src = "images/ghost.png";
        this.normalImage = this.image.src;
        this.blueImage = "images/fantasmaAzul.png";
        this.whiteImage = "images/fantasmaBranco.png";
        this.isFrightened = false;
        this.frightenedStartTime = 0;
        this.frightenedDuration = 8000;
        this.blinkDuration = 2000;
        this.piscarImediato = false;
        this.directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        this.currentDirection = this.directions[Math.floor(Math.random() * this.directions.length)];
        this.moveSpeed = 3;
        this.changeDirectionInterval = 1;
        this.lastDirectionChange = Date.now();
        this.randomDirectionChangeProb = 0.1;

        this.isMoving = true; // Adiciona controle de movimento

    }

    move() {
        if (!this.isMoving) return; // Só move se isMoving for true

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.moveSpeed) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.chooseNewDirection();
        } else {
            const moveX = (dx / dist) * this.moveSpeed;
            const moveY = (dy / dist) * this.moveSpeed;

            this.x += moveX;
            this.y += moveY;
        }
    }

    chooseNewDirection() {
        const now = Date.now();
        const shouldChangeDirection = now - this.lastDirectionChange > this.changeDirectionInterval || Math.random() < this.randomDirectionChangeProb;

        if (shouldChangeDirection) {
            const oppositeDirection = { x: -this.currentDirection.x, y: -this.currentDirection.y };

            const possibleDirections = this.directions.filter(direcao => {
                const newX = this.x + direcao.x * 40;
                const newY = this.y + direcao.y * 40;
                const mapCol = Math.floor(newX / 40);
                const mapRow = Math.floor(newY / 40);
                return (
                    map[mapRow] &&
                    map[mapRow][mapCol] != '-' &&
                    map[mapRow] &&
                    map[mapRow][mapCol] != '0' &&
                    !(direcao.x === oppositeDirection.x && direcao.y === oppositeDirection.y)
                );
            });

            if (possibleDirections.length > 0) {
                this.currentDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            } else {
                this.currentDirection = oppositeDirection;
            }

            this.targetX = this.x + this.currentDirection.x * 40;
            this.targetY = this.y + this.currentDirection.y * 40;
            this.lastDirectionChange = now;
        }
    }

    draw() {
        const elapsedFrightenedTime = Date.now() - this.frightenedStartTime;
        const blinkInterval = 100;

        if (this.isFrightened) {
            if (elapsedFrightenedTime < this.blinkDuration && this.piscarImediato) {
                if (Math.floor(elapsedFrightenedTime / blinkInterval) % 2 === 0) {
                    this.image.src = this.whiteImage;
                } else {
                    this.image.src = this.blueImage;
                }
            } else if (elapsedFrightenedTime < this.frightenedDuration - this.blinkDuration) {
                this.image.src = this.blueImage;
            } else {
                if (Math.floor(elapsedFrightenedTime / blinkInterval) % 2 === 0) {
                    this.image.src = this.whiteImage;
                } else {
                    this.image.src = this.blueImage;
                }
            }

            if (elapsedFrightenedTime > this.frightenedDuration) {
                this.isFrightened = false;
                this.image.src = this.normalImage;
            }
        } else {
            this.image.src = this.normalImage;
        }

        ctx.drawImage(this.image, this.x, this.y, 40, 40);
    }

    frightened() {
        this.isFrightened = true;
        this.piscarImediato = true;
        this.frightenedStartTime = Date.now();

        setTimeout(() => {
            this.piscarImediato = false;
        }, this.blinkDuration);
    }
}

class Pacman {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0; // Ângulo de rotação inicial
        this.pacmanImages = []; // Imagens do Pac-Man
        this.currentImageIndex = 0;
        this.imageChangeInterval = 50; // Intervalo de troca de imagens em milissegundos
        this.lastImageChangeTime = 0; // Tempo da última troca de imagem
        this.loadPacmanImages(); // Carregar as imagens
        this.moveSpeed = 8;
        this.targetX = x;
        this.targetY = y;
        this.shouldAnimate = false; // Controle de animação
        this.isVisible = true; // Controle de visibilidade

        // Configuração do áudio
        this.wakaSom = new Audio('sounds/waka.wav');
        this.pilula = new Audio('sounds/power_dot.wav');
        this.fantasma = new Audio('sounds/eat_ghost.wav');
        this.gameOverSom = new Audio('sounds/gameOver.wav');
        this.inicio = new Audio('sounds/start.mp3');
        this.morte = new Audio('sounds/morte.mp3');
        this.sirene = new Audio('sounds/sirene.mp3')

        // Adicionando os manipuladores de eventos para o áudio
        this.wakaSom.addEventListener('canplaythrough', () => {
            console.log('Áudio carregado e pronto para reprodução.');
        }, false);

        this.wakaSom.addEventListener('error', (e) => {
            console.error('Erro ao carregar o áudio:', e);
        });
    }

    loadPacmanImages() {
        // Carregar as imagens do Pac-Man
        const pacmanImage1 = new Image();
        pacmanImage1.src = "images/pac0.png"; // Imagem para a direção para a direita
        const pacmanImage2 = new Image();
        pacmanImage2.src = "images/pac1.png"; // Imagem para a direção para a esquerda
        const pacmanImage3 = new Image();
        pacmanImage3.src = "images/pac2.png"; // Imagem para a direção para cima
        const pacmanImage4 = new Image();
        pacmanImage4.src = "images/pac1.png"; // Imagem para a direção para baixo

        this.pacmanImages = [
            pacmanImage1,
            pacmanImage2,
            pacmanImage3,
            pacmanImage4
        ];
    }

    move() {
        const distX = this.targetX - this.x;
        const distY = this.targetY - this.y;
    
        const distance = Math.sqrt(distX * distX + distY * distY);
    
        if (distance > this.moveSpeed) {
            // Interpolação suave para o movimento
            const t = this.moveSpeed / distance;
            this.x += distX * t;
            this.y += distY * t;
            this.shouldAnimate = true; // Iniciar animação
        } else {
            this.x = this.targetX;
            this.y = this.targetY;
        }
    }
    

    draw() {
        if (!this.isVisible) return; // Não desenha se Pac-Man não for visível

        ctx.save();
        ctx.translate(this.x + 20, this.y + 20);
        ctx.rotate(this.angle);

        if (this.shouldAnimate) {
            const now = Date.now();
            if (now - this.lastImageChangeTime > this.imageChangeInterval) {
                this.currentImageIndex = (this.currentImageIndex + 1) % this.pacmanImages.length;
                this.lastImageChangeTime = now;
            }
        } else {
            this.currentImageIndex = 0;
        }

        ctx.drawImage(this.pacmanImages[this.currentImageIndex], -20, -20, 40, 40);
        ctx.restore();
    }

    updateImage() {
        const now = Date.now();
        if (this.shouldAnimate && now - this.lastImageChangeTime > this.imageChangeInterval) {
            this.currentImageIndex = (this.currentImageIndex + 1) % this.pacmanImages.length;
            this.lastImageChangeTime = now;
        }
    }
}

let pacmanPosition = { linha: 8, coluna: 10 };
let pacman = new Pacman(pacmanPosition.coluna * 40, pacmanPosition.linha * 40);


let pacmanDirection = { x: 0, y: 0 };  // Direção inicial
let targetPosition = { x: pacman.x, y: pacman.y };  // Posição alvo inicial

function moverPacman() {
    // Só permite mover o Pac-Man se o som de início já tiver terminado
    if (movimentoAtual && gameState === 'playing' && podeMoverPacman) {
        let novaLinha = pacmanPosition.linha;
        let novaColuna = pacmanPosition.coluna;

        if (movimentoAtual == 39  || movimentoAtual === 68) { // Seta para a direita
            novaColuna++;
        } else if (movimentoAtual == 37 || movimentoAtual === 65) { // Seta para a esquerda
            novaColuna--;
        } else if (movimentoAtual == 38 || movimentoAtual === 87) { // Seta para cima
            novaLinha--;
        } else if (movimentoAtual == 40 || movimentoAtual === 83) { // Seta para baixo
            novaLinha++;
        }

        if (map[novaLinha] && map[novaLinha][novaColuna] != '-' && map[novaLinha][novaColuna] != '0' && map[novaLinha][novaColuna] != '5') {
            pacmanPosition.linha = novaLinha;
            pacmanPosition.coluna = novaColuna;
            pacman.targetX = pacmanPosition.coluna * 40;
            pacman.targetY = pacmanPosition.linha * 40;
            fantasmasMovendo = true;
        }
    }
}


function atualizarPacman() {
    pacman.move();  // Move o Pac-Man para a posição alvo
    pacman.updateImage(); // Atualiza a imagem para a animação
}

window.addEventListener("keydown", function (event) {
    const tecla = event.keyCode;


    if (tecla === 13) { // Verifica se a tecla pressionada é Enter
        if (!startButton.classList.contains('hidden')) {
            startButton.click(); // Simula um clique no botão de iniciar o jogo
        }
    } else if(tecla === 27){
        window.location.href = "../inicio.html";
    }

    if (gameState === 'gameOver') {
        return; // Ignora entradas de teclado se o jogo estiver em 'gameOver'
    }

    if ([37, 38, 39, 40, 68, 65, 87, 83].includes(tecla)) {
        movimentoAtual = tecla;

        // Atualiza o ângulo de rotação e a imagem do Pac-Man
        if (tecla === 39 || tecla === 68) { // Seta para a direita
            pacman.angle = 0; // Nenhuma rotação
            pacman.currentImageIndex = 0; // pac0.png
        } else if (tecla === 37 || tecla === 65) { // Seta para a esquerda
            pacman.angle = Math.PI; // 180 graus
            pacman.currentImageIndex = 1; // pac1.png
        } else if (tecla === 38 || tecla === 87) { // Seta para cima
            pacman.angle = -Math.PI / 2; // -90 graus
            pacman.currentImageIndex = 2; // pac2.png
        } else if (tecla === 40 || tecla === 83) { // Seta para baixo
            pacman.angle = Math.PI / 2; // 90 graus
            pacman.currentImageIndex = 3; // pac1.png (ou outra imagem se preferir)
        }

        // Limpa o intervalo anterior para evitar múltiplos movimentos
        clearInterval(intervaloMovimento);

        // Inicia o movimento contínuo na direção atual
        intervaloMovimento = setInterval(moverPacman, 150); // 150 ms entre cada movimento, ajuste conforme necessário
    } else if (tecla === 32) { // Tecla de espaço para mute
        audioControl.toggleMute();
        botaoMute.innerText = audioControl.isMuted ? "🔇" : "🔊";
    }

    restartButton.addEventListener('click', () => {
        this.location.reload()
    });
});


let movimentoAtual = null;
let intervaloMovimento = null;


class Limite {
    static width = 40;
    static height = 40;

    constructor({ position }) {
        this.position = position;
        this.width = 40;
        this.height = 40;
    }

    draw() {
        const { x, y } = this.position;

        // Desenhar o fundo preto
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, this.width, this.height);

        // Desenhar as bordas azuis
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2; // Ajuste a largura da borda se necessário

        // Desenhar borda esquerda se não houver limite à esquerda
        if (this.shouldDrawBorder(this.position.x - this.width, this.position.y)) {
            ctx.strokeRect(x, y, 2, this.height); // Borda esquerda
        }

        // Desenhar borda direita se não houver limite à direita
        if (this.shouldDrawBorder(this.position.x + this.width, this.position.y)) {
            ctx.strokeRect(x + this.width - 2, y, 2, this.height); // Borda direita
        }

        // Desenhar borda superior se não houver limite acima
        if (this.shouldDrawBorder(this.position.x, this.position.y - this.height)) {
            ctx.strokeRect(x, y, this.width, 2); // Borda superior
        }

        // Desenhar borda inferior se não houver limite abaixo
        if (this.shouldDrawBorder(this.position.x, this.position.y + this.height)) {
            ctx.strokeRect(x, y + this.height - 2, this.width, 2); // Borda inferior
        }
    }

    // Verifica se a borda deve ser desenhada com base na posição
    shouldDrawBorder(x, y) {
        const col = Math.floor(x / 40);
        const row = Math.floor(y / 40);

        // Verifica se está dentro dos limites do mapa
        if (row < 0 || row >= map.length || col < 0 || col >= map[row].length) {
            return true; // Desenha borda se estiver fora dos limites do mapa
        }

        return map[row][col] !== '-'; // Não desenha borda se houver um limite adjacente
    }
}

class Ponto {
    static normalRadius = 5;
    static largeRadius = 10;

    constructor({ position, isLarge = false }) {
        this.position = position;
        this.isLarge = isLarge;
        this.radius = isLarge ? Ponto.largeRadius : Ponto.normalRadius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x + 20, this.position.y + 20, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }
}

const map = [
    ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', '-'],
    ['-', '2', '-', '-', '-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-', '-', '-', ' ', '-'],
    ['-', ' ', '-', '-', '-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-', '-', '-', '2', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', '-', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-', '-', '-', '-', '-'],
    ['0', '0', '0', '0', '-', ' ', '-', ' ', ' ', ' ', '6', ' ', ' ', ' ', '-', ' ', '-', '0', '0', '0', '0'],
    ['-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '5', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', '5', '5', '5', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', ' ', '-', ' ', '-', '5', '4', '5', '-', ' ', '-', ' ', '-', '-', '-', '-', '-'],
    ['0', '0', '0', '0', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '-', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', '-', '0', '0', '0', '0'],
    ['-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', '-', '-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-', '-', '-', ' ', '-'],
    ['-', ' ', ' ', '2', '-', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', '-'],
    ['-', '-', ' ', ' ', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', ' ', ' ', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', '-', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', '-', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', '-', '-', '2', '-'],
    ['-', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
];

let limites = [];
let pontos = [];
let fantasmas = [];

function desenharLimites() {
    for (let linha = 0; linha < map.length; linha++) {
        for (let coluna = 0; coluna < map[linha].length; coluna++) {
            if (map[linha][coluna] === '-') {
                const position = { x: coluna * 40, y: linha * 40 };
                const limite = new Limite({ position });
                limites.push(limite);
                limite.draw();
            }
        }
    }
}

function desenharPontos() {
    for (let ponto of pontos) {
        ponto.draw();
    }
}

function desenharFantasmas() {
    for (let fantasma of fantasmas) {
        fantasma.draw();
    }
}

const audioControl = {
    isMuted: false,

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateMuteState();
    },

    updateMuteState() {
        pacman.wakaSom.muted = this.isMuted;
        pacman.pilula.muted = this.isMuted;
        pacman.fantasma.muted = this.isMuted;
        pacman.gameOverSom.muted = this.isMuted;
        pacman.inicio.muted = this.isMuted;
        pacman.morte.muted = this.isMuted;
        pacman.sirene.muted = this.isMuted;
    },

    muteSireneDuringDeath() {
        // Muta a sirene quando o áudio de morte começa a tocar
        pacman.morte.addEventListener('play', () => {
            pacman.sirene.muted = true;
        });

        // Desmuta a sirene após o áudio de morte terminar
        pacman.morte.addEventListener('ended', () => {
            if(this.isMuted = false){
                pacman.sirene.muted = false;
            }
        });
    }
};

// Chame a função para configurar o comportamento
audioControl.muteSireneDuringDeath();

const botaoMute = document.querySelector(".botao-mute");

botaoMute.addEventListener("click", () => {
    audioControl.toggleMute();
    botaoMute.innerText = audioControl.isMuted ? "🔇" : "🔊";
});


function verificarColisaoPacManPonto() {
    pontos = pontos.filter(ponto => {
        const distX = pacman.x - ponto.position.x;
        const distY = pacman.y - ponto.position.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance <= 20 + ponto.radius) {
            if (ponto.isLarge) {
                pontuacao += 10;
                fantasmas.forEach(fantasma => fantasma.frightened());

                pacman.pilula.play();
            } else {
                pontuacao += 5;

                pacman.wakaSom.play();
            }

            return false; // Remove o ponto da lista
        }
        return true; // Mantém o ponto na lista
    });

    verificarVitoria(); // Verifica se todos os pontos foram coletados
}

const pacmanInitialPosition = { linha: 8, coluna: 10 };

function reposicionarPacMan() {
    // Reposiciona o Pac-Man para a posição inicial
    pacmanPosition = { linha: pacmanInitialPosition.linha, coluna: pacmanInitialPosition.coluna };
    pacman.x = pacmanPosition.coluna * 40;
    pacman.y = pacmanPosition.linha * 40;
    pacman.targetX = pacman.x;
    pacman.targetY = pacman.y;
    pacman.shouldAnimate = false; // Parar animação
    movimentoAtual = null; // Para o movimento do Pac-Man

    // Define Pac-Man como invulnerável por 4 segundos
    pacman.isInvulnerable = true;

    // Iniciar a animação de piscar
    let blinkInterval = setInterval(() => {
        pacman.isVisible = !pacman.isVisible; // Alterna a visibilidade
        pacman.draw(); // Re-desenha o Pac-Man com base na visibilidade
    }, 100); // Piscar a cada 100ms

    // Após 4 segundos, remover a invulnerabilidade e parar o piscar
    setTimeout(() => {
        clearInterval(blinkInterval); // Para o piscar
        pacman.isVisible = true; // Garante que o Pac-Man fique visível no final
        pacman.isInvulnerable = false; // Remove a invulnerabilidade
        pacman.draw(); // Redesenha o Pac-Man visível

        // Permite que os fantasmas voltem a se mover
        fantasmas.forEach(fantasma => {
            fantasma.isMoving = true;
        });
    }, 2000); // 2 segundos de invulnerabilidade

    // Para os fantasmas de se mover enquanto Pac-Man está morto
    fantasmas.forEach(fantasma => {
        fantasma.isMoving = true;
    });
}



// Atualize a verificação de colisão para ignorar Pac-Man quando ele estiver invulnerável
function verificarColisaoPacManFantasma() {
    fantasmas = fantasmas.map(fantasma => {
        const distX = pacman.x - fantasma.x;
        const distY = pacman.y - fantasma.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance <= 20 + 20 && !pacman.isInvulnerable) { // Verifica se Pac-Man não está invulnerável
            if (fantasma.isFrightened) {
                pontuacao += 20;
                pacman.fantasma.play();
                return new Fantasma(respawnPosition.x, respawnPosition.y); // Renascendo o fantasma
            } else {
                pacman.morte.play(); // Toca o som de morte
                vidas--

                // Move o Pac-Man para fora da tela
                pacman.x = 9999;
                pacman.y = 9999;

                fantasmas.forEach(fantasma => {
                    fantasma.isMoving = false;
                });

                if (vidas === 0) {
                    gameState = 'gameOver'; // Define o estado do jogo para 'gameOver'
                    cancelAnimationFrame(animationFrameId); // Parar o loop de animação
                    desenharGameOver(); // Mostrar tela de Game Over
                } else {
                    // Adiciona um ouvinte ao evento ended do áudio de morte
                    pacman.morte.addEventListener('ended', reposicionarPacMan);

                    // Se o áudio já terminou (caso esteja em reprodução), chama a função diretamente
                    if (pacman.morte.ended) {
                        reposicionarPacMan();
                    }
                }
            }
        }
        return fantasma;
    });
}



function animate() {
    if (gameState === 'gameOver') {
        desenharGameOver();
        pacman.gameOverSom.play();
        return; // Se o jogo estiver em estado 'gameOver', não faça mais nada
    }

    if (gameState === 'won') {
        desenharVitoria();
        return; // Se o jogo estiver em estado 'won', não faça mais nada
    }

    atualizarHighScore();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    desenharLimites();
    desenharPontos();
    desenharVidas(); // Adiciona a chamada para desenhar as vidas

    atualizarPacman(); // Atualiza o Pac-Man

    verificarColisaoPacManPonto();
    verificarColisaoPacManFantasma();

    // Se os fantasmas não devem se mover, ainda desenhe na posição atual
    if (fantasmasMovendo) {
        fantasmas.forEach(fantasma => {
            fantasma.move(); // Move o fantasma
            fantasma.draw(); // Desenha o fantasma
        });
    } else {
        desenharFantasmas(); // Desenha os fantasmas em suas posições atuais
    }

    pacman.draw(); // Desenha o Pac-Man

    desenharPontuacao();

    verificarVitoria(); // Verifica se o jogo foi vencido

    animationFrameId = requestAnimationFrame(animate);
}



function iniciarJogo() {
    if (gameState === 'gameOver') {
        return;
    }

    primeiroPasso = false; // Pac-Man ainda não deu o primeiro passo
    fantasmasMovendo = false; // Fantasmas não se movem ainda 
    pontos.length = 0;
    fantasmas.length = 0;
    vidas = 1; // Ajuste a quantidade de vidas conforme necessário
    gameState = 'playing'; // Reseta o estado do jogo ao iniciar

    // Esconder o botão de reinício
    const restartButton = document.getElementById('restartButton');
    restartButton.style.display = 'none';

    // Restante do código de inicialização
    map.forEach((row, linha) => {
        row.forEach((symbol, coluna) => {
            const position = { x: Limite.width * coluna, y: Limite.height * linha };
            if (symbol === '-') {
                const limite = new Limite({ position });
                limites.push(limite);
            } else if (symbol != '-' && symbol != '0' && symbol != '4' && symbol != '5' && symbol != '6') {
                const isLarge = symbol === '2';
                const ponto = new Ponto({ position, isLarge });
                pontos.push(ponto);
            }
            if (symbol === '1') {
                const fantasma = new Fantasma(position.x, position.y);
                fantasmas.push(fantasma);
            }
            if (symbol === '4') {
                respawnPosition = position; // Armazena a posição de renascimento
            }
        });
    });

    desenharLimites();
    desenharPontos();
    desenharFantasmas();
    pacman.draw();
    desenharVidas();

    // Verificar o carregamento do áudio
    pacman.wakaSom.load(); // Força o carregamento
    pacman.inicio.play();

    // Bloqueia o movimento do Pac-Man até o som de início terminar
    pacman.inicio.addEventListener('ended', () => {
        pacman.sirene.loop = true; // Define o áudio da sirene para repetir continuamente
        pacman.sirene.play(); // Inicia a reprodução contínua da sirene
        podeMoverPacman = true; // Permite o movimento do Pac-Man após o som de início
    });
}


function desenharGameOver() {

    pacman.x = 9999;
    pacman.y = 9999;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over!', 470, 500);

    ctx.font = '24px Arial';
    ctx.fillText('Pontuação final: ' , 450, 550);

    ctx.font = '24px Arial';
    ctx.fillText(pontuacao, 570, 550);

    // Exibir o botão de reiniciar
    const restartButton = document.getElementById('restartButton');
    restartButton.style.display = 'block';


}

function verificarVitoria() {
    if (pontos.length === 0) {
        gameState = 'won'; // Atualiza o estado do jogo para 'won'
        cancelAnimationFrame(animationFrameId); // Para o loop de animação
        desenharVitoria(); // Mostra a tela de vitória
    }
}

function desenharVitoria() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    ctx.fillStyle = 'black'; // Cor de fundo
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Você Venceu!', canvas.width / 2, canvas.height / 2);

    // Opcional: Desenhe a pontuação final
    ctx.font = '24px Arial';
    ctx.fillText('Pontuação Final: ' + pontuacao, canvas.width / 2, canvas.height / 2 + 50);

    const restartButton = document.getElementById('restartButton');
    restartButton.style.display = 'block';

}

function atualizar() {
    atualizarPiscar(); // Atualiza o estado de piscar
    desenharPontuacao(); // Desenha a pontuação
    requestAnimationFrame(atualizar); // Solicita o próximo quadro de animação
}

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    startButton.style.display = 'block';
    let gameStarted = false;

    startButton.addEventListener('click', () => {
        startButton.style.display = 'none';

        gameStarted = true;
        startButton.classList.add('hidden');
        // Iniciar o jogo aqui
        iniciarJogo();  // Substitua com sua lógica de inicialização do jogo
        animate();
    });

    document.addEventListener('keydown', (event) => {
        if (gameStarted) {
            // Lógica de movimentação do Pac-Man
            moverPacman(event);  // Substitua com sua função de movimentação do Pac-Man
        }
    });
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'h' || event.key === 'H') {
        event.preventDefault(); // Impede o comportamento padrão da tecla
        window.location.href = '../Historia dos jogos/historiaPacMan.html'; // Redireciona para a história
    }
});


// Inicia o loop de animação
atualizar();
resizeCanvas();
carregarHighScore();
