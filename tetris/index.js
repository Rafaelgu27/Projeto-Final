const gridWidth = 10
const shapeFreezeAudio = new Audio("./audios/audios_tetraminoFreeze.wav")
const completedLineAudio = new Audio("./audios/audios_completedLine.wav")
const gameOverAudio = new Audio("./audios/audios_gameOver.wav")

const colors = ["blue", "yellow", "red", "orange", "pink"]
let currentColor = Math.floor(Math.random() * colors.length)
let nextColor = Math.floor(Math.random() * colors.length)

// Shapes
const lShape = [
  [1, 2, gridWidth + 1, gridWidth*2 + 1],
  [gridWidth, gridWidth + 1, gridWidth + 2, gridWidth*2 + 2],
  [1, gridWidth + 1, gridWidth*2, gridWidth*2 + 1],
  [gridWidth, gridWidth*2, gridWidth*2 + 1, gridWidth*2 + 2]
]

const zShape = [
  [gridWidth + 1, gridWidth + 2, gridWidth*2, gridWidth*2 + 1],
  [0, gridWidth, gridWidth + 1, gridWidth*2 + 1],
  [gridWidth + 1, gridWidth + 2, gridWidth*2, gridWidth*2 + 1],
  [0, gridWidth, gridWidth + 1, gridWidth*2 + 1]
]

const tShape = [
  [1, gridWidth, gridWidth + 1, gridWidth + 2],
  [1, gridWidth + 1, gridWidth + 2, gridWidth*2 + 1],
  [gridWidth, gridWidth + 1, gridWidth + 2, gridWidth*2 + 1],
  [1, gridWidth, gridWidth + 1, gridWidth*2 + 1]
]

const oShape = [
  [0, 1, gridWidth, gridWidth + 1],
  [0, 1, gridWidth, gridWidth + 1],
  [0, 1, gridWidth, gridWidth + 1],
  [0, 1, gridWidth, gridWidth + 1]
]

const iShape = [
  [1, gridWidth + 1, gridWidth*2 + 1, gridWidth*3 + 1],
  [gridWidth, gridWidth + 1, gridWidth + 2, gridWidth + 3],
  [1, gridWidth + 1, gridWidth*2 + 1, gridWidth*3 + 1],
  [gridWidth, gridWidth + 1, gridWidth + 2, gridWidth + 3]
]

const allShapes = [lShape, zShape, tShape, oShape, iShape]

let previousColors = [];
const maxConsecutiveColors = 2;

function generatePiece() {
    let newColor;

    do {
        // Gere uma cor aleatória (substitua pela sua lógica de cores)
        newColor = getRandomColor();
    } while (shouldPreventColor(newColor));

    // Atualiza o histórico de cores
    updateColorHistory(newColor);

    // Crie a peça com a nova cor
    return createPiece(newColor);
}

function shouldPreventColor(color) {
    // Verifica se a nova cor é igual às últimas cores geradas
    return previousColors.length >= maxConsecutiveColors &&
           previousColors.every(c => c === color);
}

function updateColorHistory(color) {
    // Adiciona a nova cor ao histórico
    previousColors.push(color);

    // Remove cores antigas se o histórico estiver maior que o limite
    if (previousColors.length > maxConsecutiveColors) {
        previousColors.shift();
    }
}

