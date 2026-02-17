import { Ship, Gameboard, Player } from "./gameLogic.js";

class Game {
  constructor() {
    this.human = new Player();
    this.comp = new Player("computer");
    this.shipSizes = [5, 4, 3, 3, 2];
    this.humanShips = this.shipSizes.map((length) => ({
      ship: new Ship(length),
    }));
    this.humanShips[0].coords = [0, 0];
    this.humanShips[0].alignment = "vertical";
    this.humanShips[1].coords = [7, 6];
    this.humanShips[1].alignment = "horizontal";
    this.humanShips[2].coords = [0, 5];
    this.humanShips[2].alignment = "horizontal";
    this.humanShips[3].coords = [4, 4];
    this.humanShips[3].alignment = "vertical";
    this.humanShips[4].coords = [8, 2];
    this.humanShips[4].alignment = "horizontal";
  }

  initHumanShips() {
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
