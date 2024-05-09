// board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// bird
let birdWidth = 34; // width/hieght ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

// pipes
let pipeArray = [];
let pipeWidth = 64; // width / height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// game physics
let velocityX = -1.5; // pipes moving speed
let velocityY = 0; // bird's jumping speed
let gravity = 0.1;

let gameStarted = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

window.onload = function () {
  board = document.getElementById('board');
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext('2d'); // used for drawing on the board

  // set bird
  birdImg = new Image();
  birdImg.src = './flappybird.png';
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };

  topPipeImg = new Image();
  topPipeImg.src = './toppipe.png';

  bottomPipeImg = new Image();
  bottomPipeImg.src = './bottompipe.png';

  requestAnimationFrame(update);
  setInterval(placePipes, 1500); // every 1.5seconds
  document.addEventListener('keydown', moveBird);
  document.addEventListener('keydown', startGame);
};

function startGame(e) {
  if (e.code == 'Space' || e.code == 'ArrowUp') {
    gameStarted = true;
    document.removeEventListener('keydown', startGame);
  }
}

function update() {
  requestAnimationFrame(update);
  if (!gameStarted || gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  // bird
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0); // apply gravity to current bird.y so that it don't go over the canvas
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    gameOver = true;
  }

  //pipes
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5; // score is set at 0.5 because there are two pipes
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
      }
      pipe.passed = true;
    }

    if (detectCollision(bird, pipe)) {
      gameOver = true;
    }
  }

  // clear pipes to clear memory
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift(); // pops first element from array
  }

  // update score
  context.fillStyle = 'white';
  context.font = '20px sans-serif';
  context.textAlign = 'left';
  context.fillText(`Score: ${score}`, 5, 45);
  context.textAlign = 'right';
  context.fillText(`High: ${highScore}`, boardWidth - 5, 45);

  if (gameOver) {
    context.fillText('GAME OVER', 240, 150);
    context.fillText('Play again? JUMP!', 260, 300);
  }
}

function placePipes() {
  if (gameOver) {
    return;
  }
  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };

  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };

  pipeArray.push(bottomPipe);
}

function moveBird(e) {
  if (e.code == 'Space' || e.code == 'ArrowUp' || e.code == 'KeyX') {
    // jump
    velocityY = -3;

    // reset game
    if (gameOver) {
      bird.y = birdY;
      pipeArray = [];
      score = 0;
      gameOver = false;
    }
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
