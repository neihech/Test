// ====== 100 причин ======
const reasonsBox = document.getElementById('reasonsBox');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const reasonsList = document.getElementById('reasonsList');

const reasons = [
  "Ты всегда заставляешь меня улыбаться.",
  "Твои глаза сияют, когда ты счастлива.",
  "Ты умеешь слушать и понимать меня.",
  "Твой смех — моя любимая музыка.",
  "Ты делаешь мою жизнь ярче.",
  // ... добавь сюда еще 95 причин
];

// Для примера повторим первые 20 причин
while (reasons.length < 100) {
  reasons.push(...reasons.slice(0, 20));
}
reasons.length = 100; // обрезаем лишние

reasons.forEach(reason => {
  const li = document.createElement('li');
  li.textContent = reason;
  reasonsList.appendChild(li);
});

reasonsBox.onclick = () => {
  modal.style.display = 'block';
};
closeModal.onclick = () => {
  modal.style.display = 'none';
};
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = 'none';
};

// ====== Музыка ======

const audio = document.getElementById('audio');
const playPause = document.getElementById('playPause');
const progress = document.getElementById('progress');
const currentTime = document.getElementById('currentTime');
const duration = document.getElementById('duration');

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' + s : s}`;
}

audio.onloadedmetadata = () => {
  duration.textContent = formatTime(audio.duration);
  progress.max = Math.floor(audio.duration);
};

audio.ontimeupdate = () => {
  progress.value = Math.floor(audio.currentTime);
  currentTime.textContent = formatTime(audio.currentTime);
};

playPause.onclick = () => {
  if (audio.paused) {
    audio.play();
    playPause.textContent = '⏸️';
  } else {
    audio.pause();
    playPause.textContent = '▶️';
  }
};

progress.oninput = () => {
  audio.currentTime = progress.value;
};

// ====== Пазл ======

const puzzle = document.getElementById('puzzle');
const size = 3;
let pieces = [];

