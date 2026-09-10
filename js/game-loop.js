// game-loop.js
import {
    ship, asteroids, score, difficulty, spawnTimer,
    gameRunning, lastTime, shield, hasShield, shieldSpawned,
    width, height, setAsteroids, setScore,
    setDifficulty, setSpawnTimer, setLastTime,
    setShield, setShieldSpawned, setHasShield, setShieldCollected,
    setGameRunning, setShipExplosion, shipExplosion
} from './state.js';
import { createAsteroid, createShield, getShipPoints } from './game-objects.js';
import {
    drawShip, drawShield, drawAsteroid, drawStars, drawHyperdriveEffect, drawShipExplosion
} from './render.js';
import { checkCirclePolygonCollision } from './utils.js';
import { TARGET_FPS, SHIELD_SPAWN_SCORE } from './config.js';

let gameOverCallback = null;
let winCallback = null;
let isHyperdrive = false;
let hyperdriveProgress = 0;
let shipYOffset = 0;
let starOffset = 0;

export function setGameOverCallback(callback) {
    gameOverCallback = callback;
}

export function setWinCallback(callback) {
    winCallback = callback;
}

export function checkCollision(asteroid) {
    const shipPoints = getShipPoints();

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

export function checkShieldCollision(shield, ship) {
    if (!shield || !shield.active) return false;

    const dx = ship.x - shield.x;
    const dy = ship.y - shield.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const collectRadius = 25;

    return distance < shield.radius + collectRadius;
}

function updateHyperdrive() {
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    hyperdriveProgress += 0.008;
    shipYOffset -= 8;
    starOffset += 2;

    ctx.clearRect(0, 0, width, height);
    drawStars(ctx, width, height, starOffset);
    drawHyperdriveEffect(ctx, width, height, hyperdriveProgress);

    ctx.save();
    ctx.translate(0, shipYOffset);
    drawShip(ctx, ship, hasShield);
    ctx.restore();

    if (hyperdriveProgress < 1) {
        requestAnimationFrame(updateHyperdrive);
    } else {
        if (winCallback) {
            winCallback();
        }
    }
}

function createShipExplosion(x, y) {
    const particles = [];

    // Огненная палитра (от белого к тёмно-оранжевому)
    const fireColors = [
        '#ffffff', // белый (ядро)
        '#fff4b0', // светло-жёлтый
        '#ffd54a', // жёлтый
        '#ffb300', // оранжево-жёлтый
        '#ff8c00', // оранжевый
        '#ff5722', // тёмно-оранжевый
        '#b33a00', // красно-коричневый (края)
    ];

    // Осколки корабля (треугольники) — цвета корпуса X-Wing
    const shipColors = ['#e5edf8', '#5e9bca', '#9ab5cc'];

    // Осколки корабля (треугольники)
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 7,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3,
            life: 1.0,
            maxLife: 1.0 + Math.random() * 0.5,
            color: shipColors[Math.floor(Math.random() * shipColors.length)],
            isSpark: false
        });
    }

    // Искры / огонь (кружочки) — только огненная палитра
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 9;

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 5,
            rotation: 0,
            rotationSpeed: 0,
            life: 0.5 + Math.random() * 0.7,
            maxLife: 1.0,
            // Огненная палитра
            color: fireColors[Math.floor(Math.random() * fireColors.length)],
            isSpark: true
        });
    }

    setShipExplosion({
        active: true,
        particles: particles,
        time: 0
    });
}

function updateShipExplosion(dt) {
    if (!shipExplosion.active) return;

    let allDead = true;
    const particles = shipExplosion.particles;

    for (const particle of particles) {
        if (particle.life <= 0) continue;
        allDead = false;

        // Движение
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Замедление
        particle.vx *= 0.97;
        particle.vy *= 0.97;

        // Гравитация (немного вниз)
        particle.vy += 0.1;

        // Вращение
        particle.rotation += particle.rotationSpeed;

        // Уменьшение жизни
        particle.life -= dt * 0.8;
    }

    shipExplosion.time += dt;

    if (allDead || shipExplosion.time > 2) {
        shipExplosion.active = false;
    }
}

