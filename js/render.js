// render.js - только обновленная функция drawStars и вспомогательные функции
import { asteroidImage, cursorImage } from './main.js';
import { starField } from './state.js';

export function drawShip(ctx, ship, hasShield) {
    ctx.save();
    ctx.translate(ship.x, ship.y);

    if (hasShield) {
        ctx.shadowColor = "rgba(0, 255, 255, 0.6)";
        ctx.shadowBlur = 30;

        const gradient = ctx.createRadialGradient(0, 0, 20, 0, 0, 50);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
        gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "rgba(0, 255, 255, 0.05)";
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SHIELD", 0, 48);


    }

    ctx.shadowBlur = 0;
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

    ctx.restore();
}

export function drawShield(ctx, shield, time) {
    if (!shield || !shield.active) return;

    ctx.save();
    ctx.translate(shield.x, shield.y);

    const pulse = 0.8 + Math.sin(time / 300) * 0.2;
    const radius = shield.radius * pulse;

    ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
    ctx.shadowBlur = 30;

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 * pulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(255, 215, 0, ${0.7 * pulse})`;
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🛡️", 0, -2);

    ctx.fillStyle = `rgba(255, 215, 0, ${0.4 * pulse})`;
    ctx.font = "9px Arial";
    ctx.textBaseline = "top";
    ctx.fillText("SHIELD", 0, radius + 8);

    ctx.restore();
}

export function drawAsteroid(ctx, asteroid) {
    ctx.save();

    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);

    if (asteroidImage.complete && asteroidImage.naturalWidth > 0) {
        const size = asteroid.r * 2;
        ctx.drawImage(asteroidImage, -size / 2, -size / 2, size, size);
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

// Новая функция с разнообразными звездами
export function drawStars(ctx, width, height, offset) {
    // Нормализуем offset
    const normalizedOffset = offset % height;

    for (const star of starField) {
        // Вычисляем позицию со смещением
        let y = star.y + normalizedOffset;

        // Зацикливание
        if (y >= height) {
            y = y - height;
        }

        // Мерцание
        const twinkle = Math.sin(star.twinkleOffset + offset * star.twinkleSpeed) * 0.5 + 0.5;

        ctx.save();

        if (star.isGiant) {
            // Рисуем звезду-гиганта
            const gradient = ctx.createRadialGradient(star.x, y, 0, star.x, y, star.size * 4);
            gradient.addColorStop(0, star.color);
            gradient.addColorStop(0.3, star.color.replace('0.8', '0.3').replace('0.9', '0.3').replace('1', '0.3'));
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(star.x, y, star.size * 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = star.color;
            ctx.shadowBlur = 20;
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.x, y, star.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Обычная звезда
            const alpha = star.brightness * (0.7 + twinkle * 0.3);
            ctx.globalAlpha = alpha;

            if (star.size > 2) {
                ctx.shadowColor = star.color;
                ctx.shadowBlur = star.size * 4;
            }

            ctx.fillStyle = star.color;

            if (star.size > 2) {
                ctx.fillRect(star.x - star.size/2, y - star.size/6, star.size, star.size/3);
                ctx.fillRect(star.x - star.size/6, y - star.size/2, star.size/3, star.size);
            } else {
                ctx.fillRect(star.x, y, star.size, star.size);
            }
        }

        ctx.restore();
    }
}

export function drawCursor(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const cursorWidth = 42;
    const cursorHeight = 78;

    if (cursorImage.complete && cursorImage.naturalWidth > 0) {
        ctx.drawImage(cursorImage, -cursorWidth / 2, -cursorHeight / 2, cursorWidth, cursorHeight);

        ctx.shadowColor = "rgba(0, 212, 255, 0.3)";
        ctx.shadowBlur = 20;
        ctx.drawImage(cursorImage, -cursorWidth / 2, -cursorHeight / 2, cursorWidth, cursorHeight);
    } else {
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

export function drawTouchZone(ctx, x, y, time) {
    ctx.save();

    const zoneRadius = 120;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, zoneRadius);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.15)');
    gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, zoneRadius, 0, Math.PI * 2);
    ctx.fill();

    const pulse = 0.6 + Math.sin(time * 2) * 0.4;
    ctx.strokeStyle = `rgba(0, 212, 255, ${0.2 * pulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(x, y, zoneRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(0, 212, 255, ${0.4 * pulse})`;
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Зона управления", x, y + zoneRadius + 20);

    ctx.restore();
}

export function drawTutorialShip(ctx, x, y) {
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

export function drawTutorialAsteroid(ctx, asteroid) {
    ctx.save();

    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);
    ctx.globalAlpha = 0.5;

    if (asteroidImage.complete && asteroidImage.naturalWidth > 0) {
        const size = asteroid.r * 2;
        ctx.drawImage(asteroidImage, -size / 2, -size / 2, size, size);
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

export function drawHyperdriveEffect(ctx, width, height, progress) {
    ctx.save();

    const gradient = ctx.createRadialGradient(
        width/2, height/2, 0,
        width/2, height/2, Math.max(width, height) * 0.7
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${progress * 0.8})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const starCount = 100 + progress * 100;
    for (let i = 0; i < starCount; i++) {
        const angle = (i * 2.399) % (Math.PI * 2);
        const distance = 50 + (i * 97.3) % Math.max(width, height) * 0.8;

        const x = width/2 + Math.cos(angle) * distance * (1 + progress * 3);
        const y = height/2 + Math.sin(angle) * distance * (1 + progress * 3);

        const size = 1 + (i * 17.3) % 3;
        const alpha = 0.3 + (i * 53.7) % 0.7;

        const colors = [
            `rgba(255, 255, 255, ${alpha * (0.5 + progress * 0.5)})`,
            `rgba(200, 220, 255, ${alpha * (0.5 + progress * 0.5)})`,
            `rgba(255, 200, 200, ${alpha * (0.5 + progress * 0.5)})`,
        ];
        ctx.fillStyle = colors[i % colors.length];
        ctx.shadowColor = `rgba(100, 200, 255, ${alpha * progress * 0.5})`;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y, size, size);
    }
    ctx.shadowBlur = 0;

    const blurGradient = ctx.createRadialGradient(
        width/2, height/2, Math.max(width, height) * 0.2,
        width/2, height/2, Math.max(width, height) * 0.8
    );
    blurGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    blurGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    blurGradient.addColorStop(1, `rgba(0, 0, 0, ${progress * 0.6})`);
    ctx.fillStyle = blurGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
}