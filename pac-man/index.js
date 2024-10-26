const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const canvas = document.querySelector('canvas');
    canvas.width = 1500 * 0.9;
    canvas.height = canvas.width * 0.75; // Mantém a proporção de 4:3, por exemplo;
}

window.addEventListener('resize', resizeCanvas);

let estadoJogo = 'playing'; // Estado inicial do jogo

let animacaoFrame;
let vidas = 0;
let pontuacao = 0;
let recorde = 0; // Adiciona a variável para o high score
let podeMoverPacman = false;

let piscar = false; // Controla se o texto deve piscar
let tempoUltimaMudanca = 0; // Marca o tempo da última mudança
let numeroPiscadas = 0; // Contador de piscadas
const intervaloPiscar = 100; // Intervalo de tempo para piscar (em milissegundos)
const totalPiscadas = 3; // Total de piscadas desejadas
const duracaoPiscar = 300; // Duração total do efeito de piscar (em milissegundos)

let primeiroPasso = false; // Indica se o Pac-Man deu o primeiro passo
let fantasmasMovendo = false; // Controla se os fantasmas devem se mover

let movimentoAtual = null;
let intervaloMovimento = null;

let limites = [];
let pontos = [];
let fantasmas = [];

const botaoMute = document.querySelector(".botao-mute");

class Fantasma {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.alvoX = x;
        this.alvoY = y;
        this.image = new Image();
        this.image.src = "images/ghost.png";
        this.normalImage = this.image.src;
        this.blueImage = "images/fantasmaAzul.png";
        this.whiteImage = "images/fantasmaBranco.png";
        this.assustado = false;
        this.assustadoTempoInicio = 0;
        this.tempoAssustado = 8000;
        this.piscarDuracao = 2000;
        this.piscarImediato = false;
        this.direcoes = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        this.direcaoAtual = this.direcoes[Math.floor(Math.random() * this.direcoes.length)];
        this.velocidade = 3;
        this.intervaloMudarDirecao = 1;
        this.ultimaMudancaDirecao = Date.now();
        this.mudarDirecaoAleatoria = 0.1;

        this.movendo = true; // Adiciona controle de movimento

    }

    move() {
        if (!this.movendo) return; // Só move se movendo for true

        const dx = this.alvoX - this.x;
        const dy = this.alvoY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.velocidade) {
            this.x = this.alvoX;
            this.y = this.alvoY;
            this.escolherNovaDirecao();
        } else {
            const moveX = (dx / dist) * this.velocidade;
            const moveY = (dy / dist) * this.velocidade;

            this.x += moveX;
            this.y += moveY;
        }
    }

    escolherNovaDirecao() {
        const now = Date.now();
        const deveriaMudarDirecao = now - this.ultimaMudancaDirecao > this.intervaloMudarDirecao || Math.random() < this.mudarDirecaoAleatoria;

        if (deveriaMudarDirecao) {
            const direcaoOposta = { x: -this.direcaoAtual.x, y: -this.direcaoAtual.y };

            const possiveisDirecoes = this.direcoes.filter(direcao => {
                const novoX = this.x + direcao.x * 40;
                const novoY = this.y + direcao.y * 40;
                const mapaColuna = Math.floor(novoX / 40);
                const mapaLinha = Math.floor(novoY / 40);
                return (
                    map[mapaLinha] &&
                    map[mapaLinha][mapaColuna] != '-' &&
                    map[mapaLinha] &&
                    map[mapaLinha][mapaColuna] != '0' &&
                    !(direcao.x === direcaoOposta.x && direcao.y === direcaoOposta.y)
                );
            });

            if (possiveisDirecoes.length > 0) {
                this.direcaoAtual = possiveisDirecoes[Math.floor(Math.random() * possiveisDirecoes.length)];
            } else {
                this.direcaoAtual = direcaoOposta;
            }

            this.alvoX = this.x + this.direcaoAtual.x * 40;
            this.alvoY = this.y + this.direcaoAtual.y * 40;
            this.ultimaMudancaDirecao = now;
        }
    }

    draw() {
        const tempoAssustadoDecorrido = Date.now() - this.assustadoTempoInicio;

        if (this.assustado) {
            if (tempoAssustadoDecorrido < this.piscarDuracao && this.piscarImediato) {
                if (Math.floor(tempoAssustadoDecorrido / intervaloPiscar) % 2 === 0) {
                    this.image.src = this.whiteImage;
                } else {
                    this.image.src = this.blueImage;
                }
            } else if (tempoAssustadoDecorrido < this.tempoAssustado - this.piscarDuracao) {
                this.image.src = this.blueImage;
            } else {
                if (Math.floor(tempoAssustadoDecorrido / intervaloPiscar) % 2 === 0) {
                    this.image.src = this.whiteImage;
                } else {
                    this.image.src = this.blueImage;
                }
            }

            if (tempoAssustadoDecorrido > this.tempoAssustado) {
                this.assustado = false;
                this.image.src = this.normalImage;
            }
        } else {
            this.image.src = this.normalImage;
        }

        ctx.drawImage(this.image, this.x, this.y, 40, 40);
    }

    assustadoFantasma() {
        this.assustado = true;
        this.piscarImediato = true;
        this.assustadoTempoInicio = Date.now();

        setTimeout(() => {
            this.piscarImediato = false;
        }, this.piscarDuracao);
    }
}

