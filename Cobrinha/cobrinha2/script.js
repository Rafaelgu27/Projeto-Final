const canvas = document.querySelector("canvas");
const contexto = canvas.getContext("2d");
const pontuacao = document.querySelector(".pontuacao--valor");
const pontuacaoFinal = document.querySelector(".pontuacao-final > span");
const menu = document.querySelector(".menu-screen");
const audio = new Audio("audio.mp3");
const audioFundo = new Audio("audioFundo.mp3");
const botaoMute = document.querySelector(".botao-mute");
const tamanho = 30;
const posicaoInicial = { x: 270, y: 240 };
let cobra = [posicaoInicial];
let direcao, ultimaDirecao, loopId;
let modoJogo = 'multiplayer';
const restartButton = document.getElementById('restartButton');
restartButton.style.display = 'none';

let audioMuted = JSON.parse(localStorage.getItem('audioMuted')) || false;
audio.muted = audioMuted;
audioFundo.muted = audioMuted;
botaoMute.innerText = audioMuted ? "🔇" : "🔊";

botaoMute.addEventListener("click", () => {
    audioMuted = !audioMuted;
    audio.muted = audioMuted;
    audioFundo.muted = audioMuted;
    botaoMute.innerText = audioMuted ? "🔇" : "🔊";
    localStorage.setItem('audioMuted', JSON.stringify(audioMuted));
});

const adicionarPontuacao = () => {
    pontuacao.innerText = (+pontuacao.innerText + 10).toString().padStart(2, '0');
};


const checarColisao = () => {
    const cabeca = cobra[cobra.length - 1];
    const canvasLimite = canvas.width - tamanho;
    const pescocoIndex = cobra.length - 2;

    const paredeColisao =
        cabeca.x < 0 || cabeca.x > canvasLimite || cabeca.y < 0 || cabeca.y > canvasLimite;

    const autoColisao = cobra.find((posicao, index) => {
        return index < pescocoIndex && posicao.x == cabeca.x && posicao.y == cabeca.y;
    });

    if (paredeColisao || autoColisao) {
        gameOver();
    }
};


const checarComida = () => {
    const cabeca = cobra[cobra.length - 1];

    if (cabeca.x == comida.x && cabeca.y == comida.y) {
        adicionarPontuacao();
        cobra.push(cabeca);
        audio.play();

        let x = posicaoAleatoria();
        let y = posicaoAleatoria();

        while (cobra.find((posicao) => posicao.x == x && posicao.y == y)) {
            x = posicaoAleatoria();
            y = posicaoAleatoria();
        }

        comida.x = x;
        comida.y = y;
        comida.cor = corAleatoria();
    }
};


const desenhoCobra = () => {
    cobra.forEach((posicao, index) => {
        if (index == cobra.length - 1) {
            contexto.fillStyle = "#008000";
            contexto.fillRect(posicao.x, posicao.y, tamanho, tamanho);
            contexto.strokeStyle = '#008000';
            contexto.lineWidth = 2;
            contexto.strokeRect(posicao.x, posicao.y, tamanho, tamanho);
        } else {
            contexto.fillStyle = "#006400";
            contexto.fillRect(posicao.x, posicao.y, tamanho, tamanho);
            contexto.strokeStyle = '#008000';
            contexto.lineWidth = 2;
            contexto.strokeRect(posicao.x, posicao.y, tamanho, tamanho);
        }
    });
};


const numeroAleatorio = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const posicaoAleatoria = () => {
    const numero = numeroAleatorio(0, canvas.width - tamanho);
    return Math.round(numero / 30) * 30;
};

const corAleatoria = () => {
    const vermelho = numeroAleatorio(0, 255);
    const verde = numeroAleatorio(0, 255);
    const azul = numeroAleatorio(0, 255);
    return `rgb(${vermelho}, ${verde}, ${azul})`;
};

const desenhoComida = () => {
    const { x, y, cor } = comida;
    contexto.shadowColor = cor;
    contexto.shadowBlur = 6;
    contexto.fillStyle = cor;
    contexto.fillRect(x, y, tamanho, tamanho);
    contexto.shadowBlur = 0;
};

const comida = {
    x: posicaoAleatoria(),
    y: posicaoAleatoria(),
    cor: corAleatoria()
};

