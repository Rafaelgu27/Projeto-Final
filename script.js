const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 400;

const paddleWidth = 10, paddleHeight = 80;
const ballRadius = 8;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = 2; 
let ballSpeedY = 2; 
let speedIncrement = 0.7; 

let player1Y = (canvas.height - paddleHeight) / 2;
let player2Y = (canvas.height - paddleHeight) / 2;

const playerSpeed = 10;

let player1Score = 0, player2Score = 0;
let totalGames = null, gameOver = false;
let isGameStarted = false; 
let winnerMessage = ''; 

const toque = new Audio('audioPong/toque.mp3')
const pontoSom = new Audio('audioPong/pontoSom.mp3')

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    player1: params.get('player1') || 'Jogador 1',
    player2: params.get('player2') || 'Jogador 2',
    games: parseInt(params.get('games')) || 3
  };
}


window.onload = function() {
  const { player1, player2, games } = getQueryParams();

  
  document.getElementById('player1Display').textContent = player1;
  document.getElementById('player2Display').textContent = player2;

  player1Score = 0;
  player2Score = 0;
  document.getElementById('player1Score').textContent = 0;
  document.getElementById('player2Score').textContent = 0;

  totalGames = games;
  gameOver = false;
  isGameStarted = true;

  speedIncrement = 0.5;
  winnerMessage = ''; 

  resetBall(); 
  draw();
};


function updateGame() {
  if (!isGameStarted || gameOver) return;  

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  
  if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
    ballSpeedY = -ballSpeedY;
    toque.play()
  }

  
  if (ballX - ballRadius < 0) {
    player2Score++;
    document.getElementById('player2Score').textContent = player2Score;
    checkGameOver();
    speedIncrement += 0.2; 
    resetBall();

    pontoSom.play();
    pontoSom.currentTime = 0; 
  }

  
  if (ballX + ballRadius > canvas.width) {
    player1Score++;
    document.getElementById('player1Score').textContent = player1Score;
    checkGameOver();
    speedIncrement += 0.2; 
    resetBall();

    pontoSom.play()
    pontoSom.currentTime = 0; 

  }

  
  if (ballX - ballRadius < paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) {
    ballSpeedX = -ballSpeedX;
  }
  
 
  if (ballX + ballRadius > canvas.width - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight) {
    ballSpeedX = -ballSpeedX;
  }

  draw();
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;


  ballSpeedX = (Math.random() < 0.5 ? -1 : 1) * (2 + speedIncrement); 
  ballSpeedY = (Math.random() < 0.5 ? -1 : 1) * (2 + speedIncrement); 


  if (ballSpeedX === 0) {
    ballSpeedX = 2; 
  }
  if (ballSpeedY === 0) {
    ballSpeedY = 2; 
  }
}


function drawPaddle(x, y) {
  ctx.fillStyle = 'white';
  ctx.fillRect(x, y, paddleWidth, paddleHeight);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.closePath();
}


function drawNet() {
  for (let i = 0; i < canvas.height; i += 30) {
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
  }
}

function drawWinnerMessage() {
  const victoryMessageElement = document.getElementById('victoryMessage');
  if (gameOver) {
    victoryMessageElement.textContent = winnerMessage;  
  } else {
    victoryMessageElement.textContent = '';
  }
}


function checkGameOver() {
  if (player1Score >= totalGames || player2Score >= totalGames) {
    gameOver = true;
    const winnerName = player1Score >= totalGames ? document.getElementById('player1Display').textContent : document.getElementById('player2Display').textContent;
    winnerMessage = `${winnerName || 'Jogador'} venceu!`; 
    drawWinnerMessage(); 
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();
  drawPaddle(0, player1Y); 
  drawPaddle(canvas.width - paddleWidth, player2Y); 
  drawBall();
  drawWinnerMessage();
}

function movePlayer1(e) {
  switch (e.key) {
    case 'w':
    case 'W':
      if (player1Y > 0) player1Y -= playerSpeed;
      break;
    case 's':
    case 'S':
      if (player1Y + paddleHeight < canvas.height) player1Y += playerSpeed;
      break;
  }
}


function movePlayer2(e) {
  switch (e.key) {
    case 'ArrowUp':
      if (player2Y > 0) player2Y -= playerSpeed;
      break;
    case 'ArrowDown':
      if (player2Y + paddleHeight < canvas.height) player2Y += playerSpeed;
      break;
  }
}

let audioMuted = JSON.parse(localStorage.getItem('audioMuted')) || false;
toque.muted = audioMuted;
pontoSom.muted = audioMuted;

const botaoMute = document.querySelector(".botao-mute");
botaoMute.innerText = audioMuted ? "🔇" : "🔊";

function toggleMute() {
    audioMuted = !audioMuted;
    pontoSom.muted = audioMuted;   
    toque.muted = audioMuted;
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

window.addEventListener('keydown', (e) => {
  if(e.keyCode === 27){
    history.back();
  }
});

document.addEventListener('keydown', movePlayer1);
document.addEventListener('keydown', movePlayer2);

setInterval(updateGame, 1000 / 60);
