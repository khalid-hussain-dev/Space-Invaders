const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const modal = document.getElementById('modal');
const modalMsg = document.getElementById('modal-message');
const playAgainBtn = document.getElementById('play-again');
const restartBtn = document.getElementById('restart');
const pauseBtn = document.getElementById('pause-btn');
const pauseModal = document.getElementById('pause-modal');
const resumeBtn = document.getElementById('resume');
const pauseRestartBtn = document.getElementById('pause-restart');
const alienWidth = 40;
const gameWidth = 500;
const rightBoundary = gameWidth - 40 - alienWidth;
const leftBoundary = 5;
const topBoundary = 0;
const bottomBoundary = 550;
let lives = 3;
const livesEl = document.getElementById('lives');
let wave = 1;
const alienSpacing = 40;
const offsetX = 10;
const offsetY = 10;
const maxGameWidth = game.offsetWidth - 200;
const maxColumns = Math.floor(maxGameWidth / alienSpacing);
const playerShootSound = new Audio('playerShoot.mp3');
const playerHitSound = new Audio('playerHit.mp3');
const alienShootSound = new Audio('alienShoot.mp3');
const alienHitSound = new Audio('alienHit.mp3');
const gameOverSound = new Audio('gameOver.mp3');
const waveClearSound = new Audio('nextLevel.mp3');

let playerPos = 230;
let playerTop = 450;
let aliens = [];
let bullets = [];
let alienBullets = [];
let score = 0;
let highScore = localStorage.getItem("highscore") || 0;
let isPaused = false;

highscoreEl.textContent = `High Score: ${highScore}`;
const modalContent = document.querySelector('.modal-content');

function createAliens(wave = 1) {
  aliens = [];
  game.querySelectorAll('.alien').forEach(el => el.remove());

  const shapes = [
    'rectangle', 'diamond', 'square', 'triangle',
    'hexagon', 'pentagon', 'octagon', 'parallelogram',
    'arrow', 'cross'
  ];

  const shape = shapes[(wave - 1) % shapes.length];
  const alienCountMultiplier = 1 + Math.min((wave - 1) * 0.1, 1); // cap increase

  switch (shape) {
    case 'rectangle':
		  showWaveBanner(wave);
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < Math.min(12, maxColumns); col++) {
          createAlien(row * alienSpacing + offsetY, col * alienSpacing + offsetX, wave);
        }
      }
      break;

    case 'diamond':
      for (let row = 0; row < 7; row++) {
        let cols = row <= 3 ? row * 2 + 1 : (6 - row) * 2 + 1;
        let startCol = Math.floor((maxColumns - cols) / 2);
        for (let col = 0; col < cols; col++) {
          createAlien(row * alienSpacing + offsetY, (startCol + col) * alienSpacing + offsetX, wave);
        }
      }
      break;

    case 'square':
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
          createAlien(row * alienSpacing + offsetY, col * alienSpacing + offsetX, wave);
        }
      }
      break;

    case 'triangle':
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col <= row; col++) {
          let x = (Math.floor((maxColumns - row) / 2) + col) * alienSpacing + offsetX;
          createAlien(row * alienSpacing + offsetY, x, wave);
        }
      }
      break;

    case 'hexagon':
      const hexRows = 6;
      for (let row = 0; row < hexRows; row++) {
        let cols = row < 3 ? 6 + row : 6 + (hexRows - row - 1);
        let startCol = Math.floor((maxColumns - cols) / 2);
        for (let col = 0; col < cols; col++) {
          createAlien(row * alienSpacing + offsetY, (startCol + col) * alienSpacing + offsetX, wave);
        }
      }
      break;

    case 'pentagon':
      for (let row = 0; row < 5; row++) {
        let cols = row * 2 + 3;
        let startCol = Math.floor((maxColumns - cols) / 2);
        for (let col = 0; col < cols; col++) {
          createAlien(row * alienSpacing + offsetY, (startCol + col) * alienSpacing + offsetX, wave);
        }
      }
      break;

    case 'octagon':
      for (let row = 0; row < 8; row++) {
        let cols = row < 2 || row > 5 ? 6 : 10;
        let startCol = Math.floor((maxColumns - cols) / 2);
        for (let col = 0; col < cols; col++) {
          createAlien(row * alienSpacing + offsetY, (startCol + col) * alienSpacing + offsetX, wave);
        }
      }
      break;

    case 'parallelogram':
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 8; col++) {
          createAlien((row * alienSpacing) + offsetY, (col * alienSpacing + row * 10) + offsetX, wave);
        }
      }
      break;

    case 'arrow':
      for (let row = 0; row < 7; row++) {
        let center = Math.floor(maxColumns / 2);
        if (row < 3) {
          for (let col = 0; col < 3; col++) {
            createAlien(row * alienSpacing + offsetY, (center - col) * alienSpacing + offsetX, wave);
            if (col !== 0) createAlien(row * alienSpacing + offsetY, (center + col) * alienSpacing + offsetX), wave;
          }
        } else {
          createAlien(row * alienSpacing + offsetY, center * alienSpacing + offsetX, wave);
        }
      }
      break;

    case 'cross':
      let center = Math.floor(maxColumns / 2);
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < maxColumns; col++) {
          if (col === center || row === 3) {
            createAlien(row * alienSpacing + offsetY, col * alienSpacing + offsetX, wave);
          }
        }
      }
      break;
  }
}

