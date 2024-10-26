
const colors = ["blue", "yellow", "red", "orange", "pink"]
let currentColor = Math.floor(Math.random() * colors.length)
let nextColor = Math.floor(Math.random() * colors.length)


const gridWidth = 10

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
    return { color: color, shape: getRandomShape() };
}

let shapeHistory = [];
let nextRandomShape = getRandomShape(); // Próxima peça que será desenhada no mini grid

function getRandomShape() {
  let nextShape;
  do {
    nextShape = Math.floor(Math.random() * allShapes.length);
  } while (
    shapeHistory.length >= 2 &&
    shapeHistory[shapeHistory.length - 1] === nextShape &&
    shapeHistory[shapeHistory.length - 2] === nextShape
  );

  // Atualiza o histórico das peças
  shapeHistory.push(nextShape);
  if (shapeHistory.length > 2) {
    shapeHistory.shift();
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

document.getElementById("start-button").addEventListener("click", function() {

  document.querySelector(".start-screen").style.display = "none";

  document.querySelector(".game-container").classList.remove("hidden");

  $pauseButton.disabled = true;

  startCountdown();
});

// Função de contagem regressiva
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

      $pauseButton.disabled = false;

      timerId = setInterval(moveDown, timeMoveDown);

      musicGameAudio.play();
      musicGameAudio.loop = true; // Faz a música repetir

      isGameReady = true;
    }
  }, 1000);
}

const $pauseButton = document.getElementById("pause-button");
const $pauseMenu = document.querySelector(".pause-menu");
const $resumeButton = document.getElementById("resume-button");
const $exitButton = document.getElementById("exit-button"); 

let isPaused = false;
let isGameOver = false;
let timerId = null; 
let isGameReady = false;

// Função para pausar o jogo
function pauseGame() {
  if (!isGameOver) {
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    $pauseMenu.classList.remove("hidden");
    musicGameAudio.pause();
  }
}

// Função para retomar o jogo
function resumeGame() {
  if (!isGameOver) {
    timerId = setInterval(moveDown, timeMoveDown);
    isPaused = false;
    $pauseMenu.classList.add("hidden"); 
    musicGameAudio.play(); 
  }
}

// Evento de tecla "Espaço" para pausar ou retomar o jogo
document.addEventListener("keydown", (event) => {
  if (event.key === " " && !isGameOver && isGameReady) {
    event.preventDefault(); 
    if (!isPaused) {
      pauseGame();
    } else {
      resumeGame();
    }
  }
});

// Evento para o botão de pausa
$pauseButton.addEventListener("click", () => {
  if (!isPaused && !isGameOver) { 
    pauseGame();
  }
});

// Botão "Voltar para o jogo"
$resumeButton.addEventListener("click", () => {
  if (!isGameOver) {
    resumeGame();
  }
});

// Botão "Sair do jogo"
$exitButton.addEventListener("click", () => {
  window.location.reload();
});


function moveDown() {
  freeze()

  undraw()
  currentPosition += 10
  draw()
}

let highScore = 0;

// Função para carregar o recorde do localStorage
function carregarRecorde() {
    const savedRecorde = localStorage.getItem('tetrisHighScore');
    if (savedRecorde !== null) {
        highScore = parseInt(savedRecorde, 10);
    } else {
        highScore = 0;
    }
    document.getElementById('high-score').innerText = `${highScore}`;
}

// Função para atualizar o recorde no localStorage
function atualizarRecorde(pontuacaoAtual) {
    if (pontuacaoAtual > highScore) {
        highScore = pontuacaoAtual;
        localStorage.setItem('tetrisHighScore', highScore);
    }
    document.getElementById('high-score').innerText = `${highScore}`;
}

// Função de finalizar o jogo e verificar recorde
function finalizarJogo() {
    atualizarRecorde(pontuacao);
}

// Ao iniciar o jogo, carregamos o recorde
carregarRecorde();

let timeMoveDown = 700

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
  } else if (3850 < score && score <= 5500) {
    timeMoveDown = 100
  } else if (5500 < score && score <= 7000) {
    timeMoveDown = 50
  } else if (7000 < score && score <= 9000) {
    timeMoveDown = 30
  } else if (9000 < score && score <= 11000) {
    timeMoveDown = 20
  } else if (11000 < score && score <= 13000) {
    timeMoveDown = 10
  } else if (13000 < score && score <= 15000) {
    timeMoveDown = 5
  }
  timerId = setInterval(moveDown, timeMoveDown)
}

let $grid = document.querySelector(".grid")

