// main.js
import {
    width, height, setWidth, setHeight,
    setShip, setAsteroids, setScore,
    setDifficulty, setSpawnTimer, setGameRunning, setLastTime, setTutorialActive, gameRunning, isTouchingShip, tutorialActive,
    score, initStarField, setStarField
} from './state.js';
import { initGame } from './game-objects.js';
import { resizeCanvas, showScore, goFullscreen, initRoundRect } from './utils.js';
import { update, setGameOverCallback, setWinCallback } from './game-loop.js';
import { startTutorial, setStartGameCallback } from './tutorial.js';
import { handleTouchStart, handleTouchMove, handleTouchEnd, moveShip } from './controls.js';

// DOM элементы
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("gameOver");
const gameOverTitle = document.getElementById("gameOverTitle");
const finalScoreEl = document.getElementById("finalScore");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const scoreElement = document.getElementById("ui");

// Загрузка изображений
export const asteroidImage = new Image();
asteroidImage.src = './assets/asteroid.png';

export const cursorImage = new Image();
cursorImage.src = './assets/cursor.svg';

// Инициализация
initRoundRect();

function init() {
    const shipData = initGame();
    setShip(shipData);
    setAsteroids([]);
    setScore(0);
    setDifficulty(5);
    setSpawnTimer(0);
    setGameRunning(false);
    setLastTime(null);
    initStarField(width, height);

    scoreEl.textContent = '0';
    gameOverEl.style.display = "none";
    showScore(scoreElement, false);
}

function gameOver() {
    setGameRunning(false);
    gameOverTitle.textContent = '💥 Столкновение!';
    finalScoreEl.textContent = `Ваш результат: ${score}`;
    gameOverEl.style.display = "flex";
    showScore(scoreElement, false);
}

function winGame() {
    setGameRunning(false);
    gameOverTitle.textContent = '🚀 Победа!';
    finalScoreEl.textContent = `✨ Гиперпрыжок завершен! ${score} очков!`;
    gameOverEl.style.display = "flex";
    showScore(scoreElement, false);
}

function restartGame() {
    init();
    setGameRunning(true);
    showScore(scoreElement, true);
    requestAnimationFrame((t) => update(t, scoreEl));
}

function goToMainMenu() {
    gameOverEl.style.display = "none";
    startScreen.style.display = "flex";
    showScore(scoreElement, false);
    setGameRunning(false);
}

function handleStartGame() {
    setTutorialActive(false);
    startScreen.style.display = "none";
    init();
    setGameRunning(true);
    showScore(scoreElement, true);
    requestAnimationFrame((t) => update(t, scoreEl));
}

function handleTutorialTap() {
    if (tutorialActive) {
        handleStartGame();
    }
}

// Настройка колбэков
setGameOverCallback(gameOver);
setWinCallback(winGame);
setStartGameCallback(handleStartGame);

// Обработчики событий
window.addEventListener("resize", () => {
    const { width: newWidth, height: newHeight } = resizeCanvas(canvas);
    setWidth(newWidth);
    setHeight(newHeight);
});

// Инициализация размеров
const { width: initWidth, height: initHeight } = resizeCanvas(canvas);
setWidth(initWidth);
setHeight(initHeight);

startScreen.style.display = "flex";
showScore(scoreElement, false);

canvas.addEventListener("touchstart", e => {
    e.preventDefault();

    if (tutorialActive) {
        handleTutorialTap();
        return;
    }

    if (!gameRunning) return;

    const touch = e.touches[0];
    if (touch) {
        handleTouchStart(touch.clientX, touch.clientY);
    }
});

canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    if (tutorialActive) return;
    if (!gameRunning) return;

    const touch = e.touches[0];
    if (touch) {
        handleTouchMove(touch.clientX, touch.clientY);
    }
});

canvas.addEventListener("touchend", e => {
    e.preventDefault();
    if (tutorialActive) return;
    if (!gameRunning) return;
    handleTouchEnd();
});

canvas.addEventListener("touchcancel", e => {
    e.preventDefault();
    if (tutorialActive) return;
    if (!gameRunning) return;
    handleTouchEnd();
});

canvas.addEventListener("mousedown", e => {
    if (tutorialActive) return;
    if (!gameRunning) return;
    handleTouchStart(e.clientX, e.clientY);
});

canvas.addEventListener("mousemove", e => {
    if (tutorialActive) return;
    if (!gameRunning) return;

    if (!isTouchingShip) {
        moveShip(e.clientX);
    } else {
        handleTouchMove(e.clientX, e.clientY);
    }
});

canvas.addEventListener("mouseup", e => {
    if (tutorialActive) return;
    if (!gameRunning) return;
    handleTouchEnd();
});

canvas.addEventListener("mouseleave", e => {
    if (tutorialActive) return;
    if (!gameRunning) return;
    handleTouchEnd();
});

canvas.addEventListener("click", e => {
    if (tutorialActive) {
        handleTutorialTap();
    }
});

startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    goFullscreen();
    startTutorial();
});

window.restartGame = restartGame;
window.goToMainMenu = goToMainMenu;

init();