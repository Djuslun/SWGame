// utils.js
export function resizeCanvas(canvas) {
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;
    return { width, height };
}

export function showScore(scoreElement, visible) {
    scoreElement.classList[visible ? 'add' : 'remove']('visible');
}

export function goFullscreen() {
    const element = document.documentElement;

    if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
            console.log('Fullscreen not supported');
        });
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

export function initRoundRect() {
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            if (r > w/2) r = w/2;
            if (r > h/2) r = h/2;
            this.moveTo(x + r, y);
            this.lineTo(x + w - r, y);
            this.quadraticCurveTo(x + w, y, x + w, y + r);
            this.lineTo(x + w, y + h - r);
            this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            this.lineTo(x + r, y + h);
            this.quadraticCurveTo(x, y + h, x, y + h - r);
            this.lineTo(x, y + r);
            this.quadraticCurveTo(x, y, x + r, y);
            return this;
        };
    }
}

export function checkCirclePolygonCollision(circleX, circleY, circleRadius, polygonPoints) {
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