function checkIfRowIsFilled() {
  let linesRemoved = 0;

  // Loop para verificar todas as linhas
  for (let row = $gridSquares.length - gridWidth; row >= 0; row -= gridWidth) {
    let currentRow = [];

    for (let square = row; square < row + gridWidth; square++) {
      currentRow.push(square);
    }

    const isRowPainted = currentRow.every(square =>
      $gridSquares[square].classList.contains("shapePainted")
    );

    if (isRowPainted) {
      const squaresRemoved = $gridSquares.splice(row, gridWidth);
      squaresRemoved.forEach(square => square.removeAttribute("class"));

      $gridSquares.forEach(square => $grid.appendChild(square));

      updateScore(100);
      completedLineAudio.play();
      linesRemoved++;
    }
  }

  // Checa se há múltiplas linhas removidas e controla a geração da peça
  if (linesRemoved > 0) {
    if (!isGeneratingPiece) {
      isGeneratingPiece = true;
      setTimeout(() => {
        generateNextPiece();
        resetPiecePosition(); 
        isGeneratingPiece = false; 
      }, 1000);
    }
  }
}

let currentPiece = {
  shape: [], 
  positionX: 0, 
  positionY: 0,
};

function clearCurrentPiece() {
  currentPiece.shape.forEach(square => {
    const squareIndex = getSquareIndex(currentPiece.positionX, currentPiece.positionY);
    if (squareIndex !== null) {
      $gridSquares[squareIndex].classList.remove("shapePainted");
    }
  });
}


function drawCurrentPiece() {
  currentPiece.shape.forEach(square => {
    const squareIndex = getSquareIndex(currentPiece.positionX, currentPiece.positionY);
    if (squareIndex !== null) {
      $gridSquares[squareIndex].classList.add("shapePainted");
    }
  });
}

function getSquareIndex(x, y) {
  return (y * gridWidth) + x; 
}

function gameOver() {
  if (currentShape.some(squareIndex => 
    $gridSquares[squareIndex + currentPosition].classList.contains("filled")  
  )) {
    updateScore(-20);
    clearInterval(timerId);
    timerId = null;
    gameOverAudio.play();
    
    musicGameAudio.pause();
    musicGameAudio.currentTime = 0;

    const miniGrid = document.querySelector('.mini-grid');
    miniGrid.classList.add('hidden');
    $grid.style.display = "none";
    
    const buttons = document.querySelectorAll('.buttons-container button');
    buttons.forEach(button => button.classList.add('hidden'));
    
    $score.style.display = "none"; 
    document.querySelector("h3").style.display = "none";
    
    document.querySelectorAll('.score-container h3')[1].style.display = "none"; 
    document.getElementById('high-score').style.display = "none";

    let highScore = localStorage.getItem('tetrisHighScore') || 0;

    if (score > highScore) {
        localStorage.setItem('tetrisHighScore', score); 
        highScore = score;
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
   
    document.body.appendChild(gameOverMessage); 

    document.getElementById("play-again-button").addEventListener("click", () => {
      window.location.reload();
    });

    isGameOver = true; // Define isGameOver como verdadeiro quando o jogo termina
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
    updateScore(10);
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

document.addEventListener("keydown", function(event) {
  if (event.key.toLowerCase() === 'h') {
    window.location.href = "historiaTetris.html";
  }
});
document.addEventListener("keydown", function(event) {
  if (event.key.toLowerCase() === 't') {
    window.location.href = "tutorial.html"; 
  }
});

// Áudios
const shapeFreezeAudio = new Audio("./audios/audios_tetraminoFreeze.wav");
const completedLineAudio = new Audio("./audios/audios_completedLine.wav");
const gameOverAudio = new Audio("./audios/audios_gameOver.wav");
const musicGameAudio = new Audio("./audios/audios_jogotetris.wav");

let audioMuted = JSON.parse(localStorage.getItem('audioMuted')) || false;
shapeFreezeAudio.muted = audioMuted;
completedLineAudio.muted = audioMuted;
gameOverAudio.muted = audioMuted;
musicGameAudio.muted = audioMuted;

const botaoMute = document.querySelector(".botao-mute");
botaoMute.innerText = audioMuted ? "🔇" : "🔊";

// Função para alternar o mute
function toggleMute() {
    audioMuted = !audioMuted;
    shapeFreezeAudio.muted = audioMuted;
    completedLineAudio.muted = audioMuted;
    gameOverAudio.muted = audioMuted;
    musicGameAudio.muted = audioMuted;
    botaoMute.innerText = audioMuted ? "🔇" : "🔊";
    localStorage.setItem('audioMuted', JSON.stringify(audioMuted));
}

botaoMute.addEventListener("click", () => {
    toggleMute();
});

document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "m") {
        toggleMute();
    }
});

// Evento para reiniciar a música quando terminar
musicGameAudio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();          
});

 document.addEventListener("keydown", ({ key }) => {
  if (key == "Escape") {
      window.history.back()
  }
});