function createPuzzle() {
  const positions = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      positions.push({ row, col });
    }
  }
  const shuffled = shuffle([...positions]);
  puzzle.innerHTML = '';
  pieces = [];

  shuffled.forEach((pos, index) => {
    const piece = document.createElement('div');
    piece.classList.add('puzzle-piece');
    piece.style.backgroundImage = 'url("img/photo_2025-06-02_01-52-05.jpg")';
    piece.style.backgroundPosition = `${-pos.col * 100 / (size - 1)}% ${-pos.row * 100 / (size - 1)}%`;
    piece.style.gridRowStart = Math.floor(index / size) + 1;
    piece.style.gridColumnStart = index % size + 1;
    piece.dataset.correctRow = pos.row;
    piece.dataset.correctCol = pos.col;
    pieces.push(piece);
    puzzle.appendChild(piece);
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let draggingPiece = null;
let startX, startY;

puzzle.addEventListener('mousedown', startDrag);
puzzle.addEventListener('touchstart', startDrag, { passive: false });

function startDrag(e) {
  if (!e.target.classList.contains('puzzle-piece')) return;

  draggingPiece = e.target;
  draggingPiece.classList.add('dragging');

  const rect = draggingPiece.getBoundingClientRect();
  startX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  startY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag, { passive: false });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
}

function onDrag(e) {
  if (!draggingPiece) return;

  e.preventDefault();
  let clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let clientY = e.touches ? e.touches[0].clientY : e.clientY;

  draggingPiece.style.position = 'absolute';
  draggingPiece.style.zIndex = 1000;
  draggingPiece.style.left = clientX - startX + 'px';
  draggingPiece.style.top = clientY - startY + 'px';
}

function endDrag(e) {
  if (!draggingPiece) return;

  // Найдем, над каким кусочком отпустили
  draggingPiece.style.display = 'none';
  const dropTarget = document.elementFromPoint(
    e.changedTouches ? e.changedTouches[0].clientX : e.clientX,
    e.changedTouches ? e.changedTouches[0].clientY : e.clientY
  );
  draggingPiece.style.display = '';

  if (dropTarget && dropTarget.classList.contains('puzzle-piece') && dropTarget !== draggingPiece) {
    // Обменять gridRow и gridColumn
    const row1 = draggingPiece.style.gridRowStart;
    const col1 = draggingPiece.style.gridColumnStart;
    const row2 = dropTarget.style.gridRowStart;
    const col2 = dropTarget.style.gridColumnStart;

    draggingPiece.style.gridRowStart = row2;
    draggingPiece.style.gridColumnStart = col2;
    dropTarget.style.gridRowStart = row1;
    dropTarget.style.gridColumnStart = col1;
  }

  // Сброс позиции
  draggingPiece.style.position = '';
  draggingPiece.style.left = '';
  draggingPiece.style.top = '';
  draggingPiece.style.zIndex = '';
  draggingPiece.classList.remove('dragging');
  draggingPiece = null;

  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchend', endDrag);

  checkWin();
}

function checkWin() {
  for (let piece of pieces) {
    const currentIndex = (piece.style.gridRowStart - 1) * size + (+piece.style.gridColumnStart - 1);
    const correctIndex = piece.dataset.correctRow * size + +piece.dataset.correctCol;
    if (currentIndex !== correctIndex) return;
  }
  alert('Поздравляю! Ты собрала пазл 🎉');
}

createPuzzle();


// Подписка на события

puzzle.addEventListener('mousedown', onDragStart);
puzzle.addEventListener('touchstart', onDragStart, { passive: false });

window.addEventListener('mousemove', onDragMove);
window.addEventListener('touchmove', onDragMove, { passive: false });

window.addEventListener('mouseup', onDragEnd);
window.addEventListener('touchend', onDragEnd);

// ====== Кнопка "Я тебя люблю" + конфетти ======

const loveBtn = document.getElementById('loveBtn');
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');

let confettiPieces = [];

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

class ConfettiPiece {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = randomRange(5, 10);
    this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
    this.speedX = randomRange(-2, 2);
    this.speedY = randomRange(-5, -1);
    this.gravity = 0.1;
    this.opacity = 1;
    this.damping = 0.98;
  }
  update() {
    this.speedY += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedX *= this.damping;
    this.speedY *= this.damping;
    this.opacity -= 0.02;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach((p, i) => {
    p.update();
    p.draw(ctx);
    if (p.opacity <= 0) {
      confettiPieces.splice(i, 1);
    }
  });
  requestAnimationFrame(animateConfetti);
}
animateConfetti();

loveBtn.onclick = () => {
  const rect = loveBtn.getBoundingClientRect();
  for (let i = 0; i < 30; i++) {
    confettiPieces.push(new ConfettiPiece(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    ));
  }
};

// ====== Анимация сердечек ======

const heartsCanvas = document.querySelector('.hearts');
const heartsCtx = heartsCanvas.getContext('2d');
let hearts = [];

function resizeHeartsCanvas() {
  heartsCanvas.width = window.innerWidth;
  heartsCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeHeartsCanvas);
resizeHeartsCanvas();

class Heart {
  constructor() {
    this.x = Math.random() * heartsCanvas.width;
    this.y = heartsCanvas.height + 20;
    this.size = randomRange(10, 25);
    this.speed = randomRange(1, 3);
    this.opacity = randomRange(0.3, 0.8);
    this.swing = Math.random() * 2 * Math.PI;
    this.swingSpeed = 0.02;
  }
  update() {
    this.y -= this.speed;
    this.x += Math.sin(this.swing) * 0.5;
    this.swing += this.swingSpeed;
    if (this.y + this.size < 0) {
      this.x = Math.random() * heartsCanvas.width;
      this.y = heartsCanvas.height + 20;
      this.opacity = randomRange(0.3, 0.8);
      this.speed = randomRange(1, 3);
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#ff4d6d';
    ctx.beginPath();
    const x = this.x;
    const y = this.y;
    const size = this.size;
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y - size / 2, x - size / 2, y - size / 2, x - size / 2, y);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size / 1.5, x, y + size);
    ctx.bezierCurveTo(x, y + size / 1.5, x + size / 2, y + size / 2, x + size / 2, y);
    ctx.bezierCurveTo(x + size / 2, y - size / 2, x, y - size / 2, x, y);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 30; i++) {
  hearts.push(new Heart());
}

function animateHearts() {
  heartsCtx.clearRect(0, 0, heartsCanvas.width, heartsCanvas.height);
  hearts.forEach(h => {
    h.update();
    h.draw(heartsCtx);
  });
  requestAnimationFrame(animateHearts);
}
animateHearts();

document.getElementById('feedbackForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const msg = document.getElementById('message').value.trim();
  if (msg.length === 0) return;

  // Пока просто показываем благодарность и очищаем поле
  document.getElementById('thankYou').style.display = 'block';
  this.reset();

  // Здесь можно добавить сохранение сообщения в localStorage или отправку через API, если будет
  console.log('Сообщение:', msg);
});
