// game-objects.js
import { MAX_SPEED } from './config.js';
import { score, difficulty, height, width } from './state.js';

export function initGame() {
    return {
        x: width / 2,
        targetX: width / 2,
        y: height - 150,
        size: 22
    };
}

export function createAsteroid() {
    const radius = 15 + Math.random() * 25;

    let baseSpeed;
    if (score < 20) {
        // 1-й этап: активнее (ваши цифры)
        baseSpeed = 2.5 + Math.random() * difficulty * 1.2;
    } else if (score < 30) {
        // 2-й этап: немного полегче (ваши цифры)
        baseSpeed = 2 + Math.random() * difficulty * 0.8;
    } else if (score < 40) {
        // 3-й этап: как на 1-м этапе (ваши цифры)
        baseSpeed = 2.8 + Math.random() * difficulty * 1.3;
    } else {
        // 4-й этап: хардкор (ваши цифры)
        baseSpeed = 3 + Math.random() * difficulty * 1.7;
    }

    // Ограничиваем максимальную скорость
    baseSpeed = Math.min(baseSpeed, MAX_SPEED);

    return {
        x: Math.random() * width,
        y: -radius,
        r: radius,
        speed: baseSpeed * 60 * (height / 800),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (0.5 + Math.random() * 1.5) * (Math.random() > 0.5 ? 1 : -1)
    };
}

export function createShield() {
    return {
        x: Math.random() * (width - 100) + 50,
        y: -30,
        radius: 20,
        active: true,
        collected: false
    };
}

export function getShipPoints() {
    return [
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
}