function createAlien(top, left, wave = 1) {
  const alien = document.createElement('img'); // Use <img> not <div>
  alien.classList.add('alien');
		
  // Set wave-based alien icon
  alien.src = `alien_icon${wave}.png`;

  // Store laser icon for use when shooting
  alien.dataset.laser = `alien_laser_icon${wave}.png`;

  alien.style.top = `${top}px`;
  alien.style.left = `${left}px`;

  game.appendChild(alien);
  aliens.push(alien);

}

function showWaveBanner(waveNum, callback) {
  const banner = document.createElement('div');
  banner.classList.add('wave-banner');
  banner.textContent = `Wave ${waveNum}`;
  game.appendChild(banner);

  setTimeout(() => {
    banner.remove();
    if (typeof callback === 'function') callback();
  }, 2000);
}

function alienShoot() {
  if (aliens.length === 0) return;
  const randomAlien = aliens[Math.floor(Math.random() * aliens.length)];
  
  const bullet = document.createElement('div');
  bullet.classList.add('alien-bullet');
  bullet.style.left = `${parseInt(randomAlien.style.left) + 15}px`;
  bullet.style.top = `${parseInt(randomAlien.style.top) + 30}px`;

  // Set the background image according to the current wave number
  bullet.style.backgroundImage = `url('alien_laser_icon${wave}.png')`;
  bullet.style.backgroundSize = 'contain';
  bullet.style.backgroundRepeat = 'no-repeat';

  game.appendChild(bullet);
  alienBullets.push(bullet);
	
  alienShootSound.currentTime = 0;
  alienShootSound.play();
}


function moveAlienBullets() {
  alienBullets.forEach((bullet, index) => {
  let top = parseInt(bullet.style.top);
  bullet.style.top = `${top + 5}px`;

  if (top > 500) {
    if (game.contains(bullet)) game.removeChild(bullet);
    alienBullets.splice(index, 1);
    return;
  }

  const bRect = bullet.getBoundingClientRect();
  const pRect = player.getBoundingClientRect();

  if (
    bRect.top < pRect.bottom &&
    bRect.bottom > pRect.top &&
    bRect.left < pRect.right &&
    bRect.right > pRect.left
  ) {
    if (game.contains(bullet)) game.removeChild(bullet);
    alienBullets.splice(index, 1);

    lives--;
    updateLives();
	playerHitSound.currentTime = 0;
    playerHitSound.play();

    if (lives <= 0) {
      endGame(false);
    }

    return;
  }
});
}

function resetGameState() {
  // Remove all aliens and bullets
  game.querySelectorAll('.alien, .bullet').forEach(el => game.removeChild(el));
  aliens = [];
  bullets = [];

  // Reset player position
  playerPos = 230;
  player.style.left = `${playerPos}px`;

  // Reset score
  score = 0;
  scoreEl.textContent = `Score: ${score}`;
	
  lives = 3;
  updateLives();

  // Create aliens fresh
  wave = 1;
  createAliens();
}

function movePlayer(dx, dy) {
  playerPos += dx;
  playerTop += dy;

  if (playerPos < leftBoundary) playerPos = leftBoundary;
  if (playerPos > rightBoundary) playerPos = rightBoundary;
  if (playerTop < topBoundary) playerTop = topBoundary;
  if (playerTop > bottomBoundary) playerTop = bottomBoundary;

  player.style.left = `${playerPos}px`;
  player.style.top = `${playerTop}px`;
}

function shootBullet() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');

  // Get current player position from the DOM
  const playerRect = player.getBoundingClientRect();
  const gameRect = game.getBoundingClientRect();

  // Compute bullet position relative to the game container
  const bulletLeft = player.offsetLeft + 18; // Horizontally centered
  const bulletBottom = player.offsetTop + player.offsetHeight; // Top of player

  bullet.style.left = `${bulletLeft}px`;
  bullet.style.bottom = `${game.offsetHeight - bulletBottom}px`;

  game.appendChild(bullet);
  bullets.push(bullet);
  playerShootSound.currentTime = 0;
  playerShootSound.play();
}



function moveBullets() {
  bullets.forEach((bullet, index) => {
    let bottom = parseInt(bullet.style.bottom);
    bullet.style.bottom = `${bottom + 10}px`;

    if (bottom > 500) {
      if (game.contains(bullet)) game.removeChild(bullet);
      bullets.splice(index, 1);
      return;
    }

    aliens.forEach((alien, ai) => {
      const bRect = bullet.getBoundingClientRect();
      const aRect = alien.getBoundingClientRect();

      if (
        bRect.top < aRect.bottom &&
        bRect.bottom > aRect.top &&
        bRect.left < aRect.right &&
        bRect.right > aRect.left
      ) {
        if (game.contains(alien)) game.removeChild(alien);
        if (game.contains(bullet)) game.removeChild(bullet);
		alienHitSound.currentTime = 0;
        alienHitSound.play();
        aliens.splice(ai, 1);
        bullets.splice(index, 1);
        score += 10;
        scoreEl.textContent = `Score: ${score}`;
      }
    });
  });
}

