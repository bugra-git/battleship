import { Ship, Gameboard, Player } from "./gameLogic.js";

class Game {
  constructor() {
    this.human = new Player();
    this.comp = new Player("computer");
    this.shipSizes = [5, 4, 3, 3, 2];

    this.humanShips = [
      { title: "Carrier", ship: new Ship(5) },
      { title: "Battleship", ship: new Ship(4) },
      { title: "Cruiser", ship: new Ship(3) },
      { title: "Submarine", ship: new Ship(3) },
      { title: "Destroyer", ship: new Ship(2) },
    ];

    this.compState = {
      targetShip: null,
      base: null,
      start: null,
      queue: [],
      direction: null,
      reversed: false,
    };

    this.placeComShips();
  }

  positionShip(title, [row, col], alignment) {
    const ship = this.humanShips.find((s) => s.title === title);
    if (ship) {
      ship.coords = [row, col];
      ship.alignment = alignment;
    }
  }

  initHumanShips() {
    if (this.humanShips.some((s) => !s.coords || !s.alignment)) return;
    this.humanShips.forEach((s) => {
      this.human.board.placeShip(s.ship, s.coords, s.alignment);
    });
  }

  placeComShips() {
    const getRandomInt = (max) => Math.floor(Math.random() * max);

    const placeRandomShip = (length) => {
      let placed = false;

      while (!placed) {
        placed = this.comp.board.placeShip(
          new Ship(length),
          [getRandomInt(10), getRandomInt(10)],
          getRandomInt(2) ? "vertical" : "horizontal",
        );
      }
    };

    this.shipSizes.forEach(placeRandomShip);
  }

  playRound([row, col]) {
    if (this.gameOver()) return;

    const result = {};

    const playerAttack = this.human.attack(this.comp.board, [row, col]);
    if (!playerAttack) return;
    if (playerAttack === "hit") result.attack = "hit";
    else if (playerAttack === "miss") result.attack = "miss";
    if (
      this.comp.board.grid[row][col].ship &&
      this.comp.board.grid[row][col].ship.isSunk()
    )
      result.sunk = true;

    if (this.comp.board.allShipsSunk()) {
      result.winner = "player";
    } else {
      const {
        coord: [comAttackRow, comAttackCol],
        result: compAttackResult,
      } = this.compAttack();

      result.compAttack = {
        row: comAttackRow,
        col: comAttackCol,
        compResult: compAttackResult,
      };

      if (
        this.human.board.grid[comAttackRow][comAttackCol].ship &&
        this.human.board.grid[comAttackRow][comAttackCol].ship.isSunk()
      ) {
        result.compSunk = true;
      }

      if (this.human.board.allShipsSunk()) {
        result.winner = "computer";
      }
    }

    return result;
  }

  gameOver() {
    if (this.comp.board.allShipsSunk() || this.human.board.allShipsSunk())
      return true;
  }

  compAttack() {
    const getRandomInt = (max) => Math.floor(Math.random() * max);
    const s = this.compState;
    const resetState = () => {
      s.targetShip = null;
      s.base = null;
      s.queue = [];
      s.direction = null;
      s.start = null;
      s.reversed = false;
    };

    const coordIsValid = (coord) => {
      const [r, c] = coord;
      return (
        r >= 0 &&
        r < 10 &&
        c >= 0 &&
        c < 10 &&
        !this.human.board.grid[r][c].attacked
      );
    };

    let coord, result;

    if (!s.targetShip) {
      while (true) {
        coord = [getRandomInt(10), getRandomInt(10)];
        if (coordIsValid(coord)) break;
      }

      result = this.comp.attack(this.human.board, coord);

      if (result === "hit") {
        s.targetShip = this.human.board.grid[coord[0]][coord[1]].ship;
        s.base = coord;
        s.start = coord;
        s.queue = [
          [coord[0] - 1, coord[1]],
          [coord[0] + 1, coord[1]],
          [coord[0], coord[1] - 1],
          [coord[0], coord[1] + 1],
        ];
      }
    } else if (s.targetShip.hitCount === 1) {
      while (s.queue.length) {
        coord = s.queue.pop();
        if (coordIsValid(coord)) break;
        coord = null;
      }

      if (coord) {
        result = this.comp.attack(this.human.board, coord);
      } else {
        resetState();
        return this.compAttack();
      }

      if (result === "hit") {
        const [r, c] = coord;
        s.direction = [coord[0] - s.base[0], coord[1] - s.base[1]];
        s.base = coord;
        if (s.targetShip.isSunk()) {
          resetState();
        }
      }
    } else {
      while (true) {
        coord = [s.base[0] + s.direction[0], s.base[1] + s.direction[1]];
        if (coordIsValid(coord) || s.reversed) break;
        s.direction = [-s.direction[0], -s.direction[1]];
        s.base = s.start;
        s.reversed = true;
      }

      if (!coordIsValid(coord)) {
        resetState();
        return this.compAttack();
      }

      result = this.comp.attack(this.human.board, coord);

      if (result === "hit") {
        if (s.targetShip.isSunk()) {
          resetState();
        } else {
          s.base = coord;
        }
      } else if (!s.reversed) {
        s.direction = [-s.direction[0], -s.direction[1]];
        s.base = s.start;
        s.reversed = true;
      } else {
        resetState();
      }
    }

    return { coord, result };
  }
}

export { Game };
