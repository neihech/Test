(() => {
  const canvas = document.getElementById('heartsCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);

  class Heart {
    constructor() {
      this.x = Math.random() * width;
      this.y = -20;
      this.size = 10 + Math.random() * 15;
      this.speedY = 1 + Math.random() * 2;
      this.speedX = (Math.random() - 0.5) * 1;
      this.opacity = 0.7 + Math.random() * 0.3;
      this.angle = Math.random() * 2 * Math.PI;
      this.angleSpeed = (Math.random() - 0.5) * 0.05;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = '#ff4d6d';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(0, -this.size / 2, -this.size, -this.size / 2, -this.size, 0);
      ctx.bezierCurveTo(-this.size, this.size / 2, 0, this.size, 0, this.size * 1.5);
      ctx.bezierCurveTo(0, this.size, this.size, this.size / 2, this.size, 0);
      ctx.bezierCurveTo(this.size, -this.size / 2, 0, -this.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.angle += this.angleSpeed;

      if (this.y > height + this.size) {
        this.x = Math.random() * width;
        this.y = -20;
        this.speedY = 1 + Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 1;
        this.opacity = 0.7 + Math.random() * 0.3;
        this.size = 10 + Math.random() * 15;
        this.angle = Math.random() * 2 * Math.PI;
        this.angleSpeed = (Math.random() - 0.5) * 0.05;
      }
    }
  }

  function init() {
    resize();
    const hearts = [];
    const maxHearts = 40;

    for(let i = 0; i < maxHearts; i++) {
      hearts.push(new Heart());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      hearts.forEach(heart => {
        heart.update();
        heart.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }

  window.addEventListener('DOMContentLoaded', init);
})();