export function update(timestamp, scoreEl) {
    if (!gameRunning && !shipExplosion.active) return;

    if (lastTime === null) {
        setLastTime(timestamp);
        requestAnimationFrame((t) => update(t, scoreEl));
        return;
    }

    if (score >= 300 && !isHyperdrive) {
        isHyperdrive = true;
        hyperdriveProgress = 0;
        shipYOffset = 0;
        setGameRunning(false);
        requestAnimationFrame(updateHyperdrive);
        return;
    }

    if (lastTime === null) {
        setLastTime(timestamp);
        requestAnimationFrame((t) => update(t, scoreEl));
        return;
    }

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    setLastTime(timestamp);

    starOffset += dt * 60;

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);

    drawStars(ctx, width, height, starOffset);

    if (shipExplosion.active) {
        updateShipExplosion(dt);
        drawShipExplosion(ctx, width, height);
        requestAnimationFrame((t) => update(t, scoreEl));
        return;
    }

    if (!gameRunning) return;

    const lerpFactor = 1 - Math.pow(1 - 0.1, dt * TARGET_FPS);
    ship.x += (ship.targetX - ship.x) * lerpFactor;

    // Корректировка сложности
    if (score < 20) {
        setDifficulty(difficulty + 0.008 * TARGET_FPS * dt);
    } else if (score < 30) {
        setDifficulty(difficulty + 0.003 * TARGET_FPS * dt);
    } else if (score < 40) {
        setDifficulty(difficulty + 0.008 * TARGET_FPS * dt);
    } else {
        setDifficulty(difficulty + 0.005 * TARGET_FPS * dt);
    }

    // Спавн щита при 60 очках
    if (score >= SHIELD_SPAWN_SCORE && !shieldSpawned && !hasShield) {
        const newShield = createShield();
        setShield(newShield);
        setShieldSpawned(true);
    }

    // Обновление щита
    if (shield && shield.active) {
        shield.y += 2;

        if (checkShieldCollision(shield, ship)) {
            setHasShield(true);
            shield.active = false;
            setShieldCollected(true);
        }

        if (shield.y > height + 100) {
            shield.active = false;
        }
    }

    setSpawnTimer(spawnTimer + dt);

    let spawnInterval;
    if (score < 30) {
        spawnInterval = Math.max(18, 60 - difficulty * 2.0) / TARGET_FPS;
    } else if (score < 60) {
        spawnInterval = Math.max(22, 60 - difficulty * 1.5) / TARGET_FPS;
    } else if (score < 85) {
        spawnInterval = Math.max(18, 60 - difficulty * 2.0) / TARGET_FPS;
    } else {
        spawnInterval = Math.max(16, 60 - difficulty * 2.2) / TARGET_FPS;
    }

    if (spawnTimer >= spawnInterval) {
        setSpawnTimer(0);
        const newAsteroid = createAsteroid();
        let newAsteroids = [...asteroids, newAsteroid];

        if (score < 30) {
            if (Math.random() < 0.15) {
                const extra = createAsteroid();
                newAsteroids = [...newAsteroids, extra];
            }
        } else if (score < 60) {
            if (Math.random() < 0.08) {
                const extra = createAsteroid();
                newAsteroids = [...newAsteroids, extra];
            }
        } else if (score < 85) {
            if (Math.random() < 0.15) {
                const extra = createAsteroid();
                newAsteroids = [...newAsteroids, extra];
            }
        } else {
            if (Math.random() < 0.2) {
                const extra = createAsteroid();
                newAsteroids = [...newAsteroids, extra];
            }
        }
        setAsteroids(newAsteroids);
    }

    drawShield(ctx, shield, timestamp);

    let currentAsteroids = [...asteroids];
    for (let i = currentAsteroids.length - 1; i >= 0; i--) {
        const asteroid = currentAsteroids[i];

        asteroid.y += asteroid.speed * dt;
        asteroid.rotation += asteroid.rotationSpeed * dt;

        drawAsteroid(ctx, asteroid);

        if (checkCollision(asteroid)) {
            if (hasShield) {
                setHasShield(false);
                currentAsteroids.splice(i, 1);
                const newScore = score + 1;
                setScore(newScore);
                scoreEl.textContent = newScore;
                continue;
            } else {
                // Создаем взрыв корабля
                createShipExplosion(ship.x, ship.y);
                setGameRunning(false);

                // Ждем завершения анимации, потом показываем Game Over
                const checkExplosionEnd = setInterval(() => {
                    if (!shipExplosion.active) {
                        clearInterval(checkExplosionEnd);
                        if (gameOverCallback) {
                            gameOverCallback();
                        }
                    }
                }, 100);

                requestAnimationFrame((t) => update(t, scoreEl));
                return;
            }
        }

        if (asteroid.y > height + 100) {
            currentAsteroids.splice(i, 1);
            const newScore = score + 1;
            setScore(newScore);
            scoreEl.textContent = newScore;
        }
    }
    setAsteroids(currentAsteroids);

    drawShip(ctx, ship, hasShield);

    requestAnimationFrame((t) => update(t, scoreEl));
}