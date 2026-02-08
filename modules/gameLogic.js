class Ship {
  constructor(length) {
    this.length = length;
    this.hitCount = 0;
  }

  hit() {
    this.hitCount++;
  }

  isSunk() {
    return this.hitCount >= this.length;
  }
}

class Gameboard {
  constructor() {
    this.grid = Array(10)
      .fill()
      .map(() =>
        Array(10)
          .fill()
          .map(() => ({ ship: null, attacked: false })),
      );
  }

  placeShip(ship, [row, col], alignment) {
    const coords = [];

    if (row < 0 || col < 0) return false;
    if (alignment === "vertical" && row + ship.length > 10) return false;
    if (alignment === "horizontal" && col + ship.length > 10) return false;

    for (let i = 0; i < ship.length; i++) {
      const r = alignment === "vertical" ? row + i : row;
      const c = alignment === "horizontal" ? col + i : col;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;

          if (this.grid[nr][nc].ship) return false;
        }
      }

      coords.push([r, c]);
    }

    for (const [r, c] of coords) {
      this.grid[r][c].ship = ship;
    }

    return true;
  }

  receiveAttack([row, col]) {
    const cell = this.grid[row][col];

    if (cell.attacked) return false;
    cell.attacked = true;

    if (cell.ship) {
      cell.ship.hit();
      return "hit";
    }

    return "miss";
  }
}

export { Ship, Gameboard };
