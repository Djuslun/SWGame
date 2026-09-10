// main.js
import {
    setWidth, setHeight,
    setShip, setAsteroids, setScore,
    setDifficulty, setSpawnTimer, setGameRunning, setLastTime,
    setTutorialActive, gameRunning, isTouchingShip, tutorialActive,
    score, setHasShield, setShieldSpawned, setShield, initStarField, setShipExplosion
} from './state.js';
import { initGame } from './game-objects.js';
import { resizeCanvas, showScore, goFullscreen, initRoundRect, exitFullscreen } from './utils.js';
import { update, setGameOverCallback, setWinCallback } from './game-loop.js';
import { startTutorial, setStartGameCallback } from './tutorial.js';
import { handleTouchStart, handleTouchMove, handleTouchEnd, moveShip } from './controls.js';

// DOM элементы
const canvas = document.getElementById("game");
const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("gameOver");
const gameOverTitle = document.getElementById("gameOverTitle");
const finalScoreEl = document.getElementById("finalScore");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const scoreElement = document.getElementById("ui");
const medalButton = document.getElementById("medalButton");
const medalCount = document.getElementById("medalCount");
const highScoreEl = document.getElementById("highScore");
const totalGamesEl = document.getElementById("totalGames");
const totalScoreEl = document.getElementById("totalScore");
const bestScoreEl = document.getElementById("bestScore");
const resultsModal = document.getElementById("resultsModal");
const bgMusic = document.getElementById("bgMusic");



function startMusic() {
    if (bgMusic) {
        bgMusic.volume = 0.5; // Уровень громкости (0.0 - 1.0)
        bgMusic.play().catch(error => {
            console.log('Music play failed:', error);
        });
    }
}

// Функция для остановки музыки
function stopMusic() {
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
}

// Загрузка изображений
export const asteroidImage = new Image();
asteroidImage.src = './assets/asteroid.png';

export const cursorImage = new Image();
cursorImage.src = './assets/cursor.svg';

// Статистика
let stats = {
    highScore: 0,
    totalGames: 0,
    totalScore: 0,
    bestScore: 0
};

// Функция для проверки видимости медали
function shouldShowMedal() {
    return stats.highScore >= 50;
}

// Обновление видимости медали
function updateMedalVisibility() {
    if (!medalButton) return;

    // Показываем медаль только если максимальный счет >= 50
    // и мы в меню, не в игре и не в туториале
    if (shouldShowMedal() && (startScreen.style.display !== 'none' || gameOverEl.style.display !== 'none') && !tutorialActive && !gameRunning) {
        medalButton.style.display = 'flex';
    } else {
        medalButton.style.display = 'none';
    }
}

// Загрузка статистики из localStorage
function loadStats() {
    try {
        const saved = localStorage.getItem('asteroidStats');
        if (saved) {
            stats = JSON.parse(saved);
        } else {
            stats = {
                highScore: 0,
                totalGames: 0,
                totalScore: 0,
                bestScore: 0
            };
        }
    } catch (e) {
        console.log('Error loading stats');
        stats = {
            highScore: 0,
            totalGames: 0,
            totalScore: 0,
            bestScore: 0
        };
    }
    updateMedalCount();
    updateMedalVisibility();
}

// Сохранение статистики
function saveStats() {
    try {
        localStorage.setItem('asteroidStats', JSON.stringify(stats));
    } catch (e) {
        console.log('Error saving stats');
    }
    updateMedalCount();
    updateMedalVisibility();
}

// Обновление счетчика на медали
function updateMedalCount() {
    if (medalCount) {
        medalCount.textContent = stats.highScore || 0;
    }
}

// Обновление результатов в модальном окне
function updateResultsDisplay() {
    if (highScoreEl) highScoreEl.textContent = stats.highScore || 0;
    if (totalGamesEl) totalGamesEl.textContent = stats.totalGames || 0;
    if (totalScoreEl) totalScoreEl.textContent = stats.totalScore || 0;
    if (bestScoreEl) bestScoreEl.textContent = stats.bestScore || 0;
}

// Показать результаты
window.showResults = function() {
    updateResultsDisplay();
    resultsModal.classList.add('show');
};

// Закрыть результаты
window.closeResults = function() {
    resultsModal.classList.remove('show');
};

// Сбросить статистику
window.resetStats = function() {
    stats = {
        highScore: 0,
        totalGames: 0,
        totalScore: 0,
        bestScore: 0
    };
    saveStats();
    updateResultsDisplay();
    updateMedalCount();
    updateMedalVisibility();
    closeResults();
};

// Закрытие по клику вне модального окна
window.addEventListener('click', (e) => {
    if (e.target === resultsModal) {
        closeResults();
    }
});

// Закрытие по ESC
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeResults();
    }
});

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

    setHasShield(false);
    setShieldSpawned(false);
    setShield(null);

    setShipExplosion({
        active: false,
        particles: [],
        time: 0
    });

    scoreEl.textContent = '0';
    gameOverEl.style.display = "none";
}

function finishGame(isWin = false) {
    setGameRunning(false);
    stopMusic();
    // Обновляем статистику
    stats.totalGames++;
    stats.totalScore += score;
    if (score > stats.highScore) {
        stats.highScore = score;
    }
    if (score > stats.bestScore) {
        stats.bestScore = score;
    }


    // Настраиваем заголовок и сообщение
    if (isWin) {
        gameOverTitle.textContent = '🚀 Победа!';
        finalScoreEl.textContent = `✨ Гиперпрыжок завершен! ${score} очков!`;
    } else {
        gameOverTitle.textContent = '💥 Столкновение!';
        finalScoreEl.textContent = `Ваш результат: ${score}`;
    }

    // Добавляем дополнительный текст если набрано 50+ очков
    if (score >= 50) {
        const currentText = finalScoreEl.textContent;
        finalScoreEl.textContent = currentText + '\n🏆 Набрано 50+ очков! Покажите это участнику стенда чтобы получить отметку о прохождении кросстендового конкурса';
    }

    gameOverEl.style.display = "flex";
    showScore(scoreElement, false);
    saveStats();
    exitFullscreen();
}

function gameOver() {
    finishGame(false);
}

function winGame() {
    finishGame(true);
}

function handleStartGame() {
    setTutorialActive(false);
    startScreen.style.display = "none";
    init();
    startMusic();
    setGameRunning(true);
    showScore(scoreElement, true);
    if (medalButton) medalButton.style.display = 'none';
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
initStarField(initWidth, initHeight);

startScreen.style.display = "flex";
showScore(scoreElement, false);


// Загружаем статистику
loadStats();

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

const startGame = () => {
    startScreen.style.display = "none";
    gameOverEl.style.display = "none";
    if (medalButton) medalButton.style.display = 'none';
    goFullscreen();
    startTutorial();
}

startButton.addEventListener("click", () => {
    startGame();
});

restartButton.addEventListener("click", () => {
    startGame();
});

// Запуск
init();