class Pacman {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angulo = 0; // Ângulo de rotação inicial
        this.pacmanImages = []; // Imagens do Pac-Man
        this.imagemAtual = 0;
        this.intervaloTrocaImagem = 60; // Intervalo de troca de imagens em milissegundos
        this.tempoUltimaTroca = 0; // Tempo da última troca de imagem
        this.carregarImagensPacman(); // Carregar as imagens
        this.velocidade = 8;
        this.alvoX = x;
        this.alvoY = y;
        this.animar = false; // Controle de animação
        this.visivel = true; // Controle de visibilidade

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

    carregarImagensPacman() {
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
        const distanciaX = this.alvoX - this.x;
        const distanciaY = this.alvoY - this.y;
    
        const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);
    
        if (distancia > this.velocidade) {
            // Interpolação suave para o movimento
            const t = this.velocidade / distancia;
            this.x += distanciaX * t;
            this.y += distanciaY * t;
            this.animar = true; // Iniciar animação
        } else {
            this.x = this.alvoX;
            this.y = this.alvoY;
        }
    }
    

    draw() {
        if (!this.visivel) return; // Não desenha se Pac-Man não for visível

        ctx.save();
        ctx.translate(this.x + 20, this.y + 20);
        ctx.rotate(this.angulo);

        if (this.animar) {
            const now = Date.now();
            if (now - this.tempoUltimaTroca > this.intervaloTrocaImagem) {
                this.imagemAtual = (this.imagemAtual + 1) % this.pacmanImages.length;
                this.tempoUltimaTroca = now;
            }
        } else {
            this.imagemAtual = 0;
        }

        ctx.drawImage(this.pacmanImages[this.imagemAtual], -20, -20, 40, 40);
        ctx.restore();
    }

    updateImage() {
        const now = Date.now();
        if (this.animar && now - this.tempoUltimaTroca > this.intervaloTrocaImagem) {
            this.imagemAtual = (this.imagemAtual + 1) % this.pacmanImages.length;
            this.tempoUltimaTroca = now;
        }
    }
}

let posicaoPacman = { linha: 8, coluna: 10 };
let pacman = new Pacman(posicaoPacman.coluna * 40, posicaoPacman.linha * 40);
const posicaoInicialPacman = { linha: 8, coluna: 10 };

class Limite {
    static width = 40;
    static height = 40;

    constructor({ posicao }) {
        this.posicao = posicao;
        this.width = 40;
        this.height = 40;
    }

    draw() {
        const { x, y } = this.posicao;

        // Desenhar o fundo preto
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, this.width, this.height);

        // Desenhar as bordas azuis
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2; // Ajuste a largura da borda se necessário

        // Desenhar borda esquerda se não houver limite à esquerda
        if (this.desenharBorda(this.posicao.x - this.width, this.posicao.y)) {
            ctx.strokeRect(x, y, 2, this.height); // Borda esquerda
        }

        // Desenhar borda direita se não houver limite à direita
        if (this.desenharBorda(this.posicao.x + this.width, this.posicao.y)) {
            ctx.strokeRect(x + this.width - 2, y, 2, this.height); // Borda direita
        }

        // Desenhar borda superior se não houver limite acima
        if (this.desenharBorda(this.posicao.x, this.posicao.y - this.height)) {
            ctx.strokeRect(x, y, this.width, 2); // Borda superior
        }

