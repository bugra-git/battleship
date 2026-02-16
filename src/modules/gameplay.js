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
}

export { Game };
