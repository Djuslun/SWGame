// controls.js
import { ship, isTouchingShip, touchOffsetX, width } from './state.js';
import { setIsTouchingShip, setTouchOffsetX } from './state.js';

export function moveShip(x) {
    if (!ship) return;

    ship.targetX = x;

    if (ship.targetX < ship.size) {
        ship.targetX = ship.size;
    }

    if (ship.targetX > width - ship.size) {
        ship.targetX = width - ship.size;
    }
}

export function handleTouchStart(x, y) {
    if (!ship) return;

    const zoneRadius = 150;
    const dx = x - ship.x;
    const dy = y - ship.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const isBelowShip = y > ship.y - 30;

    if (distance < zoneRadius || (isBelowShip && distance < zoneRadius * 2)) {
        setIsTouchingShip(true);
        setTouchOffsetX(x - ship.x);
        moveShip(x - touchOffsetX);
    }
}

export function handleTouchMove(x, y) {
    if (!isTouchingShip) return;

    const newX = x - touchOffsetX;
    moveShip(newX);
}

export function handleTouchEnd() {
    setIsTouchingShip(false);
    setTouchOffsetX(0);
}