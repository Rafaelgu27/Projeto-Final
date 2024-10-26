const clicarAudio = new Audio ('clique.mp3');
const hoverSound = new Audio('select.mp3');

document.addEventListener('DOMContentLoaded', function() {

    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('mouseover', () => {
            hoverSound.currentTime = 0;
            hoverSound.play();
        });
    });
});

function desativarLinks() {
    jogoEmExecucao = true;
    document.querySelectorAll('a').forEach(link => {
        link.style.pointerEvents = 'none'; // Desabilita cliques
        link.style.opacity = '0.5'; // Opacidade reduzida para indicar desabilitação
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const pacmanLink = document.getElementById('pacman-link');
    const pacmanAnimacao = document.querySelector('.pacman-animacao');
    const pacmanAnimacao2 = document.querySelector('.pacman-animacao2');

    if (pacmanLink && pacmanAnimacao && pacmanAnimacao2) {
        pacmanLink.addEventListener('click', function(event) {
            event.preventDefault();
            clicarAudio.play();
            desativarLinks();

            pacmanAnimacao.style.left = '200vw';

            setTimeout(() => {
                pacmanAnimacao2.style.display = 'flex';
                pacmanAnimacao2.style.right = '-25vw'; 

                pacmanAnimacao.style.display = 'none';

                pacmanAnimacao2.offsetHeight;

                pacmanAnimacao2.style.transition = 'right 3s linear';
                pacmanAnimacao2.style.right = '200vw';
            }, 2000);

            setTimeout(() => {
                window.location.href = pacmanLink.href;
            }, 4000);
        });

        // Evento contextmenu
        pacmanLink.addEventListener('contextmenu', function(event) {
            event.preventDefault(); // Previna o menu de contexto
            desativarLinks(); // Desative os links
            clicarAudio.play(); // Toca o som de clique
            window.location.href = pacmanLink.href; // Redireciona imediatamente
        });
    } else {
        console.error('Elementos do Pac-Man não encontrados.');
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const asteroidsLink = document.getElementById('asteroids-link');
    const asteroidImages = ['as1.png', 'as2.png', 'as3.png'];
    const numAsteroids = 2000;

    function criarAsteroide() {
        const asteroid = document.createElement('div');
        asteroid.className = 'asteroid';
        asteroid.style.backgroundImage = `url('ImagensInicio/${asteroidImages[Math.floor(Math.random() * asteroidImages.length)]}')`;

        asteroid.style.left = '-50px'; 
        const startY = Math.random() * (window.innerHeight - 50);
        asteroid.style.top = `${startY}px`;

        document.body.appendChild(asteroid);

        const velocidadeAtravessar = Math.random() * 10 + 10;
        const velocidadeSubir = Math.random() * 0.5 + 0.5;
        const amplitude = Math.random() * (window.innerHeight * 0.4) + 50;
        let offset = 0; 

        function moverAsteroide() {
            let currentLeft = parseFloat(asteroid.style.left);
            asteroid.style.left = `${currentLeft + velocidadeAtravessar}px`;

            offset += velocidadeSubir;
            let currentTop = startY + Math.sin(offset / 20) * amplitude;
            asteroid.style.top = `${currentTop}px`;

            if (currentLeft > window.innerWidth + 50) {
                asteroid.remove();
            } else {
                requestAnimationFrame(moverAsteroide);
            }
        }

        moverAsteroide(); 
    }

    function iniciarAnimacaoAsteroides() {
        for (let i = 0; i < numAsteroids; i++) {
            setTimeout(criarAsteroide, i * 50); 
        }
    }

    if (asteroidsLink) {
        asteroidsLink.addEventListener('click', function(event) {
            event.preventDefault();
            iniciarAnimacaoAsteroides();
            clicarAudio.play();
            desativarLinks();

            setTimeout(() => {
                window.location.href = asteroidsLink.href;
            }, 4000);
        });

        // Evento contextmenu
        asteroidsLink.addEventListener('contextmenu', function(event) {
            event.preventDefault(); // Previna o menu de contexto
            desativarLinks(); // Desative os links
            clicarAudio.play(); // Toca o som de clique
            window.location.href = asteroidsLink.href; // Redireciona imediatamente
        });
        
    } else {
        console.error('Elemento dos asteroides não encontrado.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const tetrisLink = document.getElementById('tetris-link');
    const quadroTetris = document.getElementById('quadro-tetris');
    let quadrados = []; // Para armazenar os quadrados criados
    let logo; // Para armazenar a referência da logo

    if (tetrisLink && quadroTetris) {
        // Previne o menu de contexto para o link específico
        tetrisLink.addEventListener('contextmenu', function(event) {
            event.preventDefault(); // Previna o menu de contexto
            desativarLinks(); // Desative os links
            clicarAudio.play(); // Toca o som de clique
            window.location.href = tetrisLink.href; // Redireciona imediatamente
        });

        tetrisLink.addEventListener('click', function(event) {
            event.preventDefault();
            clicarAudio.play();
            desativarLinks();

            const larguraQuadrado = 20;  
            const alturaQuadrado = 20;  
            const numeroPorLinha = Math.floor(window.innerWidth / larguraQuadrado);
            const numeroPorColuna = Math.floor(window.innerHeight / alturaQuadrado) + 1;
            const posicoes = Array(numeroPorLinha).fill(0); 

            const tempoInicial = Date.now(); // Marca o tempo inicial
            const tempoLimite = 3200; // Tempo limite em milissegundos (3,2 segundos)

            const criarQuadrados = () => {
                for (let i = 0; i < 15; i++) {
                    const coluna = Math.floor(Math.random() * numeroPorLinha); 
                    // Verifica se a coluna já atingiu o número máximo de quadrados
                    if (posicoes[coluna] < numeroPorColuna) {
                        const quadrado = document.createElement('div');
                        quadrado.style.position = 'absolute';
                        quadrado.style.width = `${larguraQuadrado}px`;
                        quadrado.style.height = `${alturaQuadrado}px`;
                        const corOriginal = `hsl(${Math.random() * 360}, 70%, 30%)`; // Saturação e luminosidade ajustadas
                        quadrado.style.backgroundColor = corOriginal; 
                        quadrado.style.left = `${coluna * larguraQuadrado}px`; 
                        quadrado.style.top = `-20px`;
            
                        quadroTetris.appendChild(quadrado); 
                        quadrados.push({ element: quadrado, cor: corOriginal }); // Adiciona o quadrado à lista
            
                        let alturaAtual = -20; 
                        const cair = setInterval(() => {
                            if (alturaAtual < window.innerHeight - alturaQuadrado * (posicoes[coluna] + 1)) {
                                alturaAtual += (window.innerHeight / 50);
                                quadrado.style.top = `${alturaAtual}px`; 
                            } else {
                                clearInterval(cair); 
                                posicoes[coluna]++;
                                
                                if (posicoes[coluna] > 0) {
                                    const alturaAcima = window.innerHeight - (posicoes[coluna] * alturaQuadrado);
                                    quadrado.style.top = `${alturaAcima}px`;
                                }
                            }
                        });
                    }
                }
            };            

            const gerarQuadrados = () => {
                const tempoDecorrido = Date.now() - tempoInicial; 
                if (tempoDecorrido < tempoLimite) {
                    criarQuadrados();
                    setTimeout(gerarQuadrados);
                } else {
                    // Inicia o efeito de piscar
                    piscarQuadrados();
                }
            };

            const piscarQuadrados = () => {
                const duracao = 800;
                const intervaloPiscar = 100;
                const numPiscar = duracao / intervaloPiscar;
                let contador = 0;

                const piscar = setInterval(() => {
                    quadrados.forEach(q => {
                        if (contador % 2 === 0) {
                            q.element.style.backgroundColor = 'black'; 
                        } else {
                            q.element.style.backgroundColor = q.cor;
                        }
                    });

                    if (contador % 2 === 0) {
                        if (logo) logo.style.opacity = '0';
                    } else {
                        if (logo) logo.style.opacity = '1';
                    }

                    contador++;
                    if (contador >= numPiscar) {
                        clearInterval(piscar);
                        if (logo) logo.remove();
                    }
                }, intervaloPiscar);
            };

            const mostrarLogo = () => {
                logo = document.createElement('img');
                logo.src = 'ImagensInicio/tetris-logo.png';
                logo.style.position = 'absolute';
                logo.style.width = '25%';
                logo.style.left = '50%'; 
                logo.style.top = '50%'; 
                logo.style.transform = 'translate(-50%, -50%)';
                logo.style.zIndex = '10';
                logo.style.opacity = '1';

                quadroTetris.appendChild(logo);
            };

            gerarQuadrados();

            setTimeout(() => {
                mostrarLogo();
            }, 2000);

            setTimeout(() => {
                window.location.href = tetrisLink.href; 
            }, 4000);
        });

    } else {
        console.error('Elemento do Tetris ou quadro não encontrado.');
    }
});

document.getElementById('pong-link').addEventListener('click', function(event) {
    event.preventDefault(); // Impede o redirecionamento imediato
    desativarLinks();

    const pongLink = document.getElementById('pong-link')
    const capaPong = document.getElementById('capa-pong');
    const pongGif = document.querySelector('.pong-gif'); // Seleciona o GIF do Pong

    clicarAudio.play(); // Toca o som de clique
    capaPong.style.display = 'none'; // Esconde a capa do Pong
    pongGif.style.display = 'block'; // Mostra o GIF do Pong

    // Redireciona após 4 segundos
    setTimeout(() => {
        window.location.href = pongLink; // Redireciona para a página da cobra
    }, 4000);
});

document.getElementById('pong-link').addEventListener('contextmenu', function(event) {
    const pongLink = document.getElementById('pong-link')
    event.preventDefault(); // Impede o menu de contexto
    desativarLinks(); // Desativa links, se necessário
    clicarAudio.play(); // Toca o som de clique
    window.location.href = pongLink; // Redireciona para a página da cobra
});

document.getElementById('cobra-link').addEventListener('click', function(event) {
    event.preventDefault();
    clicarAudio.play();
    desativarLinks();

    const altura = 20; // Número inicial de quadradinhos em altura
    const quadradoTamanho = 15; // Tamanho de cada quadradinho
    const virarY = 0.62; // Porcentagem da tela onde a cobra vira para a direita
    const virarDireita = 0.63; // Porcentagem da largura da tela para mover para a direita
    const virarEsquerda = 0.25; // Porcentagem da altura da tela onde a cobra vira à esquerda
    const velocidadeVirarDireita = 5; // Distância para mover para a direita
    const velocidadeVirarEsquerda = 5; // Distância para mover para a esquerda
    const quadradoExtra = 15; // Número de quadradinhos extras após passar pelo hífen
    const duracaoPiscar = 1000; // Duração total do efeito de piscar (milissegundos)
    const intervaloPiscadas = 150; // Intervalo entre as piscadas (milissegundos)
    const quadrados = []; // Array para armazenar os quadradinhos

    const hifen = document.getElementById('hifen');

    // Define o valor inicial em 920 para a posição horizontal (X)
    const inicioX = 920; // Valor definido para X onde a cobra começa
    const inicioY = window.innerHeight + altura * quadradoTamanho; // Começa abaixo da tela

    // Cria o retângulo feito de quadradinhos na vertical
    for (let i = 0; i < altura; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.style.left = `${inicioX}px`; // Mantém a posição inicial X em 920
        square.style.top = `${inicioY - (i * quadradoTamanho)}px`; // Posiciona cada quadrado um embaixo do outro
        document.body.appendChild(square); // Adiciona ao corpo do documento
        quadrados.push(square); // Adiciona ao array
    }

    // Função para detectar se a cobra passou pelo hífen
    function estaAcimaHifen(el1, hifen) {
        const rect1 = el1.getBoundingClientRect();
        const rectHifen = hifen.getBoundingClientRect();
        return rect1.top <= rectHifen.bottom && rect1.left >= rectHifen.left && rect1.right <= rectHifen.right;
    }

    // Animação do retângulo subindo e se movendo
    let direcao = 'up'; // Direção inicial
    let hifenColetado = false; // Para controlar se o hífen foi coletado
    let estaPausado = false; // Controle para pausar o movimento da cobra
    const intervalo = setInterval(() => {
        if (estaPausado) return; // Cobra está pausada, não se move

        const cabeçaQuadrado = quadrados[0];
        const topoAtual = parseInt(cabeçaQuadrado.style.top);
        const esquerdaAtual = parseInt(cabeçaQuadrado.style.left);
        const alturaTela = window.innerHeight;
        const larguraTela = window.innerWidth;
        const porcentagemTelaY = alturaTela * virarY; // Para virar para a direita
        const limiteMoverDireita = larguraTela * virarDireita; // Limite para mover à direita
        const virarEsquerdaY = alturaTela * virarEsquerda; // 20% da altura da tela

        // Move a cabeça para cima
        if (direcao === 'up') {
            cabeçaQuadrado.style.top = `${topoAtual - 5}px`;

            // Verifica se a cobra passou pelo hífen e se ele ainda não foi coletado
            if (!hifenColetado && estaAcimaHifen(cabeçaQuadrado, hifen)) {
                hifenColetado = true; // Marca o hífen como coletado
                hifen.style.display = 'none'; // Esconde o hífen
                estaPausado = true; // Pausa o movimento da cobra

                // Aumenta o tamanho da cobra (adiciona quadradinhos azuis)
                crescerCobra(() => {
                    // Faz a cobra piscar e depois retoma o movimento
                    piscarCobra(() => {
                        estaPausado = false; // Cobra volta a se mover
                    });
                });
            }

            // Verifica se a cobra atingiu a altura para virar à direita
            if (topoAtual <= porcentagemTelaY) {
                direcao = 'right'; // Muda a direção para a direita
            }

            // Verifica se a cobra atingiu 20% da altura da tela para virar à esquerda
            if (topoAtual <= virarEsquerdaY) {
                direcao = 'left'; // Muda a direção para a esquerda
            }
        }

        // Move a cabeça para a direita
        if (direcao === 'right') {
            if (esquerdaAtual < limiteMoverDireita) {
                cabeçaQuadrado.style.left = `${esquerdaAtual + velocidadeVirarDireita}px`;
            } else {
                direcao = 'up'; // Muda a direção para cima após atingir o limite à direita
            }
        }

        // Move a cabeça para a esquerda
        if (direcao === 'left') {
            if (esquerdaAtual > 920) { // Cobra se move até atingir 920px no eixo X
                cabeçaQuadrado.style.left = `${esquerdaAtual - velocidadeVirarEsquerda}px`;
            } else {
                direcao = 'up'; // Muda a direção para cima ao atingir 920px no eixo X
            }
        }

        // Move os outros quadrados para seguir a cabeça
        for (let i = quadrados.length - 1; i > 0; i--) {
            quadrados[i].style.top = quadrados[i - 1].style.top;
            quadrados[i].style.left = quadrados[i - 1].style.left;
        }

        // Para a animação quando todos os quadradinhos saírem da tela
        if (parseInt(cabeçaQuadrado.style.top) < - altura * quadradoTamanho || esquerdaAtual < - quadradoTamanho) {
            clearInterval(intervalo);
        }
    }, 7); // Intervalo de tempo da animação

    // Função para adicionar os quadrados extras azuis ao final da cobra
    function crescerCobra(callback) {
        for (let i = 0; i < quadradoExtra; i++) {
            const ultimoQuadrado = quadrados[quadrados.length - 1]; // O último quadradinho da cobra
            const quadradoExtra = document.createElement('div');
            quadradoExtra.classList.add('square');
            quadradoExtra.style.backgroundColor = 'green'; // Cor dos novos quadrados será azul

            // Verifica se a cobra já está em 20% da altura da tela
            const topoAtual = parseInt(ultimoQuadrado.style.top);
            const alturaTela = window.innerHeight;
            const virarEsquerdaY = alturaTela * virarEsquerda;

            // Se a cobra passou dos 20% da altura da tela, posiciona os quadrados à direita
            if (topoAtual <= virarEsquerdaY) {
                quadradoExtra.style.left = `${parseInt(ultimoQuadrado.style.left) + quadradoTamanho}px`; // Move para a direita
                quadradoExtra.style.top = ultimoQuadrado.style.top; // Mantém a mesma altura
            } else {
                // Caso contrário, posiciona os quadrados abaixo
                quadradoExtra.style.left = ultimoQuadrado.style.left;
                quadradoExtra.style.top = `${parseInt(ultimoQuadrado.style.top) + quadradoTamanho}px`; // Posição um pouco abaixo do último quadrado
            }

            document.body.appendChild(quadradoExtra);
            quadrados.push(quadradoExtra); // Adiciona o novo quadradinho ao final da cobra
        }
        callback(); // Chama o callback para continuar após adicionar os quadrados extras
    }

    // Função para fazer a cobra piscar, alternando entre preto e verde
    function piscarCobra(callback) {
        let contadorPiscar = 0;
        const intervaloPiscar = setInterval(() => {
            quadrados.forEach(square => {
                // Alterna entre preto e verde
                square.style.backgroundColor = contadorPiscar % 2 === 0 ? 'black' : 'green';
            });
            contadorPiscar++;

            // Para de piscar após a duração definida
            if (contadorPiscar >= (duracaoPiscar / intervaloPiscadas)) {
                clearInterval(intervaloPiscar);
                // Restaura todos os quadrados para a cor verde
                quadrados.forEach(square => square.style.backgroundColor = 'green');
                callback(); // Chama o callback para continuar o movimento
            }
        }, intervaloPiscadas);
    }

    setTimeout(() => {
        window.location.href = 'Cobrinha/index.html'; // Redireciona para a página da cobra
    }, 4000); // 4000 milissegundos = 4 segundos
});

// Adiciona o manipulador para o evento de clique com o botão direito do mouse
document.getElementById('cobra-link').addEventListener('contextmenu', function(event) {
    event.preventDefault(); // Impede o menu de contexto padrão
    clicarAudio.play(); // Toca o áudio de clique
    desativarLinks(); // Desativa os links (se necessário)
    window.location.href = 'Cobrinha/index.html'; // Redireciona imediatamente
});