let alienDir = 1;

function moveAliens() {
  let alienSpeed = 10 + (wave - 1) * 2.5; // Speed increases slightly each wave

  aliens.forEach(alien => {
    let left = parseInt(alien.style.left);
    alien.style.left = `${left + alienDir * alienSpeed}px`;
  });

  const hitEdge = aliens.some(alien => {
    let left = parseInt(alien.style.left);
    return left <= 0 || left >= rightBoundary;
  });

  if (hitEdge) {
    alienDir *= -1;
    aliens.forEach(alien => {
      let top = parseInt(alien.style.top);
      alien.style.top = `${top + 20}px`;
    });
  }

  aliens.forEach(alien => {
    let top = parseInt(alien.style.top);
    if (top > 450) {
      endGame(false);
	  gameOverSound.currentTime = 0;
      gameOverSound.play();
    }
  });

  if (aliens.length === 0) {
    waveClearSound.currentTime = 0;
    waveClearSound.play();

    wave++;
	
	showWaveBanner(wave);

    aliens.forEach(alien => alien.remove());
    aliens.length = 0;

    createAliens(wave);
  }
  
  if (wave > 10) {
	  endGame(true);
  }
}


function endGame(won) {
  if (score > highScore) {
    localStorage.setItem("highscore", score);
    highscoreEl.textContent = `High Score: ${score}`;
  }

  modal.style.display = 'flex';
  modalMsg.textContent = won ? "You Win!" : "Game Over!";
	
  if (!won) {
    gameOverSound.currentTime = 0;
    gameOverSound.play();
  }

  // Add or remove red class based on win or lose
  if (won) {
      modalContent.classList.remove('red');
      modalContent.classList.add('green'); // Optional: if you have a green class for "You Win!"
  } else {
      modalContent.classList.remove('green');
      modalContent.classList.add('red');
}


  clearInterval(alienInterval);
  clearInterval(bulletInterval);
  clearInterval(alienShootInterval);
  clearInterval(alienBulletMoveInterval);
}

function updateLives() {
  livesEl.textContent = `Lives: ${lives}`;
}

// Controls
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') movePlayer(-20, 0);
  if (e.key === 'ArrowRight') movePlayer(20, 0);
  if (e.key === 'ArrowUp') movePlayer(0, -20);
  if (e.key === 'ArrowDown') movePlayer(0, 20);
  if (e.key === ' ') shootBullet();
});


playAgainBtn.addEventListener('click', () => {
  modal.style.display = 'none';

  // Clear all intervals
  clearInterval(alienInterval);
  clearInterval(bulletInterval);
  clearInterval(alienShootInterval);
  clearInterval(alienBulletMoveInterval);

  // Remove alien bullets from the DOM and array
  alienBullets.forEach(bullet => {
    if (game.contains(bullet)) game.removeChild(bullet);
  });
  alienBullets = [];

  // Reset game state
  resetGameState();

  // Restart intervals
  alienInterval = setInterval(moveAliens, 500);
  bulletInterval = setInterval(moveBullets, 50);
  alienShootInterval = setInterval(alienShoot, 1000);
  alienBulletMoveInterval = setInterval(moveAlienBullets, 30);
});

restartBtn.addEventListener('click', () => {
  localStorage.removeItem("highscore");
  location.reload();
});

pauseBtn.addEventListener('click', () => {
  if (!isPaused) {
    clearInterval(alienInterval);
    clearInterval(bulletInterval);
    clearInterval(alienShootInterval);
    clearInterval(alienBulletMoveInterval);
    pauseModal.style.display = 'flex';
    isPaused = true;
  }
});

resumeBtn.addEventListener('click', () => {
  pauseModal.style.display = 'none';
  if (isPaused) {
    alienInterval = setInterval(moveAliens, 500);
    bulletInterval = setInterval(moveBullets, 50);
	alienShootInterval = setInterval(alienShoot, 1000);
    alienBulletMoveInterval = setInterval(moveAlienBullets, 30);
    isPaused = false;
  }
});

pauseRestartBtn.addEventListener('click', () => {
  localStorage.removeItem("highscore");
  location.reload();
});

// Init game
createAliens();
let alienInterval = setInterval(moveAliens, 500);
let bulletInterval = setInterval(moveBullets, 50);
let alienShootInterval = setInterval(alienShoot, 1000);
let alienBulletMoveInterval = setInterval(moveAlienBullets, 30);


const connectSidebar = document.getElementById('connect-sidebar');
const connectToggle = document.getElementById('connect-toggle');

connectToggle.addEventListener('click', () => {
  connectSidebar.classList.toggle('expanded');
  connectSidebar.classList.toggle('collapsed');
});



