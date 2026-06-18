const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");

let width;
let height;

let ship;
let asteroids;
let score;
let difficulty;
let spawnTimer;
let gameRunning;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function init() {
    ship = {
        x: width / 2,
        targetX: width / 2,
        y: height - 120,
        size: 22
    };

    asteroids = [];

    score = 0;
    difficulty = 1;
    spawnTimer = 0;
    gameRunning = false;

    scoreEl.textContent = score;
    gameOverEl.style.display = "none";
}

function createAsteroid() {
    const radius = 15 + Math.random() * 25;

    asteroids.push({
        x: Math.random() * width,
        y: -radius,
        r: radius,
        speed: 2 + Math.random() * difficulty * 0.8,
        rotation: Math.random() * Math.PI * 2
    });
}

function drawShip() {
    ctx.save();
    ctx.translate(ship.x, ship.y);

    ctx.fillStyle = "#00d4ff";

    ctx.beginPath();
    ctx.moveTo(0, -ship.size);
    ctx.lineTo(ship.size * 0.7, ship.size);
    ctx.lineTo(0, ship.size * 0.4);
    ctx.lineTo(-ship.size * 0.7, ship.size);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(0, -4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawAsteroid(asteroid) {
    ctx.save();

    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);

    ctx.fillStyle = "#888";

    ctx.beginPath();

    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const distance = asteroid.r * (0.75 + Math.random() * 0.3);

        const px = Math.cos(angle) * distance;
        const py = Math.sin(angle) * distance;

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawStars() {
    ctx.fillStyle = "white";

    for (let i = 0; i < 50; i++) {
        const x = (i * 137) % width;
        const y = (i * 311 + score * 2) % height;

        ctx.fillRect(x, y, 2, 2);
    }
}

function checkCollision(asteroid) {
    const dx = ship.x - asteroid.x;
    const dy = ship.y - asteroid.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < asteroid.r + ship.size * 0.8;
}

function gameOver() {
    gameRunning = false;

    finalScoreEl.textContent =
        `Ваш результат: ${score}`;

    gameOverEl.style.display = "flex";
}

function restartGame() {
    init();
    gameRunning = true;
    update();
}

window.restartGame = restartGame;

function update() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, width, height);

    drawStars();

    const moveSpeed = 0.1;

    ship.x += (ship.targetX - ship.x) * moveSpeed;

    difficulty += 0.0015;

    spawnTimer++;

    const spawnRate =
        Math.max(18, 60 - difficulty * 2);

    if (spawnTimer > spawnRate) {
        spawnTimer = 0;
        createAsteroid();
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];

        asteroid.y += asteroid.speed;
        asteroid.rotation += 0.02;

        drawAsteroid(asteroid);

        if (checkCollision(asteroid)) {
            gameOver();
            return;
        }

        if (asteroid.y > height + 100) {
            asteroids.splice(i, 1);

            score++;
            scoreEl.textContent = score;
        }
    }

    drawShip();

    requestAnimationFrame(update);
}

function moveShip(x) {
    ship.targetX = x;

    if (ship.targetX < ship.size) {
        ship.targetX = ship.size;
    }

    if (ship.targetX > width - ship.size) {
        ship.targetX = width - ship.size;
    }
}

canvas.addEventListener("touchstart", e => {
    moveShip(e.touches[0].clientX);
});

canvas.addEventListener("touchmove", e => {
    moveShip(e.touches[0].clientX);
});

canvas.addEventListener("mousemove", e => {
    moveShip(e.clientX);
});

startButton.addEventListener("click", () => {
    startScreen.style.display = "none";

    init();
    gameRunning = true;

    update();
});