        // Desenhar borda inferior se não houver limite abaixo
        if (this.desenharBorda(this.posicao.x, this.posicao.y + this.height)) {
            ctx.strokeRect(x, y + this.height - 2, this.width, 2); // Borda inferior
        }
    }

    // Verifica se a borda deve ser desenhada com base na posição
    desenharBorda(x, y) {
        const coluna = Math.floor(x / 40);
        const linha = Math.floor(y / 40);

        // Verifica se está dentro dos limites do mapa
        if (linha < 0 || linha >= map.length || coluna < 0 || coluna >= map[linha].length) {
            return true; // Desenha borda se estiver fora dos limites do mapa
        }

        return map[linha][coluna] !== '-'; // Não desenha borda se houver um limite adjacente
    }
}

class Ponto {
    static radioPequeno = 5;
    static radioGrande = 10;

    constructor({ posicao, grande = false }) {
        this.posicao = posicao;
        this.grande = grande;
        this.radio = grande ? Ponto.radioGrande : Ponto.radioPequeno;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.posicao.x + 20, this.posicao.y + 20, this.radio, 0, Math.PI * 2, false);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }
}

//RECORDE   
function atualizarRecorde() {
    if (pontuacao > recorde) {
        recorde = pontuacao;
        localStorage.setItem('recorde', recorde); // Salva o novo high score no localStorage
    }

}

function carregarRecorde() {
    const savedHighScore = localStorage.getItem('recorde');
    if (savedHighScore) {
        recorde = parseInt(savedHighScore, 10);
    }
}

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
    ctx.fillText(recorde, 850, 560); 
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

