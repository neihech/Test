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
let draggingPiece = null;
let offsetX = 0;
let offsetY = 0;

function createPositions() {
  let pos = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      pos.push({ row, col });
    }
  }
  return pos;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createPuzzle() {
  const positions = createPositions();
  const shuffled = shuffle([...positions]);

  puzzle.innerHTML = '';
  pieces = [];

  shuffled.forEach((pos, index) => {
    const piece = document.createElement('div');
    piece.classList.add('puzzle-piece');
    piece.style.backgroundImage = 'url("img/photo_2025-06-02_01-52-05.jpg")';
    piece.style.backgroundPosition = `${-pos.col * 100 / (size - 1)}% ${-pos.row * 100 / (size - 1)}%`;
    piece.dataset.correctRow = pos.row;
    piece.dataset.correctCol = pos.col;
    piece.dataset.currentIndex = index;

    puzzle.appendChild(piece);
    pieces.push(piece);
  });
}

createPuzzle();

// Drag & Drop и Touch

function onDragStart(e) {
  if (e.target.classList.contains('puzzle-piece')) {
    draggingPiece = e.target;
    draggingPiece.classList.add('dragging');

    const rect = draggingPiece.getBoundingClientRect();
    if (e.type.startsWith('touch')) {
      offsetX = e.touches[0].clientX - rect.left;
      offsetY = e.touches[0].clientY - rect.top;
    } else {
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    }

    draggingPiece.style.position = 'absolute';
    draggingPiece.style.zIndex = 1000;
    moveAt(e);
  }
  e.preventDefault();
}

function moveAt(e) {
  let clientX, clientY;
  if (e.type.startsWith('touch')) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  draggingPiece.style.left = clientX - offsetX + 'px';
  draggingPiece.style.top = clientY - offsetY + 'px';
}

function onDragMove(e) {
  if (!draggingPiece) return;
  moveAt(e);
  e.preventDefault();
}

function onDragEnd(e) {
  if (!draggingPiece) return;

  // Найдем элемент под указателем
  draggingPiece.style.display = 'none';
  let elemBelow = document.elementFromPoint(
    e.type.startsWith('touch') ? e.changedTouches[0].clientX : e.clientX,
    e.type.startsWith('touch') ? e.changedTouches[0].clientY : e.clientY
  );
  draggingPiece.style.display = '';

  if (!elemBelow) {
    resetPiece();
    return;
  }

  // Если под указателем другая часть пазла — меняем их местами
  if (elemBelow.classList.contains('puzzle-piece') && elemBelow !== draggingPiece) {
    const index1 = pieces.indexOf(draggingPiece);
    const index2 = pieces.indexOf(elemBelow);

    puzzle.insertBefore(draggingPiece, pieces[index2]);
    puzzle.insertBefore(elemBelow, pieces[index1]);

    pieces[index1] = elemBelow;
    pieces[index2] = draggingPiece;
  } else {
    resetPiece();
  }

  draggingPiece.classList.remove('dragging');
  draggingPiece.style.position = '';
  draggingPiece.style.left = '';
  draggingPiece.style.top = '';
  draggingPiece.style.zIndex = '';

  draggingPiece = null;

  checkWin();
  e.preventDefault();
}

function resetPiece() {
  draggingPiece.style.position = '';
  draggingPiece.style.left = '';
  draggingPiece.style.top = '';
  draggingPiece.style.zIndex = '';
}

function checkWin() {
  for (let i = 0; i < pieces.length; i++) {
    const correctIndex = pieces[i].dataset.correctRow * size + +pieces[i].dataset.correctCol;
    if (i !== correctIndex) return;
  }
  alert('Поздравляю! Ты собрала пазл 🎉');
}

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