function getRandomColor() {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function createPiece(color) {
    // Cria a peça com a cor escolhida
    return { color: color, shape: getRandomShape() }; // Exemplo simples
}

let shapeHistory = []; // Histórico das últimas duas peças
let nextRandomShape = getRandomShape(); // Próxima peça que será desenhada no mini grid

function getRandomShape() {
  let nextShape;

  // Tenta encontrar uma peça que não seja igual às duas últimas
  do {
    nextShape = Math.floor(Math.random() * allShapes.length);
  } while (
    shapeHistory.length >= 2 && // Verifica se o histórico já tem duas peças
    shapeHistory[shapeHistory.length - 1] === nextShape &&
    shapeHistory[shapeHistory.length - 2] === nextShape
  );

  // Atualiza o histórico das peças
  shapeHistory.push(nextShape);
  if (shapeHistory.length > 2) {
    shapeHistory.shift(); // Remove a peça mais antiga do histórico
  }

  return nextShape;
}

let currentPosition = 3
let currentRotation = 0
let randomShape = nextRandomShape; // Inicializa a peça atual com a peça do mini grid
let currentShape = allShapes[randomShape][currentRotation];
let $gridSquares = Array.from(document.querySelectorAll(".grid div"))

function draw() {
  currentShape.forEach(squareIndex => {
    $gridSquares[squareIndex + currentPosition].classList.add("shapePainted", `${colors[currentColor]}`)
  })
}
draw()

function undraw() {
  currentShape.forEach(squareIndex => {
    $gridSquares[squareIndex + currentPosition].classList.remove("shapePainted", `${colors[currentColor]}`)
  })
}

const $miniGridSquares = document.querySelectorAll(".mini-grid div")
let miniGridWidth = 6
let nextPosition = 2
const possibleNextShapes = [
  [1, 2, miniGridWidth + 1, miniGridWidth*2 + 1],
  [miniGridWidth + 1, miniGridWidth + 2, miniGridWidth*2, miniGridWidth*2 + 1],
  [1, miniGridWidth, miniGridWidth + 1, miniGridWidth + 2],
  [0, 1, miniGridWidth, miniGridWidth + 1],
  [1, miniGridWidth + 1, miniGridWidth*2 + 1, miniGridWidth*3 + 1]
]


function displayNextShape() {
  $miniGridSquares.forEach((square) =>
    square.classList.remove("shapePainted", `${colors[nextColor]}`)
  );

  // Sorteia a nova peça e cor para o mini grid
  nextRandomShape = getRandomShape();
  nextColor = Math.floor(Math.random() * colors.length);

  const nextShape = possibleNextShapes[nextRandomShape];
  nextShape.forEach((squareIndex) =>
    $miniGridSquares[squareIndex + nextPosition + miniGridWidth].classList.add("shapePainted", `${colors[nextColor]}`)
  );
}

// setInterval(moveDown, 700)
let timeMoveDown = 700

document.getElementById("start-button").addEventListener("click", function() {
  // Esconde a tela de início
  document.querySelector(".start-screen").style.display = "none";

  // Mostra o jogo
  document.querySelector(".game-container").classList.remove("hidden");

  // Habilita o botão de "Pausar", mas desabilita inicialmente
  $pauseButton.disabled = true;

  // Inicia contagem regressiva
  startCountdown();
});

function startCountdown() {
  const countdownElement = document.createElement("div");
  countdownElement.classList.add("countdown");
  countdownElement.textContent = "3";
  document.body.appendChild(countdownElement);

  let countdownValue = 3;

  const countdownInterval = setInterval(() => {
    countdownValue--;
    countdownElement.textContent = countdownValue;

    if (countdownValue === 0) {
      clearInterval(countdownInterval);
      countdownElement.remove();

      // Reabilita o botão de pausar após a contagem
      $pauseButton.disabled = false;

      // Inicia o jogo
      timerId = setInterval(moveDown, timeMoveDown);
      
    }
  }, 1000);
}
// Seleciona os elementos do DOM
const $pauseButton = document.getElementById("pause-button");
const $pauseMenu = document.querySelector(".pause-menu");
const $resumeButton = document.getElementById("resume-button");
const $exitButton = document.getElementById("exit-button");

let isPaused = false;
let timerId = null; // Para armazenar o intervalo de movimento

// Pausar e exibir o menu de pausa
$pauseButton.addEventListener("click", () => {
  if (!isPaused) {
    clearInterval(timerId); // Pausa o jogo
    timerId = null;
    isPaused = true;
    $pauseMenu.classList.remove("hidden"); // Exibe a aba de pausa
  }
});

// Botão "Voltar para o jogo"
$resumeButton.addEventListener("click", () => {
  timerId = setInterval(moveDown, timeMoveDown); // Retoma o jogo
  isPaused = false;
  $pauseMenu.classList.add("hidden"); // Esconde a aba de pausa
});

// Botão "Sair do jogo"
$exitButton.addEventListener("click", () => {
  window.location.reload(); // Recarrega a página e volta ao início
});

function moveDown() {
  freeze()

  undraw()
  currentPosition += 10
  draw()
}

let highScore = 0;  // Variável para armazenar o recorde

// Função para carregar o recorde do localStorage
function carregarRecorde() {
    const savedRecorde = localStorage.getItem('tetrisHighScore'); // Recupera o recorde do localStorage
    if (savedRecorde !== null) {
        highScore = parseInt(savedRecorde, 10); // Converte o valor salvo para número
    } else {
        highScore = 0; // Se não houver um recorde salvo, começa com 0
    }
    document.getElementById('high-score').innerText = `${highScore}`; // Exibe o recorde na tela
}

// Função para atualizar o recorde no localStorage
function atualizarRecorde(pontuacaoAtual) {
    if (pontuacaoAtual > highScore) {
        highScore = pontuacaoAtual;  // Atualiza o recorde se a pontuação atual for maior
        localStorage.setItem('tetrisHighScore', highScore);  // Salva o novo recorde no localStorage
    }
    document.getElementById('high-score').innerText = `${highScore}`;  // Atualiza o display do recorde na interface
}

// Função de finalizar o jogo e verificar recorde
function finalizarJogo() {
    // Supondo que 'pontuacao' é a variável que contém a pontuação atual do jogador
    atualizarRecorde(pontuacao);  // Verifica e atualiza o recorde, se necessário
    // Lógica adicional de final de jogo...
}

// Ao iniciar o jogo, carregamos o recorde
carregarRecorde();

const $score = document.querySelector(".score")
let score = 0
function updateScore(updateValue) {
  score += updateValue
  $score.textContent = score

  clearInterval(timerId)
  if (score <= 450) {
    timeMoveDown = 500
  }
  else if (450 < score && score <= 1000) {
    timeMoveDown = 400
  } else if (1000 < score && score <= 1700) {
    timeMoveDown = 300
  } else if (1700 < score && score <= 2700) {
    timeMoveDown = 200
  } else if (2700 < score && score <= 3850) {
    timeMoveDown = 150
  } else {
    timeMoveDown = 110
  }
  timerId = setInterval(moveDown, timeMoveDown)
}

let $grid = document.querySelector(".grid")
function checkIfRowIsFilled() {
  for (var row = 0; row < $gridSquares.length; row += gridWidth) {
    let currentRow = []

    for (var square = row; square < row + gridWidth; square++) {
      currentRow.push(square)
    }

    const isRowPainted = currentRow.every(square => 
      $gridSquares[square].classList.contains("shapePainted")  
    )

    if (isRowPainted) {
      const squaresRemoved = $gridSquares.splice(row, gridWidth)
      squaresRemoved.forEach(square => 
        // square.classList.remove("shapePainted", "filled")
        square.removeAttribute("class")
      )
      $gridSquares = squaresRemoved.concat($gridSquares)
      $gridSquares.forEach(square => $grid.appendChild(square))

      updateScore(97)
      completedLineAudio.play()
    }
  }
}

function gameOver() {
  if (currentShape.some(squareIndex => 
    $gridSquares[squareIndex + currentPosition].classList.contains("filled")  
  )) {
    updateScore(-13);
    clearInterval(timerId);
    timerId = null;
    gameOverAudio.play();

    const miniGrid = document.querySelector('.mini-grid');
    miniGrid.classList.add('hidden'); // Oculta o mini grid
    // Esconder o grid
    $grid.style.display = "none"; // Esconde o grid
    
    const buttons = document.querySelectorAll('.buttons-container button');
    buttons.forEach(button => button.classList.add('hidden')); // Oculta todos os botões
    
    // Esconde a pontuação e o texto "Pontuação:"
    $score.style.display = "none"; // Esconde a pontuação
    document.querySelector("h3").style.display = "none"; // Esconde o texto "Pontuação:"
    
     // Esconde o campo do recorde e o texto "Recorde:"
     document.querySelectorAll('.score-container h3')[1].style.display = "none"; // Esconde o texto "Recorde:"
     document.getElementById('high-score').style.display = "none"; // Esconde o campo do recorde

    // Recupera o recorde do localStorage
    let highScore = localStorage.getItem('tetrisHighScore') || 0;

    // Verifica se a pontuação atual é maior que o recorde
    if (score > highScore) {
        localStorage.setItem('tetrisHighScore', score); // Atualiza o recorde
        highScore = score; // Atualiza a variável de recorde
    }

    // Criar e exibir a mensagem de Game Over e a pontuação
    const gameOverMessage = document.createElement("div");
    gameOverMessage.classList.add("game-over-message");
    gameOverMessage.innerHTML = `
      <h1>GAME OVER</h1>
      <p>Pontuação: ${score}</p>
      <p>Recorde: ${highScore}</p>
      <button id="play-again-button">Jogar Novamente</button>
    `;
   
    document.body.appendChild(gameOverMessage); // Adiciona a mensagem ao corpo do documento

    // Adiciona funcionalidade ao botão "Jogar Novamente"
    document.getElementById("play-again-button").addEventListener("click", () => {
      window.location.reload();
    });
  }
}



function freeze() {
  if (
    currentShape.some((squareIndex) =>
      $gridSquares[squareIndex + currentPosition + gridWidth].classList.contains("filled")
    )
  ) {
    currentShape.forEach((squareIndex) =>
      $gridSquares[squareIndex + currentPosition].classList.add("filled")
    );

    // A peça que está no mini grid será movida para o grid principal
    currentPosition = 3;
    currentRotation = 0;
    randomShape = nextRandomShape; // Usa a peça do mini grid
    currentShape = allShapes[randomShape][currentRotation];
    currentColor = nextColor;
    draw();

    checkIfRowIsFilled();
    updateScore(13);
    shapeFreezeAudio.play();

    // Sorteia e exibe uma nova peça no mini grid
    displayNextShape();

    // Verifica se o novo shape pode ser colocado
    if (
      currentShape.some((squareIndex) =>
        $gridSquares[squareIndex + currentPosition].classList.contains("filled")
      )
    ) {
      gameOver(); // Chama o gameOver se não puder colocar o novo shape
    }
  }
}


// Chama a função para exibir a próxima peça assim que o jogo começar
displayNextShape();


function moveLeft() {
  const isEdgeLimit = currentShape.some(squareIndex => (squareIndex + currentPosition) % gridWidth === 0)
  if (isEdgeLimit) return

  const isFilled = currentShape.some(squareIndex => 
    $gridSquares[squareIndex + currentPosition - 1].classList.contains("filled")
  )
  if (isFilled) return

  undraw()
  currentPosition -= 1
  draw()
}

function moveRight() {
  const isEdgeLimit = currentShape.some(squareIndex => (squareIndex + currentPosition) % gridWidth === gridWidth - 1)
  if (isEdgeLimit) return

  const isFilled = currentShape.some(squareIndex => 
    $gridSquares[squareIndex + currentPosition + 1].classList.contains("filled")
  )
  if (isFilled) return

  undraw()
  currentPosition += 1
  draw()
}

function previousRotation() {
  if (currentRotation ===  0) {
    currentRotation = currentShape.length - 1
  } else {
    currentRotation--
  }
  currentShape = allShapes[randomShape][currentRotation]
}

function rotate() {
  undraw()
  
  if (currentRotation === currentShape.length - 1) {
    currentRotation = 0
  } else {
    currentRotation += 1
  }

  currentShape = allShapes[randomShape][currentRotation]

  const isLeftEdgeLimit = currentShape.some(squareIndex => (squareIndex + currentPosition) % gridWidth === 0)
  const isRightEdgeLimit = currentShape.some(squareIndex => (squareIndex + currentPosition) % gridWidth === 9)
  if (isLeftEdgeLimit && isRightEdgeLimit) {
    previousRotation()
  }

  const isFilled = currentShape.some(squareIndex => 
    $gridSquares[squareIndex + currentPosition].classList.contains("filled")  
  )
  if (isFilled) {
    previousRotation()
  }

  draw()
}


function startCountdown() {
  const countdownElement = document.createElement("div");
  countdownElement.classList.add("countdown");
  countdownElement.textContent = "3";
  document.body.appendChild(countdownElement);

  let countdownValue = 3;

  const countdownInterval = setInterval(() => {
    countdownValue--;
    countdownElement.textContent = countdownValue;

    if (countdownValue === 0) {
      clearInterval(countdownInterval);
      countdownElement.remove();

      // Reabilita o botão de pausar após a contagem
      $pauseButton.disabled = false;

      // Inicia o jogo
      timerId = setInterval(moveDown, timeMoveDown);
  
    }
  }, 1000);
}

// Função para girar a peça
function rotatePiece() {
  rotate(); // Essa função já existe e realiza a rotação da peça
}

// Função para girar a peça
function rotatePiece() {
    undraw();
    if (currentRotation === currentShape.length - 1) {
        currentRotation = 0;
    } else {
        currentRotation += 1;
    }

    currentShape = allShapes[randomShape][currentRotation];

    const isFilled = currentShape.some(squareIndex => 
        $gridSquares[squareIndex + currentPosition].classList.contains("filled")  
    );
    
    if (isFilled) {
        previousRotation(); // Volta para a rotação anterior se estiver preenchido
    }

    draw();
}

// Adicione a chamada para ativar o controle do mouse no início do jogo
document.getElementById("start-button").addEventListener("click", function () {
    // Outras lógicas do botão de início...
});

// Função para desenhar a peça
function draw() {
  currentShape.forEach(squareIndex => {
    $gridSquares[squareIndex + currentPosition].classList.add("shapePainted", `${colors[currentColor]}`);
  });
}

// Função para remover a peça
function undraw() {
  currentShape.forEach(squareIndex => {
    $gridSquares[squareIndex + currentPosition].classList.remove("shapePainted", `${colors[currentColor]}`);
  });
}

// Lógica para mover a peça para baixo
function moveDown() {
  freeze();

  undraw();
  currentPosition += gridWidth; // Move a peça para baixo
  draw();
}


document.addEventListener("keydown", controlKeyboard)

function controlKeyboard(event) {
  if (timerId) {
    if (event.key === "ArrowLeft") {
      moveLeft()
    } else if (event.key === "ArrowRight") {
      moveRight()
    } else if (event.key === "ArrowDown") {
      moveDown()
    } else if (event.key === "ArrowUp") {
      rotate()
    }
  }
}
const botaoMute = document.querySelector(".botao-mute");
let audioMuted = JSON.parse(localStorage.getItem('audioMuted')) || false;
audios_congelarPeca.muted = audioMuted;
audios_completarLinha.muted = audioMuted;
audios_gameOver.muted = audioMuted;
botaoMute.innerText = audioMuted ? "🔇" : "🔊";

botaoMute.addEventListener("click", () => {
    audioMuted = !audioMuted;
    audios_congelarPeca.muted = audioMuted;
    audios_completarLinha.muted = audioMuted;
    audios_gameOver.muted = audioMuted;
    botaoMute.innerText = audioMuted ? "🔇" : "🔊";
    localStorage.setItem('audioMuted', JSON.stringify(audioMuted));
});

