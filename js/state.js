// state.js
export let width;
export let height;
export let ship;
export let asteroids = [];
export let score = 0;
export let difficulty = 5;
export let spawnTimer = 0;
export let gameRunning = false;
export let lastTime = null;
export let tutorialActive = false;
export let tutorialShipX = 0;
export let tutorialAsteroids = [];
export let tutorialTime = 0;
export let isTouchingShip = false;
export let touchOffsetX = 0;
export let shield = null;
export let hasShield = false;
export let shieldCollected = false;
export let shieldSpawned = false;
export let starField = []; // Массив звезд

export function setWidth(value) { width = value; }
export function setHeight(value) { height = value; }
export function setShip(value) { ship = value; }
export function setAsteroids(value) { asteroids = value; }
export function setScore(value) { score = value; }
export function setDifficulty(value) { difficulty = value; }
export function setSpawnTimer(value) { spawnTimer = value; }
export function setGameRunning(value) { gameRunning = value; }
export function setLastTime(value) { lastTime = value; }
export function setTutorialActive(value) { tutorialActive = value; }
export function setTutorialShipX(value) { tutorialShipX = value; }
export function setTutorialAsteroids(value) { tutorialAsteroids = value; }
export function setTutorialTime(value) { tutorialTime = value; }
export function setIsTouchingShip(value) { isTouchingShip = value; }
export function setTouchOffsetX(value) { touchOffsetX = value; }
export function setShield(value) { shield = value; }
export function setHasShield(value) { hasShield = value; }
export function setShieldCollected(value) { shieldCollected = value; }
export function setShieldSpawned(value) { shieldSpawned = value; }
export function setStarField(value) { starField = value; }

// Функция для инициализации звездного поля
export function initStarField(width, height) {
    starField = [];
    const starCount = 150;
    const starColors = [
        'rgba(255, 255, 255, 1)',
        'rgba(255, 255, 200, 0.9)',
        'rgba(200, 220, 255, 0.8)',
        'rgba(255, 200, 200, 0.7)',
        'rgba(200, 255, 200, 0.6)',
        'rgba(255, 200, 150, 0.5)',
    ];
    const starSizes = [1, 1.5, 2, 2.5, 3];

    for (let i = 0; i < starCount; i++) {
        const seed1 = (i * 137.508) % 1;
        const seed2 = (i * 97.31) % 1;
        const seed3 = (i * 53.7) % 1;

        starField.push({
            x: (i * 137.508 + seed1 * 100) % width,
            y: (i * 97.31 + seed2 * 100) % height,
            size: starSizes[Math.floor(seed2 * starSizes.length)],
            color: starColors[Math.floor(seed1 * starColors.length)],
            brightness: 0.6 + seed3 * 0.4,
            twinkleSpeed: 0.5 + seed3 * 2,
            twinkleOffset: seed1 * Math.PI * 2,
            isGiant: false
        });
    }

    // Добавляем звезды-гиганты
    const giantStarCount = 8;
    const giantColors = ['rgba(255, 200, 150, 0.8)', 'rgba(200, 220, 255, 0.9)', 'rgba(255, 255, 255, 1)'];
    for (let i = 0; i < giantStarCount; i++) {
        const seed = (i * 257.3) % 1;
        starField.push({
            x: (i * 317.5 + seed * 150) % width,
            y: (i * 173.2 + seed * 120) % height,
            size: 4 + seed * 6,
            color: giantColors[i % giantColors.length],
            brightness: 0.8 + seed * 0.2,
            twinkleSpeed: 0.3 + seed * 0.5,
            twinkleOffset: seed * Math.PI * 2,
            isGiant: true
        });
    }
}