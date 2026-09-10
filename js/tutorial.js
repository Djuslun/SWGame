// tutorial.js
import {
    height,
    setTutorialActive,
    setTutorialAsteroids,
    setTutorialShipX,
    setTutorialTime,
    tutorialActive,
    tutorialAsteroids,
    tutorialShipX,
    tutorialTime,
    width
} from './state.js';
import {drawCursor, drawStars, drawTouchZone, drawTutorialAsteroid, drawTutorialShip} from './render.js';

let startGameCallback = null;

export function setStartGameCallback(callback) {
    startGameCallback = callback;
}

export function startTutorial() {
    setTutorialActive(true);
    setTutorialShipX(width / 2);
    setTutorialAsteroids([]);
    setTutorialTime(0);

    const newAsteroids = [];
    for (let i = 0; i < 3; i++) {
        newAsteroids.push({
            x: Math.random() * width,
            y: -30 - Math.random() * 200,
            r: 20 + Math.random() * 20,
            speed: 1 + Math.random() * 2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (0.5 + Math.random() * 1.5) * (Math.random() > 0.5 ? 1 : -1)
        });
    }
    setTutorialAsteroids(newAsteroids);

    requestAnimationFrame(updateTutorial);
}

export function updateTutorial() {
    if (!tutorialActive) return;

    setTutorialTime(tutorialTime + 1/60);

    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    const animationSpeed = 0.8;

    const shipX = width / 2 + Math.sin(tutorialTime * animationSpeed) * (width * 0.35);
    setTutorialShipX(shipX);

    const cursorX = width / 2 + Math.sin(tutorialTime * animationSpeed - 0.2) * (width * 0.32);
    const cursorY = height - 150 - 70;

    let newAsteroids = [...tutorialAsteroids];
    for (let i = newAsteroids.length - 1; i >= 0; i--) {
        const asteroid = newAsteroids[i];
        asteroid.y += asteroid.speed * 0.8;
        asteroid.rotation += asteroid.rotationSpeed * 0.02;

        if (asteroid.y > height + 100) {
            asteroid.y = -30 - Math.random() * 200;
            asteroid.x = Math.random() * width;
            asteroid.speed = 0.8 + Math.random() * 1.6;
        }
    }
    setTutorialAsteroids(newAsteroids);

    ctx.clearRect(0, 0, width, height);
    drawStars(ctx, width, height, 0);

    for (const asteroid of tutorialAsteroids) {
        drawTutorialAsteroid(ctx, asteroid);
    }

    drawTouchZone(ctx, tutorialShipX, height - 150, tutorialTime);
    drawTutorialShip(ctx, tutorialShipX, height - 150);

    const cursorAngle = Math.atan2(
        tutorialShipX - cursorX,
        (height - 150) - cursorY
    );
    drawCursor(ctx, cursorX, cursorY, cursorAngle);

    ctx.save();
    ctx.strokeStyle = "rgba(0, 212, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY + 20);
    ctx.lineTo(tutorialShipX, height - 150 - 40);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(0, 212, 255, 0.12)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    const trailLength = 40 + Math.sin(tutorialTime * 1.5) * 20;
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY + 30);
    ctx.lineTo(cursorX + Math.sin(tutorialTime * 1.5) * 30, cursorY + 30 + trailLength);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.save();

    const textY = Math.min(50, height * 0.08);

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    const padding = 20;

    ctx.font = "bold 18px Arial";
    const titleWidth = ctx.measureText("👆 УПРАВЛЕНИЕ").width;

    ctx.font = "14px Arial";
    const text1 = "Коснись зоны возле корабля и, удерживая палец на экране,";
    const text2 = "двигай  корабль  влево-вправо";

    const textWidth1 = ctx.measureText(text1).width;
    const textWidth2 = ctx.measureText(text2).width;
    const maxTextWidthActual = Math.max(titleWidth, textWidth1, textWidth2);

    const blockWidth = Math.min(maxTextWidthActual + padding * 2, width - 40);
    const blockHeight = 30 + 24 + 24 + 24 + padding * 2;
    const blockX = (width - blockWidth) / 2;

    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(blockX, textY, blockWidth, blockHeight, 12);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#00d4ff";
    ctx.font = "bold 18px Arial";
    ctx.fillText("👆 УПРАВЛЕНИЕ", width/2, textY + 25);

    ctx.fillStyle = "#e0e0e0";
    ctx.font = "14px Arial";
    let currentY = textY + 50;

    ctx.fillText(text1, width/2, currentY);
    currentY += 22;
    ctx.fillText(text2, width/2, currentY);
    currentY += 22;
    ctx.fillStyle = "#ffcc00";
    ctx.fillText(text3, width/2, currentY);

    ctx.fillStyle = "rgba(0, 212, 255, 0.8)";
    ctx.font = "bold 16px Arial";
    ctx.globalAlpha = 0.5 + Math.sin(tutorialTime * 1.5) * 0.5;
    const hintY = height - 50;
    ctx.fillText("👆 Коснитесь экрана, чтобы начать игру", width/2, hintY);
    ctx.globalAlpha = 1.0;

    ctx.restore();

    requestAnimationFrame(updateTutorial);
}