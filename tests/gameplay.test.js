import { Game } from "../src/modules/gameplay.js";

test("human ships can be placed on board randomly when game is", () => {
  const game = new Game();
  expect(game.human.board.ships.length).toBe(5);
  expect(game.humanShips.some((s) => s.coords === undefined)).toBe(false);
  expect(game.humanShips.some((s) => s.alignment === undefined)).toBe(false);
});

test("computer ships can be placed on board randomly", () => {
  const game = new Game();
  expect(game.comp.board.ships.length).toBe(5);
});

test("round cant be played when game is over", () => {
  const game = new Game();

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
  const game = new Game();

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
  const game = new Game();

  const attackResult1 = game.playRound([0, 0]);
  const attackResult2 = game.playRound([0, 0]);

  expect(["hit", "miss"]).toContain(attackResult1.attack);
  expect(attackResult2).toBeUndefined();
});

test("player can attack computer board", () => {
  const game = new Game();

  const attackResult = game.playRound([0, 0]);
  expect(["hit", "miss"]).toContain(attackResult.attack);
});

test("game can detect when all computer ships are sunk, return winner property and wont allow computer to make any more moves", () => {
  const game = new Game();

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
  const game = new Game();

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
  const game = new Game();

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
  const game = new Game();

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

test("computer can choose a coordinate to attack", () => {
  const game = new Game();

  const attackResult = game.compAttack();
  expect(attackResult).toHaveProperty("coord");
  expect(attackResult.coord).toHaveLength(2);
  expect(Number.isInteger(attackResult.coord[0])).toBe(true);
  expect(Number.isInteger(attackResult.coord[1])).toBe(true);
});

test("coord cannot be out of bounds", () => {
  const game = new Game();

  for (let i = 0; i < 100; i++) {
    const attackResult = game.compAttack();
    const [row, col] = attackResult.coord;
    expect(row).toBeGreaterThanOrEqual(0);
    expect(row).toBeLessThan(10);
    expect(col).toBeGreaterThanOrEqual(0);
    expect(col).toBeLessThan(10);
  }
});

test("coord cannot be a previously attacked cell", () => {
  const game = new Game();
  const attackedCoords = new Set();

  for (let i = 0; i < 100; i++) {
    const attackResult = game.compAttack();
    const [row, col] = attackResult.coord;
    const coordKey = `${row},${col}`;

    expect(attackedCoords.has(coordKey)).toBe(false);
    attackedCoords.add(coordKey);
  }
});

test("it founds valid coordinate and attacks the cell on human board", () => {
  const game = new Game();
  for (let i = 0; i < 100; i++) {
    const attackResult = game.compAttack();
    const [row, col] = attackResult.coord;

    expect(game.human.board.grid[row][col].attacked).toBe(true);
  }
});

test("computer attack returns the result of the attack and the coordinate used", () => {
  const game = new Game();
  for (let i = 0; i < 100; i++) {
    const attackResult = game.compAttack();
    expect(attackResult).toHaveProperty("coord");
    expect(attackResult).toHaveProperty("result");
    expect(["hit", "miss"]).toContain(attackResult.result);
  }
});

test("if a new ship is hit computer will target that ship, set base for next attack, and adjacent cells are added to queue", () => {
  const game = new Game();

  // Simulate a hit on a ship
  let attackResult;
  do {
    attackResult = game.compAttack();
  } while (attackResult.result !== "hit");

  expect(game.compState.targetShip).toBe(
    game.human.board.grid[attackResult.coord[0]][attackResult.coord[1]].ship,
  );
  expect(game.compState.base).toEqual(attackResult.coord);
  expect(game.compState.queue).toEqual([
    [attackResult.coord[0] - 1, attackResult.coord[1]],
    [attackResult.coord[0] + 1, attackResult.coord[1]],
    [attackResult.coord[0], attackResult.coord[1] - 1],
    [attackResult.coord[0], attackResult.coord[1] + 1],
  ]);
});

test("if a ship is targeted and hit once next attacks will be on adjacent cell until direction is established", () => {
  const game = new Game();

  // Simulate a hit on a ship
  let attackResult;
  do {
    attackResult = game.compAttack();
  } while (attackResult.result !== "hit");

  const targetShip = game.compState.targetShip;
  const base = game.compState.base;

  // Simulate attacking queued adjacent cells until we get a second hit on the same ship
  while (targetShip.hitCount < 2 && game.compState.queue.length > 0) {
    attackResult = game.compAttack();
  }

  expect(targetShip.hitCount).toBe(2);

  // The second hit should be on an adjacent cell to the base
  const secondHitCoord = attackResult.coord;
  const isAdjacent =
    (secondHitCoord[0] === base[0] &&
      Math.abs(secondHitCoord[1] - base[1]) === 1) ||
    (secondHitCoord[1] === base[1] &&
      Math.abs(secondHitCoord[0] - base[0]) === 1);

  expect(isAdjacent).toBe(true);
  if (!targetShip.isSunk()) {
    expect(game.compState.direction).toEqual([
      secondHitCoord[0] - base[0],
      secondHitCoord[1] - base[1],
    ]);
  }
});

test("if second attack on targeted ship sinks the ship computer will reset state", () => {
  const game = new Game();

  // Simulate a hit on a destroyer (length 2)
  let attackResult;
  do {
    attackResult = game.compAttack();
  } while (
    attackResult.result !== "hit" ||
    game.human.board.grid[attackResult.coord[0]][attackResult.coord[1]].ship
      .length !== 2
  );

  // Attack the adjacent cell to sink the ship
  const targetShip = game.compState.targetShip;
  while (!targetShip.isSunk()) {
    attackResult = game.compAttack();
  }

  expect(targetShip.isSunk()).toBe(true);
  expect(game.compState.targetShip).toBeNull();
  expect(game.compState.base).toBeNull();
  expect(game.compState.queue).toEqual([]);
  expect(game.compState.direction).toBeNull();
  expect(game.compState.start).toBeNull();
  expect(game.compState.reversed).toBe(false);
});

test("if a ship longer than 2 is targeted and hit more than once computer can choose a valid coordinate in the same direction and attack", () => {
  const game = new Game();

  // Simulate a hit on a ship longer than 2
  let attackResult;
  do {
    attackResult = game.compAttack();
  } while (
    attackResult.result !== "hit" ||
    game.human.board.grid[attackResult.coord[0]][attackResult.coord[1]].ship
      .length < 3
  );

  const targetShip = game.compState.targetShip;
  // Simulate hitting the same ship at least 3 times
  while (targetShip.hitCount < 3) {
    attackResult = game.compAttack();
  }

  expect(targetShip.hitCount).toBe(3);
});

test("if a ship longer than 2 is targeted it will be attacked until it sinks and then computer will reset state", () => {
  const game = new Game();

  // Simulate a hit on a ship longer than 2
  let attackResult;
  do {
    attackResult = game.compAttack();
  } while (
    attackResult.result !== "hit" ||
    game.human.board.grid[attackResult.coord[0]][attackResult.coord[1]].ship
      .length < 3
  );

  const targetShip = game.compState.targetShip;
  // Simulate attacking the same ship until it sinks in minimum number of moves
  while (!targetShip.isSunk()) {
    attackResult = game.compAttack();
    if (game.compState.targetShip !== targetShip) break;
  }

  expect(targetShip.isSunk()).toBe(true);
  expect(game.compState.targetShip).toBeNull();
  expect(game.compState.base).toBeNull();
  expect(game.compState.queue).toEqual([]);
  expect(game.compState.direction).toBeNull();
  expect(game.compState.start).toBeNull();
  expect(game.compState.reversed).toBe(false);
});

test("computer can successfully sink all human ships using its attack strategy", () => {
  for (let i = 0; i < 10; i++) {
    const game = new Game();

    while (!game.gameOver()) {
      game.compAttack();
    }

    expect(game.human.board.allShipsSunk()).toBe(true);
    expect(game.compState.targetShip).toBeNull();
    expect(game.compState.base).toBeNull();
    expect(game.compState.queue).toEqual([]);
    expect(game.compState.direction).toBeNull();
    expect(game.compState.start).toBeNull();
  }
});

test("game can be played to end with calling playRound repeatedly with random valid coordinates", () => {
  for (let i = 0; i < 100; i++) {
    const game = new Game();
    const getRandomInt = (max) => Math.floor(Math.random() * max);

    while (!game.gameOver()) {
      game.playRound([getRandomInt(10), getRandomInt(10)]);
    }

    expect(game.gameOver()).toBe(true);
  }
});

test("if a ship is being repositioned it will be removed from the board and rendered in new position", () => {
  while (true) {
    const game = new Game();
    const humanGrid = game.human.board.grid;
    if (
      humanGrid[0][0].ship ||
      humanGrid[1][0].ship ||
      humanGrid[2][0].ship ||
      humanGrid[3][0].ship ||
      humanGrid[4][0].ship ||
      humanGrid[5][0].ship ||
      humanGrid[0][1].ship ||
      humanGrid[1][1].ship ||
      humanGrid[2][1].ship ||
      humanGrid[3][1].ship ||
      humanGrid[4][1].ship ||
      humanGrid[5][1].ship
    )
      continue;

    const ship = game.humanShips[0];
    const originalCoord = ship.coords;

    game.positionShip(ship.title, [0, 0], "vertical");

    expect(game.human.board.grid[0][0].ship).toBe(ship.ship);
    expect(game.human.board.grid[1][0].ship).toBe(ship.ship);
    expect(game.human.board.grid[originalCoord[0]][originalCoord[1]].ship).toBe(
      null,
    );

    break;
  }
});

test("if a ship is being repositioned and new position is invalid it will be rendered back in original position", () => {
  while (true) {
    const game = new Game();
    const humanGrid = game.human.board.grid;
    if (!humanGrid[0][0].ship) continue;

    const ship = game.humanShips[0];
    const originalCoord = ship.coords;

    game.positionShip(ship.title, [0, 0], "horizontal");

    expect(game.human.board.grid[originalCoord[0]][originalCoord[1]].ship).toBe(
      ship.ship,
    );

    break;
  }
});
