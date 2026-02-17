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
      const [[comAttackRow, comAttackCol], compAttackResult] = this.compAttack(
        row,
        col,
      );
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

  compAttack(row, col) {
    const attackResult = this.comp.attack(this.human.board, [row, col]);
    return [[row, col], attackResult];
  }
}

export { Game };