function desenharLimites() {
    for (let linha = 0; linha < map.length; linha++) {
        for (let coluna = 0; coluna < map[linha].length; coluna++) {
            if (map[linha][coluna] === '-') {
                const posicao = { x: coluna * 40, y: linha * 40 };
                const limite = new Limite({ posicao });
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

// MOVIMENTO PACMAN
window.addEventListener("keydown", function (event) {
    const tecla = event.keyCode;
    const botaoIniciar = document.getElementById('startButton');
    const botaoReiniciar = document.getElementById('restartButton');

    if (tecla === 13) { // Verifica se a tecla pressionada é Enter
        if (!botaoIniciar.classList.contains('hidden')) {
            botaoIniciar.click(); // Simula um clique no botão de iniciar o jogo
        }
    } else if(tecla === 27){
        window.location.href = "../index.html";
    }

    if (estadoJogo === 'gameOver') {
        return; // Ignora entradas de teclado se o jogo estiver em 'gameOver'
    }

    if ([37, 38, 39, 40, 68, 65, 87, 83].includes(tecla)) {
        movimentoAtual = tecla;

        if (tecla === 39 || tecla === 68) { // Seta para a direita
            pacman.angulo = 0;
            pacman.imagemAtual = 0;
        } else if (tecla === 37 || tecla === 65) { // Seta para a esquerda
            pacman.angulo = Math.PI;
            pacman.imagemAtual = 1;
        } else if (tecla === 38 || tecla === 87) { // Seta para cima
            pacman.angulo = -Math.PI / 2;
            pacman.imagemAtual = 2;
        } else if (tecla === 40 || tecla === 83) { // Seta para baixo
            pacman.angulo = Math.PI / 2;
            pacman.imagemAtual = 3; 
        }

        // Limpa o intervalo anterior para evitar múltiplos movimentos
        clearInterval(intervaloMovimento);

        intervaloMovimento = setInterval(moverPacman, 150);
    } else if (tecla === 77) { // Tecla de espaço para mute
        controleAudio.toggleMute();
        botaoMute.innerText = controleAudio.mutado ? "🔇" : "🔊";
    }

    botaoReiniciar.addEventListener('click', () => {
        this.location.reload()
    });
});

function moverPacman() {
    // Só permite mover o Pac-Man se o som de início já tiver terminado
    if (movimentoAtual && estadoJogo === 'playing' && podeMoverPacman) {
        let novaLinha = posicaoPacman.linha;
        let novaColuna = posicaoPacman.coluna;

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
            posicaoPacman.linha = novaLinha;
            posicaoPacman.coluna = novaColuna;
            pacman.alvoX = posicaoPacman.coluna * 40;
            pacman.alvoY = posicaoPacman.linha * 40;
            fantasmasMovendo = true;
        }
    }
}

function atualizarPacman() {
    pacman.move();  // Move o Pac-Man para a posição alvo
    pacman.updateImage(); // Atualiza a imagem para a animação
}

//COLISÃO
function verificarColisaoPacManPonto() {
    pontos = pontos.filter(ponto => {
        const distanciaX = pacman.x - ponto.posicao.x;
        const distanciaY = pacman.y - ponto.posicao.y;
        const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);

        if (distancia <= 20 + ponto.radio) {
            if (ponto.grande) {
                pontuacao += 10;
                fantasmas.forEach(fantasma => fantasma.assustadoFantasma());

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

// Atualize a verificação de colisão para ignorar Pac-Man quando ele estiver invulnerável
function verificarColisaoPacManFantasma() {
    fantasmas = fantasmas.map(fantasma => {
        const distanciaX = pacman.x - fantasma.x;
        const distanciaY = pacman.y - fantasma.y;
        const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);

        if (distancia <= 20 + 20 && !pacman.invulneravel) { // Verifica se Pac-Man não está invulnerável
            if (fantasma.assustado) {
                pontuacao += 20;
                pacman.fantasma.play();
                return new Fantasma(respawnPosition.x, respawnPosition.y); // Renascendo o fantasma
            } else {
                pacman.morte.play(); // Toca o som de morte
                vidas--

                pacman.x = 9999;
                pacman.y = 9999;

                fantasmas.forEach(fantasma => {
                    fantasma.movendo = false;
                });

                if (vidas === 0) {
                    estadoJogo = 'gameOver'; // Define o estado do jogo para 'gameOver'
                    cancelAnimationFrame(animacaoFrame); // Parar o loop de animação    
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

function reposicionarPacMan() {

    if(vidas > 0){
        // Reposiciona o Pac-Man para a posição inicial
        posicaoPacman = { linha: posicaoInicialPacman.linha, coluna: posicaoInicialPacman.coluna };
        pacman.x = posicaoPacman.coluna * 40;
        pacman.y = posicaoPacman.linha * 40;
        pacman.alvoX = pacman.x;
        pacman.alvoY = pacman.y;
        pacman.animar = false; // Parar animação
        movimentoAtual = null; // Para o movimento do Pac-Man

        // Define Pac-Man como invulnerável por 4 segundos
        pacman.invulneravel = true;

        // Iniciar a animação de piscar
        let blinkInterval = setInterval(() => {
            pacman.visivel = !pacman.visivel; // Alterna a visibilidade
            pacman.draw(); // Re-desenha o Pac-Man com base na visibilidade
        }, 100); // Piscar a cada 100ms

        setTimeout(() => {
            clearInterval(blinkInterval); // Para o piscar
            pacman.visivel = true; // Garante que o Pac-Man fique visível no final
            pacman.invulneravel = false; // Remove a invulnerabilidade
            pacman.draw(); // Redesenha o Pac-Man visível

            fantasmas.forEach(fantasma => {
                fantasma.movendo = true;
            });
        }, 2000); // 2 segundos de invulnerabilidade

        fantasmas.forEach(fantasma => {
            fantasma.movendo = true;
        });
    }else{
        desenharGameOver();
    }
}

//MUTAR O JOGO
const controleAudio = {
    mutado: false,

    init() {
        // Verifica o estado salvo no localStorage
        const salvarEstadoMuto = localStorage.getItem('audioMutado');
        if (salvarEstadoMuto !== null) {
            this.mutado = JSON.parse(salvarEstadoMuto);
            this.updateMuteState();
        }
        botaoMute.innerText = this.mutado ? "🔇" : "🔊";
    },

    toggleMute() {
        this.mutado = !this.mutado;
        this.updateMuteState();
        // Armazena o estado no localStorage
        localStorage.setItem('audioMutado', JSON.stringify(this.mutado));
    },

    updateMuteState() {
        pacman.wakaSom.muted = this.mutado;
        pacman.pilula.muted = this.mutado;
        pacman.fantasma.muted = this.mutado;
        pacman.gameOverSom.muted = this.mutado;
        pacman.inicio.muted = this.mutado;
        pacman.morte.muted = this.mutado;
        pacman.sirene.muted = this.mutado;
    },

    muteSireneDuringDeath() {
        pacman.morte.addEventListener('play', () => {
            pacman.sirene.muted = true;
        });

        pacman.morte.addEventListener('ended', () => {
            if(!this.mutado){
                pacman.sirene.muted = false;
            }
        });
    }
};

controleAudio.init();

botaoMute.addEventListener("click", () => {
    controleAudio.toggleMute();
    botaoMute.innerText = controleAudio.mutado ? "🔇" : "🔊";
});

document.addEventListener('DOMContentLoaded', () => {
    const botaoIniciar = document.getElementById('startButton');
    botaoIniciar.style.display = 'block';
    let gameStarted = false;

    botaoIniciar.addEventListener('click', () => {
        botaoIniciar.style.display = 'none';

        gameStarted = true;
        botaoIniciar.classList.add('hidden');
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

//DESENHAR
function desenharVidas() {
    const iconeVida = new Image();
    iconeVida.src = "images/pac2.png"; // Substitua pelo caminho do ícone que representa a vida

    const tamanhoIcone = 40; // Tamanho do ícone para cada vida
    const margem = 10; // Margem entre os ícones das vidas
    const inicioX = 900; // Posição inicial X para desenhar as vidas
    const inicioY = 30; // Posição inicial Y para desenhar as vidas

    // Desenha o ícone da vida para cada vida restante
    for (let i = 0; i < vidas; i++) {
        // Ajusta a coordenada Y para desenhar cada ícone abaixo do anterior
        const posY = inicioY + i * (tamanhoIcone + margem);
        ctx.drawImage(iconeVida, inicioX, posY, tamanhoIcone, tamanhoIcone);
    }
}

function desenharGameOver() {
    pacman.x = 9999;
    pacman.y = 9999;
    pacman.visivel = false
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
    const botaoReiniciar = document.getElementById('restartButton');
    botaoReiniciar.style.display = 'block';
}

function verificarVitoria() {
    if (pontos.length === 0) {
        estadoJogo = 'won'; // Atualiza o estado do jogo para 'won'
        cancelAnimationFrame(animacaoFrame); // Para o loop de animação
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
    ctx.fillText('Você Venceu!', 470, 500);

    // Opcional: Desenhe a pontuação final
    ctx.font = '24px Arial';
    ctx.fillText('Pontuação Final: ' + pontuacao, 450, 550);

    const botaoReiniciar = document.getElementById('restartButton');
    botaoReiniciar.style.display = 'block';
}

//FUNÇÕES DE LOOP
function animate() {
    if (estadoJogo === 'gameOver') {
        desenharGameOver();
        pacman.gameOverSom.play();
        return; // Se o jogo estiver em estado 'gameOver', não faça mais nada
    }

    if (estadoJogo === 'won') {
        desenharVitoria();
        return; // Se o jogo estiver em estado 'won', não faça mais nada
    }

    atualizarRecorde();

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

    animacaoFrame = requestAnimationFrame(animate);
}

function iniciarJogo() {
    primeiroPasso = false; // Pac-Man ainda não deu o primeiro passo
    fantasmasMovendo = false; // Fantasmas não se movem ainda 
    pontos.length = 0;
    fantasmas.length = 0;
    vidas = 2; // Ajuste a quantidade de vidas conforme necessário
    estadoJogo = 'playing'; // Reseta o estado do jogo ao iniciar

    // Esconder o botão de reinício
    const botaoReiniciar = document.getElementById('restartButton');
    botaoReiniciar.style.display = 'none';

    // Restante do código de inicialização
    map.forEach((row, linha) => {
        row.forEach((symbol, coluna) => {
            const posicao = { x: Limite.width * coluna, y: Limite.height * linha };
            if (symbol === '-') {
                const limite = new Limite({ posicao });
                limites.push(limite);
            } else if (symbol != '-' && symbol != '0' && symbol != '4' && symbol != '5' && symbol != '6') {
                const grande = symbol === '2';
                const ponto = new Ponto({ posicao, grande });
                pontos.push(ponto);
            }
            if (symbol === '1') {
                const fantasma = new Fantasma(posicao.x, posicao.y);
                fantasmas.push(fantasma);
            }
            if (symbol === '4') {
                respawnPosition = posicao; // Armazena a posição de renascimento
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

function atualizar() {
    atualizarPiscar(); // Atualiza o estado de piscar
    desenharPontuacao(); // Desenha a pontuação
    requestAnimationFrame(atualizar); // Solicita o próximo quadro de animação
}

atualizar();
resizeCanvas();
carregarRecorde();