let recordeMultiplayer = parseInt(localStorage.getItem('recordeMultiplayer')) || 0;

const recordeElemento = document.createElement('div');
recordeElemento.classList.add('recorde');
document.body.insertBefore(recordeElemento, canvas);

const recordeMultiplayerElemento = document.createElement('div');
recordeMultiplayerElemento.classList.add('recorde-multiplayer');
recordeMultiplayerElemento.innerText = `Recorde Multiplayer: ${recordeMultiplayer}`;
recordeElemento.appendChild(recordeMultiplayerElemento);

const atualizarRecorde = () => {
    recordeMultiplayerElemento.innerText = `Recorde Multiplayer: ${recordeMultiplayer}`;
};


const moverCobra = () => {
    if (!jogoEmAndamento) return;
    if (!direcao) return;
    primeiraMovimentacao = true

    const cabeca = cobra[cobra.length - 1];
    cobra.push({ x: cabeca.x + (direcao === "direita" ? tamanho : direcao === "esquerda" ? -tamanho : 0),
                  y: cabeca.y + (direcao === "baixo" ? tamanho : direcao === "cima" ? -tamanho : 0) });
    cobra.shift();
    ultimaDirecao = direcao;
};


let jogoEmAndamento = true;
let primeiraMovimentacao = false;

const gameOver = () => {
    direcao = undefined;
    jogoEmAndamento = false;
    menu.style.display = "flex";
    pontuacaoFinal.innerText = pontuacao.innerText;

    const restartButton = document.getElementById('restartButton');
    restartButton.style.display = 'block';

    const pontuacaoAtual = parseInt(pontuacao.innerText, 10);

    if (modoJogo === 'multiplayer') {
        if (pontuacaoAtual > recordeMultiplayer) {
            recordeMultiplayer = pontuacaoAtual;
            localStorage.setItem('recordeMultiplayer', recordeMultiplayer);
            recordeMultiplayerElemento.innerText = `Recorde Multiplayer: ${recordeMultiplayer}`;
        } else {
            recordeMultiplayerElemento.innerText = `Recorde Multiplayer: ${recordeMultiplayer}`;
        }
    }
    canvas.style.filter = "blur(2px)";
};


const reiniciarJogo = () => {
    pontuacao.innerText = "00";
    menu.style.display = "none";
    canvas.style.filter = "none";
    restartButton.style.display = "none"
    cobra = [posicaoInicial];
    jogoEmAndamento = true;
    atualizarRecorde();
};

const gameLoop = () => {
    clearInterval(loopId);

    contexto.clearRect(0, 0, 600, 600);
    desenhoComida();
    moverCobra();
    desenhoCobra();
    checarComida();
    checarColisao();

    if (primeiraMovimentacao) {
        audioFundo.play();
        jogoEmAndamento = true;
    }

    loopId = setTimeout(() => {
        gameLoop();
    }, 150);
};

document.addEventListener('DOMContentLoaded', (event) => {
    document.body.classList.add('no-scroll');

    document.querySelector('.botao-voltar').addEventListener('click', () => {
        document.body.classList.remove('no-scroll');
    });

    atualizarRecorde();
});

document.addEventListener("keydown", ({ key }) => {

    if ((key == "ArrowRight") && ultimaDirecao != "esquerda") {
        direcao = "direita";
    }
    if ((key == "ArrowLeft") && ultimaDirecao != "direita") {
        direcao = "esquerda";
    }
    if ((key == "w") && ultimaDirecao != "baixo") {
        direcao = "cima";
    }
    if ((key == "s") && ultimaDirecao != "cima") {
        direcao = "baixo";
    }

    if (key == "m" || key == "M") {
        audioMuted = !audioMuted;
        audio.muted = audioMuted;
        audioFundo.muted = audioMuted;
        botaoMute.innerText = audioMuted ? "🔇" : "🔊";
        localStorage.setItem('audioMuted', JSON.stringify(audioMuted));
    }
    if (key == "Escape") {
        window.location.href = "../index.html";
    }
    if (key == "h" || key == "H") {
        window.location.href = "historiaCobrinha.html";
    }

    restartButton.addEventListener('click', () => {
        reiniciarJogo()
    });
});

reiniciarJogo();
gameLoop();
