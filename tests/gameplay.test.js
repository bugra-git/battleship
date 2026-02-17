import { Game } from "../src/modules/gameplay.js";

function setupGame() {
  const game = new Game();
  game.positionShip("Carrier", [0, 0], "vertical");
  game.positionShip("Battleship", [7, 6], "horizontal");
  game.positionShip("Cruiser", [0, 5], "horizontal");
  game.positionShip("Submarine", [4, 4], "vertical");
  game.positionShip("Destroyer", [8, 2], "horizontal");
  game.initHumanShips();
  return game;
}

test("human ships can be placed on board", () => {
  const game = setupGame();
  expect(game.human.board.ships.length).toBe(5);
  expect(game.human.board.grid[0][0].ship).toBe(game.human.board.ships[0]);
  expect(game.human.board.grid[7][6].ship).toBe(game.human.board.ships[1]);
  expect(game.human.board.grid[0][5].ship).toBe(game.human.board.ships[2]);
  expect(game.human.board.grid[4][4].ship).toBe(game.human.board.ships[3]);
  expect(game.human.board.grid[8][2].ship).toBe(game.human.board.ships[4]);
});

test("computer ships can be placed on board randomly", () => {
  const game = setupGame();
  expect(game.comp.board.ships.length).toBe(5);
});

test("round cant be played when game is over", () => {
  const game = setupGame();

  // Simulate sinking all human ships
  for (const s of game.humanShips) {
    for (let i = 0; i < s.ship.length; i++) {
      const r = s.alignment === "vertical" ? s.coords[0] + i : s.coords[0];
      const c = s.alignment === "horizontal" ? s.coords[1] + i : s.coords[1];
      game.comp.attack(game.human.board, [r, c]);
    }
  }

  expect(game.gameOver()).toBe(true);
  const attackResult = game.playRound([0, 0]);
  expect(attackResult).toBeUndefined();
});

test("round cant be played with invalid coordinates", () => {
  const game = setupGame();

  const attackResult1 = game.playRound([-1, 0]);
  const attackResult2 = game.playRound([0, -1]);
  const attackResult3 = game.playRound([10, 0]);
  const attackResult4 = game.playRound([0, 10]);

  expect(attackResult1).toBeUndefined();
  expect(attackResult2).toBeUndefined();
  expect(attackResult3).toBeUndefined();
  expect(attackResult4).toBeUndefined();
});

test("round cant be played on already attacked cell", () => {
  const game = setupGame();

  const attackResult1 = game.playRound([0, 0]);
  const attackResult2 = game.playRound([0, 0]);

  expect(["hit", "miss"]).toContain(attackResult1.attack);
  expect(attackResult2).toBeUndefined();
});

test("player can attack computer board", () => {
  const game = setupGame();

  const attackResult = game.playRound([0, 0]);
  expect(["hit", "miss"]).toContain(attackResult.attack);
});

test("game can detect when all computer ships are sunk, return winner property and wont allow computer to make any more moves", () => {
  const game = setupGame();

  let result;
  // Simulate sinking all computer ships
  game.comp.board.grid.forEach((row, rowIndex) =>
    row.forEach((cell, colIndex) => {
      if (cell.ship) {
        result = game.playRound([rowIndex, colIndex]);
      }
    }),
  );

  expect(game.comp.board.allShipsSunk()).toBe(true);
  expect(game.gameOver()).toBe(true);
  expect(result.winner).toBe("player");
  expect(result.compAttack).toBeUndefined();
});

test("game can detect when all human ships are sunk and return winner property", () => {
  const game = setupGame();

  const getRandomInt = (max) => Math.floor(Math.random() * max);
  let result;

  // Simulate sinking all human ships
  for (const s of game.humanShips) {
    while (!s.ship.isSunk()) {
      result = game.playRound([getRandomInt(10), getRandomInt(10)]);
    }
  }

  expect(game.human.board.allShipsSunk()).toBe(true);
  expect(game.gameOver()).toBe(true);
  expect(result.winner).toBe("computer");
});

test("if human ship is sunk, result should have sunk property", () => {
  const game = setupGame();

  const getRandomInt = (max) => Math.floor(Math.random() * max);

  let result;
  // Simulate sinking the first human ship
  const s = game.humanShips[0];
  while (!s.ship.isSunk()) {
    result = game.playRound([getRandomInt(10), getRandomInt(10)]);
  }

  expect(game.human.board.ships[0].isSunk()).toBe(true);
  expect(result.compSunk).toBe(true);
});

test("if computer ship is sunk, result should have sunk property", () => {
  const game = setupGame();

  let result;
  // Simulate sinking the first computer ship
  const s = game.comp.board.ships[0];

  game.comp.board.grid.forEach((row, rowIndex) =>
    row.forEach((cell, colIndex) => {
      if (cell.ship === s) {
        result = game.playRound([rowIndex, colIndex]);
      }
    }),
  );

  expect(game.comp.board.ships[0].isSunk()).toBe(true);
  expect(result.sunk).toBe(true);
});

test("human ships can be positioned with positionShip method", () => {
  const game = new Game();
  game.positionShip("Carrier", [0, 0], "vertical");
  game.positionShip("Battleship", [7, 6], "horizontal");
  game.positionShip("Cruiser", [0, 5], "horizontal");
  game.positionShip("Submarine", [4, 4], "vertical");
  game.positionShip("Destroyer", [8, 2], "horizontal");

  expect(game.humanShips[0].coords).toEqual([0, 0]);
  expect(game.humanShips[0].alignment).toBe("vertical");
  expect(game.humanShips[1].coords).toEqual([7, 6]);
  expect(game.humanShips[1].alignment).toBe("horizontal");
  expect(game.humanShips[2].coords).toEqual([0, 5]);
  expect(game.humanShips[2].alignment).toBe("horizontal");
  expect(game.humanShips[3].coords).toEqual([4, 4]);
  expect(game.humanShips[3].alignment).toBe("vertical");
  expect(game.humanShips[4].coords).toEqual([8, 2]);
  expect(game.humanShips[4].alignment).toBe("horizontal");
});

test("ships arent initiated if any human ship is missing coords or alignment", () => {
  const game = new Game();
  game.humanShips[0].coords = null; // Missing coords for first ship
  game.initHumanShips();

  expect(game.human.board.ships.length).toBe(0); // No ships should be placed
});

test("ships are initiated if all human ships have coords and alignment", () => {
  const game = new Game();
  game.positionShip("Carrier", [0, 0], "vertical");
  game.positionShip("Battleship", [7, 6], "horizontal");
  game.positionShip("Cruiser", [0, 5], "horizontal");
  game.positionShip("Submarine", [4, 4], "vertical");
  game.positionShip("Destroyer", [8, 2], "horizontal");
  game.initHumanShips();

  expect(game.human.board.ships.length).toBe(5); // All ships should be placed
});
