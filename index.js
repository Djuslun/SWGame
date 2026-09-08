const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const scoreElement = document.getElementById("ui");

let width;
let height;

const REFERENCE_HEIGHT = 800;
const TARGET_FPS = 60;

let ship;
let asteroids;
let score;
let difficulty;
let spawnTimer;
let gameRunning;
let lastTime;

// Загрузка изображения астероида
const asteroidImage = new Image();
asteroidImage.src = './assets/asteroid.png';

// Загрузка изображения курсора
const cursorImage = new Image();
cursorImage.src = './assets/cursor.svg';

// Переключатель для отображения хитбоксов (ВЫКЛЮЧЕН)
let showHitboxes = false;

// Переменные для туториала
let tutorialActive = false;
let tutorialShipX = 0;
let tutorialAsteroids = [];
let tutorialTime = 0;

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function showScore(visible) {
    scoreElement.classList[visible ? 'add' : 'remove']('visible')
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function init() {
    ship = {
        x: width / 2,
        targetX: width / 2,
        y: height - 150,
        size: 22
    };

    asteroids = [];

    score = 0;
    difficulty = 6;
    spawnTimer = 0;
    gameRunning = false;
    lastTime = null;

    scoreEl.textContent = score;
    gameOverEl.style.display = "none";
    showScore(true);
}

function createAsteroid() {
    const radius = 15 + Math.random() * 25;
    const baseSpeed = 2 + Math.random() * difficulty;

    asteroids.push({
        x: Math.random() * width,
        y: -radius,
        r: radius,
        speed: baseSpeed * TARGET_FPS * (height / REFERENCE_HEIGHT),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (0.5 + Math.random() * 1.5) * (Math.random() > 0.5 ? 1 : -1)
    });
}

function drawShip() {
    ctx.save();
    ctx.translate(ship.x, ship.y);

    // X-WING — основной корпус
    ctx.fillStyle = "#e5edf8";

    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(11, 15);
    ctx.lineTo(0, 9);
    ctx.lineTo(-11, 15);
    ctx.closePath();
    ctx.fill();

    // Крылья
    ctx.fillStyle = "#5e9bca";
    ctx.fillRect(-28, 0, 56, 6);

    // Двигатели / нижние элементы
    ctx.fillStyle = "#9ab5cc";
    ctx.fillRect(-21, 8, 14, 4);
    ctx.fillRect(7, 8, 14, 4);

    ctx.restore();
}

function drawTutorialShip(x, y) {
    ctx.save();
    ctx.translate(x, y);

    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#e5edf8";

    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(11, 15);
    ctx.lineTo(0, 9);
    ctx.lineTo(-11, 15);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#5e9bca";
    ctx.fillRect(-28, 0, 56, 6);

    ctx.fillStyle = "#9ab5cc";
    ctx.fillRect(-21, 8, 14, 4);
    ctx.fillRect(7, 8, 14, 4);

    ctx.globalAlpha = 1.0;

    ctx.restore();
}

function drawTutorialAsteroid(asteroid) {
    ctx.save();

    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);
    ctx.globalAlpha = 0.5;

    if (asteroidImage.complete && asteroidImage.naturalWidth > 0) {
        const size = asteroid.r * 2;
        ctx.drawImage(
            asteroidImage,
            -size / 2,
            -size / 2,
            size,
            size
        );
    } else {
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
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
}

function drawAsteroid(asteroid) {
    ctx.save();

    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);

    if (asteroidImage.complete && asteroidImage.naturalWidth > 0) {
        const size = asteroid.r * 2;
        ctx.drawImage(
            asteroidImage,
            -size / 2,
            -size / 2,
            size,
            size
        );
    } else {
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
    }

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

// Функция для рисования курсора из изображения с измененными пропорциями
function drawCursor(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Размер курсора с измененными пропорциями
    const cursorWidth = 42;  // 60 * 0.7 = 42 (уменьшено на 30%)
    const cursorHeight = 78; // 60 * 1.3 = 78 (увеличено на 30%)

    // Проверяем, загрузилось ли изображение
    if (cursorImage.complete && cursorImage.naturalWidth > 0) {
        // Рисуем изображение курсора с измененными пропорциями
        ctx.drawImage(
            cursorImage,
            -cursorWidth / 2,
            -cursorHeight / 2,
            cursorWidth,
            cursorHeight
        );

        // Добавляем эффект свечения
        ctx.shadowColor = "rgba(0, 212, 255, 0.3)";
        ctx.shadowBlur = 20;
        ctx.drawImage(
            cursorImage,
            -cursorWidth / 2,
            -cursorHeight / 2,
            cursorWidth,
            cursorHeight
        );
    } else {
        // Fallback: рисуем простой курсор, если изображение не загрузилось
        const size = 28;
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(0, size * 0.6);
        ctx.lineTo(size * 0.3, 0);
        ctx.lineTo(0, -size * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(0, size * 0.6);
        ctx.lineTo(size * 0.3, 0);
        ctx.lineTo(0, -size * 0.6);
        ctx.closePath();
        ctx.stroke();
    }

    ctx.restore();
}

function checkCirclePolygonCollision(circleX, circleY, circleRadius, polygonPoints) {
    let inside = false;
    const n = polygonPoints.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = polygonPoints[i].x;
        const yi = polygonPoints[i].y;
        const xj = polygonPoints[j].x;
        const yj = polygonPoints[j].y;

        const intersect = ((yi > circleY) !== (yj > circleY)) &&
            (circleX < (xj - xi) * (circleY - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    if (inside) return true;

    for (let i = 0; i < n; i++) {
        const p1 = polygonPoints[i];
        const p2 = polygonPoints[(i + 1) % n];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lenSq = dx * dx + dy * dy;

        let t = ((circleX - p1.x) * dx + (circleY - p1.y) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = p1.x + t * dx;
        const closestY = p1.y + t * dy;

        const distX = circleX - closestX;
        const distY = circleY - closestY;
        const dist = Math.sqrt(distX * distX + distY * distY);

        if (dist < circleRadius) return true;
    }

    return false;
}

function checkCollision(asteroid) {
    const shipPoints = [
        {x: 0, y: -30},
        {x: 11, y: 15},
        {x: 28, y: 3},
        {x: 28, y: -3},
        {x: 11, y: 9},
        {x: 0, y: 18},
        {x: -11, y: 9},
        {x: -28, y: -3},
        {x: -28, y: 3},
        {x: -11, y: 15}
    ];

    const worldPoints = shipPoints.map(p => ({
        x: p.x + ship.x,
        y: p.y + ship.y
    }));

    const asteroidRadius = asteroid.r * 0.85;

    return checkCirclePolygonCollision(
        asteroid.x,
        asteroid.y,
        asteroidRadius,
        worldPoints
    );
}

function gameOver() {
    gameRunning = false;

    finalScoreEl.textContent =
        `Ваш результат: ${score}`;

    gameOverEl.style.display = "flex";
    showScore(false)
}

// Функция возврата в главное меню
function goToMainMenu() {
    gameOverEl.style.display = "none";
    startScreen.style.display = "flex";
    showScore(false);
    gameRunning = false;
}

window.goToMainMenu = goToMainMenu;

function restartGame() {
    init();
    gameRunning = true;
    requestAnimationFrame(update);
    showScore(true)
}

window.restartGame = restartGame;

// Функция для запуска туториала
function startTutorial() {
    tutorialActive = true;
    tutorialShipX = width / 2;
    tutorialAsteroids = [];
    tutorialTime = 0;

    for (let i = 0; i < 3; i++) {
        tutorialAsteroids.push({
            x: Math.random() * width,
            y: -30 - Math.random() * 200,
            r: 20 + Math.random() * 20,
            speed: 1 + Math.random() * 2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (0.5 + Math.random() * 1.5) * (Math.random() > 0.5 ? 1 : -1)
        });
    }

    requestAnimationFrame(updateTutorial);
}

function updateTutorial(timestamp) {
    if (!tutorialActive) return;

    tutorialTime += 1/60;

    // Уменьшенная скорость анимации (было 1.5, стало 0.8)
    const animationSpeed = 0.8;

    // Анимация корабля
    const shipX = width / 2 + Math.sin(tutorialTime * animationSpeed) * (width * 0.35);
    tutorialShipX = shipX;

    // Анимация курсора (следит за кораблем с небольшим отставанием)
    const cursorX = width / 2 + Math.sin(tutorialTime * animationSpeed - 0.2) * (width * 0.32);
    const cursorY = height - 150 - 70;

    // Обновляем астероиды
    for (let i = tutorialAsteroids.length - 1; i >= 0; i--) {
        const asteroid = tutorialAsteroids[i];
        asteroid.y += asteroid.speed * 0.8; // Уменьшена скорость астероидов в туториале
        asteroid.rotation += asteroid.rotationSpeed * 0.02;

        if (asteroid.y > height + 100) {
            asteroid.y = -30 - Math.random() * 200;
            asteroid.x = Math.random() * width;
            asteroid.speed = 0.8 + Math.random() * 1.6; // Медленнее
        }
    }

    ctx.clearRect(0, 0, width, height);
    drawStars();

    for (const asteroid of tutorialAsteroids) {
        drawTutorialAsteroid(asteroid);
    }

    drawTutorialShip(tutorialShipX, height - 150);

    // Рисуем курсор из изображения с измененными пропорциями
    const cursorAngle = Math.atan2(
        tutorialShipX - cursorX,
        (height - 150) - cursorY
    );
    drawCursor(cursorX, cursorY, cursorAngle);

    // Декоративные линии движения курсора
    ctx.save();
    ctx.strokeStyle = "rgba(0, 212, 255, 0.12)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    const trailLength = 40 + Math.sin(tutorialTime * 1.5) * 20; // Уменьшена скорость мерцания
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY + 30);
    ctx.lineTo(cursorX + Math.sin(tutorialTime * 1.5) * 30, cursorY + 30 + trailLength);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Текст туториала
    ctx.save();

    const maxTextWidth = Math.min(width * 0.7, 500);
    const textY = Math.min(50, height * 0.08);

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    const padding = 20;

    ctx.font = "bold 18px Arial";
    const titleWidth = ctx.measureText("👆 УПРАВЛЕНИЕ").width;

    ctx.font = "15px Arial";
    const text1 = "Ведите пальцем влево-вправо,";
    const text2 = "чтобы управлять кораблём";
    const text3 = "Уклоняйтесь от астероидов и набирайте очки!";

    const textWidth1 = ctx.measureText(text1).width;
    const textWidth2 = ctx.measureText(text2).width;
    const textWidth3 = ctx.measureText(text3).width;
    const maxTextWidthActual = Math.max(titleWidth, textWidth1, textWidth2, textWidth3);

    const blockWidth = Math.min(maxTextWidthActual + padding * 2, width - 40);
    const blockHeight = 30 + 24 + 24 + 24 + padding * 2;
    const blockX = (width - blockWidth) / 2;

    ctx.fillRect(blockX, textY, blockWidth, blockHeight);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#00d4ff";
    ctx.font = "bold 18px Arial";
    ctx.fillText("👆 УПРАВЛЕНИЕ", width/2, textY + 25);

    ctx.fillStyle = "white";
    ctx.font = "15px Arial";
    let currentY = textY + 50;

    ctx.fillText(text1, width/2, currentY);
    currentY += 24;

    ctx.fillText(text2, width/2, currentY);
    currentY += 24;

    ctx.fillText(text3, width/2, currentY);

    // Мигающая подсказка с уменьшенной скоростью
    ctx.fillStyle = "rgba(0, 212, 255, 0.8)";
    ctx.font = "bold 16px Arial";
    const pulseAlpha = 0.5 + Math.sin(tutorialTime * 1.5) * 0.5; // Уменьшена скорость мигания
    ctx.globalAlpha = pulseAlpha;
    const hintY = height - 50;
    ctx.fillText("👆 Коснитесь экрана, чтобы начать игру", width/2, hintY);
    ctx.globalAlpha = 1.0;

    ctx.restore();

    requestAnimationFrame(updateTutorial);
}

function startGame() {
    tutorialActive = false;
    startScreen.style.display = "none";
    init();
    gameRunning = true;
    requestAnimationFrame(update);
}

function handleTutorialTap() {
    if (tutorialActive) {
        startGame();
    }
}

function update(timestamp) {
    if (!gameRunning) return;

    if (lastTime === null) {
        lastTime = timestamp;
        requestAnimationFrame(update);
        return;
    }

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, width, height);

    drawStars();

    const lerpFactor = 1 - Math.pow(1 - 0.1, dt * TARGET_FPS);
    ship.x += (ship.targetX - ship.x) * lerpFactor;

    // Корректировка сложности в зависимости от счета
    if (score < 50) {
        difficulty += 0.003 * TARGET_FPS * dt;
    } else if (score < 100) {
        difficulty += 0.008 * TARGET_FPS * dt;
    } else {
        difficulty += 0.015 * TARGET_FPS * dt;
    }

    spawnTimer += dt;

    let spawnInterval;
    if (score < 50) {
        spawnInterval = Math.max(20, 60 - difficulty * 1.8) / TARGET_FPS;
    } else if (score < 100) {
        spawnInterval = Math.max(15, 60 - difficulty * 2.2) / TARGET_FPS;
    } else {
        spawnInterval = Math.max(10, 60 - difficulty * 2.8) / TARGET_FPS;
    }

    if (spawnTimer >= spawnInterval) {
        spawnTimer = 0;
        createAsteroid();

        if (score > 50 && Math.random() < 0.2) {
            createAsteroid();
        }
        if (score > 100 && Math.random() < 0.3) {
            createAsteroid();
        }
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];

        asteroid.y += asteroid.speed * dt;
        asteroid.rotation += asteroid.rotationSpeed * dt;

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
    if (tutorialActive) {
        e.preventDefault();
        handleTutorialTap();
        return;
    }
    if (!gameRunning) return;
    moveShip(e.touches[0].clientX);
});

canvas.addEventListener("touchmove", e => {
    if (tutorialActive) {
        e.preventDefault();
        return;
    }
    if (!gameRunning) return;
    e.preventDefault();
    moveShip(e.touches[0].clientX);
});

canvas.addEventListener("mousemove", e => {
    if (tutorialActive) return;
    if (!gameRunning) return;
    moveShip(e.clientX);
});

canvas.addEventListener("click", e => {
    if (tutorialActive) {
        handleTutorialTap();
    }
});

startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    startTutorial();
});